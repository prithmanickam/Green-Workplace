import React, { useState, useEffect } from 'react';
import SideNavbar from '../components/SideNavbar';
import { Box, Typography, Card, CardContent, Grid, Select, MenuItem, Stack, TextField, Divider, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import InfoIcon from '@mui/icons-material/Info';
import { baseURL } from "../utils/constant";
import { getGradientColors } from "../utils/gradientConstants";
import { useUser } from '../context/UserContext';
import { toast } from "react-toastify";
import { BarChart } from '@mui/x-charts/BarChart';
import "../App.css"
import useAuth from '../hooks/useAuth';

export default function CompanyDashboard() {
  const { userData } = useUser();
  const [companyData, setCompanyData] = useState({});
  const [companyCarbonStandard, setCompanyCarbonStandard] = useState({});
  const { green_gradient, amber_gradient, red_gradient } = getGradientColors();
  const [gradient, setGradient] = useState('');
  const [teamsData, setTeamsData] = useState([]);
  const [sortedTeamsData, setSortedTeamsData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [divisionSearchText, setDivisionSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('carbonFootprintAverage');
  const [infoPopoverAnchorEl, setInfoPopoverAnchorEl] = useState(null);
  const isInfoPopoverOpen = Boolean(infoPopoverAnchorEl);
  const [lineChartLength, setLineChartLength] = useState('week');
  const [lineChartData, setLineChartData] = useState({});
  const [barChartData, setBarChartData] = useState({});
  const [selectedOffice, setSelectedOffice] = useState('');
  const [officeChartData, setOfficeChartData] = useState([0, 0, 0, 0, 0]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

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
            console.log(barChartData)

          } else {
            toast.error("Failed to fetch line chart data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching line chart data.");
        });
    }
  }, [userData, barChartData]);

  useEffect(() => {
    if (barChartData && selectedOffice) {
      // Extract values in the order of the days from Monday to Friday
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      const data = days.map(day => barChartData[selectedOffice][day]);

      console.log(data);
      setOfficeChartData(data);
    }
  }, [selectedOffice, barChartData]);


  const handleOfficeChange = (event) => {
    setSelectedOffice(event.target.value);
  };


  useEffect(() => {
    if (userData) {
      fetch(`${baseURL}/getLineChartData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "company",
          lineChartLength: lineChartLength,
          user_id: userData.id,
          team_id: 0,
          company_id: userData.company_id
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setLineChartData(data.data);

          } else {
            toast.error("Failed to fetch line chart data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching line chart data.");
        });
    }
  }, [userData, lineChartLength]);

  const handleLineChartLengthChange = (length) => {
    setLineChartLength(length);
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
        <h1>Company Dashboard </h1>
        <div style={{ flex: 1, display: 'flex' }}>
          <Grid container spacing={3}>
            {/* First row */}
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                  <BarChart
                    xAxis={[{ scaleType: 'band', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], label: 'Days' }]}
                    series={[{
                      data: officeChartData,
                      color: '#eed202',
                      label: 'No. of Employees in Office',
                    }]}
                    width={300}
                    height={200}
                  />

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="h8" paragraph>
                      Select Office:
                    </Typography>

                    <Select
                      value={selectedOffice}
                      onChange={handleOfficeChange}
                    >

                      {Object.keys(barChartData).map((office) => (
                        <MenuItem key={office} value={office}>{office}</MenuItem>
                      ))}
                    </Select>

                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ height: '100%', backgroundImage: gradient }} >
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    Company Info:
                  </Typography>
                  <Typography variant="h7" paragraph>
                    Name: {companyData.name}
                  </Typography>

                  <Typography variant="h7" paragraph>
                    Company Average Weekly Commuting Carbon Footprint:
                  </Typography>
                  <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                    {companyData.averageCarbonFootprint} kg CO2
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
                  {lineChartData?.footprintList && (
                    <LineChart
                      width={300}
                      height={230}
                      series={[
                        { data: lineChartData.footprintList, label: 'Company Avg CF' },
                      ]}
                      xAxis={[{
                        scaleType: 'point',
                        data: lineChartData.dates,
                        label: 'Last 4 ' + lineChartLength + 's',
                      }]}
                    />
                  )}
                  {!lineChartData?.footprintList && (
                    <Typography>Loading line chart...</Typography>
                  )}
                  <div>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleLineChartLengthChange('week')}
                      style={{
                        borderColor: lineChartLength === 'week' ? '#02B2AF' : 'grey',
                        color: lineChartLength === 'week' ? '#02B2AF' : 'grey',
                        marginRight: '10px'
                      }}
                    >
                      Week
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleLineChartLengthChange('month')}
                      style={{
                        borderColor: lineChartLength === 'month' ? '#02B2AF' : 'grey',
                        color: lineChartLength === 'month' ? '#02B2AF' : 'grey'
                      }}
                    >
                      Month
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Second row */}
            <Grid item xs={12}>
              <Typography variant="h6" >
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
                    rowsPerPageOptions={[8]}
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
    </Box >
  );
}