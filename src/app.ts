import express, { NextFunction, Request, Response } from "express";
import authRouter from "../src/routes/auth";
import tenantRouter from "../src/routes/tenant";
import usersRouter from "../src/routes/users";
import "reflect-metadata";
import cookieParser from "cookie-parser";
import cors from "cors";
import { HttpError } from "http-errors";
import logger from "./config/logger";

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

// app.use(globalErrorHandler);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;

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

// import { Request, Response } from "express";
// import { HttpError } from "http-errors";
// import { v4 as uuid } from "uuid";
// import logger from "../config/logger";

// export const globalErrorHandler = (
//   err: HttpError,
//   req: Request,
//   res: Response
// ) => {
//   const errorId = uuid();
//   const statusCode = err.status || 500;

//   const isProduction = (process.env.NODE_ENV = "production");
//   const message = isProduction ? "Internal Server Error" : err.message;

//   logger.error(err.message, {
//     id: errorId,
//     statusCode,
//     err: err.stack,
//     path: req.path,
//     method: req.method,
//   });

//   res.status(statusCode).json({
//     errors: [
//       {
//         ref: errorId,
//         type: err.name,
//         msg: message,
//         path: req.path,
//         method: req.method,
//         location: "server",
//         stack: isProduction ? null : err.stack,
//       },
//     ],
//   });
// };
export default app;
