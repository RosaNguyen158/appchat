import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import nodemailer from "nodemailer";
import bycrypt from "bcrypt";
dotenv.config();

const UserList = [
  {
    id: 1,
    username: "John",
    password: 123,
    email: "hongnguyenarmy@gmail.com",
    age: 18,
  },
  {
    id: 2,
    username: "John",
    email: "hongnguyenarmy@gmail.com",
    password: 123,
    age: 18,
  },
];

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "rosa.nguyen.goldenowl@gmail.com", // generated ethereal user
    pass: "pzrogwaolkqbueru", // generated ethereal password
  },
});

export const register = (req, res, next) => {
  // res.sendFile(path.join(__dirname, "login.html"));
  return res.render("login.html");
};

export const login = async (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  console.log("username ", username, "pass ", password, " ", req.body);

  let findUser = UserList.find(
    (user) => user.username == username && user.password == password
  );

  console.log("findUser ", findUser);
  if (!findUser) {
    res.json("Fail");
  } else {
    await sendOTPVerificationEmail(findUser.email, res);
    res.json({
      status: "Sending",
    });
  }
};

export const enterOtp = (req, res, next) => {
  return res.render("verify.html");
};

export const verify = async (req, res, next) => {
  try {
    let otp = req.body.otp;
    console.log(otp);
    console.log(UserList[0].otp);
    if (!otp) {
      res.json("FAIL");
    } else {
      let hashedOTP = `${UserList[0].otp}`;
      const validOTP = await bycrypt.compare(`${otp}`, hashedOTP);
      if (!validOTP) {
        res.json("FAILED VERIFY OTP");
      } else {
        let username = req.body.username;
        let password = req.body.password;
        UserList[0].verify = "true";
        UserList[0].otp = "";
        const accessToken = jwt.sign(
          { username, password },
          process.env.ACCESS_TOKEN_SECRET
        );
        res.json({
          message: "thanh cong",
          token: accessToken,
        });
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};

const sendOTPVerificationEmail = async (email, res) => {
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    const mailOptions = {
      from: "rosa.nguyen.goldenowl@gmail.com",
      to: "hongnguyenarmy@gmail.com",
      subject: "Verify Your Email",
      html: `Enter ${otp}`,
    };

    const saltRounds = 10;
    let hashedOTP = await bycrypt.hash(otp, saltRounds);
    console.log("hashedOTP 1", hashedOTP);
    UserList[0].otp = hashedOTP;
    console.log(UserList[0]);
    return transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
    return false;
  }
};
