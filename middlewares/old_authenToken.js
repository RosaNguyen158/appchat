import jwt from "jsonwebtoken";
import { AppDataSource } from "@/app.js";
import { Session } from "../entities/Session";
import { User } from "../entities/User";
import { generateTokens } from "@/helpers/generateToken";
import { updateRefreshToken } from "@/helpers/generateToken";
import { atob } from "atob";

// export function authenToken(req, res, next) {
//   const authorizationHeader = req.headers["authorization"];
//   console.log("authorizationHeader ", authorizationHeader); // Beaer [token]
//   const token = authorizationHeader.split(" ")[1]; // token
//   if (!token) res.sendStatus(401);
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
//     console.log(err, data);
//     if (err) res.sendStatus(403); // loi Forbidden khong co quyen truy cap
//     next();
//   });
// }

export const RefreshToken = async (req, res, next) => {
  console.log("Middleware REFRESHTOKEN");
  const user_session = await AppDataSource.getRepository(Session).findOne({
    where: {
      token: req.session.token,
    },
  });
  let token = req.session.token;
  console.log("Token", token);
  console.log("RefreshToken", req.session.refreshToken);
  const jwtPayload = JSON.parse(atob(token.split(".")[1]));
  console.log("jwtPayload authenToken", jwtPayload);
  if (!token) {
    console.log("user_session authenToken", user_session);
    let findUser = await AppDataSource.getRepository(User).findOne({
      where: {
        id: user_session.user_id,
      },
    });
    jwt.verify(req.session.refreshToken, findUser.refresh_secret_key);
    const tokens = generateTokens(findUser);
    user_session.token = tokens.accessToken;
    await AppDataSource.manager.save(user_session);
    next();
  } else {
    next();
  }
};
