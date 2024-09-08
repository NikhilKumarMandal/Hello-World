import { Request, Response } from "express";
import { HttpError } from "http-errors";
import { v4 as uuid } from "uuid";
import logger from "../config/logger";

export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response
) => {
  const errorId = uuid();
  const statusCode = err.status || 500;

  const isProduction = (process.env.NODE_ENV = "production");
  const message = isProduction ? "Internal Server Error" : err.message;

  logger.error(err.message, {
    id: errorId,
    statusCode,
    err: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(statusCode).json({
    errors: [
      {
        ref: errorId,
        type: err.name,
        msg: message,
        path: req.path,
        method: req.method,
        location: "server",
        stack: isProduction ? null : err.stack,
      },
    ],
  });
};
