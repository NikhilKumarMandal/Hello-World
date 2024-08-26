import { NextFunction, Request, Response, Router } from "express";
import { AppDataSource } from "../config/data-source";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constant";
import { UserController } from "../controller/users.controller";
import { UserService } from "../services/userService";
import { User } from "../entity/User";
import logger from "../config/logger";
import createUserValidators from "../validators/createUserValidators";
import listUserValidators from "../validators/listUserValidators";

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

const router = Router();

router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  createUserValidators,
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next)
);

router.patch(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  createUserValidators,
  (req: Request, res: Response, next: NextFunction) =>
    userController.update(req, res, next)
);

router.get(
  "/",
  listUserValidators,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAllUser(req, res, next)
);

router.get(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.getUserById(req, res, next)
);

router.delete(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    userController.destroy(req, res, next)
);

export default router;
