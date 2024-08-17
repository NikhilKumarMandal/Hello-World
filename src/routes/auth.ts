import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { UserService } from "../services/userService";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";

const router = Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const authController = new AuthController(userService);
router.post("/register", (req, res) => authController.register(req, res));

export default router;
