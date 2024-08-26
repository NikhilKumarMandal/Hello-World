import { NextFunction, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserRequest } from "../types";
import { Logger } from "winston";
import { Roles } from "../constant";

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}
  async create(req: CreateUserRequest, res: Response, next: NextFunction) {
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
}
