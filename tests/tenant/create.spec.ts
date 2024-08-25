import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Tenant } from "../../src/entity/Tenant";
import createJWKSMock from "mock-jwks";
import { Roles } from "../../src/constant";

describe("POST /api/v1/tenant/", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;
  let adminToken: string;

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

    // Generate the admin token and assign it to the global `adminToken` variable
    adminToken = jwks.token({ sub: "1", role: Roles.ADMIN });
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given All fields", () => {
    it("should return a 201 status code", async () => {
      const tenantData = {
        name: "tenant name",
        address: "Tenant address",
      };

      const response = await request(app)
        .post("/api/v1/tenant/")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(201);
    });

    it("should create a tenant in database", async () => {
      const tenantData = {
        name: "tenant name",
        address: "Tenant address",
      };

      const response = await request(app)
        .post("/api/v1/tenant/")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(tenantData);

      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find();

      expect(tenant).toHaveLength(1);
      expect(tenant[0].name).toBe(tenantData.name);
      expect(tenant[0].address).toBe(tenantData.address);
    });

    it("should return 401 if user is not authenticated", async () => {
      const tenantData = {
        name: "tenant name",
        address: "Tenant address",
      };

      const response = await request(app)
        .post("/api/v1/tenant/")
        .send(tenantData);

      expect(response.statusCode).toBe(401);

      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find();

      expect(tenant).toHaveLength(0);
    });

    it("should return 403 if user is not an admin", async () => {
      const managerToken = jwks.token({ sub: "1", role: Roles.MANAGER });
      const tenantData = {
        name: "tenant name",
        address: "Tenant address",
      };

      const response = await request(app)
        .post("/api/v1/tenant/")
        .set("Cookie", [`accessToken=${managerToken}`])
        .send(tenantData);

      expect(response.statusCode).toBe(403);

      const tenantRepository = connection.getRepository(Tenant);
      const tenant = await tenantRepository.find();

      expect(tenant).toHaveLength(0);
    });
  });
});
