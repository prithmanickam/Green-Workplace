import React, { useState, useEffect } from 'react';
import SideNavbar from '../components/SideNavbar';
import CustomLineChart from '../components/CustomLineChart';
import CarbonStandardPopover from '../components/CarbonStandardPopover';
import CarbonChangeIndicator from '../components/CarbonChangeIndicator';
import { Box, Typography, Card, CardContent, Grid, Select, MenuItem, Stack, IconButton, Popover, TablePagination } from '@mui/material';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import { getGradientColors } from "../utils/gradientConstants";
import Avatar from '@mui/material/Avatar';
import InfoIcon from '@mui/icons-material/Info';
import InputLabel from '@mui/material/InputLabel';
import useAuth from '../hooks/useAuth';
import useCompanyCarbonStandard from '../hooks/useCompanyCarbonStandard';

export default function TeamDashboard() {
  const { userData } = useUser();
  const [teamDashboardData, setTeamDashboardData] = useState({
    name: '',
    email: '',
    company: '',
    team_created: '',
    wao_days: [],
    carbon_footprint_total: 0,
    carbon_footprint_metric: '',
    team_members: [],
  });
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const { companyCarbonStandard } = useCompanyCarbonStandard(userData?.company_id);
  const { green_gradient, amber_gradient, red_gradient } = getGradientColors();
  const [gradient, setGradient] = useState('');
  const [infoPopoverAnchorEl, setInfoPopoverAnchorEl] = useState(null);
  const isInfoPopoverOpen = Boolean(infoPopoverAnchorEl);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const [lastWeeksCarbonFootprint, setLastWeeksCarbonFootprint] = useState(null);
  const handleSetLastWeeksCarbonFootprint = (footprint) => {
    setLastWeeksCarbonFootprint(footprint);
  };

  useAuth(["Employee"]);

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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page when rows per page changes
  };


  useEffect(() => {
    if (userData) {
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
    }
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
            const sortedMembers = data.data.team_members.sort((a, b) => a.carbon_footprint - b.carbon_footprint);
            setTeamDashboardData({ ...data.data, team_members: sortedMembers });

            //console.log(data.data.line_graph_values)
          } else {
            toast.error("Failed to fetch team dashboard data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching team dashboard data.");
        });
    }
  }, [selectedTeamId, userData]);

  useEffect(() => {
    if (companyCarbonStandard && teamDashboardData) {
      // Determine the gradient class based on the carbon standards
      const carbonFootprint = parseFloat(teamDashboardData.carbon_footprint_metric);
      if (carbonFootprint < companyCarbonStandard.amber_carbon_standard) {
        setGradient(green_gradient);
      } else if ((carbonFootprint >= companyCarbonStandard.amber_carbon_standard) && (carbonFootprint < companyCarbonStandard.red_carbon_standard)) {
        setGradient(amber_gradient);
      } else if (carbonFootprint >= companyCarbonStandard.red_carbon_standard) {
        setGradient(red_gradient);
      }
    }
  }, [companyCarbonStandard, teamDashboardData, green_gradient, amber_gradient, red_gradient])

  const getAvatarStyle = (index) => {
    if (page === 0) { // Only applies border colours on the first page
      switch (index) {
        case 0: return { border: '3px solid gold' };
        case 1: return { border: '3px solid silver' };
        case 2: return { border: '3px solid #cd7f32' };
        default: return {};
      }
    }
    return {};
  };


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
            <Grid item xs={12} sm={6} md={4}>
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
                    Team set Work at Office days: {teamDashboardData?.wao_days?.join(', ') || ""}
                  </Typography>
                  <Typography variant="body1" style={{ marginBottom: '8px' }}>
                    Account Created: {teamDashboardData?.team_created?.slice(0, 10) || ""}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', backgroundImage: gradient }} >
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    This Weeks Teams Average Commuting Carbon Footprint:
                  </Typography>
                  <Stack direction="row" justifyContent="center" width="100%">
                    <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                      {teamDashboardData.carbon_footprint_metric} kg CO2e
                    </Typography>
                    {lastWeeksCarbonFootprint !== null && (
                      <CarbonChangeIndicator
                        currentFootprint={teamDashboardData.carbon_footprint_metric}
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
                  {
                    selectedTeamId && userData && (
                      <CustomLineChart
                        type="team"
                        lineChartLength={"week"}
                        userData={userData}
                        team_id={selectedTeamId}
                        setLastWeeksFootprint={handleSetLastWeeksCarbonFootprint}
                      />
                    )
                  }
                </CardContent>
              </Card>
            </Grid>

            {/* Third row */}
            <Grid item xs={12}>
              <Typography variant="h6" paragraph>
                Team Members:
              </Typography>
              <Grid container direction="column" spacing={2}>
                {teamDashboardData.team_members
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((teamMember, index) => (
                    <Grid item key={index}>
                      <Card sx={{ height: 'auto' }}>
                        <CardContent>
                          <Grid container alignItems="center">
                            <Grid item xs={2}>
                              <Box position="relative" display="flex" justifyContent="center" alignItems="center">
                                {/* Displaying the rank */}
                                {index + page * rowsPerPage < 3 && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      position: 'absolute',
                                      top: -20,
                                      fontWeight: 'bold',
                                      color: (index + page * rowsPerPage) === 0 ? 'gold' : (index + page * rowsPerPage) === 1 ? 'silver' : '#cd7f32',
                                      zIndex: 2, // Ensure text is above the avatar
                                    }}
                                  >
                                    {index + page * rowsPerPage === 0 ? '1st' : index + page * rowsPerPage === 1 ? '2nd' : '3rd'}
                                  </Typography>
                                )}
                                <Avatar
                                  alt={teamMember.firstname}
                                  src="/path_to_image.jpg"
                                  sx={{ width: 75, height: 75, marginRight: 2, ...getAvatarStyle(index + page * rowsPerPage) }}
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={10}>
                              <Typography variant="h6" paragraph>
                                {teamMember.firstname} {teamMember.lastname}
                              </Typography>
                              <Typography variant="body1" style={{ marginBottom: '8px' }}>
                                Email: {teamMember.email}
                              </Typography>
                              <Typography variant="body1" style={{ marginBottom: '8px' }}>
                                Weekly Carbon Footprint: {teamMember.carbon_footprint} kg CO2e
                              </Typography>
                              <Typography variant="body1" style={{ marginBottom: '8px' }}>
                                Work At Office preference: {teamMember.wao_preference ? teamMember.wao_preference.join(', ') : 'Not specified'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                }
              </Grid>
              <TablePagination
                component="div"
                count={teamDashboardData.team_members.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
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