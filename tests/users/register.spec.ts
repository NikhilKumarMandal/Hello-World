// import { truncateTables } from '../utils/index';
// import { AppDataSource } from '../../src/config/data-source';
// import request from "supertest";
// import app from "../../src/app";
// import {User} from "../../src/entity/User"
// import { DataSource } from "typeorm";

// describe("POST /auth/register", () => {
//   let connection: DataSource;

//   beforeAll(async() => {
//     connection = await AppDataSource.initialize()
//   })

//   beforeEach(async () => {
//     await truncateTables(connection)
//   })

//   afterAll(async () => {
//     await connection.destroy()
//   })

//   describe("Give all path", () => {
//     it("should return the 201 status code", async () => {
//       // AAA

//       // Arrange
//       const userData = {
//         firstName: "Nikhil",
//         lastName: "kumar",
//         email: "nikhilkumar@gmail.com",
//         password: "strick",
//       };

//       //Act
//       const response = await request(app).post("/auth/register").send(userData);

//       // Assert
//       expect(response.statusCode).toBe(201);
//     });

//     it("should return valid json response", async () => {
//       // Arrange
//       const userData = {
//         firstName: "Nikhil",
//         lastName: "kumar",
//         email: "nikhilkumar@gmail.com",
//         password: "strick",
//       };

//       //Act
//       const response = await request(app).post("/auth/register").send(userData);

//       // Assert
//       expect(
//         (response.header as Record<string, string>)["content-type"]
//       ).toEqual(expect.stringContaining("json"));
//     });

//     it("should presist the user in the database", async () => {
//       // Arrange
//       const userData = {
//         firstName: "Nikhil",
//         lastName: "kumar",
//         email: "nikhilkumar@gmail.com",
//         password: "strick",
//       };

//       //Act
//       const response = await request(app).post("/auth/register").send(userData);

//       // Assert
//       const userRepository = connection.getRepository(User)
//       const users = await userRepository.find()
//       expect(users).toHaveLength(1)
//     });
//   });
//   describe("Fields are missing", () => {});
// });

import request from "supertest";
import app from "../../src/app";
import { User } from "../../src/entity/User";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { truncateTables } from "./../utils/index";

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
    await truncateTables(connection);
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
  });

  describe("Fields are missing", () => {});
});
