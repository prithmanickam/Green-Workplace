const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authControllers = require("../controllers/AuthControllers");
const nodemailer = require("nodemailer");
const supabase = require("../config/supabaseConfig");

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

      //User.findOne = jest.fn().mockResolvedValue(mockUser);
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

      //User.findOne = jest.fn().mockResolvedValue(null);

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

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => {
          throw new Error("Test error");
        }),
      });

      await authControllers.loginUser(req, res);


      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });


  // Get User Tests
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

      const userData = {
        id: 1,
        email: "test@example.com",
      };

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: userData, error: null }),
      });

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", data: userData });
    });

    it("should return an error when an invalid token is provided", async () => {
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
        throw new Error("Invalid token");
      });

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it("should return an error when the user is not found in the database", async () => {
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

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
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

      const decodedToken = {
        email: "test@example.com",
      };

      jwt.verify = jest.fn(() => decodedToken);

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await authControllers.getUserData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
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

    it("should register a user successfully", async () => {
      const req = {
        body: {
          firstname: "John",
          lastname: "Doe",
          email: "johndoe@example.com",
          password: "testpassword",
          company: 1,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");

      supabase.from = jest.fn().mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      await authControllers.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return a server error on registration error", async () => {
      const req = {
        body: {
          firstname: "John",
          lastname: "Doe",
          email: "johndoe@example.com",
          password: "testpassword",
          company: 1,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");

      supabase.from = jest.fn().mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ data: null, error: "Database error" }),
      });

      await authControllers.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
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

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => {
          throw new Error("Test error");
        }),
      });

      await authControllers.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getAllUsers", () => {

    it("should return a list of users for a company", async () => {
      const req = {
        body: {
          company: 1,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const userData = [
        {
          id: 1,
          firstname: "John",
          lastname: "Doe",
          email: "johndoe@example.com",
          company_id: 1,
          type: "Employee",
        },
        {
          id: 2,
          firstname: "Jane",
          lastname: "Smith",
          email: "janesmith@example.com",
          company_id: 1,
          type: "Employee",
        },
      ];

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ data: userData, error: null }),
      });

      await authControllers.getAllUsers(req, res);

      const expectedUsers = userData.map((user) => ({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        company_id: user.company_id,
        type: user.type,
      }));

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" }); //, users: expectedUsers 
    });
  });

});
