import passport from 'passport'

import { jwtStrategy } from '@/passport/jwt'
import { localStrategy } from '@/passport/local'

passport.use(localStrategy)
passport.use(jwtStrategy)

export default passport
