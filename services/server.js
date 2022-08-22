import { AppDataSource } from "@/app.js";
import * as ChatController from "@/controllers/ChatControllers";
import { makeid } from "@/helpers/generateKey";
import * as eventSocket from "@/socketconfig";
import { Friend } from "@/entities/Friend";

//  Get token => verify => get username

export const chatMessage = async (io, socket, roomId) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  socket.on(eventSocket.chatMessage, async (message) => {
    socket.emit("sending", "sending");
    await ChatController.insertMessage(message, user.id, roomId);
    await socket.broadcast.emit(eventSocket.chatMessage, {
      message: message,
      username: user.username,
    });
  });

  // React Message: data {reactId, messageId}
  socket.on(eventSocket.react, async (data) => {
    const dataParse = JSON.parse(JSON.stringify(data));
    console.log("dataParse", dataParse);
    await ChatController.reactMessage(
      dataParse.messageId,
      user.id,
      dataParse.reactId
    );
    const findSender = await ChatController.findMessage(dataParse.messageId);
    await ChatController.addNotice(
      findSender.sender_id,
      `${user.username} reacted to your message.`
    );
  });

  socket.on(eventSocket.replyMessage, async (data) => {
    const dataParse = JSON.parse(JSON.stringify(data));
    const findReplyMessage = await ChatController.findMessage(
      dataParse.replyMessage
    );
    await ChatController.insertMessage(
      dataParse.message,
      user.id,
      roomId,
      findReplyMessage.id
    );
    socket.broadcast.emit(eventSocket.replyMessage, {
      messageReply: findReplyMessage.message,
      message: data.message,
      username: user.username,
    });
  });

  socket.on(eventSocket.forwardMessage, async (data) => {
    const dataParse = JSON.parse(JSON.stringify(data));
    const findFwdMessage = await ChatController.findMessage(
      dataParse.fwdMessage
    );
    const mess = await ChatController.insertMessage(
      findFwdMessage.message,
      user.id,
      dataParse.toRoom,
      null,
      findFwdMessage.id
    );
    socket.to(dataParse.toRoom).emit(eventSocket.forwardMessage, {
      note: "forward message",
      message: findFwdMessage.message,
      username: user.username,
    });
  });
  // Notification
  await noticeMessage(roomId, user);
  socket.emit("sent", "sent");

  disconnectUser(io, socket);
};

export const directRoom = async (io, socket) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  const friend = await ChatController.findUser(socket.handshake.query.friend);
  const friendDirectRoom = await ChatController.findMemberDirect(
    socket.handshake.query.friend
  );
  const userDirectRoom = await ChatController.findMemberDirect(user.id);
  let roomId = "";
  const result = friendDirectRoom.map((i) =>
    userDirectRoom.filter((j) => {
      if (j.room_id == i.room_id) roomId = i.room_id;
    })
  );
  if (!result.length) {
    const roomDirect = await ChatController.createRoomChat(
      null,
      "direct",
      "private",
      null
    );
    await ChatController.addMember(roomDirect.id, user.id);
    await ChatController.addMember(roomDirect.id, friend.id);
    socket.join(roomDirect.id);
    socket.emit(
      eventSocket.newMessage,
      `Joined direct room with ${friend.username}`
    );
    await ChatController.updateActiveInGroup(user.id, roomDirect.id, true);
    chatMessage(io, socket);
  } else {
    socket.join(roomId);
    socket.emit(
      eventSocket.newMessage,
      `Joined direct room with ${friend.username}`
    );
    await ChatController.updateActiveInGroup(user.id, roomId, true);
    chatMessage(io, socket, roomId);
  }
};

export const joinRoom = async (io, socket) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  const roomInfo = await ChatController.findRoom(socket.handshake.query.room);
  const member = await ChatController.findMember(
    user.id,
    socket.handshake.query.room
  );
  if (roomInfo.group_types == "public") {
    const newMem = await ChatController.addMember(roomInfo.id, user.id);
    socket.join(roomInfo.id);
    socket.broadcast.emit(
      eventSocket.newMember,
      `Hello new my roomate ${user.username}`
    );
    await ChatController.updateActiveInGroup(user.id, roomInfo.id, true);
    console.log("Active in group");
    chatMessage(io, socket, roomInfo.id);
  } else if (member) {
    socket.join(roomInfo.id);
    socket.emit(
      eventSocket.newMessage,
      `Hello ${user.username} room ${roomInfo.id}`
    );
    //Update active in group
    await ChatController.updateActiveInGroup(user.id, roomInfo.id, true);
    chatMessage(io, socket, roomInfo.id);
  } else {
    socket.emit(eventSocket.error, { message: "Cant join this room" });
  }
};

