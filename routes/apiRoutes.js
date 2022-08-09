import express from "express";
import authRouter from "@/routes/authRoutes";
import homeRouter from "@/routes/homeRoutes";

console.log(authRouter);

var app = express();
app.use("/auth/", authRouter);
app.use("/home/", homeRouter);

export default app;
