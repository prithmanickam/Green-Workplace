import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import SideNavbar from '../components/SideNavbar';
import { Box, Typography, Button, Card, CardContent, Grid, Stack, IconButton, Popover, Divider } from '@mui/material';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import InfoIcon from '@mui/icons-material/Info';
import { baseURL } from "../utils/constant";
import { getGradientColors } from "../utils/gradientConstants";

export default function YourDashboard() {
  const { userData } = useUser();
  const [dashboardData, setDashboardData] = useState([]);
  const [teamPreferences, setTeamPreferences] = useState({});
  const [confirmedPreferences, setConfirmedPreferences] = useState({});
  const [firstLoad, setFirstLoad] = useState(true);
  const [companyCarbonStandard, setCompanyCarbonStandard] = useState({});
  const { green_gradient, amber_gradient, red_gradient } = getGradientColors();
  const [gradient, setGradient] = useState('');
  const [infoPopoverAnchorEl, setInfoPopoverAnchorEl] = useState(null);
  const isInfoPopoverOpen = Boolean(infoPopoverAnchorEl);

  const handleInfoPopoverOpen = (event) => {
    setInfoPopoverAnchorEl(event.currentTarget);
  };

  const handleInfoPopoverClose = () => {
    setInfoPopoverAnchorEl(null);
  };

  useEffect(() => {
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

    fetch(`${baseURL}/getCompanyCarbonStandard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_id: userData.company_id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setCompanyCarbonStandard(data.companyCarbonStandard);
        } else {
          toast.error("Failed to fetch company dashboard data.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching company dashboard data.");
      });

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

  if (!userData || (userData.type !== 'Employee')) {
    return <Navigate to="/homepage" replace />;
  }

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
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5, display: 'flex', flexDirection: 'column' }}>
        <h1>Your Dashboard</h1>
        <div style={{ flex: 1, display: 'flex' }}>
          <Grid container spacing={3}>
            {/* First row */}
            <Grid item xs={6}>
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
                    Account Created: {dashboardData.accountCreated}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ height: '100%', backgroundImage: gradient }}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    Your Total Weekly Commuting Carbon Footprint:
                  </Typography>
                  <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                    {dashboardData.totalCarbonFootprint} kg CO2
                  </Typography>
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
                          Your Carbon Footprint: {carbonFootprint} kg CO2
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
        <Typography style={{ padding: '8px' }}>
          Carbon Footprint Standard
        </Typography>
        <Divider />
        <Stack direction="row" spacing={2} py={0.5} alignItems="center">
          <Typography style={{ flex: 1, textAlign: 'left', paddingLeft: '10px' }}>
            Good: &lt; {companyCarbonStandard.amber_carbon_standard} kg
          </Typography>
          <div
            className="green-gradient"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              alignSelf: 'center',
              marginRight: '10px',
              backgroundImage: green_gradient
            }}
          ></div>
        </Stack>
        <Stack direction="row" spacing={2} py={0.5} alignItems="center">
          <Typography style={{ flex: 1, textAlign: 'left', paddingLeft: '10px' }}>
            Average: {companyCarbonStandard.amber_carbon_standard} &lt;= & &lt; {companyCarbonStandard.red_carbon_standard} kg
          </Typography>
          <div
            className="amber-gradient"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              alignSelf: 'center',
              marginRight: '10px',
              backgroundImage: amber_gradient
            }}
          ></div>
        </Stack>
        <Stack direction="row" spacing={2} py={0.5} alignItems="center">
          <Typography style={{ flex: 1, textAlign: 'left', paddingLeft: '10px' }}>
            Bad: &gt;= {companyCarbonStandard.red_carbon_standard} kg
          </Typography>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              alignSelf: 'center',
              marginRight: '10px',
              backgroundImage: red_gradient
            }}
          ></div>
        </Stack>
      </Popover>
    </Box>
  );
}