import express from "express";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import path from "path";
import cookieParser from "cookie-parser";
import apiRouter from "@/routes/apiRoutes";
import session from "express-session";
import { createConnection } from "typeorm";
import { DataSource } from "typeorm";
import { User } from "@/entities/User";
import { Friend } from "@/entities/Friend";
import { Session } from "@/entities/Session";
import { ChatRoom } from "@/entities/ChatRoom";
import { Message } from "@/entities/Message";
import { Member } from "@/entities/Member";
import { React } from "@/entities/React";
import { ReactMessage } from "@/entities/ReactMessage";
import { Setting } from "@/entities/Setting";
import { SeenBy } from "@/entities/SeenBy";

const __dirname = path.resolve();

dotenv.config();
const app = express();
const PORT = 3000;

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: 123,
  database: "appchat",
  entities: [
    User,
    Friend,
    Session,
    ChatRoom,
    Message,
    Member,
    React,
    ReactMessage,
    Setting,
    SeenBy,
  ],
  // entities: ["@/entities/*"],
  synchronize: true,
  logging: false,
});

// to initialize initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((error) => console.log(error));

app.use(express.json());
app.use(cookieParser());
app.use("/", apiRouter);
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
