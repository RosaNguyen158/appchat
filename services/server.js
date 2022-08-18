import { AppDataSource } from "@/app.js";
import Session from "@/entities/Session";
import { Member } from "@/entities/Member";
import { ChatRoom } from "@/entities/ChatRoom";
import socket from "./client";
import * as ChatController from "@/controllers/ChatControllers";
import { ChangeStream } from "typeorm";
import { makeid } from "@/helpers/generateKey";

//  Get token => verify => get username

export const chatMessage = async (io, socket) => {
  const roomInfo = await ChatController.findRoom(socket.handshake.query.room);
  const user = await ChatController.findUser(socket.handshake.headers.id);
  socket.on("chat-message", async (message) => {
    await ChatController.insertMessage(message, user.id, roomInfo.id);
    socket.broadcast.emit("chat-message", {
      message: message,
      username: user.username,
    });
  });

  socket.on("reply-message", async (data) => {
    const dataParse = JSON.parse(JSON.stringify(data));
    const message_reply = await ChatController.findMessage(
      dataParse.replyMessage
    );
    const mess = await ChatController.insertMessage(
      dataParse.message,
      user.id,
      roomInfo.id,
      message_reply.id
    );
    socket.broadcast.emit("reply-message", {
      message_reply: message_reply.message,
      message: data.message,
      username: user.username,
    });
  });

  socket.on("forward-message", async (data) => {
    const dataParse = JSON.parse(JSON.stringify(data));
    console.log("data reply", data);
    const message_fwd = await ChatController.findMessage(dataParse.fwdMessage);
    const mess = await ChatController.insertMessage(
      message_fwd.message,
      user.id,
      dataParse.toRoom,
      null,
      message_fwd.id
    );
    console.log(mess);
    socket.to(dataParse.toRoom).emit("forward-message", {
      note: "forward message",
      message: message_fwd.message,
      username: user.username,
    });
  });
};

export const directRoom = async (io, socket) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  const roomDirect = await ChatController.findRoom(socket.handshake.query.room);
  if (!roomDirect) {
    roomDirect = await ChatController.createRoomChat(
      null,
      "direct",
      null,
      null
    );
    await ChatController.addMember(checkDirectUser.id, user.id);
    await ChatController.addMember(
      checkDirectUser.id,
      socket.handshake.query.userDirect
    );
    socket.join(roomDirect.id);
    chatMessage(io, socket);
  }
};

export const joinRoom = async (io, socket) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  const roomInfo = await ChatController.findRoom(socket.handshake.query.room);
  console.log("roomInfo", roomInfo);
  const member = await ChatController.findMember(
    user.id,
    socket.handshake.query.room
  );
  console.log("member", member);
  if (roomInfo.group_types == "public") {
    const newMem = await ChatController.addMember(roomInfo.id, user.id);
    socket.join(roomInfo.id);
    socket.broadcast.emit(
      "newMessage",
      `Hello new my roomate ${user.username}`
    );
    chatMessage(io, socket);
  } else if (member) {
    socket.join(roomInfo.id);
    socket.emit("newMessage", `Hello ${user.username} room ${roomInfo.id}`);
    chatMessage(io, socket);
  } else {
    socket.emit("error", { message: "Cant join this room" });
  }
};

export const JoinByCode = async (io, socket) => {
  const user = await ChatController.findUser(socket.handshake.headers.id);
  const code_gr = socket.handshake.query.code_roomchat;
  const roomCode = await ChatController.checkCode(code_gr);
  const member = await ChatController.findMember(user.id, roomCode.id);
  if (roomCode) {
    socket.join(roomCode.id);
    if (!member) await ChatController.addMember(roomCode.id, user.id);
    socket.emit("newMember", `Hello ${user.username} room ${roomCode.id}`);
    chatMessage(io, socket);
  } else {
    socket.emit("error", { message: "Cant join this room" });
  }
};

export const createRoom = async (io, socket) => {
  console.log(socket.handshake.headers);
  const user = await ChatController.findUser(socket.handshake.headers.id);
  socket.on("create", async (roomname) => {
    const newRoom = await ChatController.createRoomChat(
      roomname,
      "group",
      "private",
      makeid(6)
    );
    const addMem = await ChatController.addMember(newRoom.id, user.id);
    console.log("addMem", addMem);
    socket.join(newRoom.id);
    socket.emit("new-room", `Welcome to room ${newRoom.title}`);
    chatMessage(io, socket);
  });
};
