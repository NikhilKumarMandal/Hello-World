import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";

describe("POST /api/v1/tenant/", () => {
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
    it("should return a 201 status code", async () => {
      const tenantData = {
        name: "tenant name",
        address: "Tenant address",
      };

      const response = await request(app)
        .post("/api/v1/tenant/")
        .send(tenantData);

      expect(response.statusCode).toBe(201);
    });

    it("should create a tenant in database", async () => {});
  });
});
