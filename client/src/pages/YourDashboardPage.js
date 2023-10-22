import React, { useState, useEffect } from 'react';
import SideNavbar from '../components/SideNavbar';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";

export default function YourDashboard() {
  const { userData } = useUser();
  const [dashboardData, setDashboardData] = useState([]);

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
        } else {
          toast.error("Failed to fetch your dashboard data. Please try again.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching teams data.");
      });
  }, [userData]);

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
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px', textAlign: 'center' }}>
                  <Typography variant="h6" paragraph>
                    Your Total Weekly Commuting Carbon Footprint:
                  </Typography>
                  <Typography variant="h4" style={{ fontSize: '1.8rem', marginTop: '10px' }}>
                    {dashboardData.totalCarbonFootprint} kg CO2
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Third row */}
            <Grid item xs={12}>
              <Typography variant="h6" paragraph>
                Your Teams:
              </Typography>
              <Grid container direction="column" spacing={2}>
                {dashboardData.teams && dashboardData.teams.map(([team, carbonFootprint]) => (
                  <Grid item key={team._id}>
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
                          Your Work At Office Preference:
                        </Typography>
                        <Button variant="outlined" color="primary" style={{ marginRight: '8px' }}>
                          Monday
                        </Button>
                        <Button variant="outlined" color="primary" style={{ marginRight: '8px' }}>
                          Tuesday
                        </Button>
                        <Button variant="outlined" color="primary" style={{ marginRight: '8px' }}>
                          Wednesday
                        </Button>
                        <Button variant="outlined" color="primary" style={{ marginRight: '8px' }}>
                          Thursday
                        </Button>
                        <Button variant="outlined" color="primary" style={{ marginRight: '30px' }}>
                          Friday
                        </Button>
                        <Button variant="outlined" color="secondary" style={{ marginRight: '8px' }}>
                          Save
                        </Button>
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
