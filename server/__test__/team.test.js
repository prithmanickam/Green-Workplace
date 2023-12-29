const teamControllers = require("../controllers/TeamControllers");
const supabase = require("../config/supabaseConfig");

// To finish
describe("Team Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addTeam", () => {

    it('should retrieve teams with team details successfully', async () => { //TODO 

    });

    it('should handle errors when adding a team owner', async () => {
      const req = {
        body: {
          teamOwner: 'teamowner@example.com',
          teamName: 'Test Team',
          divisions: 'Division A',
          office: 1,
          company: 1,
          teamMembers: ['member1@example.com', 'member2@example.com'],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, getUserError: null }),
      });

      await teamControllers.addTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Team Owner user not found' });
    });

    it('should handle errors when creating a team', async () => {
      const req = {
        body: {
          teamOwner: 'teamowner@example.com',
          teamName: 'Test Team',
          divisions: 'Division A',
          office: 1,
          company: 1,
          teamMembers: ['member1@example.com', 'member2@example.com'],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const teamOwnerData = { id: 1 };

      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: teamOwnerData, getUserError: null }),
      }).mockReturnValueOnce({
        upsert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: 'Team creation error' }),
      });

      await teamControllers.addTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: 'error' });
    });
  });

  describe("deleteTeam", () => {
    it("should successfully delete a team", async () => {
      const req = { body: { teamId: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock successful deletion
      supabase.from = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      await teamControllers.deleteTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return an error if the team is not found", async () => {
      const req = { body: { teamId: 99 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock error during deletion
      supabase.from = jest.fn().mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Deletion error')),
      });

      await teamControllers.deleteTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });


  describe("getTeams", () => {
    it("should successfully get a list of teams", async () => {
      const req = { body: { company: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock the initial data retrieval
      const allTeams = [{ id: 1, name: 'Team A' }, { id: 2, name: 'Team B' }];
      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: allTeams, error: null }),
      });

      // Mock the nested data retrieval for each team
      allTeams.forEach(team => {
        supabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              User: { email: 'example@example.com' },
              Office: { name: 'Office A' },
              Team_Member: [{ count: 5 }]
            },
            error: null
          }),
        });
      });

      await teamControllers.getTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: "ok" }));
      expect(res.json.mock.calls[0][0].teams).toHaveLength(2);
    });



    it("should return an error if there is a problem fetching teams", async () => {
      const req = { body: { company: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock failure in data retrieval
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.getTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getUserTeamsData", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve user's team data", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const userTeams = [{ team_id: 101 }, { team_id: 102 }];
      const teamData = [{ name: 'Alpha Team' }, { name: 'Beta Team' }];

      // Mock the team member data retrieval
      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userTeams, error: null }),
      });

      // Mock the team name data retrieval for each team
      userTeams.forEach((team, index) => {
        supabase.from.mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [teamData[index]], error: null }),
        });
      });

      await teamControllers.getUserTeamsData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "ok",
        data: expect.arrayContaining([
          { teamId: 101, teamName: 'Alpha Team' },
          { teamId: 102, teamName: 'Beta Team' }
        ]),
      });
    });

    it("should return an error if there is a problem fetching user teams", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock failure in fetching user team IDs
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.getUserTeamsData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it("should return an error if there is a problem fetching team names", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock successful retrieval of user team IDs
      const userTeams = [{ team_id: 101 }];
      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userTeams, error: null }),
      });

      // Mock failure in fetching team names
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.getUserTeamsData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getYourDashboardData", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve user's dashboard data", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const userDetails = [{
        firstname: "John",
        lastname: "Doe",
        email: "john@example.com",
        account_created: "2021-01-01",
        Company: { name: "Example Inc." }
      }];

      const userTeams = [{
        monday_cf: 10,
        tuesday_cf: 20,

        wao_preference: "Remote",
        Team: {
          id: 101,
          name: "Alpha Team",
          User: { firstname: "Alice", lastname: "Smith" }
        }
      }];

      // Mock the user details data retrieval
      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userDetails, error: null }),
      });

      // Mock the user team data retrieval
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userTeams, error: null }),
      });

      await teamControllers.getYourDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: "ok",
        data: expect.objectContaining({
          name: "John Doe",
          email: "john@example.com",
          company: "Example Inc.",

        }),
      }));
    });

    it("should return an error if there is a problem fetching user details", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock failure in fetching user details
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.getYourDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

  });

  describe("getOffices", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve office data for a company", async () => {
      const req = {
        body: {
          company: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase response for successful data retrieval
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: "Office A" }, { id: 2, name: "Office B" }],
          error: null
        }))
      }));

      await teamControllers.getOffices(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "ok",
        data: expect.any(Array)
      });
    });
  });

  describe("getUserTeams", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve user's teams", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const userTeams = [{ team_id: 101, Team: { name: "Alpha Team" } }];

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userTeams, error: null }),
      });

      await teamControllers.getUserTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", user_teams: userTeams });
    });

    it("should return an error if retrieving teams fails", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.getUserTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getUserTeams", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve user's teams", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const userTeams = [{ team_id: 101, Team: { name: "Alpha Team" } }];

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userTeams, error: null }),
      });

      await teamControllers.getUserTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", user_teams: userTeams });
    });

    it("should return an error if retrieving teams fails", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.getUserTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getUserTeamOwnerTeams", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve teams owned by the user", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const userOwnedTeams = [{ id: 101, name: "Alpha Team" }];

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userOwnedTeams, error: null }),
      });

      await teamControllers.getUserTeamOwnerTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", user_teams: userOwnedTeams });
    });

    it("should return an error if retrieving owned teams fails", async () => {
      const req = { body: { user_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.getUserTeamOwnerTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });


  describe("getTeamOwnerFunctionsData", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve data for team owner functions page", async () => {

    });

  });

  describe("editTeamName", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully edit the team name", async () => {
      const req = {
        body: {
          team_id: 101,
          new_team_name: "New Team Name"
        }
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      await teamControllers.editTeamName(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return an error if editing the team name fails", async () => {
      const req = {
        body: {
          team_id: 101,
          new_team_name: "New Team Name"
        }
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.editTeamName(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("editTeamWAODays", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully edit the team WAO days", async () => {
      const req = {
        body: {
          team_id: 101,
          selected_days: ["Monday", "Wednesday"]
        }
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      await teamControllers.editTeamWAODays(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return an error if editing the team WAO days fails", async () => {
      const req = {
        body: {
          team_id: 101,
          selected_days: ["Monday", "Wednesday"]
        }
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await teamControllers.editTeamWAODays(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });


  describe("addTeamMember", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully add a new team member", async () => {
      const req = {
        body: {
          team_id: 101,
          new_team_member: "newmember@example.com"
        }
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const userId = [{ id: 201 }];

      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userId, error: null }),
      }).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      await teamControllers.addTeamMember(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return an error if the user is not found", async () => {
      const req = {
        body: {
          team_id: 101,
          new_team_member: "nonexistent@example.com"
        }
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      await teamControllers.addTeamMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

  });

  describe("removeTeamMember", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully remove a team member", async () => {

    });


    it("should return an error if the user is not found", async () => {
      const req = {
        body: {
          team_id: 101,
          team_member: "nonexistent@example.com"
        }
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      await teamControllers.removeTeamMember(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

  });

  describe("getTeamDashboardData", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve team dashboard data", async () => {
      const req = { body: { team_id: 101 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const teamData = [{
        id: 101,
        name: "Alpha Team",
        divisions: "Division A",
        team_created: "2021-01-01",
        Company: { name: "Example Inc." },
        User: { email: "teamowner@example.com" }
      }];

      const teamMembersInfo = [

      ];

      // Mock the team data retrieval
      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: teamData, error: null }),
      });

      // Mock the team member data retrieval
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: teamMembersInfo, error: null }),
      });

      await teamControllers.getTeamDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

    });

    it("should return an error if fetching team details fails", async () => {
      const req = { body: { team_id: 101 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock failure in fetching team details
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error for team')),
      });

      await teamControllers.getTeamDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    // Add a test for error in fetching team member information
  });

  describe("getCompanyDashboardData", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve company dashboard data", async () => {
      const req = { body: { company_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      const teamsData = [
        // Mock data for team and their corresponding Team_Member data
        {
          id: 101,
          name: "Alpha Team",
          divisions: "Division A",
          User: { email: "teamowner@example.com" },
          Team_Member: [
            { monday_cf: 10, tuesday_cf: 5, wednesday_cf: 5, thursday_cf: 5, friday_cf: 5 },

          ]
        },

      ];

      const companyNameData = [{ name: "Example Inc." }];

      // Mock the team data retrieval
      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: teamsData, error: null }),
      });

      // Mock the company name data retrieval
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: companyNameData, error: null }),
      });

      await teamControllers.getCompanyDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

    });

    it("should return an error if fetching team details fails", async () => {
      const req = { body: { company_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock failure in fetching team details
      supabase.from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error for teams')),
      });

      await teamControllers.getCompanyDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it("should return an error if fetching company name fails", async () => {
      const req = { body: { company_id: 1 } };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock the team data retrieval
      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      // Mock failure in fetching company name
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Database error for company name')),
      });

      await teamControllers.getCompanyDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("getLineChartData", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve line chart data for a team", async () => {

    });

    it("should return an error if database query fails", async () => {
      const req = {
        body: {
          type: "team",
          lineChartLength: "week",
          team_id: 1,
          company_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase failure
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn(() => Promise.resolve({
          data: null,
          error: "Database error"
        }))
      }));

      await teamControllers.getLineChartData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

  });

});
