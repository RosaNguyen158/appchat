import express from "express";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import path from "path";
import cookieParser from "cookie-parser";
import apiRouter from "@/routes/apiRoutes";
import { createConnection } from "typeorm";
import { User } from "@/entities/User";
const __dirname = path.resolve();

dotenv.config();
const app = express();
const PORT = 3000;

const main = async () => {
  try {
    const connection = await createConnection({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: 123,
      database: "appchat",
      entities: [User],
    });
    app.use(express.json());
    app.use(cookieParser());
    app.use("/api/", apiRouter);
    app.use(express.static(path.join(__dirname, "public")));
    console.log("Connected to Postgres");

    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  } catch (error) {
    console.log(error);
    throw new Error("Unable connected to Postgres");
  }
};

main();

//http://localhost:3000/api/auth/login
