import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { UserService } from "../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/registerValidators";
import { TokenServices } from "../services/TokenService";

const router = Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);
const tokenService = new TokenServices();

const authController = new AuthController(userService, logger, tokenService);
router.post(
  "/register",
  registerValidators,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

export default router;
