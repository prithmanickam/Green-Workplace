const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authControllers = require("../controllers/AuthControllers"); 
const User = require("../models/UserModel"); 

jest.mock("jsonwebtoken");
jest.mock("bcryptjs");

describe("Authentication Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should return a token on successful login", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword", // Replace with the hashed password of the test user
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn(() => "mockedToken");

      await authControllers.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", token: "mockedToken" });
    });

    it("should return an error for invalid credentials", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "invalidpassword",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const mockUser = {
        email: "test@example.com",
        password: "hashedPassword", // Replace with the hashed password of the test user
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await authControllers.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid password" });
    });

    it("should return an error for user not found", async () => {
      const req = {
        body: {
          email: "nonexistent@example.com",
          password: "password",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(null);

      await authControllers.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.findOne = jest.fn().mockRejectedValue(new Error("Test error"));

      await authControllers.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getUserData", () => {
    it("should return user data when a valid token is provided", async () => {
      const req = {
        body: {
          token: "validToken",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const decodedToken = {
        email: "test@example.com",
      };

      jwt.verify = jest.fn(() => decodedToken);
      User.findOne = jest.fn().mockResolvedValue(decodedToken);

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", data: decodedToken });
    });

    it("should return an error for an expired token", async () => {
      const req = {
        body: {
          token: "expiredToken",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const decodedToken = {
        email: "test@example.com",
      };

      jwt.verify = jest.fn(() => {
        const error = new Error("Token expired");
        error.name = "TokenExpiredError"; // Set the error name
        throw error;
      });

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Token expired" });
    });

    it("should return an error for an invalid token", async () => {
      const req = {
        body: {
          token: "invalidToken",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      jwt.verify = jest.fn(() => {
        const error = new Error("Invalid token");
        error.name = "JsonWebTokenError"; // Set the error name
        throw error;
      });

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    });

    it("should return an error for user not found", async () => {
      const req = {
        body: {
          token: "validToken",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const decodedToken = {
        email: "test@example.com",
      };

      jwt.verify = jest.fn(() => decodedToken);
      User.findOne = jest.fn().mockResolvedValue(null);

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User Not found" });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          token: "validToken",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      jwt.verify = jest.fn(() => {
        throw new Error("Test error");
      });

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });
});
