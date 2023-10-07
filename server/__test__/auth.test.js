const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authControllers = require("../controllers/AuthControllers");
const CarbonFootprintControllers = require("../controllers/CarbonFootprintControllers");
const User = require("../models/UserModel");
const nodemailer = require("nodemailer");

jest.mock("jsonwebtoken");
jest.mock("bcryptjs");
jest.mock("nodemailer");

// Auth Controllers
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
        password: "hashedPassword",
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
        password: "hashedPassword",
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
        error.name = "TokenExpiredError";
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
        error.name = "JsonWebTokenError";
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

  describe("sendRegistrationEmails", () => {

    it("should send registration emails", async () => {
      const req = {
        body: {
          emails: ["test1@example.com", "test2@example.com"],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      jwt.sign = jest.fn(() => "mockedRegistrationToken");
      nodemailer.createTransport = jest.fn(() => ({
        sendMail: jest.fn(),
      }));

      await authControllers.sendRegistrationEmails(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return an error for unexpected exceptions", async () => {
      const req = {
        body: {
          emails: ["test@example.com"],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      jwt.sign = jest.fn(() => {
        throw new Error("Test error");
      });

      await authControllers.sendRegistrationEmails(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it("should return the email from a valid token", async () => {
      const req = {
        query: {
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

      await authControllers.getEmailFromToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", email: decodedToken.email });
    });

    it("should return a server error for invalid token", async () => {
      const req = {
        query: {
          token: "invalidToken",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      jwt.verify = jest.fn(() => {
        throw new Error("Invalid token");
      });

      await authControllers.getEmailFromToken(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error", error: "Internal server error" });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        query: {
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

      await authControllers.getEmailFromToken(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error", error: "Internal server error" });
    });
  });


  describe("registerUser", () => {
    it("should successfully register a new user", async () => {
      const req = {
        body: {
          firstname: "John",
          lastname: "Doe",
          email: "test@example.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");
      User.prototype.save = jest.fn();

      await authControllers.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return an error for an existing user", async () => {
      const req = {
        body: {
          firstname: "John",
          lastname: "Doe",
          email: "test@example.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const mockExistingUser = {
        email: "test@example.com",
      };

      User.findOne = jest.fn().mockResolvedValue(mockExistingUser);

      await authControllers.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "User already exists" });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          firstname: "John",
          lastname: "Doe",
          email: "test@example.com",
          password: "testpassword",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.findOne = jest.fn().mockRejectedValue(new Error("Test error"));

      await authControllers.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getAllUsers", () => {
    it("should successfully fetch all users except Admin", async () => {
      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const mockUsers = [
        {
          firstname: "John",
          lastname: "Doe",
          email: "john@example.com",
          type: "Team Member",
        },
        {
          firstname: "Jane",
          lastname: "Smith",
          email: "jane@example.com",
          type: "Team Member",
        },
      ];

      User.find = jest.fn().mockResolvedValue(mockUsers);

      await authControllers.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", users: mockUsers });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.find = jest.fn().mockRejectedValue(new Error("Test error"));

      await authControllers.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getAllNonTeamOwners", () => {
    it("should successfully fetch all users who are not team owners and not Admin", async () => {
      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const mockUsers = [
        {
          firstname: "John",
          lastname: "Doe",
          email: "john@example.com",
          type: "Team Member",
          teamOwner: null,
        },
        {
          firstname: "Jane",
          lastname: "Smith",
          email: "jane@example.com",
          type: "Team Member",
          teamOwner: null,
        },
      ];

      User.find = jest.fn().mockResolvedValue(mockUsers);

      await authControllers.getAllNonTeamOwners(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", users: mockUsers });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {};
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.find = jest.fn().mockRejectedValue(new Error("Test error"));

      await authControllers.getAllNonTeamOwners(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

});
