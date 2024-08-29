import { isJwt } from "../utils/index";
import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constant";
import bcrypt from "bcryptjs";

describe("POST /api/v1/auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    try {
      connection = await AppDataSource.initialize();
      if (!connection.isInitialized) {
        throw new Error("Database connection failed to initialize");
      }
    } catch (error) {
      console.error("Error during Data Source initialization:", error);
      throw error; // Rethrow the error to fail the test
    }
  });

  beforeEach(async () => {
    // Database truncate
    await connection.dropDatabase();
    await connection.synchronize();
    // await truncateTables(connection);
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given All fileds", () => {
    it("should return the access token and refresh token inside a cookie", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });

      // Act
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: userData.email, password: userData.password });

      interface Headers {
        ["set-cookie"]: string[];
      }

      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      const cookies =
        (response.headers as unknown as Headers)["set-cookie"] || [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken=")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }

        if (cookie.startsWith("refreshToken=")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it("should return the 400 if email or password is wrong", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const userRepository = connection.getRepository(User);
      await userRepository.save({
        ...userData,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });

      // Act
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: userData.email, password: "wrongPassword" });

      // Assert

      expect(response.statusCode).toBe(400);
    });
  });
});
