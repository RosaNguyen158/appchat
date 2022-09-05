import dotenv from "dotenv"; // de su dung cac bien trong .env
import jwt from "jsonwebtoken";

dotenv.config();

export const generateTokens = (payload) => {
  const { id, username, secretKey, refreshSecretKey } = payload;

  // Create JWT
  const accessToken = jwt.sign({ id, username }, secretKey, {
    expiresIn: "5m",
  });

  const refreshToken = jwt.sign({ id, username }, refreshSecretKey, {
    expiresIn: "1h",
  });
  return { accessToken, refreshToken };
};
