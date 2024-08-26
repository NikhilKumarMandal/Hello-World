import { NextFunction, Request, Response, Router } from "express";
import { TenantController } from "../controller/tenant.controller";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constant";
import createTenantValidators from "../validators/createTenantValidators";
import listTenantValidators from "../validators/listTenantValidators";

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

const router = Router();

router.post(
  "/",
  authenticate,
  canAccess([Roles.ADMIN]),
  createTenantValidators,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next)
);

router.patch(
  "/update/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  createTenantValidators,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next)
);

router.get(
  "/",
  listTenantValidators,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAllTenant(req, res, next)
);

router.get(
  "/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getTenantById(req, res, next)
);

router.delete(
  "/delete/:id",
  authenticate,
  canAccess([Roles.ADMIN]),
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.destroy(req, res, next)
);

export default router;
