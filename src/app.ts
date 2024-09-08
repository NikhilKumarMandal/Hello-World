import express from "express";
import authRouter from "../src/routes/auth";
import tenantRouter from "../src/routes/tenant";
import usersRouter from "../src/routes/users";
import "reflect-metadata";
import cookieParser from "cookie-parser";
import cors from "cors";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to our application");
});

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tenant", tenantRouter);
app.use("/api/v1/users", usersRouter);

app.use(globalErrorHandler);

export default app;
