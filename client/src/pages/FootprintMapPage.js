import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import { Card, CardContent, Typography, Box, TextField, Button, Stack, ToggleButton, ToggleButtonGroup, Grid, Divider, IconButton } from '@mui/material';
import DriveIcon from '@mui/icons-material/DriveEta';
import WalkIcon from '@mui/icons-material/DirectionsWalk';
import BicycleIcon from '@mui/icons-material/DirectionsBike';
import TransitIcon from '@mui/icons-material/DirectionsTransit';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { ThemeContext } from '../context/ThemeContext';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import useAuth from '../hooks/useAuth';
import useUserTeamsData from '../hooks/useUserTeamsData';
import TeamFields from '../components/TeamFields';

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';

// Uni of Glasgow Coords (maps position on load)
const center = { lat: 55.8721, lng: -4.2897 };

const CO2_EMISSIONS_PER_METER = {
  Car: 0.00016637,
  Bicycle: 0,
  Bus: 0.0001195,
  Train: 0.00003694,
  Walking: 0,
  Motorcycle: 0.00010086,
  ElectricCar: 0.00005563,
  Subway: 0.0000275,
  Tram: 0.0000202
};

function FootprintMapPage() {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // light/dark theme modifications 
  const { mode } = React.useContext(ThemeContext);
  let sideBarColour = 'rgba(0, 0, 0, 0.8)';

  if (mode === "light") {
    sideBarColour = 'rgba(255, 255, 255, 0.6)';
  }

  const { userData } = useUser();
  const navigate = useNavigate()

  // use states constants
  const [day, setDay] = React.useState('');
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState(0);
  const [formattedDistance, setFormattedDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [doubledDuration, setDoubledDuration] = useState('');
  const [doubledDistance, setDoubledDistance] = useState('');
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(0);
  const [travelMode, setTravelMode] = useState('TRANSIT');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [leafIconColour, setLeafIconColour] = useState('#eed202');
  const [teamPercentages, setTeamPercentages] = useState({});
  const [transitDistances, setTransitDistances] = useState({"Walking":0, "Bus":0,"Train":0,"Subway":0,"Tram":0,"Car":0, "Cycling": 0});
  const [totalPercentage, setTotalPercentage] = useState(0);
  const { teams } = useUserTeamsData(userData?.id);
  const [teamFieldsOpen, setTeamFieldsOpen] = useState(true);

  const handleToggleTeamFields = () => {
    setTeamFieldsOpen(!teamFieldsOpen);
  };

  const originRef = useRef();
  const destiantionRef = useRef();

  useAuth(["Employee"]);


  const calculateCarbonFootprint = useCallback(() => {   
    let totalCarbonFootprint = 0;
    totalCarbonFootprint += transitDistances["Walking"] * CO2_EMISSIONS_PER_METER.Walking;
    totalCarbonFootprint += transitDistances["Bus"] * CO2_EMISSIONS_PER_METER.Bus;
    totalCarbonFootprint += transitDistances["Train"] * CO2_EMISSIONS_PER_METER.Train;
    totalCarbonFootprint += transitDistances["Subway"] * CO2_EMISSIONS_PER_METER.Subway;
    totalCarbonFootprint += transitDistances["Tram"] * CO2_EMISSIONS_PER_METER.Tram;
    totalCarbonFootprint += transitDistances["Car"] * CO2_EMISSIONS_PER_METER.Car;

    
    return totalCarbonFootprint.toFixed(2);
  }, [transitDistances]);

  

  useEffect(() => {
    if (duration !== '') {
      // Convert distance from meters to kilometers with two decimal places

      const distanceInKm = (distance / 1000).toFixed(2) + ' km';
      console.log(distance)
      console.log(distanceInKm)
  
      // Update the state to display distance in 'X.XX km' format
      setFormattedDistance(distanceInKm);

      const carbonFootprint = calculateCarbonFootprint();
      setCarbonFootprint(carbonFootprint);
    }
  }, [distance, duration]);
  

  if (!isLoaded) {
    console.log(map)
    return <Typography />;
  }

  // Calculates the distance and duration
  async function calculateRoute() {
    if (originRef.current.value === '' || destiantionRef.current.value === '' || travelMode === null || day === '') {
      toast.error("Enter all fields.");
      return;
    }

    if (window.google && window.google.maps) {
      const directionsService = new window.google.maps.DirectionsService();

      // To calculate the date and time for the next Monday at 8 AM (just for testing)
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysUntilMonday = currentDay === 1 ? 7 : (8 - currentDay);

      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(8, 0, 0, 0);

      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destiantionRef.current.value,
        travelMode: travelMode,
        drivingOptions: {
          departureTime: nextMonday,
          trafficModel: 'bestguess',
        },
      });

      setDirectionsResponse(results);
      //setDistance(distance + results.routes[0].legs[0].distance.text);
      console.log(distance + results.routes[0].legs[0].distance.text)
      setDuration(results.routes[0].legs[0].duration.text);
      const routeDurationStr = results.routes[0].legs[0].duration.text;
      const routeDurationMinutes = durationToMinutes(routeDurationStr);
      setTotalDurationMinutes(prevMinutes => prevMinutes + routeDurationMinutes);

      let totalWalkingDistance = 0;
      let totalBusDistance = 0;
      let totalTrainDistance = 0;
      let totalSubwayDistance = 0;
      let totalTramDistance = 0;
      let totalCarDistance = 0;
      let totalCyclingDistance = 0;

      results.routes[0].legs.forEach((leg) => {
        leg.steps.forEach((step) => {
          const stepDistance = step.distance.value; // Distance in meters

          if (step.travel_mode === 'WALKING') {
            totalWalkingDistance += stepDistance;
          } else if (step.travel_mode === 'TRANSIT') {
            const vehicleType = step.transit.line.vehicle.type;
            switch (vehicleType) {
              case 'BUS':
                totalBusDistance += stepDistance;
                break;
              case 'HEAVY_RAIL': // represents Trains
                totalTrainDistance += stepDistance;
                break;
              case 'SUBWAY': // represents metro or underground tubes
                totalSubwayDistance += stepDistance;
                break;
              case 'TRAM':
                totalTramDistance += stepDistance;
                break;
              default:
                console.log(`Unhandled vehicle type: ${vehicleType}`);
            }
          } else if (step.travel_mode === 'DRIVING') {
            totalCarDistance += stepDistance;
          } else if (step.travel_mode === 'BICYCLING') {
            totalCyclingDistance += stepDistance; 
          }
        });
      });

      const totalDistances = {
        "Walking": transitDistances["Walking"] + totalWalkingDistance,
        "Bus": transitDistances["Bus"] + totalBusDistance,
        "Train": transitDistances["Train"] + totalTrainDistance,
        "Subway": transitDistances["Subway"] + totalSubwayDistance,
        "Tram": transitDistances["Tram"] + totalTramDistance,
        "Car": transitDistances["Car"] + totalCarDistance,
        "Cycling": transitDistances["Cycling"] + totalCyclingDistance,
      };

      const sumOfDistances = Object.values(totalDistances).reduce((acc, distance) => acc + distance, 0);

      // Update the total distance
      setDistance(sumOfDistances);

      console.log(sumOfDistances)
      
      // Used to calculate carbon footprint for each mode accumulated
      setTransitDistances(totalDistances)

      if (travelMode === 'DRIVING') {
        setLeafIconColour('#C00000');

      } else if (travelMode === 'TRANSIT') {
        setLeafIconColour('#eed202');

      } else {
        setLeafIconColour('#1ED760');
      }
    } else {
      console.error('Google Maps API has not loaded');
      toast.error("Google Maps API has not loaded")
    }
  }

  // Converts a duration string to total minutes
