import { AppDataSource } from "@/app.js";
import { ChatRoom } from "@/entities/ChatRoom";
import { Member } from "@/entities/Member";
import { Message } from "@/entities/Message";
import { User } from "@/entities/User";
import { Session } from "@/entities/Session";

export const joinRoom = async (userid, room) => {
  const mem = new Member();
  mem.mem_id = userid;
  mem.room_id = room;
  await AppDataSource.manager.save(mem);
  return mem;
};

export const getRoomUsers = async (room) => {
  let mems = await AppDataSource.getRepository(Member).findOne({
    where: {
      room_id: room,
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
  mess.reply_id = messReply;
  mess.forward_id = messFwd;
  mess.sender_id = sender;
  mess.room_id = room;
  await AppDataSource.manager.save(mess);
  return mess;
};

export const createRoomChat = async (roomName, type, groupTypes, codeGr) => {
  let room = new ChatRoom();
  room.title = roomName;
  room.type = type;
  room.group_types = groupTypes;
  room.code_gr = codeGr;
  await AppDataSource.manager.save(room);
  return room;
};

export const addMember = async (roomId, memId) => {
  let member = new Member();
  member.room_id = roomId;
  member.user_id = memId;
  await AppDataSource.manager.save(member);
  return member;
};

export const findUser = async (userId) => {
  const user = await AppDataSource.getRepository(User).findOne({
    where: {
      id: userId,
    },
  });
  console.log(user);
  return user;
};

export const findMember = async (userId, roomId) => {
  const user = await AppDataSource.getRepository(Member).findOne({
    where: {
      user_id: userId,
      room_id: roomId,
    },
  });
  return user;
};
export const findMemberDirect = async (userId) => {
  const user = await AppDataSource.getRepository(Member)
    .createQueryBuilder("member")
    .innerJoin("member.room_id", "chatroom")
    .where("chatroom.type = :name and member.user_id = :user_id", {
      name: "direct",
      user_id: userId,
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
      code_gr: codeGr,
    },
  });
  return roomcheck;
};

export const updateMute = async (userId) => {
  const updateMember = await AppDataSource.getRepository(Member).findOne({
    where: {
      user_id: userId,
      is_mute: true,
    },
  });
  return updateMember;
};

export const updateActive = async (userId) => {
  const updateSession = await AppDataSource.getRepository(Session).findOne({
    where: {
      user_id: userId,
    },
  });
  const updateActive = await AppDataSource.getRepository(User).findOne({
    where: {
      id: userId,
    },
  });
  updateActive.is_active = false;
  await AppDataSource.manager.save(updateActive);
  updateSession.last_active = new Date();
  return updateSession;
};
