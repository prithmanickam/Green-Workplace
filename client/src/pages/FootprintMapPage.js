import React, { useState, useRef } from 'react';
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
import Select from '@mui/material/Select';
import { toast } from "react-toastify";

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

  const { mode } = React.useContext(ThemeContext);
  let sideBarColour = 'rgba(0, 0, 0, 0.8)';

  if (mode === "light") {
    sideBarColour = 'rgba(255, 255, 255, 0.6)';
  }

  const [day, setDay] = React.useState('');
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [carbonFootprint, setCarbonFootprint] = useState('');


  const originRef = useRef();
  const destiantionRef = useRef();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (distance !== '') {
      const carbonFootprint = calculateCarbonFootprint(parseFloat(distance));
      setCarbonFootprint(carbonFootprint);
    }
  }, [distance]);

  if (!isLoaded) {
    console.log(map)
    return <Typography />;
  }

  // Calculates the distance and duration
  async function calculateRoute() {
    if (originRef.current.value === '' || destiantionRef.current.value === '') {
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
    } else {
      console.error('Google Maps API has not loaded');
      toast.error("Google Maps API has not loaded")
    }
  }

  // To Calculate Carbon Footprint (Currently calculate with respect to driving)
  function calculateCarbonFootprint(distance) {
    // Using my assumption that an average fuel efficiency of 10 km/l and carbon emissions of 2.3 kg/liter
    const fuelEfficiency = 10; // in km/l
    const carbonEmissionsPerLiter = 2.3; // in kg/l
    const fuelConsumed = distance / fuelEfficiency; // in liters
    const carbonFootprint = fuelConsumed * carbonEmissionsPerLiter; // kg CO2
    return carbonFootprint.toFixed(2);
  }

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
                <Typography style={{ fontSize: '15px' }}>Time: {duration}</Typography>
                <Box py={1}>
                  <Divider />
                </Box>
                <Typography style={{ fontSize: '15px' }}>Carbon Footprint:</Typography>
                <Typography style={{ fontSize: '15px', fontWeight: 'bold' }}>{carbonFootprint} kg CO2</Typography>
              </Grid>
              <Grid item xs={3} container justifyContent="flex-end">
                <EnergySavingsLeafIcon sx={{ color: '#eed202', fontSize: 30 }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} p={2} justifyContent="center">
          <Button
            type='submit'
            //onClick={calculateRoute}
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
    </>

  );
}

export default FootprintMapPage;
