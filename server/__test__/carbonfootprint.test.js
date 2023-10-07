const CarbonFootprintControllers = require("../controllers/CarbonFootprintControllers");
const User = require("../models/UserModel");

// Carbon Footprint Controllers
describe("Carbon Footprint Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("postCarbonFootprint", () => {
    it("should update user's currentWeekStats for a given day", async () => {
      const req = {
        body: {
          email: "test@example.com",
          day: "Monday",
          duration: "3 mins",
          carbonFootprint: 0.21,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const mockUser = {
        email: "test@example.com",
        currentWeekStats: {
          Monday: {
            duration: "",
            carbon: 0,
          },
        },
        save: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      await CarbonFootprintControllers.postCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockUser.currentWeekStats.Monday.duration).toBe("3 mins");
      expect(mockUser.currentWeekStats.Monday.carbon).toBe(0.21);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          email: "test@example.com",
          day: "Monday",
          duration: "3 mins",
          carbonFootprint: 0.21,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.findOne = jest.fn().mockRejectedValue(new Error("Test error"));

      await CarbonFootprintControllers.postCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("resetCarbonFootprint", () => {
    it("should reset user's currentWeekStats for a given day", async () => {
      const req = {
        body: {
          email: "test@example.com",
          day: "Monday",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const mockUser = {
        email: "test@example.com",
        currentWeekStats: {
          Monday: {
            duration: "3 mins",
            carbon: 0.21,
          },
        },
        save: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      await CarbonFootprintControllers.resetCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockUser.currentWeekStats.Monday.duration).toBe("0 min");
      expect(mockUser.currentWeekStats.Monday.carbon).toBe(0);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          email: "test@example.com",
          day: "Monday",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.findOne = jest.fn().mockRejectedValue(new Error("Test error"));

      await CarbonFootprintControllers.resetCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });
});