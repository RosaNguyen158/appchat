import { AppDataSource } from '@/app.js'
import { Friend } from '@/entities/Friend'
import { makeid } from '@/helpers/generateKey'
import * as socketServices from '@/services/socketServices'
import * as eventSocket from '@/socketConstants'

export const chatMessage = async (io, socket, roomId) => {
    try {
        const user = await socketServices.findUser(socket.handshake.headers.id)
        socket.on(eventSocket.chatMessage, async (message) => {
            socket.emit('sending', 'sending')
            await socketServices.insertMessage(message, user.id, roomId)
            await socket.broadcast.emit(eventSocket.chatMessage, {
                message: message,
                username: user.username,
            })
        })

        // React Message: data {reactId, messageId}
        socket.on(eventSocket.react, async (data) => {
            const dataParse = JSON.parse(JSON.stringify(data))
            console.log('dataParse', dataParse)
            await socketServices.reactMessage(
                dataParse.messageId,
                user.id,
                dataParse.reactId
            )
            const findSender = await socketServices.findMessage(
                dataParse.messageId
            )
            await socketServices.addNotice(
                findSender.senderId,
                `${user.username} reacted to your message.`
            )
        })

        // replyMessage : {replyMessage: id, message: content}
        socket.on(eventSocket.replyMessage, async (data) => {
            const dataParse = JSON.parse(JSON.stringify(data))
            const findReplyMessage = await socketServices.findMessage(
                dataParse.replyMessage
            )
            if (!findReplyMessage) {
                return socket.emit(
                    eventSocket.error,
                    'Message Reply does not exist'
                )
            }
            await socketServices.insertMessage(
                dataParse.message,
                user.id,
                roomId,
                findReplyMessage.id
            )
            socket.broadcast.emit(eventSocket.replyMessage, {
                messageReply: findReplyMessage.message,
                message: data.message,
                username: user.username,
            })
        })

        // forwardMessage {fwdMessage: id, toRoom: id}
        socket.on(eventSocket.forwardMessage, async (data) => {
            const dataParse = JSON.parse(JSON.stringify(data))
            console.log(dataParse)
            const findFwdMessage = await socketServices.findMessage(
                dataParse.fwdMessage
            )
            if (!findFwdMessage) {
                return socket.emit(eventSocket.error, 'Message does not exist')
            }
            const checkMember = await socketServices.findMember(
                user.id,
                dataParse.toRoom
            )
            if (!checkMember) {
                return socket.emit(
                    eventSocket.error,
                    "You aren't a member of this room"
                )
            }
            await socketServices.insertMessage(
                findFwdMessage.message,
                user.id,
                dataParse.toRoom,
                null,
                findFwdMessage.id
            )

            console.log('checkMember', checkMember)
            socket.to(dataParse.toRoom).emit(eventSocket.forwardMessage, {
                note: 'forward message',
                message: findFwdMessage.message,
                username: user.username,
            })
        })
        // Notification
        const result = await noticeMessage(roomId, user)
        if (result) socket.emit('sent', 'sent')

        disconnectUser(io, socket)
    } catch (error) {
        return socket.emit(eventSocket.error, error.message)
    }
}

export const directRoom = async (io, socket) => {
    try {
        const user = await socketServices.findUser(socket.handshake.headers.id)
        const friend = await socketServices.findUser(
            socket.handshake.query.friend
        )
        const friendDirectRoom = await socketServices.findMemberDirect(
            socket.handshake.query.friend
        )
        const userDirectRoom = await socketServices.findMemberDirect(user.id)
        let roomId = ''
        const result = friendDirectRoom.map((i) =>
            userDirectRoom.filter((j) => {
                if (j.roomId == i.roomId) roomId = i.roomId
            })
        )
        if (!result.length) {
            const roomDirect = await socketServices.createRoomChat(
                null,
                'direct',
                'private',
                null
            )
            await socketServices.addMember(roomDirect.id, user.id)
            await socketServices.addMember(roomDirect.id, friend.id)
            socket.join(roomDirect.id)
            socket.emit(
                eventSocket.newMessage,
                `Joined direct room with ${friend.username}`
            )
            await socketServices.updateActiveInGroup(
                user.id,
                roomDirect.id,
                true
            )
            chatMessage(io, socket)
        } else {
            socket.join(roomId)
            socket.emit(
                eventSocket.newMessage,
                `Joined direct room with ${friend.username}`
            )
            await socketServices.updateActiveInGroup(user.id, roomId, true)
            chatMessage(io, socket, roomId)
        }
    } catch (error) {
        return socket.emit(eventSocket.error, error.message)
    }
}

