import React from "react";
import { Link } from "react-router-dom";
import SideNavbar from '../components/SideNavbar';
import { Card, CardContent, Typography, Box, Button, Stack, Grid } from '@mui/material';
//import { useUser } from '../context/UserContext';

export default function SetCarbonFootprint() {
  //const { userData } = useUser();

  // placeholders before using user data
  const cardsData = [
    { day: "Mon", time: "2 hours", carbonFootprint: "5 kg" },
    { day: "Tue", time: "1.5 hours", carbonFootprint: "4 kg" },
    { day: "Wed", time: "0 hours", carbonFootprint: "0 kg" },
    { day: "Thu", time: "2.5 hours", carbonFootprint: "6 kg" },
    { day: "Fri", time: "0 hours", carbonFootprint: "0 kg" },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Set Your Carbon Footprint</h1>
        </div>
        <div>
          <Stack direction="row" spacing={5} p={2} justifyContent="center">
            <Link to={"/SetCarbonFootprint/UseMap"}>
              <Button
                type='submit'
                sx={{
                  mt: 3, mb: 2,
                  color: "white",
                  font: "Arial",
                  backgroundColor: "green",
                  borderRadius: "10px",
                  "&:hover": {
                    backgroundColor: "darkgreen",
                  },
                }}>
                Use Map
              </Button>
            </Link>
            <Link to={"/SetCarbonFootprint/UseMap"}>
              <Button
                aria-label='center back'
                sx={{
                  mt: 3, mb: 2,
                  color: "white",
                  font: "Arial",
                  backgroundColor: "grey",
                  borderRadius: "10px",
                  "&:hover": {
                    backgroundColor: "#36454F",
                  },
                }}>
                Add Manually
              </Button>
            </Link>
          </Stack>
        </div>

        <Grid container py={3} spacing={3} justifyContent="center" alignItems="center">
          {cardsData.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    {card.day}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time: {card.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your carbon footprint: {card.carbonFootprint}
                  </Typography>
                </CardContent>
                <Button variant="outlined" fullWidth>
                  Reset
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>

      </Box>
    </Box>
  );
}
