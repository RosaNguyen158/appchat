import express from "express";
import dotenv from "dotenv"; // de su dung cac bien trong .env
import path from "path";
import cookieParser from "cookie-parser";
import apiRouter from "@/routes/apiRoutes";
const __dirname = path.resolve();

dotenv.config();
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/", apiRouter);
app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

//http://localhost:3000/api/auth/login
