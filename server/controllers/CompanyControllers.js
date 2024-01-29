const supabase = require("../config/supabaseConfig");


// Get offices in the company from the database
module.exports.getOffices = async (req, res) => {
  const { company } = req.body;

  try {

    const { data, error } = await supabase
      .from("Office")
      .select("*")
      .eq("company_id", company);

    res.status(200).json({ status: "ok", data: data });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "error" });
  }
};

// Add a new office to the database
module.exports.addOffice = async (req, res) => {
  const { officeName, company_id } = req.body;

  try {
    const { data, error } = await supabase
      .from("Office")
      .insert([
        { name: officeName, company_id: company_id }
      ]);

    if (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }

    res.status(200).json({ status: "ok", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Delete an office from the database
module.exports.deleteOffice = async (req, res) => {
  const { officeId } = req.body;

  try {
    const { data, error } = await supabase
      .from("Office")
      .delete()
      .match({ id: officeId });

    if (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }

    res.status(200).json({ status: "ok", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Add a new office to the database
module.exports.updateEmployeeOffice = async (req, res) => {
  const { employeeEmail, office_id } = req.body;

  try {
    const { data, error } = await supabase
      .from("User")
      .update([
        { office_id: office_id }
      ])
      .eq("email", employeeEmail);

    if (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }

    res.status(200).json({ status: "ok", data: data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports.deleteEmployee = async (req, res) => {
  const { employeeEmail } = req.body;

  try {
    // Retrieve the User ID
    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("id")
      .eq("email", employeeEmail)
      .single();

    if (userError || !userData) {
      return res.status(500).json({ status: "error", message: "User not found." });
    }

    const user_id = userData.id;

    // Delete from related tables
    const tables = ["Team_Member", "Team_Member_History", "User_Monday_Stats", "User_Tuesday_Stats", "User_Wednesday_Stats", "User_Thursday_Stats", "User_Friday_Stats"];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq("user_id", user_id);
      if (error) {
        throw error;
      }
    }

    // Delete the user
    const { error } = await supabase.from("User").delete().eq("id", user_id);
    if (error) {
      throw error;
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports.getLineChartData = async (req, res) => {
  const { type, lineChartLength, user_id, team_id, company_id } = req.body;

  try {

    function formatAsDDMMYY(date) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear().toString().substr(-2);
      return `${day}-${month}-${year}`;
    }

    function getLast4Mondays() {
      const mondays = [];
      let date = new Date();

      for (let i = 0; i < 5; i++) {
        date.setDate(date.getDate() - (date.getDay() + 6) % 7);
        mondays.push(formatAsDDMMYY(date));
        date.setDate(date.getDate() - 1);
      }
      mondays.reverse();
      mondays.pop();

      return mondays;
    }

    function getFirstDayOfLast4Months() {
      const monthNumbers = [];
      let date = new Date();

      for (let i = 0; i < 5; i++) {
        // Set the date to the first day of the current month
        date.setDate(1);
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month number as two digits
        monthNumbers.unshift(month); // Add to the beginning of the array
        // Move to the first day of the previous month
        date.setMonth(date.getMonth() - 1);
      }
      monthNumbers.pop();
      return monthNumbers;
    }

    let weeklyFootprint = 0;
    let monthlyFootprint = 0;
    let footprintList = [];
    let dates = [];

    let field_name = "";
    let id_name = "";

    if (type === "team") {
      field_name = "team_id";
      id_name = team_id;
    } else if (type === "company") {
      field_name = "company_id";
      id_name = company_id;
    } else if (type === "user") {
      field_name = "user_id";
      id_name = user_id;
    }

    if (lineChartLength === "week") {
      dates = getLast4Mondays();
      for (const monday of dates) {
        const { data, error } = await supabase
          .from("Team_Member_History")
          .select("carbon_footprint")
          .eq(field_name, id_name)
          .eq("week", monday);

        if (type === "user") {
          weeklyFootprint = data.reduce((sum, record) => sum + record.carbon_footprint, 0);
        } else {
          weeklyFootprint = data.reduce((sum, record) => sum + record.carbon_footprint, 0) / data.length;
        }
        const validWeeklyFootprint = isNaN(weeklyFootprint) ? 0 : weeklyFootprint;
        footprintList.push(validWeeklyFootprint);
      }
    } else if (lineChartLength === "month") {
      dates = getFirstDayOfLast4Months();

      for (const month of dates) {
        const { data, error } = await supabase
          .from("Team_Member_History")
          .select("carbon_footprint, week")
          .eq(field_name, id_name)
          .gte("week", `01-${month}-23`)
          .lte("week", `31-${month}-23`);

        if (data && data.length > 0) {
          const filteredData = data.filter(record => record.week.includes(`-${month}-`));
          if (type === "user") {
            let weeklySums = {};
            for (const record of filteredData) {
              if (!weeklySums[record.week]) {
                weeklySums[record.week] = 0;
              }
              weeklySums[record.week] += record.carbon_footprint;
            }
            // Sum the weekly sums and then divide by the number of unique weeks
            monthlyFootprint = Object.values(weeklySums).reduce((sum, weekSum) => sum + weekSum, 0) / Object.keys(weeklySums).length;
          } else {
            monthlyFootprint = filteredData.reduce((sum, record) => sum + record.carbon_footprint, 0) / filteredData.length;
          }

          footprintList.push(monthlyFootprint);
        } else {
          console.log(`No data found for month: ${month}`);
          footprintList.push(0);
        }
      }
    }

    const lineChartData = {
      footprintList: footprintList,
      dates: dates,
    }

    res.status(200).json({ status: "ok", data: lineChartData });
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: "error" });
  }
};


module.exports.getBarChartData = async (req, res) => {
  const { company_id } = req.body;

  try {
    let offices = {};
    const { data: users } = await supabase
      .from("User")
      .select(`
        Office(name),
        Team_Member(monday_cf, tuesday_cf, wednesday_cf, thursday_cf, friday_cf)
      `)
      .eq("company_id", company_id)
      .neq("type", "Admin");

    users.forEach(user => {
      const officeName = user.Office.name;

      // Initialise office in the offices object if it doesn't exist
      if (!offices[officeName]) {
        offices[officeName] = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0 };
      }

      // Object to track if a day has already been incremented for this user
      const incrementedDays = { monday: false, tuesday: false, wednesday: false, thursday: false, friday: false };

      // Iterate through each team member
      user.Team_Member.forEach(member => {
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
          // Check if the day's cf > 0 and if the day has not been incremented yet for this user
          if (member[`${day}_cf`] > 0 && !incrementedDays[day]) {
            offices[officeName][day] += 1;
            incrementedDays[day] = true; // Mark the day as incremented
          }
        });
      });
    });

    res.status(200).json({ status: "ok", data: offices });
  } catch (error) {
    res.status(500).json({ status: "error" });
  }
};


module.exports.getCompanyDashboardData = async (req, res) => {
  const { company_id } = req.body;

  try {

    const { data: teams, getTeamsError } = await supabase
      .from("Team")
      .select(`
        id,
        name, 
        divisions,
        User(email),
        Team_Member(monday_cf,
          tuesday_cf,
          wednesday_cf,
          thursday_cf,
          friday_cf)
      `)
      .eq("company_id", company_id);

    const teamsInfo = [];
    let totalCompanyCarbonFootprint = 0;
    let totalCompanyMembers = 0;

    let continentData = {};

    for (const team of teams) {
      const carbonFootprintSum = team.Team_Member.reduce((sum, member) => {
        return sum + member.monday_cf + member.tuesday_cf + member.wednesday_cf + member.thursday_cf + member.friday_cf;
      }, 0);

      const totalMembers = team.Team_Member.length;
      const carbonFootprintAverage = totalMembers > 0 ? (carbonFootprintSum / totalMembers).toFixed(2) : 'N/A';

      const teamInfo = {
        id: team.id,
        name: team.name,
        ownerEmail: team.User.email,
        division: team.divisions,
        carbonFootprintAverage: carbonFootprintAverage,
        numberOfMembers: totalMembers,
        carbonFootprintTotal: carbonFootprintSum.toFixed(2),
      };

      teamsInfo.push(teamInfo);

      totalCompanyCarbonFootprint += carbonFootprintSum;
      totalCompanyMembers += totalMembers;

      const division = team.divisions || "";
      const continent = division.split('/')[0] || "Unknown";

      if (!continentData[continent]) {
        continentData[continent] = { totalFootprint: 0, totalMembers: 0 };
      }

      continentData[continent].totalFootprint += carbonFootprintSum;
      continentData[continent].totalMembers += totalMembers;
    }

    const averageCompanyCarbonFootprint = totalCompanyMembers > 0 ? (totalCompanyCarbonFootprint / totalCompanyMembers).toFixed(2) : 'N/A';

    const companyInfo = {
      name: 'No Name',
      averageCarbonFootprint: averageCompanyCarbonFootprint,
      totalCarbonFootprint: totalCompanyCarbonFootprint.toFixed(2),
    };

    const { data: companyName } = await supabase
      .from("Company")
      .select("name")
      .eq("id", company_id);

    if (companyName && companyName.length > 0) {
      companyInfo.name = companyName[0].name;
    }

    const { count: userCount } = await supabase
      .from("User")
      .select("id", { count: 'exact' })
      .neq("type", "Admin")
      .eq("company_id", company_id);

    const continentAverages = {};
    for (const [continent, data] of Object.entries(continentData)) {
      continentAverages[continent] = data.totalMembers > 0 ? (data.totalFootprint / data.totalMembers).toFixed(2) : 'N/A';
    }

    res.status(200).json({ status: "ok", teamsInfo, companyInfo, userCount, totalCompanyCarbonFootprint, continentAverages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error" });
  }
};