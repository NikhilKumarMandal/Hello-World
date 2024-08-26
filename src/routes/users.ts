import { NextFunction, Request, Response, Router } from "express";
import { AppDataSource } from "../config/data-source";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constant";
import createTenantValidators from "../validators/createTenantValidators";
import { UserController } from "../controller/users.controller";
import { UserService } from "../services/userService";
import { User } from "../entity/User";
import logger from "../config/logger";

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

const router = Router();

router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  createTenantValidators,
  (req: Request, res: Response, next: NextFunction) =>
    userController.create(req, res, next)
);

// router.patch(
//   "/update/:id",
//   authenticate,
//   canAccess([Roles.ADMIN]),
//   createTenantValidators,
//   (req: Request, res: Response, next: NextFunction) =>
//     tenantController.update(req, res, next)
// );

// router.get(
//   "/",
//   listUserValidators,
//   (req: Request, res: Response, next: NextFunction) =>
//     tenantController.getAllTenant(req, res, next)
// );

// router.get(
//   "/:id",
//   authenticate,
//   canAccess([Roles.ADMIN]),
//   (req: Request, res: Response, next: NextFunction) =>
//     tenantController.getTenantById(req, res, next)
// );

// router.delete(
//   "/delete/:id",
//   authenticate,
//   canAccess([Roles.ADMIN]),
//   (req: Request, res: Response, next: NextFunction) =>
//     tenantController.destroy(req, res, next)
// );

export default router;
