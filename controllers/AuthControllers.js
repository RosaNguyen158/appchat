import jwt from "jsonwebtoken";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import bycrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { sanitizeBody } from "express-validator";
import * as OtpEmail from "../helpers/otpEmail";
// import connectDB from "../ormconfig";
import { User } from "../entities/User";

dotenv.config();

export const register = (req, res, next) => {
  // Validate fields.
  body("firstName")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters.");
  ("");
  body("lastName")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Last name must be specified.")
    .isAlphanumeric()
    .withMessage("Last name has non-alphanumeric characters.");
  body("email")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Email must be specified.")
    .isEmail()
    .withMessage("Email must be a valid email address.")
    .custom((value) => {
      return UserModel.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject("E-mail already in use");
        }
      });
    });
  body("password")
    .isLength({ min: 6 })
    .trim()
    .withMessage("Password must be 6 characters or greater.");
  // Sanitize fields.
  sanitizeBody("firstName").escape();
  sanitizeBody("lastName").escape();
  sanitizeBody("email").escape();
  sanitizeBody("password").escape();
  // res.sendFile(path.join(__dirname, "login.html"));
  // return res.render("login.html");

  const user1 = User.create({
    username: 'bobby',
    password: 1,
  })
  
  const savedPet = await User.save(user1)
};

export const login = async (req, res, next) => {
  let user_name = req.body.username;
  let pass_word = req.body.password;

  console.log("username ", user_name, "pass ", pass_word);
  let findUser = await User.findOne({
    where: {
      username: user_name,
      password: pass_word,
    },
  });
  console.log("findUser ", findUser);

  if (!findUser) {
    res.json("Fail");
  } else {
    await OtpEmail.sendOTPVerificationEmail(findUser);
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
    let user_name = req.body.username;
    let pass_word = req.body.password;
    let otp = req.body.otp;
    console.log(otp);
    let findUser = await User.findOne({
      where: {
        username: user_name,
        password: pass_word,
      },
    });
    if (!otp) {
      res.json("FAIL");
    } else {
      let hashedOTP = `${findUser.otp}`;
      console.log("findUser.otp", findUser.otp);
      const validOTP = await bycrypt.compare(`${otp}`, hashedOTP);
      if (!validOTP) {
        res.json("FAILED VERIFY OTP");
      } else {
        findUser.verify = "true";
        findUser.otp = "";
        const accessToken = jwt.sign(
          { user_name, pass_word },
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