function durationToMinutes(durationStr) {
  const regex = /(\d+)\s*hours?|(\d+)\s*mins?/g;
  let totalMinutes = 0;
  let match;

  while ((match = regex.exec(durationStr))) {
    if (match[1]) totalMinutes += parseInt(match[1]) * 60; // hours to minutes
    if (match[2]) totalMinutes += parseInt(match[2]); // minutes
  }

  return totalMinutes;
}

// Formats total minutes back into a readable duration string
function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ` : ''}${mins > 0 ? `${mins} min${mins > 1 ? 's' : ''}` : ''}`.trim();
}


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

  function navigateBack() {
    navigate('/SetCarbonFootprint');
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance(0);
    setFormattedDistance('');
    setDuration('');
    setCarbonFootprint('');
    originRef.current.value = '';
    destiantionRef.current.value = '';
  }

  const handleTravelModeChange = (event, newMode) => {
    setTravelMode(newMode);
  };

  const handleSetDay = (event) => {
    setDay(event.target.value);
  };

  function handleDepartureTimeChange(event) {
    setDepartureTime(event.target.value);
  }

  function handleSubmit(event) {
    if (duration === "" || carbonFootprint === "" || day === "") {
      toast.error("Duration or Carbon Footprint must not be empty.");

      // ensure value percentage inputted for users with teams
    } else if (totalPercentage !== 100 && (teams.length > 0)) {
      toast.error("The total percentage given between teams needs to equal 100%");

    } else {

      const teamData = teams.map((team) => ({
        team_id: team.teamId,
        calculatedCarbonFootprint:
          ((parseFloat(teamPercentages[team.teamName]) / 100) *
            parseFloat(carbonFootprint)).toFixed(2),
      }));

      console.log(day, duration, carbonFootprint, teamData);

      fetch(`${baseURL}/postCarbonFootprint`, {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          day,
          duration: doubledDuration,
          carbonFootprint: parseFloat(carbonFootprint),
          teamData,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data, "SetCarbonFootprint");
          if (data.status === "ok") {
            toast.success(`Carbon Stats Saved for ${day}.`);
          } else {
            toast.error("Something went wrong");
          }
        });
    }
  }

  return (
    <>
      <div style={{ position: 'fixed', zIndex: 100, width: '100%' }}>
        <TopNavbar />
      </div>
      <Box
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100%',
          width: '100%',
        }}
      >

        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 2,
          borderRadius: '10px',
          mx: 2,
          my: 9,
          backgroundColor: sideBarColour,
          boxShadow: 'base',
          width: 270,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <Card>
          <CardContent>
            <Box flexGrow={1} p={1}>
              <Autocomplete>
                <TextField
                  label='Home Location'
                  inputRef={originRef}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Autocomplete>
            </Box>
            <Box flexGrow={1} p={1}>
              <Autocomplete>
                <TextField
                  label='Office Location'
                  inputRef={destiantionRef}
                  size="small"
                  style={{ width: '100%' }}
                />
              </Autocomplete>
            </Box>
            <Box flexGrow={1} >
              <Stack direction="row" spacing={2} p={2} justifyContent="center">

                <FormControl size="small" sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="demo-simple-select-helper-label">Day</InputLabel>
                  <Select
                    labelId="demo-simple-select-helper-label"
                    id="demo-simple-select-helper"
                    value={day}
                    label="Day"
                    onChange={handleSetDay}
                  >
                    <MenuItem value={"Monday"}>Mon</MenuItem>
                    <MenuItem value={"Tuesday"}>Tue</MenuItem>
                    <MenuItem value={"Wednesday"}>Wed</MenuItem>
                    <MenuItem value={"Thursday"}>Thu</MenuItem>
                    <MenuItem value={"Friday"}>Fri</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label='Time'
                  value={departureTime}
                  size="small"
                  style={{ width: '100%' }}
                  onChange={handleDepartureTimeChange}
                />
              </Stack>
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Typography style={{ fontSize: '15px' }} variant="subtitle1">Select Travel Mode:</Typography>
              <ToggleButtonGroup
                value={travelMode}
                exclusive
                onChange={handleTravelModeChange}
                aria-label="travel mode"
              >
                <ToggleButton value="DRIVING" aria-label="driving">
                  <DriveIcon
                    color={
                      travelMode === 'DRIVING' ? 'primary' : 'action'
                    }
                  />
                </ToggleButton>
                <ToggleButton value="WALKING" aria-label="walking">
                  <WalkIcon
                    color={
                      travelMode === 'WALKING' ? 'primary' : 'action'
                    }
                  />
                </ToggleButton>
                <ToggleButton value="BICYCLING" aria-label="bicycling">
                  <BicycleIcon
                    color={
                      travelMode === 'BICYCLING' ? 'primary' : 'action'
                    }
                  />
                </ToggleButton>
                <ToggleButton value="TRANSIT" aria-label="transit">
                  <TransitIcon
                    color={
                      travelMode === 'TRANSIT' ? 'primary' : 'action'
                    }
                  />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} p={2} justifyContent="center">
          <Button
            type='submit'
            onClick={calculateRoute}
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
            Calculate Route
          </Button>
          <Button
            aria-label='center back'
            onClick={clearRoute}
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

            Reset
          </Button>
        </Stack>

        <Card>
          <CardContent>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs={9}>
                <Typography style={{ fontSize: '13px' }}>Distance: {formattedDistance}</Typography>
                <Typography style={{ fontSize: '13px' }}>Duration: {formatDuration(totalDurationMinutes)}</Typography>
                <Box py={1}>
                  <Divider />
                </Box>
                <Typography style={{ fontSize: '15px' }}>Carbon Footprint:</Typography>
                <Typography style={{ fontSize: '15px', fontWeight: 'bold' }}>{carbonFootprint} kg CO2e</Typography>
              </Grid>
              <Grid item xs={3} container justifyContent="flex-end">
                <EnergySavingsLeafIcon sx={{ color: leafIconColour, fontSize: 30 }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} p={2} justifyContent="center">
          <Button
            type='submit'
            onClick={handleSubmit}
            sx={{
              px: 6,
              color: "white",
              font: "Arial",
              backgroundColor: "#3182CE",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "#2C5282",
              },
            }}>
            Submit
          </Button>
          <Button
            aria-label='center back'
            onClick={navigateBack}
            sx={{

              color: "white",
              font: "Arial",
              backgroundColor: "grey",
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "#36454F",
              },
            }}>
            Back
          </Button>
        </Stack>
      </Box>

      {Array.isArray(teams) && teams.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 2,
            borderRadius: '10px',
            mx: 2,
            my: 9,
            backgroundColor: sideBarColour,
            boxShadow: 'base',
            width: 270,
            position: 'absolute',
            top: 0,
            right: 0,

          }}
        >
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography sx={{ fontSize: '10.7px' }}>
                  For the day you selected, enter the percent of time you spend between your teams in the office.
                </Typography>
                <IconButton onClick={handleToggleTeamFields}>
                  {teamFieldsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={teamFieldsOpen}>
                <TeamFields
                  teams={teams}
                  teamPercentages={teamPercentages}
                  handleTeamPercentageChange={handleTeamPercentageChange}
                  carbonFootprint={carbonFootprint}
                />
              </Collapse>
            </CardContent>
          </Card>
        </Box>
      )}

    </>
  );
}

export default FootprintMapPage;
