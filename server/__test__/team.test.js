const teamControllers = require("../controllers/TeamControllers");
const supabase = require("../config/supabaseConfig");

// To finish
describe("Team Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addTeam", () => {
    
    it('should retrieve teams with team details successfully', async () => { //TODO FIX
        // const req = {
        //   body: {
        //     company: 1,
        //   },
        // };
        // const res = {
        //   status: jest.fn(() => res),
        //   json: jest.fn(),
        // };
    
        // const allTeamsData = [
        //   {
        //     team_id: 1,
        //     team_owner_email: 'teamowner@example.com',
        //     office_name: 'Office A',
        //     name: 'Team A',
        //     team_members_count: 5,
        //   },
        //   {
        //     team_id: 2,
        //     team_owner_email: 'teamowner2@example.com',
        //     office_name: 'Office B',
        //     name: 'Team B',
        //     team_members_count: 3,
        //   },
        // ];
    
        // const allTeams = [
        //   {
        //     id: 1,
        //     name: 'Team A',
        //   },
        //   {
        //     id: 2,
        //     name: 'Team B',
        //   },
        // ];
    
        // const teamInfo1 = {
        //   User: { email: 'teamowner@example.com' },
        //   Office: { name: 'Office A' },
        //   Team_Member: [{ count: 5 }],
        // };
    
        // const teamInfo2 = {
        //   User: { email: 'teamowner2@example.com' },
        //   Office: { name: 'Office B' },
        //   Team_Member: [{ count: 3 }],
        // };
    
        // supabase.from = jest.fn().mockReturnValueOnce({
        //   select: jest.fn().mockReturnThis(),
        //   eq: jest.fn().mockReturnThis(),
        //   get: jest.fn().mockResolvedValue({ data: allTeams, error: null }),
        // }).mockReturnValueOnce({
        //   from: jest.fn().mockReturnThis(),
        //   select: jest.fn().mockReturnThis(),
        //   eq: jest.fn().mockReturnThis(),
        //   single: jest.fn().mockResolvedValue({ data: teamInfo1, getTeamInfoError: null }),
        // }).mockReturnValueOnce({
        //   from: jest.fn().mockReturnThis(),
        //   select: jest.fn().mockReturnThis(),
        //   eq: jest.fn().mockReturnThis(),
        //   single: jest.fn().mockResolvedValue({ data: teamInfo2, getTeamInfoError: null }),
        // });
    
        // await teamControllers.getTeams(req, res);
    
        // expect(res.status).toHaveBeenCalledWith(200);
        // expect(res.json).toHaveBeenCalledWith({ status: 'ok', teams: allTeamsData });
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
      
    });

    it("should return an error if the team is not found", async () => {
      
    });
  });

  describe("getTeams", () => {
    it("should successfully get a list of teams", async () => {
      
    });
  });
});