export const joinRoom = async (io, socket) => {
    const user = await socketServices.findUser(socket.handshake.headers.id)
    if (!user) {
        return socket.emit(eventSocket.error, 'User does not exist')
    }
    const roomInfo = await socketServices.findRoom(socket.handshake.query.room)
    if (!roomInfo) {
        return socket.emit(eventSocket.error, 'Room chat does not exist')
    }
    const member = await socketServices.findMember(
        user.id,
        socket.handshake.query.room
    )
    if (roomInfo.groupTypes == 'public') {
        await socketServices.addMember(roomInfo.id, user.id)
        socket.join(roomInfo.id)
        socket.broadcast.emit(
            eventSocket.newMember,
            `Hello new my roomate ${user.username}`
        )
        await socketServices.updateActiveInGroup(user.id, roomInfo.id, true)
        console.log('Active in group')
        chatMessage(io, socket, roomInfo.id)
    } else if (member) {
        socket.join(roomInfo.id)
        socket.emit(
            eventSocket.newMessage,
            `Hello ${user.username} room ${roomInfo.id}`
        )
        //Update active in group
        await socketServices.updateActiveInGroup(user.id, roomInfo.id, true)
        chatMessage(io, socket, roomInfo.id)
    } else {
        socket.emit(eventSocket.error, { message: 'Cant join this room' })
    }
}

// if not found room by code => error: Not found, else addMember
export const JoinByCode = async (io, socket) => {
    const user = await socketServices.findUser(socket.handshake.headers.id)
    if (!user) {
        return socket.emit(eventSocket.error, 'User does not exist')
    }
    const codeGroup = socket.handshake.query.code_roomchat
    const findRoom = await socketServices.checkCode(codeGroup)
    if (findRoom) {
        const member = await socketServices.findMember(user.id, findRoom.id)
        if (!member) await socketServices.addMember(findRoom.id, user.id)
        socket.join(findRoom.id)
        socket.emit(
            eventSocket.newMessage,
            `Hello ${user.username} room ${findRoom.id}`
        )
        //Update active in group
        await socketServices.updateActiveInGroup(user.id, findRoom.id, true)
        chatMessage(io, socket, findRoom.id)
    } else {
        socket.emit(eventSocket.error, { message: 'Not found this room' })
    }
}

// check amount member, error: at least 3 members
export const createRoom = async (io, socket) => {
    const user = await socketServices.findUser(socket.handshake.headers.id)
    socket.on(eventSocket.create, async (data) => {
        const dataParse = JSON.parse(JSON.stringify(data))
        let countMember = 0
        if (dataParse.friends.length < 2) {
            return socket.emit(eventSocket.error, {
                message: 'At least 3 members in a room',
            })
        }
        let membersCantAdd = []
        let members = []
        await dataParse.friends.reduce(async (memberList, member) => {
            let check = await checkPrivacyMember(
                user.id,
                member.friendId,
                socket
            )
            console.log('check', check)
            if (check) {
                countMember++
                members.push(member.friendId)
            } else {
                membersCantAdd.push(member.friendId)
            }
            return members
        }, [])
        console.log('countMember', membersCantAdd, members)
        if (countMember > 1) {
            const newRoom = await socketServices.createRoomChat(
                dataParse.title,
                'group',
                'private',
                makeid(6)
            )
            members.map(async (memberId) => {
                await socketServices.addMember(newRoom.id, memberId)
            })
            await socketServices.addMember(newRoom.id, user.id)
            socket.join(newRoom.id)
            if (membersCantAdd.length) {
                membersCantAdd.map(async (memberId) => {
                    let member = await socketServices.findUser(memberId)
                    socket.emit(
                        eventSocket.error,
                        `Cant add ${member.username} into this room`
                    )
                })
            }
            socket.emit(eventSocket.newMessage, `Welcome to new room`)
            chatMessage(io, socket, newRoom.id)
        } else {
            if (membersCantAdd.length) {
                membersCantAdd.map(async (memberId) => {
                    let member = await socketServices.findUser(memberId)
                    socket.emit(
                        eventSocket.error,
                        `Cant add ${member.username} into this room`
                    )
                })
            }
            socket.emit(eventSocket.error, `At least 3 members in a room`)
        }
    })
}

