import { AppDataSource } from "@/app.js";
import { ChatRoom } from "@/entities/ChatRoom";
import { Member } from "@/entities/Member";
import { Message } from "@/entities/Message";
import { User } from "@/entities/User";

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
  mess_reply,
  mess_fwd
) => {
  let mess = new Message();
  mess.message = message;
  mess.reply_id = mess_reply;
  mess.forward_id = mess_fwd;
  mess.sender = sender;
  mess.room_id = room;
  await AppDataSource.manager.save(mess);
  return mess;
};

export const createRoomChat = async (room_name, type, group_types, code_gr) => {
  let room = new ChatRoom();
  room.title = room_name;
  room.type = type;
  room.group_types = group_types;
  room.code_gr = code_gr;
  await AppDataSource.manager.save(room);
  return room;
};

export const addMember = async (room_id, mem_id) => {
  let members = new Member();
  members.room_id = room_id;
  members.user_id = mem_id;
  await AppDataSource.manager.save(members);
  return members;
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

// export const findMemberDirect = async (userId) => {
//   const user = await AppDataSource.getRepository(Member).find({
//     user_id: userId,
//   });
//   return user;
// };

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

export const checkCode = async (code_gr) => {
  const roomcheck = await AppDataSource.getRepository(ChatRoom).findOne({
    where: {
      code_gr: code_gr,
    },
  });
  return roomcheck;
};
