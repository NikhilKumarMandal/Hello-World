import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { UserService } from "../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import logger from "../config/logger";
import registerValidators from "../validators/registerValidators";
import { TokenServices } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import { CredentialService } from "../services/CredentialService";
import loginValidators from "../validators/loginValidators";

const router = Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenServices(refreshTokenRepository);
const credentialService = new CredentialService();

const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credentialService
);

router.post(
  "/register",
  registerValidators,
  (req: Request, res: Response, next: NextFunction) =>
    authController.register(req, res, next)
);

router.post(
  "/login",
  loginValidators,
  (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

export default router;
