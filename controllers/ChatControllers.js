import { AppDataSource } from "@/app.js";
import { Member } from "@/entities/Member";
import { Message } from "@/entities/Message";

export const joinRoom = async (userid, room) => {
  const mem = new Member();
  mem.mem_id = userid;
  mem.room_id = room;
  await AppDataSource.manager.save(mem);
  return mem;
};

export const getRoomUsers = async (room) => {
  let findUser = await AppDataSource.getRepository(Member).findOne({
    where: {
      room_id: room,
    },
  });
  return findUser;
};

export const insertMessage = async (message, sender) => {
  let mess = new Message();
  mess.message = message;
  mess.sender = sender;
  await AppDataSource.manager.save(mess);
  return mess;
};
