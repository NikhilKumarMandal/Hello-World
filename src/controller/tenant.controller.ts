import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

export class TenantController {
  constructor(
    private tenantService: TenantService,
    private logger: Logger
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    console.log(result);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;
    this.logger.debug("Request for create Tenant", req.body);

    try {
      const tenant = await this.tenantService.create({ name, address });

      this.logger.info("Tenant has been created", tenant.id);

      res.status(201).json({ id: tenant.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    console.log(result);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(500, "Invald url params!"));
      return;
    }

    this.logger.debug("Request for updating a tenant", req.body);

    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });

      this.logger.info("Tenant has been updated", { id: Number(tenantId) });

      res.status(200).json({ id: Number(tenantId) });
    } catch (error) {
      next(error);
      return;
    }
  }
}
