const CarbonFootprintControllers = require("../controllers/CarbonFootprintControllers");
const User = require("../models/UserModel");
const Team = require("../models/TeamModel");

jest.mock("../models/UserModel");
jest.mock("../models/TeamModel");

describe("Carbon Footprint Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("postCarbonFootprint", () => {
    it("should update user's carbon footprint and team's dayStats", async () => {
      const req = {
        body: {
          email: "test@example.com",
          day: "Monday",
          duration: "60 min",
          carbonFootprint: 10,
          teamData: [
            {
              team_id: "team1",
              calculatedCarbonFootprint: 5,
            },
          ],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const user = {
        email: "test@example.com",
        currentWeekStats: {
          Monday: {},
        },
        teams: [
          {
            _id: "team1",
            dayStats: {
              Monday: 0,
            },
          },
        ],
        save: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(user);

      await CarbonFootprintControllers.postCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
      expect(user.currentWeekStats.Monday.duration).toEqual("60 min");
      expect(user.currentWeekStats.Monday.carbon).toEqual(10);
      expect(user.teams[0].dayStats.Monday).toEqual(5);
      expect(user.save).toHaveBeenCalled();
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          email: "test@example.com",
          day: "Monday",
          duration: "60 min",
          carbonFootprint: 10,
          teamData: [],
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

  describe("getCarbonFootprint", () => {
    it("should return user's carbon footprint data for the week", async () => {
      const req = {
        body: {
          email: "test@example.com",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const user = {
        email: "test@example.com",
        teams: [
          {
            _id: "team1",
            dayStats: {
              Monday: 5,
            },
          },
        ],
      };

      const team = {
        _id: "team1",
        teamName: "Team 1",
      };

      User.findOne = jest.fn().mockResolvedValue(user);
      Team.findById = jest.fn().mockResolvedValue(team);

      await CarbonFootprintControllers.getCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "ok",
        data: {
          Monday: ["Team 1: 5.00kg CO2"],
          Tuesday: ["Team 1: 0kg CO2"],
          Wednesday: ["Team 1: 0kg CO2"],
          Thursday: ["Team 1: 0kg CO2"],
          Friday: ["Team 1: 0kg CO2"],
        },
      });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          email: "test@example.com",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      User.findOne = jest.fn().mockRejectedValue(new Error("Test error"));

      await CarbonFootprintControllers.getCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("resetCarbonFootprint", () => {
    it("should reset user's carbon footprint for a specific day", async () => {
      const req = {
        body: {
          day: "Monday",
          email: "test@example.com",
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const user = {
        email: "test@example.com",
        currentWeekStats: {
          Monday: {
            duration: "60 min",
            carbon: 10,
          },
        },
        teams: [
          {
            _id: "team1",
            dayStats: {
              Monday: 5,
            },
          },
        ],
        save: jest.fn(),
      };

      User.findOne = jest.fn().mockResolvedValue(user);

      await CarbonFootprintControllers.resetCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
      expect(user.currentWeekStats.Monday.duration).toEqual("0 min");
      expect(user.currentWeekStats.Monday.carbon).toEqual(0);
      expect(user.teams[0].dayStats.Monday).toEqual(0);
      expect(user.save).toHaveBeenCalled();
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          day: "Monday",
          email: "test@example.com",
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
