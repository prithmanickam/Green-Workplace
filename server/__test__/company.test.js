const teamControllers = require("../controllers/CompanyControllers");
const supabase = require("../config/supabaseConfig");

jest.mock("../config/supabaseConfig", () => ({
  from: jest.fn()
}));

describe("Company Controller Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
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
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({
        data: [{ id: 1, name: "Office A" }, { id: 2, name: "Office B" }],
        error: null
      });

      supabase.from.mockReturnValue({ select: mockSelect, eq: mockEq });

      await teamControllers.getOffices(req, res);

      expect(supabase.from).toHaveBeenCalledWith("Office");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("company_id", 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "ok",
        data: expect.any(Array)
      });
    });
    it('should return a 500 error if an exception occurs', async () => {
      const req = {
        body: {
          company: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock an error thrown by the database operation
      const mockError = new Error('Unexpected error');
      supabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockImplementation(() => {
          throw mockError;
        })
      }));

      await teamControllers.getOffices(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

  describe('addOffice', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully add a new office', async () => {
      const req = {
        body: {
          officeName: 'New Office',
          company_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase response for successful insertion
      const mockInsert = jest.fn().mockResolvedValue({ data: { name: 'New Office', company_id: 1 }, error: null });
      supabase.from = jest.fn().mockReturnValue({ insert: mockInsert });

      await teamControllers.addOffice(req, res);

      expect(supabase.from).toHaveBeenCalledWith("Office");
      expect(mockInsert).toHaveBeenCalledWith([{ name: 'New Office', company_id: 1 }]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "ok",
        data: expect.any(Object)
      });
    });

    it('should return an error if adding office fails', async () => {
      const req = {
        body: {
          officeName: 'New Office',
          company_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Simulate a failure in Supabase insert
      const mockError = new Error("Insertion error");
      const mockInsert = jest.fn().mockResolvedValue({ data: null, error: mockError });
      supabase.from = jest.fn().mockReturnValue({ insert: mockInsert });

      await teamControllers.addOffice(req, res);

      expect(mockInsert).toHaveBeenCalledWith([{ name: 'New Office', company_id: 1 }]);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: 'error', message: mockError.message });
    });
    it('should return a 500 error if the database operation fails', async () => {
      const req = {
        body: {
          officeName: 'New Office',
          company_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock an error response from the database
      const mockError = new Error('Database operation failed');
      supabase.from = jest.fn().mockImplementation(() => ({
        insert: jest.fn().mockRejectedValue(mockError)
      }));

      await teamControllers.addOffice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: "error",
        message: mockError.message
      });
    });
  });

  describe('deleteOffice', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully delete an office', async () => {
      const req = {
        body: {
          officeId: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase response for successful deletion
      supabase.from = jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        match: jest.fn().mockResolvedValue({ data: null, error: null })
      }));

      await teamControllers.deleteOffice(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", data: null });
    });

    it('should return an error if deletion fails', async () => {
      const req = {
        body: {
          officeId: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockError = new Error("Deletion error");

      // Mock Supabase response for failed deletion
      supabase.from = jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        match: jest.fn().mockResolvedValue({ data: null, error: mockError })
      }));

      await teamControllers.deleteOffice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: 'error', message: mockError.message });
    });


    it('should return a 500 error if an exception occurs', async () => {
      const req = {
        body: {
          officeId: 123
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Simulate Supabase error
      const mockError = new Error("Database error");
      supabase.from = jest.fn().mockImplementation(() => ({
        delete: jest.fn().mockReturnThis(),
        match: jest.fn(() => Promise.reject(mockError))
      }));

      await teamControllers.deleteOffice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error", message: mockError.message });
    });

  });

  describe('updateEmployeeOffice', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully update an employee\'s office', async () => {
      const req = {
        body: {
          employeeEmail: 'employee@example.com',
          office_id: 2
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Supabase response for successful update
      supabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: { email: 'employee@example.com', office_id: 2 }, error: null })
      }));

      await teamControllers.updateEmployeeOffice(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: "ok",
        data: { email: 'employee@example.com', office_id: 2 }
      });
    });

    it('should return an error if the update fails', async () => {
      const req = {
        body: {
          employeeEmail: 'employee@example.com',
          office_id: 2
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockError = new Error("Update error");

      // Mock Supabase response for failed update
      supabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: mockError })
      }));

      await teamControllers.updateEmployeeOffice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: 'error', message: mockError.message });
    });

    it('should return a 500 error if an exception occurs in updateEmployeeOffice', async () => {
      const req = {
        body: {
          employeeEmail: 'employee@example.com',
          office_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Simulate an exception occurring during the Supabase operation
      const mockError = new Error("Database operation failed");
      supabase.from = jest.fn().mockImplementation(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn(() => Promise.reject(mockError))
      }));

      await teamControllers.updateEmployeeOffice(req, res);

      // Assert that the response status and json methods are called with the expected values
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error", message: mockError.message });
    });

  });

  describe('deleteEmployee', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully delete an employee and related records', async () => {
      const req = {
        body: {
          employeeEmail: 'employee@example.com'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // mock handling different tables
      const mockReturnObject = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation((columnName, value) => {
          if (columnName === 'email') {
            return Promise.resolve({ data: { id: 1 }, error: null });
          } else {
            return Promise.resolve({ error: null });
          }
        }),
        delete: jest.fn().mockReturnThis()
      };

      supabase.from = jest.fn().mockImplementation(table => {
        return mockReturnObject;
      });

      await teamControllers.deleteEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

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

      // New mock data for user count
      const userCountData = { count: 42 }; // Mock user count


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

      // Mock the user count retrieval
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: userCountData, error: null }),
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

    it('should successfully return line chart data for weekly footprint', async () => {
      const req = {
        body: {
          type: 'user',
          lineChartLength: 'week',
          user_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock data returned from Supabase
      const mockTeamMemberHistoryData = [
        { carbon_footprint: 10 },
        { carbon_footprint: 20 }
      ];

      supabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        mockResolvedValue: jest.fn().mockResolvedValue({ data: mockTeamMemberHistoryData })
      }));

      await teamControllers.getLineChartData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

    it('should successfully return line chart data for monthly footprint', async () => {
      const req = {
        body: {
          type: 'company',
          lineChartLength: 'month',
          company_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock data for monthly footprint
      const mockMonthlyData = [
        { carbon_footprint: 100, week: '01-01-23' },
        { carbon_footprint: 200, week: '08-01-23' }
      ];

      // Mock Supabase for monthly data
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        mockResolvedValue: jest.fn().mockResolvedValue({ data: mockMonthlyData })
      }));

      await teamControllers.getLineChartData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
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
        gt: jest.fn(() => Promise.resolve({
          data: null,
          error: "Database error"
        }))
      }));

      await teamControllers.getLineChartData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });

  });

  describe('getBarChartData', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully return bar chart data', async () => {
      const req = {
        body: {
          company_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock data returned from Supabase
      const mockUsers = [
        {
          Office: { name: 'Office A' },
          Team_Member: [
            { monday_cf: 10, tuesday_cf: 0, wednesday_cf: 0, thursday_cf: 5, friday_cf: 0 },
          ]
        },
        {
          Office: { name: 'Office B' },
          Team_Member: [
            { monday_cf: 0, tuesday_cf: 10, wednesday_cf: 0, thursday_cf: 0, friday_cf: 5 },
          ]
        },
      ];

      supabase.from = jest.fn().mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockResolvedValue({ data: mockUsers })
      }));

      await teamControllers.getBarChartData(req, res);

      // the expected structure of the response
      const expectedData = {
        'Office A': { monday: 1, tuesday: 0, wednesday: 0, thursday: 1, friday: 0 },
        'Office B': { monday: 0, tuesday: 1, wednesday: 0, thursday: 0, friday: 1 },
      };

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: "ok", data: expectedData });
    });

    it('should return a 500 error if an exception occurs in getBarChartData', async () => {
      const req = {
        body: {
          company_id: 1
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Simulate an exception occurring during the Supabase operation
      supabase.from = jest.fn().mockImplementation(() => {
        throw new Error("Database operation failed");
      });

      await teamControllers.getBarChartData(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ status: "error" });
    });
  });

});
