import React, { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, TextField, IconButton, Typography, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SideNavbar from '../components/SideNavbar';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import InputAdornment from '@mui/material/InputAdornment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsRailwayIcon from '@mui/icons-material/DirectionsRailway';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import ElectricScooterIcon from '@mui/icons-material/ElectricScooter';
import SubwayIcon from '@mui/icons-material/Subway';
import TramIcon from '@mui/icons-material/Tram';
import useAuth from '../hooks/useAuth';

const CO2_EMISSIONS_PER_MINUTE = {
  Car: 0.009,
  Bicycle: 0,
  Bus: 0.0022,
  Train: 0.0005,
  Walk: 0,
  Motorcycle: 0.005,
  ElectricCar: 0.001,
  Scooter: 0.003,
  Subway: 0.0003,
  Tram: 0.0004
};

export default function ManuallyAddFootprint() {
  const { userData } = useUser();
  const [teams, setTeams] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [entries, setEntries] = useState([]);
  const [teamPercentages, setTeamPercentages] = useState({});
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  useAuth(["Employee"]);

  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'Car': return <DirectionsCarIcon />;
      case 'Bicycle': return <DirectionsBikeIcon />;
      case 'Bus': return <DirectionsBusIcon />;
      case 'Train': return <DirectionsRailwayIcon />;
      case 'Walk': return <DirectionsWalkIcon />;
      case 'Motorcycle': return <TwoWheelerIcon />;
      case 'ElectricCar': return <ElectricCarIcon />;
      case 'Scooter': return <ElectricScooterIcon />;
      case 'Subway': return <SubwayIcon />;
      case 'Tram': return <TramIcon />;
      default: return null;
    }
  };

  useEffect(() => {
    if (userData) {
      fetch(`${baseURL}/getUserTeamsData`, {
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
            console.log("hi")
            console.log(data.data)
            const fetchedTeams = data.data;
            console.log(fetchedTeams)
            setTeams(fetchedTeams);

          } else {
            toast.error("Failed to fetch teams data. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching teams data.");
        });
    }
  }, [userData]);


  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const handleTransportChange = (event) => {
    setTransportMode(event.target.value);
  };

  const updateTotalCarbonFootprint = () => {
    const total = entries.reduce((sum, entry) => sum + parseFloat(entry.carbonFootprint || 0), 0);
    setCarbonFootprint(total.toFixed(2));
  };

  const updateTotalDuration = (entries) => {
    const totalMinutes = entries.reduce((sum, entry) => {
      const [hours, minutes] = entry.time.split(':').map(Number);
      return sum + hours * 60 + minutes;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    setTotalDuration(`${hours}h ${minutes}m`);
  };

  const addEntry = () => {
    setEntries(prevEntries => {
      const newEntries = [...prevEntries, { mode: transportMode, time: '00:00', carbonFootprint: '0.00' }];
      updateTotalCarbonFootprint(newEntries);
      updateTotalDuration(newEntries);
      return newEntries;
    });
  };

  const handleTimeChange = (index) => (event) => {
    setEntries(prevEntries => {
      const newEntries = [...prevEntries];
      newEntries[index].time = event.target.value;
      newEntries[index].carbonFootprint = calculateCarbonFootprint(newEntries[index].mode, event.target.value);
      updateTotalCarbonFootprint(newEntries);
      updateTotalDuration(newEntries);
      return newEntries;
    });
  };

  const deleteEntry = (index) => {
    setEntries(prevEntries => {
      const newEntries = prevEntries.filter((_, i) => i !== index);
      updateTotalCarbonFootprint(newEntries);
      updateTotalDuration(newEntries);
      return newEntries;
    });
  };

  // percentage to distribute carbon footprint value to users teams
  const handleTeamPercentageChange = (event, teamName) => {
    const newPercentages = { ...teamPercentages };
    newPercentages[teamName] = event.target.value;
    setTeamPercentages(newPercentages);

    // Recalculate total percentage
    const total = Object.values(newPercentages).reduce(
      (accumulator, percentage) => accumulator + parseFloat(percentage) || 0,
      0
    );
    setTotalPercentage(total);
  };

  const calculateCarbonFootprint = (mode, time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (CO2_EMISSIONS_PER_MINUTE[mode] * totalMinutes).toFixed(2);
  };

  const isSingleTeamUser = Array.isArray(teams) && teams.length === 1;

  const teamFields = Array.isArray(teams) ? teams.map((team) => (
    <Box key={team.teamName}>
      <hr />
      <Typography>{team.teamName}</Typography>

      <TextField
        size="small"
        style={{ width: '100%' }}
        value={isSingleTeamUser ? 100 : teamPercentages[team.teamName] || ''}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>,
        }}
        onChange={(event) => handleTeamPercentageChange(event, team.teamName)}
      />
      <Typography sx={{ fontSize: '14px', py: 1 }}>
        Carbon Footprint:{' '}
        {teamPercentages[team.teamName]
          ? (
            (parseFloat(teamPercentages[team.teamName]) / 100) *
            parseFloat(carbonFootprint)
          ).toFixed(2)
          : 'N/A'}
        kg CO2
      </Typography>

    </Box>
  )) : null;

  const handleSubmit = () => {
    // Calculating total duration from entries
    const duration = entries.reduce((sum, entry) => {
      const [hours, minutes] = entry.time.split(':').map(Number);
      return sum + hours * 60 + minutes;
    }, 0);

    // Validation checks
    if (duration === 0 || carbonFootprint === '0.00' || selectedDay === '') {
      toast.error("Duration, Carbon Footprint, or Day must not be empty.");
      return;
    }

    if (totalPercentage !== 100 && teams.length > 0) {
      toast.error("The total percentage given between teams needs to equal 100%");
      return;
    }

    // Prepare data for each team
    const teamData = teams.map(team => ({
      team_id: team.teamId,
      calculatedCarbonFootprint: ((parseFloat(teamPercentages[team.teamName]) / 100) * parseFloat(carbonFootprint)).toFixed(2),
    }));

    if (userData) {
      fetch(`${baseURL}/postCarbonFootprint`, {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          user_id: userData.id,
          day: selectedDay,
          duration,
          carbonFootprint: parseFloat(carbonFootprint),
          teamData,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data, "SetCarbonFootprint");
          if (data.status === "ok") {
            toast.success(`Carbon Stats Saved for ${selectedDay}.`);
          } else {
            toast.error("Something went wrong");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while saving carbon stats.");
        });
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Manually Add Your Carbon Footprint</h1>

          <FormControl fullWidth margin="normal">
            <InputLabel id="select-day-label">Select Days</InputLabel>
            <Select
              labelId="select-day-label"
              id="select-day"
              value={selectedDay}
              label="Select Days"
              onChange={handleDayChange}
            >
              <MenuItem value="Monday">Monday</MenuItem>
              <MenuItem value="Tuesday">Tuesday</MenuItem>
              <MenuItem value="Wednesday">Wednesday</MenuItem>
              <MenuItem value="Thursday">Thursday</MenuItem>
              <MenuItem value="Friday">Friday</MenuItem>
            </Select>
          </FormControl>
          <Grid container spacing={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Grid item xs={9}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="select-transport-label">Select Transport Mode</InputLabel>
                <Select
                  labelId="select-transport-label"
                  id="select-transport"
                  value={transportMode}
                  label="Select Transport Mode"
                  onChange={handleTransportChange}
                >
                  <MenuItem value="Car">Car</MenuItem>
                  <MenuItem value="Bicycle">Bicycle</MenuItem>
                  <MenuItem value="Bus">Bus</MenuItem>
                  <MenuItem value="Train">Train</MenuItem>
                  <MenuItem value="Walk">Walk</MenuItem>
                  <MenuItem value="Motorcycle">Motorcycle</MenuItem>
                  <MenuItem value="ElectricCar">Electric Car</MenuItem>
                  <MenuItem value="Scooter">Scooter</MenuItem>
                  <MenuItem value="Subway">Subway</MenuItem>
                  <MenuItem value="Tram">Tram</MenuItem>
                </Select>
              </FormControl>

            </Grid>
            <Grid item xs={3}>
              <Button variant="contained" color="primary" onClick={addEntry}>
                Add
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2} style={{ marginTop: '20px' }}>
            <Grid item xs={6}>
              <h2> Journey </h2>
              <Box sx={{ maxHeight: '350px', overflowY: 'auto', marginTop: 2 }}>

                {entries.map((entry, index) => (
                  <Card key={index} sx={{ marginY: 2 }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ marginRight: 2 }}>
                        {getTransportIcon(entry.mode)}
                      </Box>
                      <Typography sx={{ marginRight: 2 }}>{entry.mode}</Typography>
                      <TextField
                        type="time"
                        value={entry.time}
                        onChange={handleTimeChange(index)}
                        sx={{ marginRight: 2 }}
                      />
                      <Typography sx={{ marginRight: 2 }}>
                        {entry.carbonFootprint} kg CO2
                      </Typography>
                      <IconButton onClick={() => deleteEntry(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>

            <Grid item xs={6}>

              <h2> Distribute carbon footprint with teams </h2>
              <Box flexGrow={1} sx={{ maxHeight: '350px', overflowY: 'auto', marginTop: 2 }}>

                {teamFields}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
            <h2> Total Carbon Footprint: {carbonFootprint} kg CO2, Total Duration: {totalDuration}</h2>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 300, marginTop: 1 }}>
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Submit
              </Button>

              <Button variant="contained" color="secondary">
                Back
              </Button>
            </Box>
          </Box>

        </div>
      </Box>
    </Box>
  );
}
