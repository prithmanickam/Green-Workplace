import React, { useState, useEffect, useCallback } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, TextField, IconButton, Typography, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SideNavbar from '../components/SideNavbar';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import { useNavigate } from 'react-router-dom';
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
import EditIcon from '@mui/icons-material/Edit';
import useAuth from '../hooks/useAuth';
import useUserTeamsData from '../hooks/useUserTeamsData';
import TeamFields from '../components/TeamFields';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const CO2_EMISSIONS_PER_MINUTE = {
  Car: 0.083185,
  Bicycle: 0,
  Bus: 0.03585,
  Train: 0.03077102,
  Walking: 0,
  Motorcycle: 0.05043,
  ElectricCar: 0.027815,
  Subway: 0.011,
  Tram: 0.00404
};

const CarEditModal = ({ open, handleClose, handleSave, engineType, setEngineType, numberOfEmployees, setNumberOfEmployees }) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit Car Details</DialogTitle>
      <DialogContent>
        {/* Engine Type Field */}
        <FormControl fullWidth margin="normal">
          <InputLabel id="engine-type-label">Engine Type</InputLabel>
          <Select
            labelId="engine-type-label"
            id="engine-type"
            value={engineType}
            label="Engine Type"
            onChange={(e) => setEngineType(e.target.value)}
          >
            <MenuItem value="Petrol">Petrol</MenuItem>
            <MenuItem value="Diesel">Diesel</MenuItem>
          </Select>
        </FormControl>

        {/* Number of Employees Field */}
        <TextField
          margin="dense"
          id="number-of-employees"
          label="No. of Employees"
          type="number"
          fullWidth
          variant="outlined"
          value={numberOfEmployees}
          onChange={(e) => setNumberOfEmployees(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function ManuallyAddFootprint() {
  const { userData } = useUser();
  const [selectedDay, setSelectedDay] = useState('');
  const [transportMode, setTransportMode] = useState('');
  const [entries, setEntries] = useState([]);
  const [teamPercentages, setTeamPercentages] = useState({});
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [carbonFootprint, setCarbonFootprint] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const { teams } = useUserTeamsData(userData?.id);
  const [carDetails, setCarDetails] = useState({ engineType: 'Petrol', numberOfEmployees: 1 });
  const [isCarEditModalOpen, setIsCarEditModalOpen] = useState(false);
  const [editingCarIndex, setEditingCarIndex] = useState(-1);
  const [returnJourney, setReturnJourney] = useState('Yes');
  const navigate = useNavigate()

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

  const handleDayChange = (event) => {
    setSelectedDay(event.target.value);
  };

  const handleTransportChange = (event) => {
    setTransportMode(event.target.value);
  };

  const updateTotalCarbonFootprint = useCallback(() => {
    let total = entries.reduce((sum, entry) => sum + parseFloat(entry.carbonFootprint || 0), 0);
    if (returnJourney === 'Yes') {
      total *= 2;
    }
    setCarbonFootprint(total.toFixed(2));
  }, [entries, returnJourney]);

  const updateTotalDuration = useCallback((entries) => {
    let totalMinutes = entries.reduce((sum, entry) => {
      const [hours, minutes] = entry.time.split(':').map(Number);
      return sum + hours * 60 + minutes;
    }, 0);

    if (returnJourney === 'Yes') {
      totalMinutes *= 2;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    setTotalDuration(`${hours} h ${minutes} mins`);
  }, [returnJourney]);

  useEffect(() => {
    updateTotalCarbonFootprint();
    updateTotalDuration(entries);
  }, [returnJourney, entries, updateTotalCarbonFootprint, updateTotalDuration]);


  const addEntry = () => {
    setEntries(prevEntries => {
      const newEntries = [...prevEntries, { mode: transportMode, time: '00:00', carbonFootprint: '0.00' }];
      updateTotalCarbonFootprint();
      updateTotalDuration(newEntries);
      return newEntries;
    });
  };

  const handleTimeChange = (index) => (event) => {
    setEntries(prevEntries => {
      const newEntries = [...prevEntries];
      newEntries[index].time = event.target.value;
      newEntries[index].carbonFootprint = calculateCarbonFootprint(newEntries[index].mode, event.target.value);
      updateTotalCarbonFootprint();
      updateTotalDuration(newEntries);
      return newEntries;
    });
  };

  const deleteEntry = (index) => {
    setEntries(prevEntries => {
      const newEntries = prevEntries.filter((_, i) => i !== index);
      updateTotalCarbonFootprint();
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

  const calculateCarbonFootprint = (mode, time, carDetails = {}) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (mode === 'Walk' || mode === 'Bicycle') {
      return '0.00';
    }

    let emissionRate = CO2_EMISSIONS_PER_MINUTE[mode];

    if (mode === 'Car' && carDetails.engineType) {
      // Adjust the emission rate based on engine type & no. of employees
      emissionRate *= (carDetails.engineType === 'Diesel' ?  0.966 : 1); 
      emissionRate /= carDetails.numberOfEmployees;
    }

    return (emissionRate * totalMinutes).toFixed(2);
  };


  const handleSubmit = () => {
    // Calculating total duration from entries
    const duration = entries.reduce((sum, entry) => {
      const [hours, minutes] = entry.time.split(':').map(Number);
      return sum + hours * 60 + minutes;
    }, 0);

    // Validation checks
    if (duration === 0 || parseFloat(carbonFootprint) === 0.00 || selectedDay === '') {
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

  const handleEditCar = (index) => {
    setEditingCarIndex(index);
    setIsCarEditModalOpen(true);
    // Load the current details into the modal
    setCarDetails({
      engineType: entries[index].engineType || 'Petrol',
      numberOfEmployees: entries[index].numberOfEmployees || 1,
    });
  };

  const handleCloseCarEditModal = () => {
    setIsCarEditModalOpen(false);
  };

  const handleSaveCarDetails = () => {
    setEntries(prevEntries => {
      const newEntries = [...prevEntries];
      newEntries[editingCarIndex] = {
        ...newEntries[editingCarIndex],
        ...carDetails,
        carbonFootprint: calculateCarbonFootprint(newEntries[editingCarIndex].mode, newEntries[editingCarIndex].time, carDetails),
      };
      updateTotalCarbonFootprint();
      updateTotalDuration(newEntries);
      return newEntries;
    });
    setIsCarEditModalOpen(false);
  };

  function navigateBack() {
    navigate('/SetCarbonFootprint');
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Manually Add Your Carbon Footprint</h1>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="select-day-label">Select Day</InputLabel>
                <Select
                  labelId="select-day-label"
                  id="select-day"
                  value={selectedDay}
                  label="Select Day"
                  onChange={handleDayChange}
                >
                  <MenuItem value="Monday">Monday</MenuItem>
                  <MenuItem value="Tuesday">Tuesday</MenuItem>
                  <MenuItem value="Wednesday">Wednesday</MenuItem>
                  <MenuItem value="Thursday">Thursday</MenuItem>
                  <MenuItem value="Friday">Friday</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="return-journey-label">Return Journey</InputLabel>
                <Select
                  labelId="return-journey-label"
                  id="return-journey"
                  value={returnJourney}
                  label="Return Journey"
                  onChange={(e) => setReturnJourney(e.target.value)}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

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
                        {entry.mode === 'Car' && (
                          <IconButton onClick={() => handleEditCar(index)}>
                            <EditIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Typography sx={{ marginRight: 2 }}>{entry.mode}</Typography>
                      <TextField
                        type="time"
                        value={entry.time}
                        onChange={handleTimeChange(index)}
                        sx={{ marginRight: 2 }}
                      />
                      <Typography sx={{ marginRight: 2 }}>
                        {entry.carbonFootprint} kg CO2e
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

                <TeamFields
                  teams={teams}
                  teamPercentages={teamPercentages}
                  handleTeamPercentageChange={handleTeamPercentageChange}
                  carbonFootprint={carbonFootprint}
                />
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
            <h2> Total Carbon Footprint: {carbonFootprint} kg CO2e, Total Duration: {totalDuration}</h2>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 300, marginTop: 1 }}>
              <Button variant="contained" color="success" onClick={handleSubmit}>
                Submit
              </Button>

              <Button variant="contained" color="secondary" onClick={navigateBack}>
                Back
              </Button>
            </Box>
          </Box>

        </div>
      </Box>
      <CarEditModal
        open={isCarEditModalOpen}
        handleClose={handleCloseCarEditModal}
        handleSave={handleSaveCarDetails}
        engineType={carDetails.engineType}
        setEngineType={(type) => setCarDetails({ ...carDetails, engineType: type })}
        numberOfEmployees={carDetails.numberOfEmployees}
        setNumberOfEmployees={(num) => setCarDetails({ ...carDetails, numberOfEmployees: num })}
      />
    </Box>
  );
}
