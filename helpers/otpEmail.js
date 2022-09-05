import nodemailer from "nodemailer";
import bycrypt from "bcrypt";
import { User } from "../entities/User";
import { AppDataSource } from "@/app.js";
import { makeid } from "@/helpers/generateKey";

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "19521550@gm.uit.edu.vn", // generated ethereal user
    pass: "hzxfxjlxhiajimqz",
  },
});

export const sendOTPVerificationEmail = async (user) => {
  const otp = makeid(4);
  console.log("sendOTPVerificationEmail", user.email);
  try {
    const mailOptions = {
      from: "19521550@gm.uit.edu.vn",
      to: user.email,
      subject: "Verify Your Email",
      html: `Enter ${otp}`,
    };

    console.log("OTPMAIL ", user);

    const saltRounds = 10;
    let hashedOTP = await bycrypt.hash(otp, saltRounds);
    console.log("hashedOTP 1", hashedOTP);
    let updated = await AppDataSource.getRepository(User).update(
      { id: user.id },
      { otp: hashedOTP }
    );
    console.log(updated);
    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default { sendOTPVerificationEmail };
