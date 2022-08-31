import express from "express";

import authRouter from "@/routes/authRoutes";
import homeRouter from "@/routes/homeRoutes";

var app = express();
app.use("/auth/", authRouter);
app.use("/home/", homeRouter);

// GET POST PUT DELETE OPTION

export default app;
