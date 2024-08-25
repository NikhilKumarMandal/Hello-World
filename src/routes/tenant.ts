import { Router } from "express";
import { TenantController } from "../controller/tenant.controller";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";

const tenantRepository = AppDataSource.getRepository(Tenant);

const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

const router = Router();

router.post("/", authenticate, (req, res, next) =>
  tenantController.create(req, res, next)
);
export default router;
