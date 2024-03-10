import React, { useState, useEffect } from 'react';
import SideNavbar from '../components/SideNavbar';
import CustomLineChart from '../components/CustomLineChart';
import CarbonStandardPopover from '../components/CarbonStandardPopover';
import CarbonChangeIndicator from '../components/CarbonChangeIndicator';
import { Box, Stack, Typography, Button, Card, CardContent, Grid, IconButton, Popover } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from "react-toastify";
import InfoIcon from '@mui/icons-material/Info';
import { baseURL } from "../utils/constant";
import { getGradientColors } from "../utils/gradientConstants";
import { useUser } from '../context/UserContext';
import useAuth from '../hooks/useAuth';
import useCompanyCarbonStandard from '../hooks/useCompanyCarbonStandard';

export default function YourDashboard() {
  const { userData } = useUser();
  const [dashboardData, setDashboardData] = useState([]);
  const [teamPreferences, setTeamPreferences] = useState({});
  const [confirmedPreferences, setConfirmedPreferences] = useState({});
  const [firstLoad, setFirstLoad] = useState(true);
  const { green_gradient, amber_gradient, red_gradient } = getGradientColors();
  const [gradient, setGradient] = useState('');
  const [infoPopoverAnchorEl, setInfoPopoverAnchorEl] = useState(null);
  const isInfoPopoverOpen = Boolean(infoPopoverAnchorEl);
  const { companyCarbonStandard } = useCompanyCarbonStandard(userData?.company_id);


  const [lastWeeksCarbonFootprint, setLastWeeksCarbonFootprint] = useState(null);
  const handleSetLastWeeksCarbonFootprint = (footprint) => {
    setLastWeeksCarbonFootprint(footprint);
  };

  const currentFootprint = parseFloat(dashboardData.totalCarbonFootprint);
  const lastWeeksFootprint = parseFloat(lastWeeksCarbonFootprint);

  // Initial and current status of green region
  const isInGreenRegion = (footprint) => footprint < companyCarbonStandard.amber_carbon_standard;
  const wasInGreenRegion = isInGreenRegion(lastWeeksFootprint);
  const isInGreenRegionCurrently = isInGreenRegion(dashboardData.totalCarbonFootprint);
  const targetReduction = lastWeeksFootprint * 0.95;

  // Determine if the goal is met
  let goalAchievement;
  if (wasInGreenRegion) {
    goalAchievement = isInGreenRegionCurrently;
  } else {
    goalAchievement = currentFootprint <= targetReduction;
  }

  // Adjust the goal message accordingly
  const goalMessage = wasInGreenRegion
    ? "Goal for This Week: Maintain Carbon Footprint in Green Region."
    : `Goal for This Week: 5% Reduction in Carbon Footprint (Target: ${targetReduction.toFixed(2)} kg CO2e)`;

  useAuth(["Employee"]);

  const handleInfoPopoverOpen = (event) => {
    setInfoPopoverAnchorEl(event.currentTarget);
  };

  const handleInfoPopoverClose = () => {
    setInfoPopoverAnchorEl(null);
  };

  useEffect(() => {
    if (userData) {

      fetch(`${baseURL}/getYourDashboardData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setDashboardData(data.data);
            data.data.teams.forEach((team) => {
              const confirmedPrefs = {};
              data.data.teams.forEach((team) => {
                confirmedPrefs[team[0].teamId] = team[0].wao_preference;
              });
              setConfirmedPreferences(confirmedPrefs);
              if (firstLoad === true) {
                setTeamPreferences(confirmedPrefs);
                setFirstLoad(false)
              }
            });
          } else {
            toast.error("Failed to fetch your dashboard data. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching teams data.");
        });
    }

  }, [userData, confirmedPreferences, firstLoad]);


  useEffect(() => {

    if (companyCarbonStandard && dashboardData) {
      // Determine the gradient class based on the carbon standards
      const carbonFootprint = parseFloat(dashboardData.totalCarbonFootprint);
      if (carbonFootprint < companyCarbonStandard.amber_carbon_standard) {
        setGradient(green_gradient);
      } else if ((carbonFootprint >= companyCarbonStandard.amber_carbon_standard) && (carbonFootprint < companyCarbonStandard.red_carbon_standard)) {
        setGradient(amber_gradient);
      } else if (carbonFootprint >= companyCarbonStandard.red_carbon_standard) {
        setGradient(red_gradient);
      }
    }
  }, [companyCarbonStandard, dashboardData, green_gradient, amber_gradient, red_gradient]);


  const handleDayToggle = (teamId, day) => {
    setTeamPreferences((prevPreferences) => {
      const teamPreference = prevPreferences[teamId] || [];
      const updatedPreferences = teamPreference.includes(day)
        ? teamPreference.filter((d) => d !== day)
        : [...teamPreference, day];

      return { ...prevPreferences, [teamId]: updatedPreferences };
    });
  };

  const handleSavePreferences = (teamId) => {
    if (userData) {
      const selectedDays = teamPreferences[teamId] || [];
      const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].filter(day => selectedDays.includes(day));

      fetch(`${baseURL}/postWorkAtOfficePreference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          team_id: teamId,
          selected_days: orderedDays,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            toast.success("Preferences saved successfully");
            setConfirmedPreferences({
              ...confirmedPreferences,
              [teamId]: orderedDays
            });
          } else {
            toast.error("Failed to save preferences. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while saving preferences.");
        });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5, display: 'flex', flexDirection: 'column' }}>
        <h1>Your Dashboard</h1>
        <div style={{ flex: 1, display: 'flex' }}>
          <Grid container spacing={3}>
            {/* First row */}
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px' }}>
                  <Typography variant="h6" paragraph>
                    Your Info
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Name: {dashboardData.name}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Email: {dashboardData.email}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Company: {dashboardData.company}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Account Created: {dashboardData?.accountCreated?.slice(0, 10) || ""}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', backgroundImage: gradient }}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    Your Total Commuting Carbon Footprint This Week:
                  </Typography>
                  <Stack direction="row" justifyContent="center" width="100%">
                    <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                      {dashboardData.totalCarbonFootprint} kg CO2e
                    </Typography>

                    {lastWeeksCarbonFootprint !== null && (
                      <CarbonChangeIndicator
                        currentFootprint={dashboardData.totalCarbonFootprint}
                        lastWeeksFootprint={lastWeeksCarbonFootprint}
                      />
                    )}
                  </Stack>

                  <IconButton
                    onClick={handleInfoPopoverOpen}
                    aria-label="info"
                    style={{ marginLeft: '10px' }}
                  >
                    <InfoIcon />
                  </IconButton>

                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <CustomLineChart
                    type="user"
                    lineChartLength={"week"}
                    userData={userData}
                    team_id={0}
                    setLastWeeksFootprint={handleSetLastWeeksCarbonFootprint}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Card for Goal Achievement */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h6">
                      {goalMessage}
                    </Typography>
                    {lastWeeksCarbonFootprint !== null ? (
                      <Typography variant="body1" style={{ display: 'flex', alignItems: 'center' }}>
                        {goalAchievement ? 'Goal Met' : 'Goal Not Met'}
                        {goalAchievement ? <CheckCircleIcon color="success" sx={{ ml: 2 }} /> : <CancelIcon color="error" sx={{ ml: 2 }} />}
                      </Typography>
                    ) : (
                      <Typography variant="body1">Last week's data is not available.</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Third row */}
            <Grid item xs={12}>
              <Typography variant="h6" paragraph>
                Your Teams:
              </Typography>
              <Grid container direction="column" spacing={2}>
                {dashboardData.teams && dashboardData.teams.sort((a, b) => a[0].teamId - b[0].teamId).map(([team, carbonFootprint]) => (
                  <Grid item key={team.teamId}>

                    <Card sx={{ height: 'auto' }}>
                      <CardContent>
                        <Typography variant="h6" paragraph>
                          Team Name: {team.teamName}
                        </Typography>
                        <Typography variant="body1" style={{ marginBottom: '8px' }}>
                          Team Owner: {team.firstname} {team.lastname}
                        </Typography>
                        <Typography variant="body1" style={{ marginBottom: '8px' }}>
                          Your Carbon Footprint: {carbonFootprint} kg CO2e
                        </Typography>
                        <Typography variant="body1" style={{ marginBottom: '8px' }}>
                          Your Work At Office Preference: {confirmedPreferences[team.teamId] ? confirmedPreferences[team.teamId].join(', ') : 'None selected'}

                        </Typography>
                        <div>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                            <Button
                              key={day}
                              variant="outlined"
                              onClick={() => handleDayToggle(team.teamId, day)}
                              sx={{
                                backgroundColor: teamPreferences[team.teamId] && teamPreferences[team.teamId].includes(day) ? '#eed202' : 'primary',
                                color: teamPreferences[team.teamId] && teamPreferences[team.teamId].includes(day) ? 'black' : 'primary',
                                border: teamPreferences[team.teamId] && teamPreferences[team.teamId].includes(day) ? '1px solid black' : 'primary',
                                marginRight: '8px',
                              }}
                            >
                              {day}
                            </Button>
                          ))}
                          <Button
                            variant="outlined"
                            color={'success'}
                            style={{ marginRight: '8px' }}
                            onClick={() => handleSavePreferences(team.teamId)}
                            sx={{
                              backgroundColor: '#1ED760',
                              color: 'black'
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Box>
      <Popover
        open={isInfoPopoverOpen}
        anchorEl={infoPopoverAnchorEl}
        onClose={handleInfoPopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <CarbonStandardPopover
          companyCarbonStandard={companyCarbonStandard}
          greenGradient={green_gradient}
          amberGradient={amber_gradient}
          redGradient={red_gradient}
        />
      </Popover>
    </Box>
  );
}