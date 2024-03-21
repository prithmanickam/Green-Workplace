import React, { useState, useEffect } from 'react';
import SideNavbar from '../components/SideNavbar';
import CustomLineChart from '../components/CustomLineChart';
import CustomBarChart from '../components/CustomBarChart';
import CustomPieChart from '../components/CustomPieChart';
import CarbonStandardPopover from '../components/CarbonStandardPopover';
import CarbonChangeIndicator from '../components/CarbonChangeIndicator';
import { Box, Typography, Card, CardContent, Grid, Select, MenuItem, Stack, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, ToggleButton, ToggleButtonGroup } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import InfoIcon from '@mui/icons-material/Info';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewSummaryIcon from '@mui/icons-material/ViewQuilt';
import ForestIcon from '@mui/icons-material/Forest';
import { baseURL } from "../utils/constant";
import { getGradientColors } from "../utils/gradientConstants";
import { useUser } from '../context/UserContext';
import { toast } from "react-toastify";
import "../App.css";
import useAuth from '../hooks/useAuth';
import useCompanyCarbonStandard from '../hooks/useCompanyCarbonStandard';


export default function CompanyDashboard() {
  const { userData } = useUser();
  const [companyData, setCompanyData] = useState({});
  const [totalCompanyEmployees, setTotalCompanyEmployees] = useState();
  const [totalCarbonFootprint, setTotalCarbonFootprint] = useState();
  const { green_gradient, amber_gradient, red_gradient } = getGradientColors();
  const [gradient, setGradient] = useState('');
  const [teamsData, setTeamsData] = useState([]);
  const [sortedTeamsData, setSortedTeamsData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [divisionSearchText, setDivisionSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('carbonFootprintAverage');
  const [infoPopoverAnchorEl, setInfoPopoverAnchorEl] = useState(null);
  const isInfoPopoverOpen = Boolean(infoPopoverAnchorEl);
  const [barChartData, setBarChartData] = useState({});
  const [selectedOffice, setSelectedOffice] = useState('');
  const [officeChartData, setOfficeChartData] = useState([0, 0, 0, 0, 0]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const { companyCarbonStandard } = useCompanyCarbonStandard(userData?.company_id);
  const [dashboardMode, setDashboardMode] = useState('summary');
  const [continentAverages, setContinentAverages] = useState({});

  useAuth(["Admin", "Employee"]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedTeamsData = sortedTeamsData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleInfoPopoverOpen = (event) => {
    setInfoPopoverAnchorEl(event.currentTarget);
  };

  const handleInfoPopoverClose = () => {
    setInfoPopoverAnchorEl(null);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setDashboardMode(newMode);
    }
  };

  const [lastWeeksCarbonFootprint, setLastWeeksCarbonFootprint] = useState(null);
  const handleSetLastWeeksCarbonFootprint = (footprint) => {
    setLastWeeksCarbonFootprint(footprint);
  };

  useEffect(() => {
    if (userData) {
      fetch(`${baseURL}/getCompanyDashboardData`, {
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
            setCompanyData(data.companyInfo);
            setTotalCompanyEmployees(data.userCount)
            setContinentAverages(data.continentAverages)
            console.log(data.continentAverages)
            console.log("hi")
            setTotalCarbonFootprint(data.totalCompanyCarbonFootprint)
            setTeamsData(data.teamsInfo);
            const sortedByCarbonFootprint = [...data.teamsInfo].sort((a, b) => sortOrder === 'asc' ? parseFloat(a.carbonFootprintAverage) - parseFloat(b.carbonFootprintAverage) : parseFloat(b.carbonFootprintAverage) - parseFloat(a.carbonFootprintAverage));
            setSortedTeamsData(sortedByCarbonFootprint);
          } else {
            toast.error("Failed to fetch company dashboard data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching company dashboard data.");
        });
    }
  }, [userData, sortOrder]);

  useEffect(() => {
    if (companyCarbonStandard && companyData) {
      // Determine the gradient class based on the carbon standards
      const carbonFootprint = parseFloat(companyData.averageCarbonFootprint);
      if (carbonFootprint < companyCarbonStandard.amber_carbon_standard) {
        setGradient(green_gradient);
      } else if ((carbonFootprint >= companyCarbonStandard.amber_carbon_standard) && (carbonFootprint < companyCarbonStandard.red_carbon_standard)) {
        setGradient(amber_gradient);
      } else if (carbonFootprint >= companyCarbonStandard.red_carbon_standard) {
        setGradient(red_gradient);
      }
    }
  }, [companyCarbonStandard, companyData, green_gradient, amber_gradient, red_gradient]);

  useEffect(() => {
    if (userData) {

      fetch(`${baseURL}/getBarChartData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_id: userData.company_id
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setBarChartData(data.data);
            // Check if there are offices in the data and select the first offfice
            const offices = Object.keys(data.data);
            if (offices.length > 0 && !selectedOffice) {
              setSelectedOffice(offices[0]);
            }

          } else {
            toast.error("Failed to fetch line chart data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching line chart data.");
        });
    }
  }, [userData, barChartData, selectedOffice]);

  useEffect(() => {
    if (barChartData && selectedOffice) {
      // Extract values in the order of the days from Monday to Friday
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const data = days.map(day => barChartData[selectedOffice][day]);

      setOfficeChartData(data);
    }
  }, [selectedOffice, barChartData]);


  const handleOfficeChange = (event) => {
    setSelectedOffice(event.target.value);
  };

  const handleSortChange = (event) => {
    const sortKey = event.target.value;
    setSortBy(sortKey);
    if (sortKey === "name") {
      // Sort by team name
      setSortedTeamsData([...teamsData].sort((a, b) => a.name.localeCompare(b.name)));
    } else if (sortKey === "carbonFootprintAverage") {
      // Sort by Average Weekly Commuting Carbon Footprint
      const sortedByCarbonFootprint = [...teamsData].sort((a, b) => sortOrder === 'asc' ? parseFloat(a.carbonFootprintAverage) - parseFloat(b.carbonFootprintAverage) : parseFloat(b.carbonFootprintAverage) - parseFloat(a.carbonFootprintAverage));
      setSortedTeamsData(sortedByCarbonFootprint);
    }
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    setSearchText(searchTerm);
    const filteredTeams = teamsData.filter((team) => team.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setSortedTeamsData(filteredTeams);
  };

  const handleDivisionSearchChange = (event) => {
    const divisionTerm = event.target.value;
    setDivisionSearchText(divisionTerm);
    const filteredTeams = teamsData.filter((team) => team.division.toLowerCase().includes(divisionTerm.toLowerCase()));
    setSortedTeamsData(filteredTeams);
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5, display: 'flex', flexDirection: 'column' }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <h1>Company Dashboard</h1>
          </Grid>
          <Grid item>
            <Grid item>
              <ToggleButtonGroup
                value={dashboardMode}
                exclusive
                onChange={handleModeChange}
                aria-label="dashboard mode"
              >
                <ToggleButton value="summary" aria-label="summary mode">
                  <ViewSummaryIcon />
                </ToggleButton>
                <ToggleButton value="compact" aria-label="compact mode">
                  <ViewCompactIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Grid>

        {dashboardMode === 'summary' ? (
          // Render summary version (3 cards)
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                  <CustomBarChart
                    officeChartData={officeChartData}
                    selectedOffice={selectedOffice}
                    handleOfficeChange={handleOfficeChange}
                    offices={Object.keys(barChartData)}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', backgroundImage: gradient }} >
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    Company Info:
                  </Typography>
                  <Typography variant="h7" paragraph style={{ marginBottom: '4px' }}>
                    Name: {companyData.name}
                  </Typography>
                  <Typography variant="h7" paragraph style={{}}>
                    No. of Employees: {totalCompanyEmployees}
                  </Typography>

                  <Typography variant="h7" paragraph>
                    Company Average Commuting Carbon Footprint Per Employee this Week:
                  </Typography>

                  <Stack direction="row" justifyContent="center" width="100%">
                    <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                      {companyData.averageCarbonFootprint} kg CO2e
                    </Typography>
                    {lastWeeksCarbonFootprint !== null && (
                      <CarbonChangeIndicator
                        currentFootprint={companyData.averageCarbonFootprint}
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
                    type="company"
                    lineChartLength={"week"}
                    userData={userData}
                    team_id={0}
                    setLastWeeksFootprint={handleSetLastWeeksCarbonFootprint}
                  />

                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          // Render detailed version (6 cards)
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }} >
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    Company Info:
                  </Typography>
                  <Typography variant="h7" paragraph style={{ marginBottom: '4px' }}>
                    Name: {companyData.name}
                  </Typography>
                  <Typography variant="h7" paragraph style={{}}>
                    No. of Employees: {totalCompanyEmployees}
                  </Typography>


                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', backgroundImage: gradient }} >
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>

                  <Typography variant="h7" paragraph>
                    Company Average Commuting Carbon Footprint Per Employee this Week:
                  </Typography>
                  <Stack direction="row" justifyContent="center" width="100%">
                    <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                      {companyData.averageCarbonFootprint} kg CO2e
                    </Typography>
                    {lastWeeksCarbonFootprint !== null && (
                      <CarbonChangeIndicator
                        currentFootprint={companyData.averageCarbonFootprint}
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
              <Card sx={{ height: '100%' }} >
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h7" paragraph>
                    Company Total Commuting Carbon Footprint this Week:
                  </Typography>
                  <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                    {totalCarbonFootprint?.toFixed(2)} kg CO2e
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                    <Typography style={{ fontSize: '0.9rem', marginRight: '8px' }}>
                      Requires approximately
                    </Typography>
                    <ForestIcon />
                    <Typography style={{ fontSize: '0.9rem', marginLeft: '8px' }}>
                      {(totalCarbonFootprint / 22).toFixed(1)} trees to offset
                    </Typography>
                  </Box>

                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                  <CustomBarChart
                    officeChartData={officeChartData}
                    selectedOffice={selectedOffice}
                    handleOfficeChange={handleOfficeChange}
                    offices={Object.keys(barChartData)}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <CustomLineChart
                    type="company"
                    lineChartLength={"week"}
                    userData={userData}
                    team_id={0}
                  />

                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }} >
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h7" paragraph>
                    CO2e Distribution by Region:

                  </Typography>
                  <CustomPieChart data={continentAverages} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <div style={{ flex: 1, display: 'flex' }}>
          <Grid container spacing={3}>

            {/* Second row */}
            <Grid item xs={12} >
              <Typography variant="h6" sx={{ paddingTop: '10px' }}>
                Teams:
              </Typography>
              <Stack direction="row" spacing={2} py={2} alignItems="center">
                <Typography variant="body1">Sort By:</Typography>
                <Select
                  label="Sort By"
                  value={sortBy}
                  onChange={handleSortChange}
                  sx={{ width: '200px' }}
                >
                  <MenuItem value="name">Team Name</MenuItem>
                  <MenuItem value="carbonFootprintAverage">Carbon Footprint</MenuItem>
                </Select>
                <Select
                  label="Sort Order"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  sx={{ width: '150px' }}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
                <TextField
                  label="Search Team"
                  variant="outlined"
                  value={searchText}
                  onChange={handleSearchChange}
                />
                <TextField
                  label="Search Division"
                  variant="outlined"
                  value={divisionSearchText}
                  onChange={handleDivisionSearchChange}
                />
              </Stack>
              <Grid container direction="column" spacing={2} py={3}>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="team table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Team Name</TableCell>
                        <TableCell align="right">Owner Email</TableCell>
                        <TableCell align="right">Division</TableCell>
                        <TableCell align="right">Average Weekly CF</TableCell>
                        <TableCell align="right">Number of Members</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTeamsData.map((team) => (
                        <TableRow
                          key={team.id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {team.name}
                          </TableCell>
                          <TableCell align="right">{team.ownerEmail}</TableCell>
                          <TableCell align="right">{team.division}</TableCell>
                          <TableCell align="right">{team.carbonFootprintAverage}</TableCell>
                          <TableCell align="right">{team.numberOfMembers}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[8, 15, 25]}
                    component="div"
                    count={sortedTeamsData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
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
    </Box >
  );
}