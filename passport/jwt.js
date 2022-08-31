const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt
const { findSession, findUser } = require('@/services/socketServices')

export const getUser = async () => {
    const token = ExtractJwt.fromAuthHeaderWithScheme('jwt')
    console.log('token', token)
    const user_session = await findSession(token, function (err) {
        if (err) {
            console.log(err)
            return false
        }
    })
    const user = await findUser(user_session.userId, function (err) {
        if (err) {
            console.log(err)
            return false
        }
    })
    return user.secretKey
}

export const jwtStrategy = new JwtStrategy(
    {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
        secretOrKey: getUser,
    },
    (jwt_payload, done) => {
        if (!jwt_payload) {
            return done(null, false)
        } else {
            return done(null, jwt_payload)
        }
    }
)