export const muteNotice = async (io, socket) => {
    const user = await socketServices.findUser(socket.handshake.headers.id)
    await socketServices.updateMute(user.id)
}

export const disconnectUser = async (io, socket) => {
    try {
        const userId = socket.handshake.headers.id
        const user = await socketServices.findUser(socket.handshake.headers.id)
        if (!user) {
            return socket.emit(eventSocket.error, `User does not exist`)
        }
        socket.on('disconnect', async () => {
            console.log(
                'socket.handshake.query.room',
                socket.handshake.query.room
            )

            if (socket.handshake.query.friend) {
                let roomId = ''
                const friendDirectRoom = await socketServices.findMemberDirect(
                    socket.handshake.query.friend
                )
                const userDirectRoom = await socketServices.findMemberDirect(
                    userId
                )
                friendDirectRoom.map((i) =>
                    userDirectRoom.filter((j) => {
                        if (j.roomId == i.roomId) roomId = i.roomId
                    })
                )
                console.log('disconnect room', roomId)
                const updateActiveInGroup =
                    await socketServices.updateActiveInGroup(
                        user.id,
                        roomId,
                        false
                    )
                if (!updateActiveInGroup) {
                    return socket.emit(eventSocket.error, `Error`)
                }
            }
            if (socket.handshake.query.room) {
                console.log(
                    'socket.handshake.query.room',
                    socket.handshake.query.room
                )
                await socketServices.updateActiveInGroup(
                    user.id,
                    socket.handshake.query.room,
                    false
                )
            }
            await socketServices.updateActive(user.id)
            socket.broadcast.emit(
                'userDisconnect',
                `${user.username} has left room chat`
            )
        })
    } catch (error) {
        return socket.emit(eventSocket.error, error.message)
    }
}

export const noticeMessage = async (roomId, user) => {
    try {
        const findRoom = await socketServices.findRoom(roomId)
        const listMember = await socketServices.getRoomUsers(roomId)
        for (let member of listMember) {
            if (member.userId != user.id && member.activeInGroup == false) {
                if (findRoom.type == 'direct') {
                    await socketServices.addNotice(
                        member.userId,
                        `You have a new message from ${user.username}`
                    )
                } else {
                    await socketServices.addNotice(
                        member.userId,
                        `You have a new message from ${findRoom.title} room`
                    )
                }
            }
        }
    } catch (error) {
        return false
    }
}

const checkPrivacyMember = async (userId, memId, socket) => {
    try {
        const userPrivacy = await socketServices.userPrivacy(memId)
        const infoMember = await socketServices.findUser(memId)
        let userFriend = await AppDataSource.getRepository(Friend).findOne({
            where: {
                userId: userId,
                friendId: memId,
            },
        })
        if (userPrivacy.roleAddToGroup == 'Everybody') {
            return true
        } else if (
            userPrivacy.roleAddToGroup == 'My contacts' &&
            userFriend &&
            userFriend.status == 'friend'
        ) {
            return true
        } else {
            socket.emit(
                eventSocket.newMessage,
                `You cant add ${infoMember.username} into the group`
            )
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}
