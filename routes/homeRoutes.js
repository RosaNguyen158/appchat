import express from "express";
import * as HomeController from "@/controllers/HomeControllers";
import { RefreshToken } from "../middlewares/authenToken";

let route = express.Router();

route.get("/insertReact", RefreshToken, HomeController.insertReact);
route.get("/friend", RefreshToken, HomeController.friend);
route.get("/home", HomeController.home);

export default route;
