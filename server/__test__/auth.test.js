const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authControllers = require("../controllers/AuthControllers");
const nodemailer = require("nodemailer");
const supabase = require("../config/supabaseConfig");
const uuid = require('uuid');
const JWT_SECRET_FOR_REGISTRATION = 'asbfi3e5asf36n2'
const JWT_SECRET = "asf23rjkafass35";

jest.mock("jsonwebtoken");
jest.mock("bcryptjs");
jest.mock("nodemailer");
jest.mock('uuid');


// Auth Controllers
describe("Authentication Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateUsername', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully update the user\'s name', async () => {
      const req = {
        body: {
          userId: 1,
          editedUser: {
            firstname: "NewFirstName",
            lastname: "NewLastName"
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Adjusted mock for Supabase to correctly chain the eq method after update
      const mockEq = jest.fn().mockResolvedValue({ data: [{ firstname: "NewFirstName", lastname: "NewLastName" }], error: null });
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      supabase.from = jest.fn().mockReturnValue({ update: mockUpdate });

      await authControllers.updateUsername(req, res);

      expect(supabase.from).toHaveBeenCalledWith("User");
      expect(mockUpdate).toHaveBeenCalledWith({ firstname: "NewFirstName", lastname: "NewLastName" });
      expect(mockEq).toHaveBeenCalledWith("id", 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", message: "User name updated successfully", user: [{ firstname: "NewFirstName", lastname: "NewLastName" }] });
    });


    it('should return an error if the update fails', async () => {
      const req = {
        body: {
          userId: 1,
          editedUser: {
            firstname: "NewFirstName",
            lastname: "NewLastName"
          }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockError = new Error("Update error");
      const mockUpdate = jest.fn().mockResolvedValue({ data: null, error: mockError });
      supabase.from = jest.fn().mockReturnValue({ update: mockUpdate, eq: jest.fn().mockReturnThis() });

      await authControllers.updateUsername(req, res);

      expect(mockUpdate).toHaveBeenCalledWith({ firstname: "NewFirstName", lastname: "NewLastName" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: 'error' });
    });
  });

  describe('updatePassword', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully update the user password', async () => {
      const req = {
        body: {
          userEmail: 'user@example.com',
          newPassword: 'newPassword123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock bcrypt hash function
      bcrypt.hash = jest.fn().mockResolvedValue('hashedNewPassword');

      // Adjusted mock for Supabase to correctly simulate the update and eq chain
      const mockEq = jest.fn().mockResolvedValue({ data: { email: 'user@example.com', password: 'hashedNewPassword' }, error: null });
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      supabase.from = jest.fn().mockReturnValue({ update: mockUpdate });

      await authControllers.updatePassword(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(supabase.from).toHaveBeenCalledWith("User");
      expect(mockUpdate).toHaveBeenCalledWith({ password: 'hashedNewPassword' });
      expect(mockEq).toHaveBeenCalledWith("email", 'user@example.com');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", message: "User name updated successfully", user: { email: 'user@example.com', password: 'hashedNewPassword' } });
    });

    it('should return an error if the update fails', async () => {
      const req = {
        body: {
          userEmail: 'user@example.com',
          newPassword: 'newPassword123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock bcrypt hash function
      bcrypt.hash = jest.fn().mockResolvedValue('hashedNewPassword');

      const mockError = new Error("Update error");
      const mockUpdate = jest.fn().mockResolvedValue({ data: null, error: mockError });
      supabase.from = jest.fn().mockReturnValue({ update: mockUpdate, eq: jest.fn().mockReturnThis() });

      await authControllers.updatePassword(req, res);

      expect(mockUpdate).toHaveBeenCalledWith({ password: 'hashedNewPassword' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: 'error' });
    });
  });


  describe('sendResetPasswordEmail', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should send a reset password email', async () => {
      const req = {
        body: {
          email: 'user@example.com'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock uuid generation
      const mockUuid = '1234-uuid';
      uuid.v4.mockReturnValue(mockUuid);

      // Mock JWT signing
      const mockToken = 'mocked-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      // Mock nodemailer transport and sendMail function
      const sendMailMock = jest.fn().mockResolvedValue(true);
      const createTransportMock = jest.fn().mockReturnValue({ sendMail: sendMailMock });
      nodemailer.createTransport = createTransportMock;

      await authControllers.sendResetPasswordEmail(req, res);

      expect(jwt.sign).toHaveBeenCalledWith(expect.anything(), JWT_SECRET_FOR_REGISTRATION);
      expect(createTransportMock).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith({
        from: 'no-reply@greenworkplace.com',
        to: 'user@example.com',
        subject: 'Green-Workplace Reset Password Link',
        html: expect.stringContaining(`resetpassword/${mockToken}`)
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

  });


  describe("loginUser", () => {
    it('should successfully login a user and return a token', async () => {
      const req = {
        body: {
          email: 'user@example.com',
          password: 'correctPassword'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock data returned from Supabase
      const mockUserData = {
        email: 'user@example.com',
        password: 'hashedPassword'
      };

      supabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUserData, error: null })
      }));

      // Mock bcrypt comparison to simulate correct password
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      // Mock JWT signing
      const mockToken = 'mocked-jwt-token';
      jwt.sign.mockReturnValue(mockToken);

      await authControllers.loginUser(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith({ email: 'user@example.com' }, JWT_SECRET, { expiresIn: "1m" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", token: mockToken });
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

      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await authControllers.loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid password" });
    });

    it('should return 404 error if user is not found', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase to simulate user not found
      supabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'User not found' } })
      }));

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
    it('should successfully register a user', async () => {
      const req = {
        body: {
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          company: 1,
          office: 2
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const userData =
      {
        id: 87,
        account_created: '2024-01-12T22:03:37.485452+00:00',
        firstname: 'yo',
        lastname: 'test',
        email: 'test@email.com',
        password: 'password123',
        type: 'Employee',
        company_id: 1,
        office_id: 2
      }


      const companyInfo = {
        id: 1,
        name: 'Company1',
        green_carbon_standard: 0,
        amber_carbon_standard: 4,
        red_carbon_standard: 8,
        temporary_team: 35
      }

      // Mock the Supabase behavior for register api
      supabase.from = jest.fn().mockImplementation(table => {
        if (table === 'User') {
          return { upsert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [userData], error: null }) };
        } else if (table === 'Company') {
          return { select: jest.fn().mockResolvedValue({ data: companyInfo, error: null }) };
        } else if (table === 'Team_Member') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
      });

      await authControllers.registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(supabase.from).toHaveBeenCalledWith("User");
      expect(supabase.from).toHaveBeenCalledWith("Company");
      //expect(supabase.from).toHaveBeenCalledWith("Team_Member");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
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
          office: "London",
        },
        {
          id: 2,
          firstname: "Jane",
          lastname: "Smith",
          email: "janesmith@example.com",
          company_id: 1,
          Office: "Glasgow",
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
      }));

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });
    it('should return a 500 error if fetching users fails in getAllUsers', async () => {
      const req = {
        body: {
          company: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase to simulate an error during fetching users
      supabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        eq: jest.fn(() => Promise.resolve({ error: "Database error" }))
      }));

      await authControllers.getAllUsers(req, res);

      // Check that the response status and json methods are called with the expected values
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it('should return a 500 error if an exception occurs in getAllUsers', async () => {
      const req = {
        body: {
          company: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Simulate a situation where an exception is thrown during the API logic
      supabase.from = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await authControllers.getAllUsers(req, res);

      // Verify that the 500 status code and the appropriate JSON response are returned
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

});
