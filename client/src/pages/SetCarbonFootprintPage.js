import React, { useState, useEffect } from 'react';
import { Link, Navigate } from "react-router-dom";
import SideNavbar from '../components/SideNavbar';
import { Card, CardContent, Typography, Box, Button, Stack, Grid } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { toast } from "react-toastify";
import { baseURL } from "../utils/constant";
import { useUser } from '../context/UserContext';
import useAuth from '../hooks/useAuth';

export default function SetCarbonFootprint() {

  const { userData } = useUser();
  const [teams, setTeams] = useState([]);
  const [totalStats, setTotalStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useAuth(["Employee"]);

  useEffect(() => {

    if (userData) {

      fetch(`${baseURL}/getCarbonFootprint`, {
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
            const teamStats = data.stats;
            setTeams(teamStats);
            const totalStats = data.totalStats;
            setTotalStats(totalStats);

          } else {
            toast.error("Failed to fetch user carbon data for teams.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching teams data.");
        })
        .finally(() => {
          setLoading(false); // Set loading to false when data fetching is complete
        });
    }

  }, [userData]);

  if (userData && (userData.type !== 'Employee')) {
    return <Navigate to="/homepage" replace />;
  }

  // placeholders before using user data
  const cardsData = [
    {
      day: "Monday",
    },
    {
      day: "Tuesday",
    },
    {
      day: "Wednesday",
    },
    {
      day: "Thursday",
    },
    {
      day: "Friday",
    },
  ];

  function handleReset(day) {
    fetch(`${baseURL}/resetCarbonFootprint`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        day,
        user_id: userData.id,
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
                Add Using Google Maps
              </Button>
            </Link>
            <Link to={"/SetCarbonFootprint/ManuallyAddFootprint"}>
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
            <Link to={"/SetCarbonFootprint/TransportModeDetection"}>
              <Button
                aria-label='center back'
                sx={{
                  mt: 3, mb: 2,
                  color: "white",
                  font: "Arial",
                  backgroundColor: "#eed202",
                  borderRadius: "10px",
                  "&:hover": {
                    backgroundColor: "#8B8000",
                  },
                }}>
                Add using Machine Learning
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

                  {loading ? (
                    <Box py={2}>
                      <LinearProgress />
                    </Box>
                  ) : (
                    <>
                      {totalStats[card.day] && (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Duration: {totalStats[card.day].duration}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Carbon Footprint: {totalStats[card.day].carbon_footprint} kg CO2e
                          </Typography>
                        </>
                      )}


                      {teams[card.day] && (
                        <>
                          <hr />
                          {teams[card.day].map((teamStats, teamIndex) => (
                            <Typography key={teamIndex} variant="body2" color="text.secondary">
                              {teamStats}
                            </Typography>
                          ))}
                        </>
                      )}
                    </>
                  )}

                </CardContent>
                <Button variant="contained" color="secondary" fullWidth onClick={() => handleReset(card.day)}>
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
