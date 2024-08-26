import { NextFunction, Response, Request } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest, UserQueryParams } from "../types";
import { Logger } from "winston";
import { Roles } from "../constant";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
    // validated fields
    const result = validationResult(req);
    console.log(result);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: Roles.MANAGER,
      });

      this.logger.info("User created successfully", { id: user.id });

      res.status(201).json({ id: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async update(req: CreateUserRequest, res: Response, next: NextFunction) {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invald url params!"));
      return;
    }

    const { firstName, lastName, role } = req.body;

    this.logger.debug("Request for updation", req.body);

    try {
      await this.userService.update(Number(userId), {
        firstName,
        lastName,
        role,
      });

      this.logger.info("User updated successfully", { id: Number(userId) });

      res.status(200).json({ id: userId });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invald url params!"));
      return;
    }

    try {
      const user = await this.userService.findById(Number(userId));

      if (!user) {
        next(createHttpError(400, "User does not exits"));
      }

      this.logger.info("User fected successfully", { id: Number(userId) });

      res.status(200).json(user);
    } catch (error) {
      next(error);
      return;
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;

    if (isNaN(Number(userId))) {
      next(createHttpError(400, "Invald url params!"));
      return;
    }

    this.logger.debug("Request for delete user", { id: Number(userId) });

    try {
      await this.userService.deleteById(Number(userId));
      this.logger.info("User delete successfully", { id: Number(userId) });
      res.status(200).json({ id: Number(userId) });
    } catch (error) {
      next(error);
      return;
    }
  }

  async getAllUser(req: Request, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true });

    try {
      const [users, count] = await this.userService.getAll(
        validatedQuery as UserQueryParams
      );

      this.logger.info("All users have been fetched");
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }
}
