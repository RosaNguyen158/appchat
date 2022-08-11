import nodemailer from "nodemailer";
import bycrypt from "bcrypt";
import { User } from "../entities/User";

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "rosa.nguyen.goldenowl@gmail.com", // generated ethereal user
    pass: "pzrogwaolkqbueru", // generated ethereal password
  },
});

export const sendOTPVerificationEmail = async (user) => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  console.log("sendOTPVerificationEmail", user.email);
  try {
    const mailOptions = {
      from: "rosa.nguyen.goldenowl@gmail.com",
      to: user.email,
      subject: "Verify Your Email",
      html: `Enter ${otp}`,
    };

    const saltRounds = 10;
    let hashedOTP = await bycrypt.hash(otp, saltRounds);
    console.log("hashedOTP 1", hashedOTP);
    let updated = await User.update({ id: user.id }, { otp: hashedOTP });
    console.log(updated);
    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default { sendOTPVerificationEmail };
