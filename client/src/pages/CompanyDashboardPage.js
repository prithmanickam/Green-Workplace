import React, { useState, useEffect } from 'react';
import SideNavbar from '../components/SideNavbar';
import { Box, Typography, Card, CardContent, Grid, Select, MenuItem, Stack, TextField } from '@mui/material';
import { baseURL } from "../utils/constant";
import { useUser } from '../context/UserContext';
import { toast } from "react-toastify";

export default function CompanyDashboard() {
  const { userData } = useUser();
  const [companyData, setCompanyData] = useState({});
  const [teamsData, setTeamsData] = useState([]);
  const [sortedTeamsData, setSortedTeamsData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [divisionSearchText, setDivisionSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('carbonFootprintAverage');

  useEffect(() => {

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

  }, [userData, sortOrder]);

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
        <h1>Company Dashboard</h1>
        <div style={{ flex: 1, display: 'flex' }}>
          <Grid container spacing={3}>
            {/* First row */}
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px' }}>
                  <Typography variant="h6" paragraph>
                    Company Info:
                  </Typography>
                   Name: {companyData.name}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h7" paragraph>
                    Company Average Weekly Commuting Carbon Footprint:
                  </Typography>
                  <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                    {companyData.averageCarbonFootprint} kg CO2
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h7" paragraph>
                    Company Total Weekly Commuting Carbon Footprint:
                  </Typography>
                  <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                    {companyData.totalCarbonFootprint} kg CO2
                  </Typography>
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
              <Grid container direction="column" spacing={2}>
                {sortedTeamsData.map((team) => (
                  <Grid item key={team.id}>
                    <Card sx={{ height: 'auto' }}>
                      <CardContent>
                        {team.name}
                        <br />
                        Owner Email: {team.ownerEmail}
                        <br />
                        Division: {team.division}
                        <br />
                        Average Weekly Commuting Carbon Footprint: {team.carbonFootprintAverage}
                        <br />
                        Number of Members: {team.numberOfMembers}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Box>
    </Box>
  );
}