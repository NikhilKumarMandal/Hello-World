import { DataSource } from "typeorm";
import request from "supertest";
import createJWKSMock from "mock-jwks";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { Roles } from "../../src/constant/index";
import { User } from "../../src/entity/User";
import { createTenant } from "../utils";
import { Tenant } from "../../src/entity/Tenant";

describe("POST /api/v1/users", () => {
  let connection: DataSource;
  let jwks: ReturnType<typeof createJWKSMock>;

  beforeAll(async () => {
    jwks = createJWKSMock("http://localhost:5501");
    connection = await AppDataSource.initialize();
  });

  beforeEach(async () => {
    jwks.start();
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterEach(() => {
    jwks.stop();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should persist the user in the database", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant));
      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });

      // Register user
      const userData = {
        firstName: "hello",
        lastName: "world",
        email: "hello@mern.space",
        password: "password",
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie
      await request(app)
        .post("/api/v1/users/")
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(userData.email);
    });

    it("should create a manager user", async () => {
      const tenant = await createTenant(connection.getRepository(Tenant)); // Dynamically create tenant

      const adminToken = jwks.token({
        sub: "1",
        role: Roles.ADMIN,
      });

      // Register user with a role
      const userData = {
        firstName: "hello",
        lastName: "world",
        email: "hello@mern.space",
        password: "password",
        tenantId: tenant.id,
        role: Roles.MANAGER,
      };

      // Add token to cookie and make request
      await request(app)
        .post("/api/v1/users/") // Correct endpoint
        .set("Cookie", [`accessToken=${adminToken}`])
        .send(userData);

      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(1);
      expect(users[0].role).toBe(Roles.MANAGER);
    });
  });
});
