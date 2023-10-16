import React, { useState, useEffect } from 'react';
import { Link, Navigate } from "react-router-dom";
import SideNavbar from '../components/SideNavbar';
import { Card, CardContent, Typography, Box, Button, Stack, Grid } from '@mui/material';
import { useUser } from '../context/UserContext';
import { toast } from "react-toastify";
import { baseURL } from "../utils/constant";

export default function SetCarbonFootprint() {

  const { userData } = useUser();
  const [teams, setTeams] = useState([]);

  const email = userData.email;

  useEffect(() => {
    fetch(`${baseURL}/getCarbonFootprint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userData.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          console.log("hi")
          console.log(data.data)
          const fetchedTeams = data.data;
          console.log(fetchedTeams)
          setTeams(fetchedTeams);

        } else {
          toast.error("Failed to fetch user carbon data for teams.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching teams data.");
      });
  }, [userData]);


  if (!userData || (userData.type !== 'Team Member')) {
    return <Navigate to="/homepage" replace />;
  }

  // placeholders before using user data
  const cardsData = [
    {
      day: "Monday",
      duration: userData.currentWeekStats?.Monday?.duration || "0 min",
      carbonFootprint: `${userData.currentWeekStats?.Monday?.carbon || 0} kg`,
    },
    {
      day: "Tuesday",
      duration: userData.currentWeekStats?.Tuesday?.duration || "0 min",
      carbonFootprint: `${userData.currentWeekStats?.Tuesday?.carbon || 0} kg`,
    },
    {
      day: "Wednesday",
      duration: userData.currentWeekStats?.Wednesday?.duration || "0 min",
      carbonFootprint: `${userData.currentWeekStats?.Wednesday?.carbon || 0} kg`,
    },
    {
      day: "Thursday",
      duration: userData.currentWeekStats?.Thursday?.duration || "0 min",
      carbonFootprint: `${userData.currentWeekStats?.Thursday?.carbon || 0} kg`,
    },
    {
      day: "Friday",
      duration: userData.currentWeekStats?.Friday?.duration || "0 min",
      carbonFootprint: `${userData.currentWeekStats?.Friday?.carbon || 0} kg`,
    },
  ];

  function handleReset(day) {
    fetch(`${baseURL}/resetCarbonFootprint`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        day,
        email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "ResetCarbonFootprint");
        if (data.status === "ok") {
          toast.success(`Carbon Stats Reseted for ${day}.`);
        } else {
          toast.error("Something went wrong");
        }
      });
  }

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
                    Duration: {card.duration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Carbon Footprint: {card.carbonFootprint}
                  </Typography>
                  {teams[card.day] && (
                    <>
                      <hr /> {/* Divider */}
                      {teams[card.day].map((teamStats, teamIndex) => (
                        <Typography key={teamIndex} variant="body2" color="text.secondary">
                          {teamStats}
                        </Typography>
                      ))}
                    </>
                  )}
                </CardContent>
                <Button variant="outlined" fullWidth onClick={() => handleReset(card.day)}>
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
