import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { Roles } from "../../src/constant";
import createJWKSMock from "mock-jwks";

describe("GET /api/v1/auth/self", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
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
    jwks.start();
    // Database truncate
    await connection.dropDatabase();
    await connection.synchronize();
    // await truncateTables(connection);
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given All fileds", () => {
    it("should return the 200 status code", async () => {
      const accessToken = jwks.token({ sub: "1", role: Roles.CUSTOMER });

      const response = await request(app)
        .get("/api/v1/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();
      expect(response.statusCode).toBe(200);
    });

    it("should return the user data", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get("/api/v1/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      expect((response.body as Record<string, string>).id).toBe(data.id);
    });

    it("should not return the password fields", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      const accessToken = jwks.token({ sub: String(data.id), role: data.role });

      const response = await request(app)
        .get("/api/v1/auth/self")
        .set("Cookie", [`accessToken=${accessToken};`])
        .send();

      expect(response.body as Record<string, string>).not.toHaveProperty(
        "password"
      );
    });

    it("should return 401 status code if token does not exits", async () => {
      // Arrange
      const userData = {
        firstName: "Nikhil",
        lastName: "kumar",
        email: "nikhilkumar@gmail.com",
        password: "password",
      };

      const userRepository = connection.getRepository(User);
      const data = await userRepository.save({
        ...userData,
        role: Roles.CUSTOMER,
      });

      const response = await request(app).get("/api/v1/auth/self").send();

      expect(response.statusCode).toBe(401);
    });
  });
});
