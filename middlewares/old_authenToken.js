import jwt from 'jsonwebtoken'

import { AppDataSource } from '@/app.js'
import { generateTokens } from '@/helpers/generateToken'

import { Session } from '../entities/Session'
import { User } from '../entities/User'

// export function authenToken(req, res, next) {
//   const authorizationHeader = req.headers["authorization"];
//   console.log("authorizationHeader ", authorizationHeader); // Beaer [token]
//   const token = authorizationHeader.split(" ")[1]; // token
//   if (!token) res.sendStatus(401);
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
//     console.log(err, data);
//     if (err) res.sendStatus(403); // loi Forbidden khong co quyen truy cap
//     next();
//   });
// }

export const RefreshToken = async (req, res, next) => {
    const user_session = await AppDataSource.getRepository(Session).findOne({
        where: {
            token: req.session.token,
        },
    })
    let token = req.session.token
    if (!token) {
        let findUser = await AppDataSource.getRepository(User).findOne({
            where: {
                id: user_session.userId,
            },
        })
        jwt.verify(req.session.refreshToken, findUser.refreshSecretKey)
        const tokens = generateTokens(findUser)
        user_session.token = tokens.accessToken
        await AppDataSource.manager.save(user_session)
        next()
    } else {
        next()
    }
}
