import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { generateTokens } from "@/helpers/generateToken";
import { AppDataSource } from "@/app.js";
import { User } from "../entities/User";
import { Session } from "../entities/Session";
import geoip from "geoip-lite";
import UAParser from "ua-parser-js";
import { Setting } from "@/entities/Setting";
import qrcode from "qrcode";
import { authenticator } from "@otplib/preset-default";
import { makeid } from "@/helpers/generateKey";
import { hashKey } from "@/helpers/hashKey";
import bycrypt from "bcrypt";

dotenv.config();

export const register = async (req, res, next) => {
  let checkUsername = await AppDataSource.getRepository(User).findOne({
    where: {
      username: req.body.username,
    },
  });
  if (checkUsername) {
    return res.json({ message: "This username already used" });
  }
  const user = new User();
  user.password = await hashKey(req.body.password);
  user.username = req.body.username;
  user.email = req.body.email;
  await AppDataSource.manager.save(user);

  const userSetting = new Setting();
  userSetting.user_id = user.id;
  await AppDataSource.manager.save(userSetting);
  console.log(user.id);
  await login(req, res, next);
  console.log("Successfully Saved.");
  return;
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let user = await AppDataSource.getRepository(User).findOne({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.json({ message: "Username or password incorrect" });
    }
    const validPassword = await bycrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ message: "Invalid Password" });
    }
    const userSetting = await AppDataSource.getRepository(Setting).findOne({
      where: {
        user_id: user.id,
      },
    });
    if (userSetting.two_step_verification) {
      user.temp_token = jwt.sign({ username }, user.refresh_secret_key);
      await AppDataSource.manager.save(user, (err, user) => {
        if (err) {
          return res.json({
            message: "Error to create temporary token",
          });
        }
      });
      return res.json({
        temp_token: user.temp_token,
      });
    } else {
      const userSession = await createSession(req, user);
      return res.json({
        message: "new token",
        token: userSession.token,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyToLogin = async (req, res) => {
  try {
    const temp_token = req.headers["authorization"];
    console.log("temp_token", temp_token);
    let user = await AppDataSource.getRepository(User).findOne({
      where: {
        temp_token: temp_token,
      },
    });
    console.log(user);
    if (!user) {
      return res.json({ message: "Temp token is not found" });
    } else {
      let otp = req.body.otp;
      let secret = user.secret_2FA;
      console.log(user);
      user.temp_token = null;
      await AppDataSource.manager.save(user);
      console.log(otp, secret);
      if (!otp) {
        res.json("FAIL");
      } else {
        const validOTP = authenticator.check(otp, secret);
        console.log(validOTP);
        if (!validOTP) {
          res.json("FAILED VERIFY OTP");
        } else {
          const userSession = await createSession(req, user);
          if (!userSession) {
            return res.json({
              message: "Login Failed",
            });
          }
          return res.json({
            message: "Logged in successfully",
            token: userSession.token,
          });
        }
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

export const twoFAEnable = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await AppDataSource.getRepository(User).findOne({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.json({
        send: "User account does not exist",
        token: req.token,
      });
    } else {
      const validPassword = await bycrypt.compare(password, req.user.password);
      console.log(validPassword);
      if (!validPassword) {
        return res.json({ message: "Invalid Password", token: req.token });
      }
      const secret = authenticator.generateSecret();
      user.secret_2FA = secret;
      await AppDataSource.manager.save(user);
      const otp = authenticator.generate(user.secret_2FA);
      const otpauth = authenticator.keyuri(user.username, "App Chat", secret);
      qrcode.toDataURL(otpauth, (err, imageUrl) => {
        if (err) {
          console.log("Error with QR");
          return res.json({ message: err.message, token: req.token });
        } else {
          console.log("req.token", req.token);
          return res.json({ otp: otp, img: imageUrl, token: req.token });
        }
      });
    }
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const verifyToEnable = async (req, res, next) => {
  try {
    let otp = req.body.otp;
    console.log("otp", otp);
    let findUser = await AppDataSource.getRepository(User).findOne({
      where: {
        id: req.user.id,
      },
    });
    const userSetting = await AppDataSource.getRepository(Setting).findOne({
      where: {
        user_id: findUser.id,
      },
    });
    if (!otp) {
      return res.json({ message: "Fail!", token: req.token });
    } else {
      let secret_2FA = findUser.secret_2FA;
      const validOTP = authenticator.check(otp, secret_2FA);
      if (!validOTP) {
        return res.json({ message: "OTP is incorrect", token: req.token });
      } else {
        let recovery = makeid(6);
        findUser.recovery = recovery;
        await AppDataSource.manager.save(findUser);
        userSetting.two_step_verification = true;
        await AppDataSource.manager.save(userSetting, (err, user) => {
          if (err) {
            return res.json({
              send: err.message,
              token: req.token,
            });
          }
        });
        return res.status(200).json({
          message: "2FA enabled",
          recovery: recovery,
          token: req.token,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: "FAILED",
      message: error.message,
      token: req.token,
    });
  }
};

export const loginRecovery = async (req, res) => {
  let userRecovery = await AppDataSource.getRepository(User).findOne({
    where: {
      recovery: req.body.recovery,
    },
  });
  if (!userRecovery) {
    return res.json({ send: "Recovery code incorrect" });
  } else {
    userRecovery.recovery = null;
    let username = userRecovery.username;
    userRecovery.temp_token = jwt.sign(
      { username },
      userRecovery.refresh_secret_key
    );
    await AppDataSource.manager.save(userRecovery, (err, user) => {
      if (err) {
        return res.json({
          message: err.message,
        });
      }
    });
    return res.json({
      message: "Recovery correct",
      temp_token: userRecovery.temp_token,
    });
  }
};

export const resetPassword = async (req, res) => {
  const temp_token = req.headers["authorization"];
  let user = await AppDataSource.getRepository(User).findOne({
    where: {
      temp_token: temp_token,
    },
  });
  if (user) {
    user.temp_token = null;
    user.password = await hashKey(req.body.password);
    user.secret_2FA = null;
    await AppDataSource.manager.save(user, (err, user) => {
      if (err) {
        return res.json({
          message: err.message,
        });
      }
    });
    const userSetting = await AppDataSource.getRepository(Setting).findOne({
      where: {
        user_id: user.id,
      },
    });
    userSetting.two_step_verification = false;
    await AppDataSource.manager.save(userSetting, (err, user) => {
      if (err) {
        return res.json({
          message: err.message,
        });
      }
    });
    return res.json({
      message: "Reset password success",
    });
  } else {
    return res.json({ message: "Temporary token is not found" });
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

export const createSession = async (req, user) => {
  try {
    const { username, password } = user;
    console.log(username, password);
    user.is_active = true;
    const tokens = generateTokens(user);
    const user_session = new Session();
    user_session.token = tokens.accessToken;
    user_session.refresh_token = tokens.refreshToken;
    user_session.user_id = user.id;
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
    await AppDataSource.manager.save(user);
    console.log(user_session);
    return user_session;
  } catch (error) {
    console.log(error);
    return false;
  }
};
