import { RefreshToken } from "../../src/entity/RefreshToken";
import { isJwt } from "../utils/index";
import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constant";

describe("POST /api/v1/auth/register", () => {
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

  describe("Given all fields", () => {
    it("should return the 201 status code", async () => {
      // AAA

      //Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      expect(
        (response.header as Record<string, string>)["content-type"]
      ).toEqual(expect.stringContaining("json"));
    });

    it("should presist the user in the database", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });

    it("should assign a customer role", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("should store the hashed password in the database", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find({ select: ["password"] });

      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2[ab]\$\d+\$/);
    });

    it("should return 400 status code if email is already exists", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      const user = await userRepository.find();

      // Assert
      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(1);
    });

    it("should return the access token and refresh token inside a cookie", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert

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

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it("Should store the refresh token in the database", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "Kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      // Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      const refreshTokenRepo = connection.getRepository(RefreshToken);

      // Query tokens by correct userId
      const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId = :userId", {
          userId: response.body.userId,
        })
        .getMany();

      expect(tokens).toHaveLength(1);
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 status code if email fields is missing", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user).toHaveLength(0);
    });

    it("Should return 400 status code if FirstName is missing", async () => {
      // Arrange
      const userData = {
        firstName: "",
        lastName: "kumar",
        email: "helloworld@12",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user).toHaveLength(0);
    });

    it("Should return 400 status code if LastName is missing", async () => {
      // Arrange
      const userData = {
        firstName: "nikhil",
        lastName: "",
        email: "helloworld@12",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user).toHaveLength(0);
    });

    it("Should return 400 status code if Password is missing", async () => {
      // Arrange
      const userData = {
        firstName: "nikhil",
        lastName: "kumar",
        email: "helloworld@12",
        password: "",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user).toHaveLength(0);
    });
  });

  describe("Fields are not in proper format", () => {
    it("It should trim the email fields", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: " nikhilkumar@gmail.com ",
        password: "password",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user[0].email).toBe("nikhilkumar@gmail.com");
    });

    it("Should return 400 status code if password length is less then 8 chars", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "hello",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert

      expect(response.statusCode).toBe(400);
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user).toHaveLength(0);
    });

    it("Should return an array message if email is missing", async () => {
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "",
        password: "hello12345",
      };

      //Act
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(response.body).toHaveProperty("errors");
      expect(
        (response.body as Record<string, string>).errors.length
      ).toBeGreaterThan(0);
    });
  });
});
