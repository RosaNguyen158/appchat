import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import path from "path";
import authenToken from "@/middlewares/authenToken";

const __dirname = path.resolve();

dotenv.config();
// const UserList = [
//   {
//     id: 1,
//     username: "John",
//     password: 123,
//     email: "hongnguyenarmy@gmail.com",
//     age: 18,
//   },
//   {
//     id: 2,
//     username: "John",
//     email: "hongnguyenarmy@gmail.com",
//     password: 123,
//     age: 18,
//   },
// ];

// app.get("/app", authenToken, (req, res) => {
//   res.json({ status: "Success!", data: User });
// });

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
