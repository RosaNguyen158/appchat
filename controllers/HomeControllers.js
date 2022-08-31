import dotenv from 'dotenv' // de su dung cac bien trong .env

import { AppDataSource } from '@/app.js'
import * as ChatController from '@/controllers/ChatControllers'
import { Friend } from '@/entities/Friend'
import { React } from '@/entities/React'
import { Session } from '@/entities/Session'
import { Setting } from '@/entities/Setting'
import { User } from '@/entities/User'
import { convertMsToHM } from '@/helpers/convertTimeLastSeen'

dotenv.config()

export const insertReact = //middleware
    async (req, res) => {
        try {
            const icon = new React()
            icon.name = 'Angry'
            await AppDataSource.manager.save(icon)
            console.log(icon)
            return res.json({
                message: 'Successfully Saved.',
                token: req.token,
            })
        } catch (error) {
            console.log(error)
            return res.json({ message: error.message, token: req.token })
        }
    }

export const home = async (req, res) => {
    try {
        return res.json({ message: 'Welcome Home!', token: req.token })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const updateContact = async (req, res) => {
    try {
        const firstNameChange = req.query.firstname
        const lastNameChange = req.query.lastname
        const updateContact = await AppDataSource.getRepository(User).findOne({
            where: {
                id: req.user.id,
            },
        })
        updateContact.firstName = firstNameChange
        updateContact.lastName = lastNameChange
        const result = await AppDataSource.manager.save(updateContact)
        if (!result) {
            return res.json({
                message: 'Update failed!',
                token: req.token,
            })
        }
        return res.json({
            message: 'Updated Success!',
            token: req.token,
        })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const searchContact = async (req, res) => {
    try {
        const findByKey = req.query.findByKey
        let findUser = await AppDataSource.getRepository(User).find({
            where: {
                username: findByKey,
            },
        })
        if (!findUser) {
            return res.json({
                message: 'No results found',
                token: req.token,
            })
        }
        return res.json({
            result: findUser,
            token: req.token,
        })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const requestFriend = async (req, res) => {
    try {
        let findFriend = await AppDataSource.getRepository(User).findOne({
            where: {
                id: req.body.friendId,
            },
        })
        if (!findFriend) {
            return res.json({
                message: 'Friend account does not exist',
                token: req.token,
            })
        }
        const requestFriend = new Friend()
        requestFriend.userId = req.user.id
        requestFriend.friendId = req.body.friendId
        requestFriend.status = 'request'
        await AppDataSource.manager.save(requestFriend)
        const infoUser = await ChatController.findUser(req.user.id)
        const newNotice = await ChatController.addNotice(
            req.body.friendId,
            `${infoUser.username} sent you a friend request.`
        )
        console.log(newNotice)
        return res.json({
            message: 'Sent request Success!',
            token: req.token,
        })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const confirmFriend = async (req, res) => {
    try {
        let findReqFriend = await AppDataSource.getRepository(Friend).findOne({
            where: {
                friendId: req.user.id,
                userId: req.body.friendId,
                status: 'request',
            },
        })
        if (!findReqFriend) {
            return res.json({
                message: 'Request friend does not exist',
                token: req.token,
            })
        }
        findReqFriend.status = 'friend'
        await AppDataSource.manager.save(findReqFriend)

        const newFriend = new Friend()
        newFriend.userId = req.user.id
        newFriend.friendId = req.body.friendId
        newFriend.status = 'friend'
        await AppDataSource.manager.save(newFriend)

        const infoUser = await ChatController.findUser(req.user.id)
        await ChatController.addNotice(
            req.body.friendId,
            `${infoUser.username} accepted your friend request.`
        )
        return res.status(200).json({
            message: 'Confirmed success',
            token: req.token,
        })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const unFriend = async (req, res) => {
    try {
        let findReqFriend = await AppDataSource.getRepository(Friend).findOne({
            where: {
                friendId: req.user.id,
                userId: req.body.friendId,
                status: 'friend',
            },
        })
        console.log(findReqFriend)
        if (!findReqFriend) {
            return res.json({
                message: 'Not found friend relationship',
                token: req.token,
            })
        }
        await AppDataSource.createQueryBuilder()
            .delete()
            .from(Friend)
            .where('userId = :userId and friendId = :friendId', {
                userId: req.user.id,
                friendId: req.body.friendId,
            })
            .execute()
        await AppDataSource.createQueryBuilder()
            .delete()
            .from(Friend)
            .where('friendId = :userId and userId = :friendId', {
                userId: req.user.id,
                friendId: req.body.friendId,
            })
            .execute()

        return res.status(200).json({
            message: 'Unfriend success',
            token: req.token,
        })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const updatePrivacy = async (req, res) => {
    try {
        let findSetting = await AppDataSource.getRepository(Setting).findOne({
            where: {
                userId: req.user.id,
            },
        })
        let findUser = await AppDataSource.getRepository(User).findOne({
            where: {
                id: req.user.id,
            },
        })
        if (!findSetting) {
            return res.json({
                message: "User's Setting is not found",
                token: req.token,
            })
        }
        if (req.body.rolePhoneSeenby) {
            findSetting.rolePhoneSeenby = req.body.rolePhoneSeenby
        }
        if (req.body.roleLastseen) {
            findSetting.roleLastseen = req.body.roleLastseen
        }
        if (req.body.roleAddToGroup) {
            findSetting.roleAddToGroup = req.body.roleAddToGroup
        }
        if (req.body.linkInFwd) {
            findSetting.linkInFwd = req.body.linkInFwd
        }
        if (req.body.twoStepVerification) {
            findSetting.twoStepVerification = req.body.twoStepVerification
            findUser.recovery = null
            findUser.secret2FA = null
            await AppDataSource.manager.save(findUser)
        }
        const result = await AppDataSource.manager.save(findSetting)
        if (!result) {
            return res.json({
                message: 'Failed to update setting',
                token: req.token,
            })
        }
        return res.status(200).json({
            message: 'Update privacy success',
            token: req.token,
        })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const infoUser = async (req, res) => {
    try {
        let userId = req.user.id,
            contactId = req.body.contactId

        let findUser = await AppDataSource.getRepository(User).findOne({
            where: {
                id: req.body.contactId,
            },
        })

        let userSetting = await AppDataSource.getRepository(Setting).findOne({
            where: {
                userId: req.body.contactId,
            },
        })

        let userFriend = await AppDataSource.getRepository(Friend).findOne({
            where: {
                userId: userId,
                friendId: contactId,
            },
        })
        let infoUser = {}
        infoUser.firstname = findUser.firstName
        infoUser.lastname = findUser.lastName
        infoUser.username = findUser.username
        infoUser.username = findUser.username

        if (userSetting.rolePhoneSeenby == 'Everybody') {
            infoUser.email = findUser.email
        } else if (
            userSetting.rolePhoneSeenby == 'My contacts' &&
            userFriend &&
            userFriend.status == 'friend'
        ) {
            infoUser.email = findUser.email
        }

        if (userSetting.roleLastseen == 'Everybody') {
            if (findUser.isActive) {
                infoUser.status = 'online'
            } else {
                infoUser.lastseen = convertMsToHM(
                    new Date() - findUser.lastSeen
                )
            }
        } else if (
            userSetting.roleLastseen == 'My contacts' &&
            userFriend &&
            userFriend.status == 'friend'
        ) {
            if (findUser.isActive) {
                infoUser.status = 'online'
            } else {
                infoUser.lastseen = convertMsToHM(
                    new Date() - findUser.lastSeen
                )
            }
        }
        return res.json({ infoUser: infoUser, token: req.token })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const deleteSession = async (req, res) => {
    try {
        let checkSession = await AppDataSource.getRepository(Session).findOne({
            where: {
                id: req.body.session_id,
            },
        })
        if (!checkSession) {
            res.json({ message: 'Session is not found', token: req.token })
        } else if (checkSession.userId == req.user.id) {
            await AppDataSource.createQueryBuilder()
                .delete()
                .from(Session)
                .where('id = :session_id', {
                    session_id: req.body.session_id,
                })
                .execute()
            return res
                .status(200)
                .json({ message: 'Deleted session', token: req.token })
        }
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}

export const deleteAllSession = async (req, res) => {
    try {
        let listSession = await AppDataSource.getRepository(Session).find({
            where: {
                userId: req.user.id,
            },
        })
        if (listSession.length > 1) {
            listSession.map(async (session) => {
                if (session.id != req.session) {
                    await AppDataSource.createQueryBuilder()
                        .delete()
                        .from(Session)
                        .where('id = :session_id', {
                            session_id: session.id,
                        })
                        .execute()
                }
            })
        }
        return res
            .status(200)
            .json({ message: 'Deleted all session', token: req.token })
    } catch (error) {
        return res.json({ message: error.message, token: req.token })
    }
}
