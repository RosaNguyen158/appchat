import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env

dotenv.config();

export const generateTokens = (payload) => {
  const { id, username, secret_key, refresh_secret_key } = payload;

  // Create JWT
  const accessToken = jwt.sign({ id, username }, secret_key, {
    expiresIn: "3s",
  });

  const refreshToken = jwt.sign({ id, username }, refresh_secret_key, {
    expiresIn: "1h",
  });
  return { accessToken, refreshToken };
};
