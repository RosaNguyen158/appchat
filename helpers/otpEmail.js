import bycrypt from 'bcrypt'
import nodemailer from 'nodemailer'

import { AppDataSource } from '@/app.js'
import { makeid } from '@/helpers/generateKey'

import { User } from '../entities/User'

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: '19521550@gm.uit.edu.vn', // generated ethereal user
        pass: 'hzxfxjlxhiajimqz',
    },
})
export const sendOTPVerificationEmail = async (user) => {
    const otp = makeid(4)
    try {
        const mailOptions = {
            from: '19521550@gm.uit.edu.vn',
            to: user.email,
            subject: 'Verify Your Email',
            html: `Enter ${otp}`,
        }
        console.log('OTPMAIL ', otp)
        const saltRounds = 10
        let hashedOTP = await bycrypt.hash(otp, saltRounds)
        await AppDataSource.getRepository(User).update(
            { id: user.id },
            { otpEmail: hashedOTP }
        )
        return transporter.sendMail(mailOptions)
    } catch (error) {
        console.log(error)
        return false
    }
}

export default { sendOTPVerificationEmail }
