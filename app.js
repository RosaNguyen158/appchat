import express from "express";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import path from "path";
import cookieParser from "cookie-parser";
import apiRouter from "@/routes/apiRoutes";
import { createConnection } from "typeorm";
import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import { Friend } from "@/entities/Friend";
import { Session } from "@/entities/Session";
import { ChatRoom } from "@/entities/ChatRoom";
import { Message } from "@/entities/Message";
import { Member } from "@/entities/Member";
import { React } from "@/entities/React";
import { ReactMessage } from "@/entities/ReactMessage";
import { Setting } from "@/entities/Setting";
import { SeenBy } from "@/entities/SeenBy";
import * as chatSocket from "@/services/server";
import ChatController from "@/controllers/ChatControllers";
import socket from "./services/client";

export const http = require("http");
// import server from "@/services/server";

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const __dirname = path.resolve();

dotenv.config();
const PORT = 3000;

export const AppDataSource = new DataSource({
  type: process.env.TYPE_DBA,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    User,
    Friend,
    Session,
    ChatRoom,
    Message,
    Member,
    React,
    ReactMessage,
    Setting,
    SeenBy,
  ],
  // entities: ["@/entities/*"],
  synchronize: true,
  logging: false,
});

AppDataSource.initialize()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((error) => console.log(error));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", apiRouter);

io.of("/direct-room").on("connection", (socket) => {
  chatSocket.directRoom(io, socket);
});
io.of("/creat-new-room").on("connection", (socket) => {
  chatSocket.createRoom(io, socket);
});
io.of("/join-room-by-code").on("connection", (socket) => {
  chatSocket.JoinByCode(io, socket);
});
io.of("/join-room").on("connection", (socket) => {
  if (socket.handshake.query.room) chatSocket.joinRoom(io, socket);
  if (socket.handshake.query.code_roomchat) chatSocket.JoinByCode(io, socket);
});

// const onConnection = (socket) => {
//   chatSocket.chatMessage(io, socket);
// };
// io.on("connection", onConnection);

// io.use((socket, next) => {
//   console.log(socket.handshake.headers.id);
//   const userId = socket.handshake.headers;
//   const findUser = ChatController.findUser(userId);
//   if (findUser) next();
//   console.log("findUser", findUser);
// });

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
