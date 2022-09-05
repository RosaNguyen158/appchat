import express from 'express'

import * as AuthController from '@/controllers/AuthControllers'
import { RefreshToken } from '@/middlewares/authenToken'
// import passport from "@/passport";

const route = express.Router()
//PASSPORTjs
// route.post(
//   "/login",
//   passport.authenticate("local", { session: false }),
//   AuthController.login
// );

route.post('/register', AuthController.register)
route.post('/verify-otp-email', AuthController.verifyOTPEmail)
route.post('/login', AuthController.login)
route.post('/verify', AuthController.verifyToLogin)
route.post('/enable-2FA', RefreshToken, AuthController.twoFAEnable)
route.post('/verify-to-enable', RefreshToken, AuthController.verifyToEnable)
route.post('/login-with-recovery-code', AuthController.loginRecovery)
route.post('/reset-password', AuthController.resetPassword)
route.post('/logout', AuthController.logout)

export default route