// if not found room by code => error: Not found, else addMember
export const JoinByCode = async (io, socket) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  const codeGroup = socket.handshake.query.code_roomchat;
  const findRoom = await ChatController.checkCode(codeGroup);
  if (findRoom) {
    const member = await ChatController.findMember(user.id, findRoom.id);
    if (!member) await ChatController.addMember(findRoom.id, user.id);
    socket.join(findRoom.id);
    socket.emit(
      eventSocket.newMessage,
      `Hello ${user.username} room ${findRoom.id}`
    );
    //Update active in group
    await ChatController.updateActiveInGroup(user.id, findRoom.id, true);
    chatMessage(io, socket, findRoom.id);
  } else {
    socket.emit(eventSocket.error, { message: "Not found this room" });
  }
};

// check amount member, error: at least 3 members
export const createRoom = async (io, socket) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  socket.on(eventSocket.create, async (data) => {
    const dataParse = JSON.parse(JSON.stringify(data));
    let countMember = 0;
    let addMemberList = await dataParse.Friends.reduce(
      async (memberList, member) => {
        let members = [];
        let check = await checkPrivacyMember(user.id, member.friend_id, socket);
        console.log("check", check);
        if (check) {
          countMember++;
          members.push(member.friend_id);
        }
        return members;
      },
      []
    );
    console.log("countMember", countMember);
    if (countMember > 1) {
      const newRoom = await ChatController.createRoomChat(
        dataParse.roomName,
        "group",
        "private",
        makeid(6)
      );
      await addMemberList.map(async (memberId) => {
        await ChatController.addMember(newRoom.id, memberId);
      });
      await ChatController.addMember(newRoom.id, user.id);
      socket.join(newRoom.id);
      socket.emit(eventSocket.newMessage, `Welcome to new room`);
      chatMessage(io, socket, newRoom.id);
    } else {
      socket.emit(eventSocket.error, `At least 3 members in a room`);
    }
  });
};

export const muteNotice = async (io, socket) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  const isMute = await ChatController.updateMute(user.id);
};

export const disconnectUser = async (io, socket) => {
  const userId = socket.handshake.headers.id;
  const user = await ChatController.findUser(socket.handshake.headers.id);
  socket.on("disconnect", async () => {
    console.log("socket.handshake.query.room", socket.handshake.query.room);

    if (socket.handshake.query.friend) {
      let roomId = "";
      const friendDirectRoom = await ChatController.findMemberDirect(
        socket.handshake.query.friend
      );
      const userDirectRoom = await ChatController.findMemberDirect(userId);
      const result = friendDirectRoom.map((i) =>
        userDirectRoom.filter((j) => {
          if (j.room_id == i.room_id) roomId = i.room_id;
        })
      );
      console.log("disconnect room", roomId);
      await ChatController.updateActiveInGroup(user.id, roomId, false);
    }
    if (socket.handshake.query.room) {
      console.log("socket.handshake.query.room", socket.handshake.query.room);
      await ChatController.updateActiveInGroup(
        user.id,
        socket.handshake.query.room,
        false
      );
    }
    const updateSession = await ChatController.updateActive(user.id);
    socket.broadcast.emit(
      "userDisconnect",
      `${user.username} has left the chat`
    );
  });
};

export const noticeMessage = async (roomId, user) => {
  const findRoom = await ChatController.findRoom(roomId);
  const listMember = await ChatController.getRoomUsers(roomId);
  for (let member of listMember) {
    if (member.user_id != user.id && member.active_in_group == false) {
      if (findRoom.type == "direct") {
        await ChatController.addNotice(
          member.user_id,
          `You have a new message from ${user.username}`
        );
      } else {
        await ChatController.addNotice(
          member.user_id,
          `You have a new message from ${findRoom.title} room`
        );
      }
    }
  }
};

const checkPrivacyMember = async (userId, memId, socket) => {
  const userPrivacy = await ChatController.userPrivacy(memId);
  const infoMember = await ChatController.findUser(memId);
  let userFriend = await AppDataSource.getRepository(Friend).findOne({
    where: {
      user_id: userId,
      friend_id: memId,
    },
  });
  if (userPrivacy.role_add_to_group == "Everybody") {
    return true;
  } else if (
    userPrivacy.role_add_to_group == "My contacts" &&
    userFriend &&
    userFriend.status == "friend"
  ) {
    return true;
  } else {
    socket.emit(
      eventSocket.newMessage,
      `You cant add ${infoMember.username} into the group`
    );
    return false;
  }
};
