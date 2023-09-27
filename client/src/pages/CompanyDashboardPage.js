import React from "react";
import SideNavbar from '../components/SideNavbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function CompanyDashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h4" gutterBottom>
          Company Dashboard
        </Typography>
        <div style={{ flex: 1, display: 'flex' }}>
          <Grid container spacing={3}>
            {/* First row */}
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px' }}>
                  Company Info
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px' }}>
                  Company average carbon footprint for WAO days (per person):
                  7.2kg CO2e
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px' }}>
                  Total employees: 40
                  Total carbon footprint this week:
                  563kg CO2e
                </CardContent>
              </Card>
            </Grid>

            {/* Second row */}
            <Grid item xs={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px' }}>
                  Line Graph
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent style={{ minHeight: '100px' }}>
                  Hierarchy Chart
                </CardContent>
              </Card>
            </Grid>

            {/* Third row */}
            <Grid item xs={12}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  Teams
                  <Grid container direction="column" spacing={1}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                      <Grid item key={item}>
                        <Card sx={{ height: '50px', width: '100%' }}>
                          <CardContent>
                            Team {item}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Box>
    </Box>
  );
}
