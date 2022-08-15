import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import bycrypt from "bcrypt";
import session from "express-session";
import { atob } from "atob";
import { generateTokens } from "@/helpers/generateToken";
import { updateRefreshToken } from "@/helpers/generateToken";
import { body, validationResult } from "express-validator";
import { sanitizeBody } from "express-validator";
import * as OtpEmail from "../helpers/otpEmail";
import { AppDataSource } from "@/app.js";
import { User } from "../entities/User";
import { Session } from "../entities/Session";

dotenv.config();

export const register = async (req, res, next) => {
  body("username")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Username must be specified.")
    .isAlphanumeric()
    .withMessage("Username has non-alphanumeric characters.");
  // body("lastName")
  //     .isLength({ min: 1 })
  //     .trim()
  //     .withMessage("Last name must be specified.")
  //     .isAlphanumeric()
  //     .withMessage("Last name has non-alphanumeric characters."),
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .custom((value) => {
      return AppDataSource.getRepository(User)
        .findOne({
          where: {
            email: value,
          },
        })
        .then((user) => {
          if (user) {
            return Promise.reject("E-mail already in use");
          }
        });
    });
  body("password")
    .isLength({ min: 6 })
    .trim()
    .withMessage("Password must be 6 characters or greater.");
  // Sanitize fields.
  sanitizeBody("username").escape();
  sanitizeBody("email").escape();
  sanitizeBody("password").escape();
  const user = new User();
  user.password = req.body.password;
  user.username = req.body.username;
  user.email = req.body.email;

  await AppDataSource.manager.save(user);
  console.log(user.id);
  res.json({ message: "Successfully Saved." });
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
      console.log(hashedOTP);
      const validOTP = await bycrypt.compare(`${otp}`, hashedOTP);
      if (!validOTP) {
        res.json("FAILED VERIFY OTP");
      } else {
        const user_id = findUser.id;
        await AppDataSource.manager.save(findUser);
        const tokens = generateTokens(findUser);

        const user_session = new Session(); // Insert new Session
        user_session.token = tokens.accessToken;
        user_session.refresh_token = tokens.refreshToken;
        user_session.user_id = user_id;
        await AppDataSource.manager.save(user_session);
        console.log("user_session", user_session);
        // updateRefreshToken(user_session.id, tokens.refreshToken);
        req.session.refreshToken = tokens.refreshToken;
        req.session.token = tokens.accessToken;

        const jwtPayload = JSON.parse(atob(tokens.accessToken.split(".")[1]));
        console.log(jwtPayload);

        console.log(req.session);
        res.json({
          message: "thanh cong",
          token: tokens.accessToken,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  console.log("req.session.refreshToken", req.session.refreshToken);
  let user_session = await AppDataSource.getRepository(Session).findOne({
    where: {
      refresh_token: req.session.refreshToken,
    },
  });
  updateRefreshToken(user_session, null);
  console.log("user_session logout", user_session);
  res.json("Success Logout");
};
