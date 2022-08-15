import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import path from "path";
import { AppDataSource } from "@/app.js";
import { React } from "@/entities/React";
import { User } from "../entities/User";
import { Friend } from "../entities/Friend";
import { RefreshToken } from "../middlewares/authenToken";

const __dirname = path.resolve();

dotenv.config();

export const insertReact = RefreshToken; //middleware
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
  console.log(friend);
  res.json({ message: "Successfully Saved Friend." });
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
