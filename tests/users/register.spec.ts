import request from "supertest";
import app from "../../src/app";

describe("POST /auth/register", () => {
  describe("Give all path", () => {
    it("should return the 201 status code", async () => {
      // AAA

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
    });
  });
  describe("Fields are missing", () => {});
});
