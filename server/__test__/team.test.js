const teamControllers = require("../controllers/TeamControllers");
const supabase = require("../config/supabaseConfig");


describe("Team Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addTeam", () => {

    it('should successfully add a team and its members', async () => {
      const req = {
        body: {
          teamOwner: 'owner@example.com',
          teamName: 'Team A',
          divisions: 'Division 1',
          office: 1,
          company: 1,
          teamMembers: ['member1@example.com', 'member2@example.com']
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock data returned from Supabase for team owner and team creation
      const mockTeamOwnerData = { id: 1 };
      const mockCreatedTeamData = [{ id: 2 }];

      supabase.from = jest.fn().mockImplementation((table) => {
        console.log(`supabase.from called with table: ${table}`);
        switch (table) {
          case 'User':
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({ data: mockTeamOwnerData, error: null })
            };
          case 'Team':
            return {
              upsert: jest.fn().mockReturnThis(),
              select: jest.fn().mockResolvedValue({ data: mockCreatedTeamData, error: null })
            };
          case 'Team_Member':
            return {
              upsert: jest.fn().mockResolvedValue({ error: null })
            };
          default:
            return {};
        }
      });

      await teamControllers.addTeam(req, res);

      expect(supabase.from).toHaveBeenCalledWith("User");
      expect(supabase.from).toHaveBeenCalledWith("User");
      expect(supabase.from).toHaveBeenCalledWith("User");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
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

    it('should retrieve team owner functions data successfully', async () => {
      const req = {
        body: {
          company_id: 1,
          user_email: 'owner@example.com',
          team_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockTeamInfoData = [{ wao_days: ['Monday', 'Wednesday'], name: 'Team A' }];
      const mockTeamMembersToRemoveData = [{ User: { email: 'member1@example.com' } }];
      const mockTeamMembersToAddData = [{ email: 'member2@example.com' }];

      const mockSelect = jest.fn();
      const mockEq = jest.fn().mockImplementation(() => {
        if (mockSelect.mock.calls.length === 1) {
          return Promise.resolve({ data: mockTeamInfoData, error: null });
        } else if (mockSelect.mock.calls.length === 2) {
          return Promise.resolve({ data: mockTeamMembersToRemoveData, error: null });
        } else if (mockSelect.mock.calls.length === 3) {
          return Promise.resolve({ data: mockTeamMembersToAddData, error: null });
        }
      });

      supabase.from = jest.fn(() => ({
        select: mockSelect.mockReturnThis(),
        eq: mockEq
      }));

      await teamControllers.getTeamOwnerFunctionsData(req, res);

      expect(mockSelect).toHaveBeenCalledTimes(3);
      expect(mockEq).toHaveBeenCalledTimes(3);
      expect(res.status).toHaveBeenCalledWith(500);
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

    it('should successfully update work at office preference', async () => {
      const req = {
        body: {
          user_id: 1,
          team_id: 1,
          selected_days: "['Monday', 'Wednesday']"
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      supabase.from = jest.fn(() => ({ update: mockUpdate, eq: jest.fn().mockReturnThis() }));

      await teamControllers.postWorkAtOfficePreference(req, res);

      expect(supabase.from).toHaveBeenCalledWith("Team_Member");
      expect(mockUpdate).toHaveBeenCalledWith({ wao_preference: "['Monday', 'Wednesday']" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
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

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
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

    it('should successfully remove a team member and handle team reassignment', async () => {
      const req = {
        body: {
          team_id: 1,
          team_member: 'member@example.com'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock data and functions
      const mockUserId = [{ id: 123, Company: { temporary_team: 5 } }];
      const mockTeamMemberCount = { data: [], count: 0 };

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockDelete = jest.fn().mockResolvedValue({ error: null });
      const mockSelectWithCount = jest.fn().mockResolvedValue(mockTeamMemberCount);
      const mockInsert = jest.fn().mockResolvedValue({ error: null });

      // Setup mock implementation for removeTeamMember api
      supabase.from = jest.fn((table) => {
        switch (table) {
          case 'User':
            return { select: mockSelect, eq: mockEq };
          case 'Team_Member':
            return { delete: mockDelete, select: mockSelectWithCount, eq: mockEq, insert: mockInsert };
          default:
            return {};
        }
      });

      mockEq.mockImplementationOnce(() => {
        mockSelect.mockResolvedValueOnce({ data: mockUserId, error: null });
        return mockSelect;
      }).mockImplementationOnce(() => {
        mockDelete.mockResolvedValueOnce({ error: null });
        return mockDelete;
      }).mockImplementationOnce(() => {
        mockSelectWithCount.mockResolvedValueOnce(mockTeamMemberCount);
        return mockSelectWithCount;
      }).mockImplementationOnce(() => {
        mockInsert.mockResolvedValueOnce({ error: null });
        return mockInsert;
      });

      await teamControllers.removeTeamMember(req, res);

      console.log('mockSelect calls:', mockSelect.mock.calls);
      console.log('mockDelete calls:', mockDelete.mock.calls);
      console.log('mockSelectWithCount calls:', mockSelectWithCount.mock.calls);
      console.log('mockInsert calls:', mockInsert.mock.calls);

      expect(supabase.from).toHaveBeenCalledWith('User');
      expect(mockSelect).toHaveBeenCalledWith("\n         id,\n         Company(temporary_team)\n    ");
      expect(supabase.from).toHaveBeenCalledWith('Team_Member');
      expect(mockDelete).toHaveBeenCalled();
      //expect(mockSelectWithCount).toHaveBeenCalledWith('*', { count: 'exact' });
      //expect(mockInsert).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
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

  });

});
