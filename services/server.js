import { AppDataSource } from "@/app.js";
import * as ChatController from "@/controllers/ChatControllers";
import { makeid } from "@/helpers/generateKey";
import * as eventSocket from "@/socketconfig";

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
    socket.emit("sent", "sent");
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
    chatMessage(io, socket);
  } else {
    socket.join(roomId);
    socket.emit(
      eventSocket.newMessage,
      `Joined direct room with ${friend.username}`
    );
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
    chatMessage(io, socket, roomInfo.id);
  } else if (member) {
    socket.join(roomInfo.id);
    socket.emit(
      eventSocket.newMessage,
      `Hello ${user.username} room ${roomInfo.id}`
    );
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
    if (dataParse.newMmemNd && dataParse.newMmemRd) {
      const newRoom = await ChatController.createRoomChat(
        dataParse.roomName,
        "group",
        "private",
        makeid(6)
      );
      const addMember1 = await ChatController.addMember(newRoom.id, user.id);
      await ChatController.addMember(newRoom.id, dataParse.newMmemNd);
      await ChatController.addMember(newRoom.id, dataParse.newMmemRd);
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

export const disconnectUser = async (io, socket, userSocker) => {
  console.log(userSocker++);
  const user = await ChatController.findUser(socket.handshake.headers.id);
  socket.on("disconnect", async () => {
    const timeDisconnect = Date.now();
    const updateSession = await ChatController.updateActive(
      user.id,
      timeDisconnect
    );
    console.log("updateSession", updateSession);
    socket.broadcast.emit(
      "userDisconnect",
      `${user.username} has left the chat`
    );
  });
};

export const sendImg = async (io, socket) => {};
