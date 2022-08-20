import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import path from "path";
import { AppDataSource } from "@/app.js";
import { React } from "@/entities/React";
import { User } from "@/entities/User";
import { Friend } from "@/entities/Friend";
import { Session } from "@/entities/Session";
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
  const authorizationHeader = req.headers["authorization"];
  const token = authorizationHeader; // token
  let user_session = await AppDataSource.getRepository(Session).findOne({
    where: {
      token: token,
    },
  });
  const updateSession = await AppDataSource.getRepository(User).findOne({
    where: {
      first_name: firstNameChange,
      last_name: lastNameChange,
      id: user_session.id,
    },
  });
  return res.json({
    message: "Updated Success!",
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
  });
};

export const home =
  ((req, res, next) => {
    try {
      console.log(req.cookies.token);
      let token = req.cookies.token;
      let result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (result) {
        next();
      }
    } catch (error) {
      return res.redirect("/login");
    }
  },
  (req, res, next) => {
    res.sendFile(path.join(__dirname, "home.html"));
  });

export const friend = async (req, res, next) => {
  const friend = new Friend();
  friend.user_id = req.body.user_id;
  friend.friend_id = req.body.friend_id;
  await AppDataSource.manager.save(friend);
  res.status(200);
};

export const product =
  ((req, res, next) => {
    try {
      console.log("product ", req.cookies.token);
      console.log("product ", req.headers);
      let token = req.cookies.token;
      let result = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (result) {
        next();
      }
    } catch (error) {
      return res.redirect("/login");
    }
  },
  (req, res, next) => {
    res.sendFile(path.join(__dirname, "/product.html"));
  });
