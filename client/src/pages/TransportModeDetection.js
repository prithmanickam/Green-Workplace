import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import SideNavbar from '../components/SideNavbar';
import { baseURL } from "../utils/constant";
import { toast } from "react-toastify";

const TransportModeDetection = () => {
  const [transportMode, setTransportMode] = useState('');
  const [transportModes, setTransportModes] = useState([]);
  const [accelerationX, setAccelerationX] = useState();
  const [sensorData, setSensorData] = useState({
    accelerometerData: [],
    gyroscopeData: [],
  });

  const [deviceType, setDeviceType] = useState('Unknown Device');

  useEffect(() => {
    // Function to determine the device type
    const determineDeviceType = () => {
      const userAgent = navigator.userAgent;
      if (/Mobi|Android/i.test(userAgent)) {
        return 'Mobile Device';
      }
      return 'Desktop Browser';
    };

    setDeviceType(determineDeviceType());
  }, []);

  // (for web app testing purposes) Function to generate random sensor data
  const generateRandomSensorData = () => {
    const getRandomValue = (min, max) => Math.random() * (max - min) + min;

    return {
      'android.sensor.accelerometer#mean': getRandomValue(9, 10),
      'android.sensor.accelerometer#min': getRandomValue(6, 7),
      'android.sensor.accelerometer#max': getRandomValue(15, 16),
      'android.sensor.accelerometer#std': getRandomValue(2, 3),
      'android.sensor.gyroscope#mean': getRandomValue(1, 2),
      'android.sensor.gyroscope#min': getRandomValue(0, 1),
      'android.sensor.gyroscope#max': getRandomValue(3, 4),
      'android.sensor.gyroscope#std': getRandomValue(1, 2),
    };
  };

  // Function to calculate stats
  const calculateStats = (data) => {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const std = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / data.length);
    return { mean, min, max, std };
  };

  useEffect(() => {
    const handleMotion = (event) => {
      const { accelerationIncludingGravity } = event;
      console.log("x acceleration",accelerationIncludingGravity.x)
      setAccelerationX(accelerationIncludingGravity.x)
      setSensorData(prevData => ({
        ...prevData,
        accelerometerData: [
          ...prevData.accelerometerData,
          accelerationIncludingGravity.x,
          accelerationIncludingGravity.y,
          accelerationIncludingGravity.z,
        ].filter(Boolean), // Filtering out null/undefined values
      }));
    };

    const handleOrientation = (event) => {
      setSensorData(prevData => ({
        ...prevData,
        gyroscopeData: [
          ...prevData.gyroscopeData,
          event.alpha,
          event.beta,
          event.gamma,
        ].filter(Boolean), 
      }));
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    // Cleaning up the event listener when the component unmounts
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log(sensorData)
      // Only proceed if we have enough data
      if (sensorData.accelerometerData.length > 0 && sensorData.gyroscopeData.length > 0) {
        // Calculate stats for accelerometer and gyroscope
        const accelerometerStats = calculateStats(sensorData.accelerometerData);
        const gyroscopeStats = calculateStats(sensorData.gyroscopeData);

        const newData = {
          'android.sensor.accelerometer#mean': accelerometerStats.mean,
          'android.sensor.accelerometer#min': accelerometerStats.min,
          'android.sensor.accelerometer#max': accelerometerStats.max,
          'android.sensor.accelerometer#std': accelerometerStats.std,
          'android.sensor.gyroscope#mean': gyroscopeStats.mean,
          'android.sensor.gyroscope#min': gyroscopeStats.min,
          'android.sensor.gyroscope#max': gyroscopeStats.max,
          'android.sensor.gyroscope#std': gyroscopeStats.std,
        };

        // Send this sensor data to the backend
        fetch(`${baseURL}/getTransportMode`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newData),
        })
        .then((response) => response.json())
        .then((data) => {
          setTransportMode(data.mode);
          setTransportModes(modes => [...modes, data.mode]);
          toast.success("Fetched transport mode: " + data.mode);
        })
        .catch((error) => {
          console.error('Error:', error);
          toast.error("Error fetching transport mode.");
        });

        // Resets the sensor data arrays
        setSensorData({
          accelerometerData: [],
          gyroscopeData: [],
        });
      }
    }, 7000);

    // Clears the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [sensorData]);


  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />

      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <Typography variant="h4" gutterBottom>
          Transport Mode Detection
        </Typography>
        <Typography variant="h6">
          Accessing from: {deviceType}
        </Typography>
        <Typography variant="h6">
          Testing purposes:
        </Typography>
        <Typography variant="h6">
          Accelerometer Data: {sensorData.accelerometerData}
        </Typography>
        <Typography variant="h6">
          Accelerometer Data min: {sensorData.accelerometerData.min}
        </Typography>
        <Typography variant="h6">
          Acceleration X: {accelerationX}
        </Typography>
        <Typography variant="h6">
          Gyroscope Data: {sensorData.gyroscopeData}
        </Typography>
        {/* Display the latest transport mode */}
        {transportMode && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Latest Transport Mode
              </Typography>
              <Typography variant="h5">
                {transportMode}
              </Typography>
            </CardContent>
          </Card>
        )}
        {/* Display the history of transport modes */}
        <Box>
          {transportModes.map((mode, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Previous Transport Mode {index + 1}
                </Typography>
                <Typography variant="h6">
                  {mode}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TransportModeDetection;
