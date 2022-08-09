import express from "express";
import * as AuthController from "@/controllers/AuthControllers";

const route = express.Router();

console.log(AuthController);

route.get("/register", AuthController.register);
route.get("/enterOTP", AuthController.enterOtp);
route.post("/login", AuthController.login);
route.post("/verify", AuthController.verify);

export default route;
