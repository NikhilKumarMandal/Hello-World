import { TokenService } from "./../services/TokenService";
import { UserService } from "./../services/userService";
import { NextFunction, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenServices: TokenService,
    private credentialService: CredentialService
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    console.log(result);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("New request to register a user", {
      firstName,
      lastName,
      email,
      password: "*******",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      this.logger.info("User has been registered", { id: user.id });

      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenServices.generateAccessToken(payload);

      const newRefreshToken =
        await this.tokenServices.persistRefreshToken(user);

      const refreshToken = this.tokenServices.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res
        .status(201)
        .json({ message: "User registered successfully", userId: user.id });

      res.status(201).json();
    } catch (error) {
      next(error);
      return;
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    // validate all things

    const result = validationResult(req);
    console.log(result);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    // Take data from body

    const { email, password } = req.body;

    this.logger.debug("New request to register a user", {
      email,
      password: "*******",
    });

    try {
      // check email is correct or not
      const user = await this.userService.findByEmail(email);

      // check user exists or not
      if (!user) {
        const error = createHttpError(400, "Email or Password does not match!");
        next(error);
        return;
      }

      // compare password is correct or not
      const comparePassword = await this.credentialService.comparePassword(
        password,
        user.password
      );

      // check password is correct or not

      if (!comparePassword) {
        const error = createHttpError(400, "Email or Password does not match!");
        next(error);
        return;
      }
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenServices.generateAccessToken(payload);

      const newRefreshToken =
        await this.tokenServices.persistRefreshToken(user);

      const refreshToken = this.tokenServices.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res
        .status(200)
        .json({ message: "User login successfully", userId: user.id });
    } catch (error) {
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    console.log("Auth", req.auth);
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    console.log(req.auth);

    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      };

      const accessToken = this.tokenServices.generateAccessToken(payload);

      const user = await this.userService.findById(Number(req.auth.sub));

      if (!user) {
        const error = createHttpError(
          400,
          "User with the token could not find"
        );
        next(error);
        return;
      }

      const newRefreshToken =
        await this.tokenServices.persistRefreshToken(user);

      await this.tokenServices.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.tokenServices.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365,
        httpOnly: true,
      });

      res
        .status(200)
        .json({
          message: "Successfully create access Token using refresh token",
          userId: user.id,
        });
    } catch (error) {
      next(error);
      return;
    }
  }
}
