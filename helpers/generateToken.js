import jwt from "jsonwebtoken";
import session from "express-session";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import { Session } from "../entities/Session";
import { AppDataSource } from "@/app.js";

dotenv.config();

export const generateTokens = (payload) => {
  const { id, username, secret_key, refresh_secret_key } = payload;

  // Create JWT
  const accessToken = jwt.sign({ id, username }, secret_key, {
    expiresIn: "15s",
  });

  const refreshToken = jwt.sign({ id, username }, refresh_secret_key, {
    expiresIn: "1h",
  });
  return { accessToken, refreshToken };
};
