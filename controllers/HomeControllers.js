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
const __dirname = path.resolve();

dotenv.config();

export const insertReact = //middleware
  async (req, res, next) => {
    try {
      const icon = new React();
      icon.name = "Angry";
      await AppDataSource.manager.save(icon);
      console.log(icon);
      res.json({ message: "Successfully Saved." });
    } catch (error) {
      console.log(error);
      res.json({ message: "Fail" });
    }
  };

export const updateContact = async (req, res, next) => {
  const firstNameChange = req.query.firstname;
  const lastNameChange = req.query.lastname;
  const updateContact = await AppDataSource.getRepository(User).findOne({
    where: {
      id: req.query.user_id,
    },
  });
  updateContact.first_name = firstNameChange;
  updateContact.last_name = lastNameChange;
  await AppDataSource.manager.save(updateContact);
  return res.json({
    message: "Updated Success!",
    token: req.body.token,
  });
};

export const searchContact = async (req, res, next) => {
  const findByKey = req.query.findByKey;
  let findUser = await AppDataSource.getRepository(User).findOne({
    where: {
      username: findByKey,
    },
  });
  return res.json({
    result: findUser,
    message: "Updated Success!",
    token: req.body.token,
  });
};

export const requestFriend = async (req, res, next) => {
  const requestFriend = new Friend();
  requestFriend.user_id = req.body.user_id;
  requestFriend.friend_id = req.body.friend_id;
  requestFriend.status = "request";
  await AppDataSource.manager.save(requestFriend);
  return res.status(200);
};

export const confirmFriend = async (req, res, next) => {
  let findReqFriend = await AppDataSource.getRepository(Friend).findOne({
    where: {
      friend_id: req.body.user_id,
      user_id: req.body.friend_id,
    },
  });
  findReqFriend.status = "friend";
  await AppDataSource.manager.save(findReqFriend);

  const newFriend = new Friend();
  newFriend.user_id = req.body.user_id;
  newFriend.friend_id = req.body.friend_id;
  newFriend.status = "friend";
  await AppDataSource.manager.save(newFriend);
  return res.status("200");
};

export const unFriend = async (req, res, next) => {
  let recordFriend1 = await AppDataSource.createQueryBuilder()
    .delete()
    .from(Friend)
    .where("user_id = :user_id and friend_id = :friend_id", {
      user_id: req.body.user_id,
      friend_id: req.body.friend_id,
    })
    .execute();
  let recordFriend2 = await AppDataSource.createQueryBuilder()
    .delete()
    .from(Friend)
    .where("friend_id = :user_id and user_id = :friend_id", {
      user_id: req.body.user_id,
      friend_id: req.body.friend_id,
    })
    .execute();
  return res.status(200);
};

export const deleteSession = async (req, res, next) => {
  let recordFriend1 = await AppDataSource.createQueryBuilder()
    .delete()
    .from(Session)
    .where("id = :session_id", {
      session_id: req.body.session_id,
    })
    .execute();
  return res.status(200);
};

export const updatePrivacy = async (req, res, next) => {
  let findSetting = await AppDataSource.getRepository(Setting).findOne({
    where: {
      user_id: req.body.user_id,
    },
  });
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
  await AppDataSource.manager.save(findSetting);
  return res.status(200);
};

export const infoUser = async (req, res, next) => {
  try {
    let user_id = req.body.user_id,
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
    console.log("fiend", userFriend, user_id);
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
    return res.json({ infoUser: infoUser, token: req.body.token });
  } catch (error) {
    return res.json({ message: error, token: req.body.token });
  }
};
