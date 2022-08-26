import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import path from "path";
import { AppDataSource } from "@/app.js";
import { React } from "@/entities/React";
import { User } from "@/entities/User";
import { Friend } from "@/entities/Friend";
import { Session } from "@/entities/Session";
import { Setting } from "@/entities/Setting";
import * as ChatController from "@/controllers/ChatControllers";
import { convertMsToHM } from "@/helpers/convertTimeLastSeen";
const __dirname = path.resolve();

dotenv.config();

export const insertReact = //middleware
  async (req, res, next) => {
    try {
      const icon = new React();
      icon.name = "Angry";
      await AppDataSource.manager.save(icon);
      console.log(icon);
      return res.json({
        message: "Successfully Saved.",
        token: req.token,
      });
    } catch (error) {
      console.log(error);
      return res.json({ message: error.message, token: req.token });
    }
  };

export const home = async (req, res, next) => {
  try {
    return res.json({ message: "Welcome Home!", token: req.token });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const firstNameChange = req.query.firstname;
    const lastNameChange = req.query.lastname;
    const updateContact = await AppDataSource.getRepository(User).findOne({
      where: {
        id: req.user.id,
      },
    });
    updateContact.first_name = firstNameChange;
    updateContact.last_name = lastNameChange;
    const result = await AppDataSource.manager.save(updateContact);
    if (!result) {
      return res.json({
        message: "Update failed!",
        token: req.token,
      });
    }
    return res.json({
      message: "Updated Success!",
      token: req.token,
    });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const searchContact = async (req, res, next) => {
  try {
    const findByKey = req.query.findByKey;
    let findUser = await AppDataSource.getRepository(User).find({
      where: {
        username: findByKey,
      },
    });
    if (!findUser) {
      return res.json({
        message: "No results found",
        token: req.token,
      });
    }
    return res.json({
      result: findUser,
      token: req.token,
    });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const requestFriend = async (req, res, next) => {
  try {
    let findFriend = await AppDataSource.getRepository(User).findOne({
      where: {
        id: req.body.friend_id,
      },
    });
    if (!findFriend) {
      return res.json({
        message: "Friend account does not exist",
        token: req.token,
      });
    }
    const requestFriend = new Friend();
    requestFriend.user_id = req.user.id;
    requestFriend.friend_id = req.body.friend_id;
    requestFriend.status = "request";
    await AppDataSource.manager.save(requestFriend);
    const infoUser = await ChatController.findUser(req.user.id);
    const newNotice = await ChatController.addNotice(
      req.body.friend_id,
      `${infoUser.username} sent you a friend request.`
    );
    console.log(newNotice);
    return res.json({
      message: "Sent request Success!",
      token: req.token,
    });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const confirmFriend = async (req, res, next) => {
  try {
    let findReqFriend = await AppDataSource.getRepository(Friend).findOne({
      where: {
        friend_id: req.user.id,
        user_id: req.body.friend_id,
        status: "request",
      },
    });
    if (!findReqFriend) {
      return res.json({
        message: "Request friend does not exist",
        token: req.token,
      });
    }
    findReqFriend.status = "friend";
    await AppDataSource.manager.save(findReqFriend);

    const newFriend = new Friend();
    newFriend.user_id = req.user.id;
    newFriend.friend_id = req.body.friend_id;
    newFriend.status = "friend";
    await AppDataSource.manager.save(newFriend);

    const infoUser = await ChatController.findUser(req.user.id);
    await ChatController.addNotice(
      req.body.friend_id,
      `${infoUser.username} accepted your friend request.`
    );
    return res.status(200).json({
      message: "Confirmed success",
      token: req.token,
    });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const unFriend = async (req, res, next) => {
  try {
    let findReqFriend = await AppDataSource.getRepository(Friend).findOne({
      where: {
        friend_id: req.user.id,
        user_id: req.body.friend_id,
        status: "friend",
      },
    });
    console.log(findReqFriend);
    if (!findReqFriend) {
      return res.json({
        message: "Not found friend relationship",
        token: req.token,
      });
    }
    let recordFriend1 = await AppDataSource.createQueryBuilder()
      .delete()
      .from(Friend)
      .where("user_id = :user_id and friend_id = :friend_id", {
        user_id: req.user.id,
        friend_id: req.body.friend_id,
      })
      .execute();
    let recordFriend2 = await AppDataSource.createQueryBuilder()
      .delete()
      .from(Friend)
      .where("friend_id = :user_id and user_id = :friend_id", {
        user_id: req.user.id,
        friend_id: req.body.friend_id,
      })
      .execute();

    return res.status(200).json({
      message: "Unfriend success",
      token: req.token,
    });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const updatePrivacy = async (req, res, next) => {
  try {
    let findSetting = await AppDataSource.getRepository(Setting).findOne({
      where: {
        user_id: req.user.id,
      },
    });
    let findUser = await AppDataSource.getRepository(User).findOne({
      where: {
        id: req.user.id,
      },
    });
    if (!findSetting) {
      return res.json({
        message: "User's Setting is not found",
        token: req.token,
      });
    }
    if (req.body.role_phone_seenby) {
      findSetting.role_phone_seenby = req.body.role_phone_seenby;
    }
    if (req.body.role_lastseen) {
      findSetting.role_lastseen = req.body.role_lastseen;
    }
    if (req.body.role_add_to_group) {
      findSetting.role_add_to_group = req.body.role_add_to_group;
    }
    if (req.body.link_in_fwd) {
      findSetting.link_in_fwd = req.body.link_in_fwd;
    }
    if (req.body.two_step_verification) {
      findSetting.two_step_verification = req.body.two_step_verification;
      findUser.recovery = null;
      findUser.secret_2FA = null;
      await AppDataSource.manager.save(findUser);
    }
    const result = await AppDataSource.manager.save(findSetting);
    if (!result) {
      return res.json({
        message: error.message,
        token: req.token,
      });
    }
    return res.status(200).json({
      message: "Update privacy success",
      token: req.token,
    });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const infoUser = async (req, res, next) => {
  try {
    let user_id = req.user.id,
      contact_id = req.body.contact_id;

    let findUser = await AppDataSource.getRepository(User).findOne({
      where: {
        id: req.body.contact_id,
      },
    });

    let userSetting = await AppDataSource.getRepository(Setting).findOne({
      where: {
        user_id: req.body.contact_id,
      },
    });

    let userFriend = await AppDataSource.getRepository(Friend).findOne({
      where: {
        user_id: user_id,
        friend_id: contact_id,
      },
    });
    let infoUser = {};
    infoUser.firstname = findUser.first_name;
    infoUser.lastname = findUser.last_name;
    infoUser.username = findUser.username;
    infoUser.username = findUser.username;

    if (userSetting.role_phone_seenby == "Everybody") {
      infoUser.email = findUser.email;
    } else if (
      userSetting.role_phone_seenby == "My contacts" &&
      userFriend &&
      userFriend.status == "friend"
    ) {
      infoUser.email = findUser.email;
    }

    if (userSetting.role_lastseen == "Everybody") {
      if (findUser.is_active) {
        infoUser.status = "online";
      } else {
        infoUser.lastseen = convertMsToHM(new Date() - findUser.last_seen);
      }
    } else if (
      userSetting.role_lastseen == "My contacts" &&
      userFriend &&
      userFriend.status == "friend"
    ) {
      if (findUser.is_active) {
        infoUser.status = "online";
      } else {
        infoUser.lastseen = convertMsToHM(new Date() - findUser.last_seen);
      }
    }
    return res.json({ infoUser: infoUser, token: req.token });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    let checkSession = await AppDataSource.getRepository(Session).findOne({
      where: {
        id: req.body.session_id,
      },
    });
    if (!checkSession) {
      res.json({ message: "Session is not found", token: req.token });
    } else if (checkSession.user_id == req.user.id) {
      let recordFriend1 = await AppDataSource.createQueryBuilder()
        .delete()
        .from(Session)
        .where("id = :session_id", {
          session_id: req.body.session_id,
        })
        .execute();
      return res
        .status(200)
        .json({ message: "Deleted session", token: req.token });
    }
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};

export const deleteAllSession = async (req, res, next) => {
  try {
    let listSession = await AppDataSource.getRepository(Session).find({
      where: {
        user_id: req.user.id,
      },
    });
    if (listSession.length > 1) {
      listSession.map(async (session) => {
        if (session.id != req.session) {
          let recordFriend1 = await AppDataSource.createQueryBuilder()
            .delete()
            .from(Session)
            .where("id = :session_id", {
              session_id: session.id,
            })
            .execute();
        }
      });
    }
    return res
      .status(200)
      .json({ message: "Deleted all session", token: req.token });
  } catch (error) {
    return res.json({ message: error.message, token: req.token });
  }
};
