import { AppDataSource } from "@/app.js";
import { ChatRoom } from "@/entities/ChatRoom";
import { Member } from "@/entities/Member";
import { Message } from "@/entities/Message";
import { User } from "@/entities/User";
import { Session } from "@/entities/Session";
import { Notification } from "@/entities/Notification";
import { ReactMessage } from "@/entities/ReactMessage";
import { Setting } from "@/entities/Setting";

export const joinRoom = async (userid, room) => {
  const mem = new Member();
  mem.mem_id = userid;
  mem.roomId = room;
  await AppDataSource.manager.save(mem);
  return mem;
};

export const getRoomUsers = async (room) => {
  let mems = await AppDataSource.getRepository(Member).find({
    where: {
      roomId: room,
    },
  });
  return mems;
};

export const insertMessage = async (
  message,
  sender,
  room,
  messReply,
  messFwd
) => {
  let mess = new Message();
  mess.message = message;
  mess.replyId = messReply;
  mess.forwardId = messFwd;
  mess.senderId = sender;
  mess.roomId = room;
  await AppDataSource.manager.save(mess);
  return mess;
};

export const createRoomChat = async (roomName, type, groupTypes, codeGroup) => {
  try {
    let room = new ChatRoom();
    room.title = roomName;
    room.type = type;
    room.groupTypes = groupTypes;
    room.codeGroup = codeGroup;
    await AppDataSource.manager.save(room);
    return room;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const addMember = async (roomId, memId) => {
  let member = new Member();
  member.roomId = roomId;
  member.userId = memId;
  await AppDataSource.manager.save(member);
  return member;
};

export const findUser = async (userId) => {
  const user = await AppDataSource.getRepository(User).findOne({
    where: {
      id: userId,
    },
  });
  return user;
};

export const findMember = async (userId, roomId) => {
  const user = await AppDataSource.getRepository(Member).findOne({
    where: {
      userId: userId,
      roomId: roomId,
    },
  });
  return user;
};
export const findMemberDirect = async (userId) => {
  const user = await AppDataSource.getRepository(Member)
    .createQueryBuilder("members")
    .innerJoin("members.roomId", "chatrooms")
    .where("chatrooms.type = :name and members.userId = :userId", {
      name: "direct",
      userId: userId,
    })
    .getMany();

  return user;
};

export const findMessage = async (messId) => {
  const message = await AppDataSource.getRepository(Message).findOne({
    where: {
      id: messId,
    },
  });
  return message;
};

export const findRoom = async (room) => {
  const roomInfo = await AppDataSource.getRepository(ChatRoom).findOne({
    where: {
      id: room,
    },
  });
  return roomInfo;
};

export const checkCode = async (codeGr) => {
  const roomcheck = await AppDataSource.getRepository(ChatRoom).findOne({
    where: {
      codeGroup: codeGr,
    },
  });
  return roomcheck;
};

export const userPrivacy = async (userId) => {
  const userPrivacy = await AppDataSource.getRepository(Setting).findOne({
    where: {
      userId: userId,
    },
  });
  return userPrivacy;
};

export const updateMute = async (userId) => {
  const updateMember = await AppDataSource.getRepository(Member).findOne({
    where: {
      userId: userId,
      isMute: true,
    },
  });
  return updateMember;
};

export const updateActive = async (userId) => {
  const updateSession = await AppDataSource.getRepository(Session).findOne({
    where: {
      userId: userId,
    },
  });
  const updateActive = await AppDataSource.getRepository(User).findOne({
    where: {
      id: userId,
    },
  });
  updateActive.isActive = false;
  updateActive.lastSeen = new Date();
  await AppDataSource.manager.save(updateActive);
  let activeTime = new Date();
  console.log("Date", activeTime);
  updateSession.lastActive = activeTime;
  await AppDataSource.manager.save(updateSession);
  return updateSession;
};

export const addNotice = async (userId, content) => {
  const userNotice = new Notification();
  userNotice.userId = userId;
  userNotice.content = content;
  userNotice.is_read = false;
  await AppDataSource.manager.save(userNotice);
  return userNotice;
};

export const updateNotice = async (userId, content) => {
  const updateNoice = await AppDataSource.getRepository(Notification).findOne({
    where: {
      userId: userId,
    },
  });
  updateNoice.content = content;
  return updateNoice;
};

export const reactMessage = async (messageId, userId, reactId) => {
  const reactMess = new ReactMessage();
  reactMess.messageId = messageId;
  reactMess.memberId = userId;
  reactMess.reactId = reactId;
  await AppDataSource.manager.save(reactMess);
  return reactMess;
};

export const updateActiveInGroup = async (userId, roomId, status) => {
  const activeMember = await AppDataSource.getRepository(Member).findOne({
    where: {
      userId: userId,
      roomId: roomId,
    },
  });
  if (status) {
    const updateActive = await AppDataSource.getRepository(User).findOne({
      where: {
        id: userId,
      },
    });
    if (!activeMember) {
      return false;
    }
    updateActive.isActive = true;
    updateActive.lastSeen = new Date();
    await AppDataSource.manager.save(updateActive);
  }
  activeMember.activeInGroup = status;
  await AppDataSource.manager.save(activeMember);
  console.log("Active in group");
  return activeMember;
};
