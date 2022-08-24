import nodemailer from "nodemailer";
import bycrypt from "bcrypt";
import { User } from "../entities/User";
import { AppDataSource } from "@/app.js";
import { makeid } from "@/helpers/generateKey";
import { totp } from "otplib";
import dotenv from "dotenv";
import qrcode from "qrcode";
import { authenticator } from "@otplib/preset-default";

dotenv.config();

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
  const otpauth = authenticator.keyuri(
    user.username,
    user.email,
    user.secret_otplib
  );

  const imageUrl = await qrcode.toDataURL(otpauth);
  try {
    const mailOptions = {
      from: "19521550@gm.uit.edu.vn",
      to: user.email,
      subject: "Verify Your Email",
      attachDataUrls: true, //to accept base64 content in messsage
      html: 'Scan QR CODE </br> <img src="' + imageUrl + '">',
    };
    console.log("OTP", user.email);
    // const saltRounds = 10;
    // let hashedOTP = await bycrypt.hash(otp, saltRounds);

    // let updated = await AppDataSource.getRepository(User).update(
    //   { id: user.id },
    //   { otp: otp }
    // );
    // console.log(updated);
    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default { sendOTPVerificationEmail };
