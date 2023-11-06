import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import SideNavbar from '../components/SideNavbar';
import { Box, Typography, Card, CardContent, Grid, Select, MenuItem, Stack, IconButton, Popover, Divider  } from '@mui/material';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import Avatar from '@mui/material/Avatar';
import InfoIcon from '@mui/icons-material/Info';
import InputLabel from '@mui/material/InputLabel';

export default function TeamDashboard() {
  const { userData } = useUser();
  const [teamDashboardData, setTeamDashboardData] = useState({
    name: '',
    email: '',
    company: '',
    team_created: '',
    carbon_footprint_total: 0,
    carbon_footprint_metric: 0,
    team_members: [],
  });
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [companyCarbonStandard, setCompanyCarbonStandard] = useState({});
  const [gradient, setGradient] = useState('');
  const [infoPopoverAnchorEl, setInfoPopoverAnchorEl] = useState(null);
  const isInfoPopoverOpen = Boolean(infoPopoverAnchorEl);

  const handleInfoPopoverOpen = (event) => {
    setInfoPopoverAnchorEl(event.currentTarget);
  };

  const handleInfoPopoverClose = () => {
    setInfoPopoverAnchorEl(null);
  };

  const teamOptions = userTeams.map(team => ({
    team_id: team.team_id,
    team_name: team.Team.name,
  }));

  useEffect(() => {
    fetch(`${baseURL}/getUserTeams`, {
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
          setUserTeams(data.user_teams);
          if (data.user_teams.length > 0 && selectedTeam === '') {
            // Set the initial selected team to the first team only if it's not already set
            setSelectedTeam(data.user_teams[0].Team.name);
            setSelectedTeamId(data.user_teams[0].team_id);
          }
        } else {
          toast.error("Failed to fetch user's teams.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching teams data.");
      });
  }, [userData, selectedTeam]);

  useEffect(() => {
    if (selectedTeamId) {
      fetch(`${baseURL}/getTeamDashboardData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team_id: selectedTeamId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setTeamDashboardData(data.data);
          } else {
            toast.error("Failed to fetch team dashboard data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching team dashboard data.");
        });
    }

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
  }, [selectedTeamId, userData]);

  useEffect(() => {
    if (companyCarbonStandard && teamDashboardData) {
      // Determine the gradient class based on the carbon standards
      const carbonFootprint = parseFloat(teamDashboardData.carbon_footprint_metric);
      if (carbonFootprint < companyCarbonStandard.amber_carbon_standard) {
        setGradient("green-gradient");
      } else if ((carbonFootprint >= companyCarbonStandard.amber_carbon_standard) && (carbonFootprint < companyCarbonStandard.red_carbon_standard)) {
        setGradient("amber-gradient");
      } else if (carbonFootprint >= companyCarbonStandard.red_carbon_standard) {
        setGradient("red-gradient");
      }
    }
  }, [companyCarbonStandard, teamDashboardData]);


  if (!userData || (userData.type !== 'Employee')) {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5, display: 'flex', flexDirection: 'column' }}>


        <Stack direction="row" py={1} spacing={5} alignItems="center" >
          <h1>Team Dashboard</h1>
          {/* Dropdown to switch team dashboard for different teams */}
          <InputLabel>You are viewing team:</InputLabel>
          <Select
            value={selectedTeamId}
            sx={{ width: 300 }}
            onChange={(e) => {
              const newSelectedTeamId = e.target.value;
              setSelectedTeamId(newSelectedTeamId);
              const selectedTeamObject = teamOptions.find(option => option.team_id === newSelectedTeamId);
              if (selectedTeamObject) {
                setSelectedTeam(selectedTeamObject.team_name);
              }
            }}
            style={{ marginBottom: '16px' }}
          >
            {teamOptions.map((option, index) => (
              <MenuItem key={option.team_id} value={option.team_id}>
                {option.team_name}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <div style={{ flex: 1, display: 'flex' }}>
          <Grid container spacing={3}>
            {/* First row */}
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px' }}>
                  <Typography variant="h6" paragraph>
                    Team Info
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Name: {teamDashboardData.name}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Team Owner Email: {teamDashboardData.email}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Company: {teamDashboardData.company}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Account Created: {teamDashboardData.team_created}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }} className={gradient}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    Teams Average Weekly Commuting Carbon Footprint:
                  </Typography>
                  <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                    {teamDashboardData.carbon_footprint_metric} kg CO2
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
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    Teams Total Weekly Commuting Carbon Footprint:
                  </Typography>
                  <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                    {teamDashboardData.carbon_footprint_total} kg CO2
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Third row */}
            <Grid item xs={12}>
              <Typography variant="h6" paragraph>
                Team Members:
              </Typography>
              <Grid container direction="column" spacing={2}>
                {teamDashboardData.team_members && teamDashboardData.team_members.map((teamMember, index) => (
                  <Grid item key={index}>
                    <Card sx={{ height: 'auto' }}>
                      <CardContent>
                        <Grid container alignItems="center">
                          <Grid item xs={2}>
                            <Grid container alignItems="center" justifyContent="center">
                              <Avatar alt={teamMember.firstname} src="/path_to_image.jpg" sx={{ width: 75, height: 75, marginRight: 2 }} />
                            </Grid>
                          </Grid>
                          <Grid item xs={10}>
                            <Typography variant="h6" paragraph>
                              {teamMember.firstname} {teamMember.lastname}
                            </Typography>
                            <Typography variant="body1" style={{ marginBottom: '8px' }}>
                              Email: {teamMember.email}
                            </Typography>
                            <Typography variant="body1" style={{ marginBottom: '8px' }}>
                              Weekly Carbon Footprint: {teamMember.carbon_footprint} kg CO2
                            </Typography>
                            <Typography variant="body1" style={{ marginBottom: '8px' }}>
                              Work At Office preference: {teamMember.wao_preference ? teamMember.wao_preference.join(', ') : 'Not specified'}
                            </Typography>
                          </Grid>
                        </Grid>
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
        <Divider/>
        <Stack direction="row" spacing={2} py={0.5} alignItems="center">
          <Typography style={{ flex: 1, textAlign: 'center' }}>
            Good: &lt; {companyCarbonStandard.green_carbon_standard} kg
          </Typography>
          <div
            className="green-gradient"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              alignSelf: 'center',
              marginRight: '20px',
            }}
          ></div>
        </Stack>
        <Stack direction="row" spacing={2} py={0.5} alignItems="center">
          <Typography style={{ flex: 1, textAlign: 'center' }}>
            Average: &lt; {companyCarbonStandard.amber_carbon_standard} kg
          </Typography>
          <div
            className="amber-gradient"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              alignSelf: 'center',
              marginRight: '20px',
            }}
          ></div>
        </Stack>
        <Stack direction="row" spacing={2} py={0.5} alignItems="center">
          <Typography style={{ flex: 1, textAlign: 'center' }}>
            Bad: &gt; {companyCarbonStandard.red_carbon_standard} kg
          </Typography>
          <div
            className="red-gradient"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              alignSelf: 'center',
              marginRight: '20px',
            }}
          ></div>
        </Stack>
      </Popover>
    </Box>
  );
}