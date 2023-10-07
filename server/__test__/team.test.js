const TeamControllers = require("../controllers/TeamControllers");
const Team = require("../models/TeamModel");
const User = require("../models/UserModel");

// To finish
describe("Team Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addTeam", () => {
    it("should successfully add a new team", async () => {
      
      
    });

    it("should return a 409 error if the team owner is already a team owner", async () => {
      const req = {
        body: {
          teamOwner: "existingteamowner@example.com",
          teamName: "Test Team",
          divisions: "Division A",
          office: "Office A",
          company: "Company A",
          teamMembers: [],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mocking database calls to simulate an existing team owner
      User.findOne = jest.fn().mockResolvedValue({
        email: "existingteamowner@example.com",
        teamOwner: { _id: "teamId" },
      });

      await TeamControllers.addTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: "User is already a team owner" });
    });
  });

  describe("deleteTeam", () => {
    it("should successfully delete a team", async () => {
      
    });

    it("should return an error if the team is not found", async () => {
      
    });
  });

  describe("getTeams", () => {
    it("should successfully get a list of teams", async () => {
      
    });
  });
});
