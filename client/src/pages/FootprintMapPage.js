import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import { Card, CardContent, Typography, Box, TextField, Button, Stack, ToggleButton, ToggleButtonGroup, Grid, Divider } from '@mui/material';
import DriveIcon from '@mui/icons-material/DriveEta';
import WalkIcon from '@mui/icons-material/DirectionsWalk';
import BicycleIcon from '@mui/icons-material/DirectionsBike';
import TransitIcon from '@mui/icons-material/DirectionsTransit';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import { ThemeContext } from '../context/ThemeContext';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';

// Uni of Glasgow Coords (maps position on load)
const center = { lat: 55.8721, lng: -4.2897 };

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

  if (!userData || (userData.type !== 'Employee')) {
    console.log("nav backk")
    navigate('/SetCarbonFootprint');
  }
  const email = userData.email;

  // use states constants
  const [day, setDay] = React.useState('');
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [travelMode, setTravelMode] = useState('TRANSIT');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [leafIconColour, setLeafIconColour] = useState('#eed202');
  const [teams, setTeams] = useState([]);
  const [teamPercentages, setTeamPercentages] = useState({});
  const [totalPercentage, setTotalPercentage] = useState(0);

  const originRef = useRef();
  const destiantionRef = useRef();

  useEffect(() => {
    if (distance !== '') {
      const carbonFootprint = calculateCarbonFootprint(parseFloat(distance), travelMode);
      setCarbonFootprint(carbonFootprint);
    }
  }, [distance, travelMode]);

  useEffect(() => {
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
  }, [userData]);

  if (!isLoaded) {
    console.log(map)
    return <Typography />;
  }
  console.log("teams")
  console.log(teams)

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
      setDistance(results.routes[0].legs[0].distance.text);
      setDuration(results.routes[0].legs[0].duration.text);

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

  function calculateCarbonFootprint(distance, travelMode) {

    if (travelMode === 'DRIVING') {
      console.log("drive")
      // My assumptions for driving
      const fuelEfficiency = 10; // in km/l
      const carbonEmissionsPerLiter = 2.3; // in kg/liter
      const fuelConsumed = distance / fuelEfficiency; // in liters
      const carbonFootprint = fuelConsumed * carbonEmissionsPerLiter; // kg CO2
      return carbonFootprint.toFixed(2);

    } else if (travelMode === 'TRANSIT') {
      // Assumption that 100 grams of CO2 per passenger-kilometer (0.1 kg/km)
      const averageEmissionsPerKm = 0.1;
      const carbonFootprint = distance * averageEmissionsPerKm; // kg CO2
      return carbonFootprint.toFixed(2);

    } else {
      // For walking or cycling
      return 0;
    }
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

  const teamFields = Array.isArray(teams) ? teams.map((team) => (
    <Box key={team.teamName}>
      <hr />
      <Typography>{team.teamName}</Typography>
      <TextField
        //label="Percentage"
        size="small"
        style={{ width: '100%' }}
        value={teamPercentages[team.teamName] || ''}
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



  function navigateBack() {
    navigate('/SetCarbonFootprint');
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance('');
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

      //toast.success(`Carbon Stats Saved for ${day}.`);
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
          day,
          duration,
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
      <Box
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100%',
          width: '100%',
        }}
      >
        <TopNavbar />
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
          height: 564,
          //height: '100vh', 
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
                <Typography style={{ fontSize: '15px' }}>Distance: {distance}</Typography>
                <Typography style={{ fontSize: '15px' }}>Duration: {duration}</Typography>
                <Box py={1}>
                  <Divider />
                </Box>
                <Typography style={{ fontSize: '15px' }}>Carbon Footprint:</Typography>
                <Typography style={{ fontSize: '15px', fontWeight: 'bold' }}>{carbonFootprint} kg CO2</Typography>
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
              mt: 3, mb: 2, px: 6,
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
              mt: 3, mb: 2,
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
              <Typography sx={{ fontSize: '10.7px' }}>For the day you selected, enter the percent of time you spend between your teams in the office.</Typography>
              <Typography></Typography>
              <Box flexGrow={1}>
                {teamFields}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

    </>
  );
}

export default FootprintMapPage;
