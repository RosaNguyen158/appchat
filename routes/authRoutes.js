import express from "express";
import * as AuthController from "@/controllers/AuthControllers";

const route = express.Router();

route.get("/friend", AuthController.friend);
route.get("/register", AuthController.register);
route.get("/enterOTP", AuthController.enterOtp);
route.post("/login", AuthController.login);
route.post("/verify", AuthController.verify);

export default route;
