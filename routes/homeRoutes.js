import express from "express";
import * as HomeController from "@/controllers/HomeControllers";

let route = express.Router();

route.get("/home", HomeController.home);
route.get("/product", HomeController.product);

export default route;
