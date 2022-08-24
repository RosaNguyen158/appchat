import { Session } from "@/entities/Session";
import jwt from "jsonwebtoken";
import { User } from "@/entities/User";
import { AppDataSource } from "@/app.js";
import { generateTokens } from "@/helpers/generateToken";

export const RefreshToken = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    const token = authorizationHeader; // token
    console.log("authorizationHeader", token);
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
    console.log(user);
    if (!token) {
      console.log("error");
    } else {
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
                req.user = user;
                // res.json({
                //   token: tokens.accessToken,
                // });
              } else {
                res.json("Login Again");
              }
            }
          );
        }
        (req.user = user), (req.token = user_session.token);
        next();
      });
    }
  } catch (error) {
    return res.json({ error: error.message });
  }
};
