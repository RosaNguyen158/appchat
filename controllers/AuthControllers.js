import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import bycrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { sanitizeBody } from "express-validator";
import * as OtpEmail from "../helpers/otpEmail";
import { AppDataSource } from "@/app.js";
import { User } from "../entities/User";
import { UserAccount } from "../entities/UserAccount";
import { Friend } from "../entities/Friend";

dotenv.config();

export const register = async (req, res, next) => {
  const user = new User();
  user.password = 333;
  user.username = "Hanna";
  user.email = "hongnguyenarmy@gmail.com";

  const user_account = new UserAccount();
  user_account.is_active = true;
  user_account.user_id = user;
  await AppDataSource.manager.save([user_account, user]);
  console.log(user.id);
  res.json({ message: "Successfully Saved." });
};

export const friend = async (req, res, next) => {
  const user = new User();
  user.password = 333;
  user.username = "Hanna";
  user.email = "hongnguyenarmy@gmail.com";

  const user1 = new User();
  user.password = 333;
  user.username = "Hanna";
  user.email = "hongnguyenarmy@gmail.com";

  const user_account = new UserAccount();
  user_account.is_active = true;
  user_account.user_id = user;

  const friend_account = new UserAccount();
  user_account.is_active = true;
  user_account.user_id = user1;

  const friend = new Friend();
  friend.user_id = 3;
  friend.friend_id = user_account;
  await AppDataSource.manager.save(friend);
  console.log(friend.id);
  res.json({ message: "Successfully Saved Friend." });
};

export const login = async (req, res, next) => {
  let user_name = req.body.username;
  let pass_word = req.body.password;

  console.log("username ", user_name, "pass ", pass_word);
  let findUser = await AppDataSource.getRepository(User).findOne({
    where: {
      username: user_name,
      password: pass_word,
    },
  });
  console.log("findUser ", findUser);

  if (!findUser) {
    res.json("Fail");
  } else {
    await OtpEmail.sendOTPVerificationEmail(findUser);
    res.json({
      status: "Sending",
    });
  }
};

export const enterOtp = (req, res, next) => {
  return res.render("verify.html");
};

export const verify = async (req, res, next) => {
  try {
    let user_name = req.body.username;
    let pass_word = req.body.password;
    let otp = req.body.otp;
    console.log(otp);
    let findUser = await AppDataSource.getRepository(User).findOne({
      where: {
        username: user_name,
        password: pass_word,
      },
    });
    if (!otp) {
      res.json("FAIL");
    } else {
      let hashedOTP = `${findUser.otp}`;
      console.log("findUser.otp", findUser.otp);
      const validOTP = await bycrypt.compare(`${otp}`, hashedOTP);
      if (!validOTP) {
        res.json("FAILED VERIFY OTP");
      } else {
        findUser.verify = "true";
        findUser.otp = "";
        const accessToken = jwt.sign(
          { user_name, pass_word },
          process.env.ACCESS_TOKEN_SECRET
        );
        res.json({
          message: "thanh cong",
          token: accessToken,
        });
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};
