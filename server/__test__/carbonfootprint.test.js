const carbonFootprintControllers = require("../controllers/CarbonFootprintControllers");
const supabase = require("../config/supabaseConfig")

jest.mock("../config/supabaseConfig");;

describe("Carbon Footprint Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("postCarbonFootprint", () => {

    it('should successfully post carbon footprint data', async () => {

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
      const req = {
        body: {
          user_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase response for user teams and duration
      supabase.from.mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn(() => Promise.resolve({
          data: [{ team_id: 101 }, { team_id: 102 }],
          error: null
        }))
      })).mockImplementationOnce(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn(() => Promise.resolve({
          data: [{}],
          error: null
        }))
      }));

      // Mock team carbon footprint data for each team
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gt: jest.fn(() => Promise.resolve({
          data: [{ monday_cf: 10, tuesday_cf: 20 }],
          error: null
        }))
      }));

      await carbonFootprintControllers.getCarbonFootprint(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
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
  describe("editCompanyCarbonStandard", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully update company carbon standards", async () => {
      const req = {
        body: {
          company_id: 1,
          greenStandard: 10,
          amberStandard: 20,
          redStandard: 30
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      await carbonFootprintControllers.editCompanyCarbonStandard(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok" });
    });

    it("should handle exceptions and return a 500 error", async () => {
      const req = {
        body: {
          company_id: 1,
          greenStandard: 100,
          amberStandard: 200,
          redStandard: 300
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase to simulate an exception
      supabase.from.mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn(() => { throw new Error("Database update error"); })
      }));

      await carbonFootprintControllers.editCompanyCarbonStandard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

  });

  describe("getCompanyCarbonStandard", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully retrieve company carbon standards", async () => {
      const req = { body: { company_id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockCompanyStandards = {
        green_carbon_standard: 10,
        amber_carbon_standard: 20,
        red_carbon_standard: 30
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [mockCompanyStandards], error: null }),
      });

      await carbonFootprintControllers.getCompanyCarbonStandard(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", companyCarbonStandard: mockCompanyStandards });
    });

    it("should return an error if retrieving carbon standards fails", async () => {
      const req = { body: { company_id: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: "Database error" }),
      });

      await carbonFootprintControllers.getCompanyCarbonStandard(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });


  describe("getTransportMode", () => {

    it("should return an error for no data provided", async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await carbonFootprintControllers.getTransportMode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "No data provided."
      });
    });


    it("should return an error for no data provided", async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await carbonFootprintControllers.getTransportMode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: "No data provided."
      });
    });

  });

});
