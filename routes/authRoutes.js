import express from "express";
import * as AuthController from "@/controllers/AuthControllers";

const route = express.Router();

// route.post("/refreshToken", AuthController.RefreshToken);
route.post("/register", AuthController.register);
route.post("/login", AuthController.login);
route.post("/verify", AuthController.verify);
route.post("/logout", AuthController.logout);

export default route;
