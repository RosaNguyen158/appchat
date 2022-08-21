import dotenv from "dotenv"; // de su dung cac bien trong .env
import bycrypt from "bcrypt";
import { generateTokens } from "@/helpers/generateToken";
import * as OtpEmail from "../helpers/otpEmail";
import { AppDataSource } from "@/app.js";
import { User } from "../entities/User";
import { Session } from "../entities/Session";
import geoip from "geoip-lite";
import UAParser from "ua-parser-js";
import { Setting } from "@/entities/Setting";

dotenv.config();

export const register = async (req, res, next) => {
  const user = new User();
  user.password = req.body.password;
  user.username = req.body.username;
  user.email = req.body.email;
  await AppDataSource.manager.save(user);

  const userSetting = new Setting();
  userSetting.user_id = user.id;
  await AppDataSource.manager.save(userSetting);
  console.log(user.id);
  // res.redirect("/auth/login");
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

export const verify = async (req, res, next) => {
  try {
    let user_name = req.body.username;
    let pass_word = req.body.password;
    let otp = req.body.otp;
    let findUser = await AppDataSource.getRepository(User).findOne({
      where: {
        username: user_name,
        password: pass_word,
      },
    });
    if (!otp) {
      res.json("FAIL");
    } else {
      const validOTP = await bycrypt.compare(`${otp}`, findUser.otp);
      if (!validOTP) {
        res.json("FAILED VERIFY OTP");
      } else {
        findUser.is_active = true;
        const tokens = generateTokens(findUser);
        const user_session = new Session();
        user_session.token = tokens.accessToken;
        user_session.refresh_token = tokens.refreshToken;
        user_session.user_id = findUser.id;
        user_session.agent_info = req.headers["user-agent"];
        const geo = geoip.lookup("222.253.42.176");
        user_session.location = geo.country;
        user_session.ip_address = req.ip;
        const agent_info = UAParser(
          "Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1"
        );
        user_session.agent_os = agent_info.os.name;
        user_session.agent_browser = agent_info.browser.name;
        user_session.device_name = agent_info.device.vendor;
        await AppDataSource.manager.save(user_session);
        await AppDataSource.manager.save(findUser);
        return res.json({
          message: "thanh cong",
          token: tokens.accessToken,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader; // token
  let user_session = await AppDataSource.getRepository(Session).findOne({
    where: {
      token: token,
    },
  });
  user_session.refresh_token = null;
  await AppDataSource.manager.save(user_session);
  res.json("Success Logout");
};
