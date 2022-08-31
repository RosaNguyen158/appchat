import jwt from 'jsonwebtoken'

import { AppDataSource } from '@/app.js'
import { Session } from '@/entities/Session'
import { User } from '@/entities/User'
import { generateTokens } from '@/helpers/generateToken'

export const RefreshToken = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers['authorization']
        const token = authorizationHeader // token
        let user_session = await AppDataSource.getRepository(Session).findOne({
            where: {
                token: token,
            },
        })
        let user = await AppDataSource.getRepository(User).findOne({
            where: {
                id: user_session.userId,
            },
        })
        if (!token) {
            console.log('error')
        } else {
            jwt.verify(token, user.secretKey, async (err) => {
                if (err) {
                    jwt.verify(
                        user_session.refreshToken,
                        user.refreshSecretKey,
                        async (err) => {
                            if (!err) {
                                const tokens = generateTokens(user)
                                user_session.token = tokens.accessToken
                                user_session.refreshToken = tokens.refreshToken
                                await AppDataSource.manager.save(user_session)
                                req.user = user
                                req.session = user_session.id
                            } else {
                                return
                            }
                        }
                    )
                }
                ;(req.user = user),
                    (req.token = user_session.token),
                    (req.session = user_session.id)
                next()
            })
        }
    } catch (error) {
        return res.json({ error: error.message })
    }
}
