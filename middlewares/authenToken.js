import jwt from "jsonwebtoken";

export function authenToken(req, res, next) {
  const authorizationHeader = req.headers["authorization"];
  console.log("authorizationHeader ", authorizationHeader); // Beaer [token]
  const token = authorizationHeader.split(" ")[1]; // token
  if (!token) res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    console.log(err, data);
    if (err) res.sendStatus(403); // loi Forbidden khong co quyen truy cap
    next();
  });
}
