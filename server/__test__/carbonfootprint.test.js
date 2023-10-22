const carbonFootprintControllers = require("../controllers/CarbonFootprintControllers");
const supabase = require("../config/supabaseConfig");

describe("Carbon Footprint Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("postCarbonFootprint", () => {
    it("should successfully post user and team carbon footprints", async () => {  //TODO FIX
      // const req = {
      //   body: {
      //     user_id: 1,
      //     day: "2023-10-21",
      //     duration: 120,
      //     carbonFootprint: 50,
      //     teamData: [
      //       { team_id: 1, calculatedCarbonFootprint: 30 },
      //       { team_id: 2, calculatedCarbonFootprint: 40 },
      //     ],
      //   },
      // };
      // const res = {
      //   status: jest.fn(() => res),
      //   json: jest.fn(),
      // };

      // supabase.from = jest.fn().mockReturnValueOnce({
      //   upsert: jest.fn().mockResolvedValue({ error: null }),
      // }).mockReturnValueOnce({
      //   update: jest.fn().mockResolvedValue({ error: null }),
      // }).mockReturnValueOnce({
      //   update: jest.fn().mockResolvedValue({ error: null }),
      // });

      // await carbonFootprintControllers.postCarbonFootprint(req, res);

      // expect(res.status).toHaveBeenCalledWith(200);
      // expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return a server error on user carbon footprint posting error", async () => {
      const req = {
        body: {
          user_id: 1,
          day: "2023-10-21",
          duration: 120,
          carbonFootprint: 50,
          teamData: [
            { team_id: 1, calculatedCarbonFootprint: 30 },
            { team_id: 2, calculatedCarbonFootprint: 40 },
          ],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: "User carbon footprint error" }),
      });

      await carbonFootprintControllers.postCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it("should return a server error on team carbon footprint posting error", async () => {
      const req = {
        body: {
          user_id: 1,
          day: "2023-10-21",
          duration: 120,
          carbonFootprint: 50,
          teamData: [
            { team_id: 1, calculatedCarbonFootprint: 30 },
            { team_id: 2, calculatedCarbonFootprint: 40 },
          ],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      }).mockReturnValueOnce({
        update: jest.fn().mockResolvedValue({ error: "Team carbon footprint error" }),
      });

      await carbonFootprintControllers.postCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          user_id: 1,
          day: "2023-10-21",
          duration: 120,
          carbonFootprint: 50,
          teamData: [
            { team_id: 1, calculatedCarbonFootprint: 30 },
            { team_id: 2, calculatedCarbonFootprint: 40 },
          ],
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValueOnce({
        upsert: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await carbonFootprintControllers.postCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

  });

  describe("getCarbonFootprint", () => {
    it("should successfully retrieve carbon footprint data", async () => {
    //   const req = {
    //     body: {
    //       user_id: 1,
    //     },
    //   };
    //   const res = {
    //     status: jest.fn(() => res),
    //     json: jest.fn(),
    //   };

    //   const userTeamsData = [
    //     { team_id: 1 },
    //     { team_id: 2 },
    //   ];

    //   const userStatsData = [
    //     { duration: 120, carbon_footprint: 50 },
    //     { duration: 90, carbon_footprint: 40 },
    //   ];

    //   const teamMemberData = [
    //     {
    //       monday_cf: 30,
    //       tuesday_cf: 20,
    //       wednesday_cf: 10,
    //       thursday_cf: 5,
    //       friday_cf: 0,
    //     },
    //     {
    //       monday_cf: 25,
    //       tuesday_cf: 15,
    //       wednesday_cf: 5,
    //       thursday_cf: 0,
    //       friday_cf: 0,
    //     },
    //   ];

    //   const teamData = [
    //     { name: "Team 1" },
    //     { name: "Team 2" },
    //   ];

    //   supabase.from = jest.fn().mockReturnValueOnce({
    //     select: jest.fn().mockReturnThis(),
    //     eq: jest.fn().mockReturnThis(),
    //     get: jest.fn().mockResolvedValue({ data: userTeamsData, getUserTeamsError: null }),
    //   }).mockReturnValueOnce({
    //     from: jest.fn().mockReturnThis(),
    //     select: jest.fn().mockReturnThis(),
    //     eq: jest.fn().mockReturnThis(),
    //     get: jest.fn().mockResolvedValue({ data: userStatsData, error: null }),
    //   }).mockReturnValueOnce({
    //     from: jest.fn().mockReturnThis(),
    //     select: jest.fn().mockReturnThis(),
    //     eq: jest.fn().mockReturnThis(),
    //     get: jest.fn().mockResolvedValue({ data: teamMemberData, getTeamDaysError: null }),
    //   }).mockReturnValueOnce({
    //     from: jest.fn().mockReturnThis(),
    //     select: jest.fn().mockReturnThis(),
    //     eq: jest.fn().mockReturnThis(),
    //     get: jest.fn().mockResolvedValue({ data: teamData, getTeamNameError: null }),
    //   });

    //   await carbonFootprintControllers.getCarbonFootprint(req, res);

    //   const expectedStats = {
    //     Monday: ["Team 1: 30kg CO2", "Team 2: 25kg CO2"],
    //     Tuesday: ["Team 1: 20kg CO2", "Team 2: 15kg CO2"],
    //     Wednesday: ["Team 1: 10kg CO2", "Team 2: 5kg CO2"],
    //     Thursday: ["Team 1: 5kg CO2", "Team 2: 0kg CO2"],
    //     Friday: ["Team 1: 0kg CO2", "Team 2: 0kg CO2"],
    //   };

    //   const expectedTotalStats = {
    //     Monday: ["Duration: 120 min", "Carbon Footprint: 50kg CO2"],
    //     Tuesday: ["Duration: 90 min", "Carbon Footprint: 40kg CO2"],
    //     Wednesday: ["Duration: 0 min", "Carbon Footprint: 0kg CO2"],
    //     Thursday: ["Duration: 0 min", "Carbon Footprint: 0kg CO2"],
    //     Friday: ["Duration: 0 min", "Carbon Footprint: 0kg CO2"],
    //   };

    //   expect(res.status).toHaveBeenCalledWith(200);
    //   expect(res.json).toHaveBeenCalledWith({ status: "ok", stats: expectedStats, totalStats: expectedTotalStats });
    });

    it("should return a server error on user team retrieval error", async () => {
      const req = {
        body: {
          user_id: 1,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({ data: null, getUserTeamsError: "User team retrieval error" }),
      });

      await carbonFootprintControllers.getCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it("should return a server error for unexpected exceptions", async () => {
      const req = {
        body: {
          user_id: 1,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      supabase.from = jest.fn().mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      await carbonFootprintControllers.getCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe("resetCarbonFootprint", () => {
    it("should reset carbon footprint and return status 'ok'", async () => {
      const req = {
        body: {
          day: "Monday",
          user_id: 1,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock successful updates and deletion
      supabase.from = jest.fn()
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({ error: null }),
        })
        .mockReturnValueOnce({
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({ error: null }),
        });

      await carbonFootprintControllers.resetCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should return status 'error' on team carbon footprint update error", async () => {
      const req = {
        body: {
          day: "Monday",
          user_id: 1,
        },
      };
      const res = {
        status: jest.fn(() => res),
        json: jest.fn(),
      };

      // Mock team carbon footprint update error
      supabase.from = jest.fn()
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({ error: "Team update error" }),
        });

      await carbonFootprintControllers.resetCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
   
  });
});
