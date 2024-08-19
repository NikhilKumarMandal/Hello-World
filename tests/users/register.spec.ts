import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constant";

describe("POST /auth/register", () => {
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
        password: "strick",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json response", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "strick",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

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
        password: "strick",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

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
        password: "strick",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

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
        password: "strick",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      console.log(users[0].password);

      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    it("should return 400 status code if email is already exists", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "strick",
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save({ ...userData, role: Roles.CUSTOMER });

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      const user = await userRepository.find();

      // Assert
      expect(response.statusCode).toBe(400);
      expect(user).toHaveLength(1);
    });
  });

  describe("Fields are missing", () => {
    it("should return 400 status code if email fields is missing", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "",
        password: "strick",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

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
        password: "strick",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      // Assert
      const userRepository = connection.getRepository(User);
      const user = await userRepository.find();
      expect(user[0].email).toBe("nikhilkumar@gmail.com");
    });
  });
});
