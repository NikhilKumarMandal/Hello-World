import express, { Request, Response, NextFunction } from "express";
import logger from "./config/logger";
import { HttpError } from "http-errors";
import authRouter from "../src/routes/auth";
import "reflect-metadata";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to our application");
});

app.use("/auth", authRouter);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;
