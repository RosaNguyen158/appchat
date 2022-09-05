import cookieParser from 'cookie-parser'
import dotenv from 'dotenv' // de su dung cac bien trong .env
import express from 'express'
import passport from 'passport'
import path from 'path'
import { DataSource } from 'typeorm'

import * as chatSocket from '@/controllers/ChatControllers'
import { ChatRoom } from '@/entities/ChatRoom'
import { Friend } from '@/entities/Friend'
import { Member } from '@/entities/Member'
import { Message } from '@/entities/Message'
import { React } from '@/entities/React'
import { ReactMessage } from '@/entities/ReactMessage'
import { SeenBy } from '@/entities/SeenBy'
import { Session } from '@/entities/Session'
import { Setting } from '@/entities/Setting'
import { User } from '@/entities/User'
import apiRouter from '@/routes/apiRoutes'

import { Notification } from './entities/Notification'
import { home } from './socketConstants'

export const http = require('http')
// import 'http' from "http";

const app = express()
const server = http.createServer(app)
const { Server } = require('socket.io')

const io = new Server(server)

const __dirname = path.resolve()

dotenv.config()
const PORT = 3000

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
        Notification,
    ],
    // entities: ["@/entities/*"],
    synchronize: true,
    logging: false,
})

AppDataSource.initialize()
    .then(() => {
        console.log('Connected to PostgreSQL')
    })
    .catch((error) => console.log(error))

app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', apiRouter)

// Set up Passport
app.use(passport.initialize())
app.use(passport.session())

io.on('connection', (socket) => {
    socket.emit(home, 'Welcome to App Chat!')
})

io.of('/direct-room').on('connection', (socket) => {
    chatSocket.directRoom(io, socket)
    chatSocket.disconnectUser(io, socket)
})
io.of('/create-new-room').on('connection', (socket) => {
    chatSocket.createRoom(io, socket)
})
io.of('/join-room-by-code').on('connection', (socket) => {
    chatSocket.JoinByCode(io, socket)
})
io.of('/join-room').on('connection', (socket) => {
    if (socket.handshake.query.room) chatSocket.joinRoom(io, socket)
    if (socket.handshake.query.code_roomchat) chatSocket.JoinByCode(io, socket)
})

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
    console.log(`Server is running on PORT ${PORT}`)
})
