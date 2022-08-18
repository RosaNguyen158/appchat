import { Session } from "@/entities/Session";
import jwt from "jsonwebtoken";
import { User } from "@/entities/User";
import { AppDataSource } from "@/app.js";
import { generateTokens } from "@/helpers/generateToken";

export const verifyToken = async (socket, token) => {
  let user_session = await AppDataSource.getRepository(Session).findOne({
    where: {
      token: token,
    },
  });
  console.log("user_session", user_session);
  let user = await AppDataSource.getRepository(User).findOne({
    where: {
      id: user_session.user_id,
    },
  });
  if (!token) {
    return false;
  } else {
    console.log("CHECK ACCESSTOKEN");
    jwt.verify(token, user.secret_key, async (err) => {
      if (err) {
        console.log("CHECK REFRESHTOKEN");
        jwt.verify(
          user_session.refresh_token,
          user.refresh_secret_key,
          async (err, data) => {
            if (!err) {
              const tokens = generateTokens(user);
              user_session.token = tokens.accessToken;
              user_session.refresh_token = tokens.refreshToken;
              await AppDataSource.manager.save(user_session);
              return true;
            } else {
              return false;
            }
          }
        );
      }
    });
  }
};
