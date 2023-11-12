import React, { useState, useEffect, useRef  } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import SideNavbar from '../components/SideNavbar';
import { baseURL } from "../utils/constant";
import { toast } from "react-toastify";

const TransportModeDetection = () => {
  const [transportMode, setTransportMode] = useState('');
  const [transportModes, setTransportModes] = useState([]);
  const [accelerationX, setAccelerationX] = useState();
  const [accelerometerMin, setAccelerometerMin] = useState(null);
  const [sensorData, setSensorData] = useState({
    accelerometerData: [],
    gyroscopeData: [],
  });

  const [deviceType, setDeviceType] = useState('Unknown Device');

  const sensorDataRef = useRef({
    accelerometerData: [],
    gyroscopeData: [],
  });

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
    // Filter out non-numeric and infinite values before calculations
    const validData = data.filter(val => typeof val === 'number' && isFinite(val));

    if (validData.length === 0) {
      return { mean: null, min: null, max: null, std: null };
    }

    const sum = validData.reduce((a, b) => a + b, 0);
    const mean = sum / validData.length;
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    const variance = validData.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / validData.length;
    const std = Math.sqrt(variance);

    return {
      mean: parseFloat(mean.toFixed(5)),
      min: parseFloat(min.toFixed(5)),
      max: parseFloat(max.toFixed(5)),
      std: parseFloat(std.toFixed(5)),
    };
  };

  useEffect(() => {
    const handleMotion = (event) => {
      const { accelerationIncludingGravity } = event;
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

      const magnitude = Math.sqrt(
        accelerationIncludingGravity.x ** 2 +
        accelerationIncludingGravity.y ** 2 +
        accelerationIncludingGravity.z ** 2
      );
      setAccelerometerMin(prevMin => prevMin !== null ? Math.min(prevMin, magnitude) : magnitude);
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
      const { accelerometerData, gyroscopeData } = sensorDataRef.current;
      console.log(sensorData.accelerometerData.length)
      console.log(sensorData.gyroscopeData.length)
      // Only proceed if we have enough data
      if (accelerometerData.length > 0 && gyroscopeData.length > 0) {
        // Calculate stats for accelerometer and gyroscope
        const accelerometerStats = calculateStats(accelerometerData);
        const gyroscopeStats = calculateStats(gyroscopeData);

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

        console.log(newData)

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
            if (data.status === "ok") {
              console.log(data.mode)
              setTransportMode(data.mode);
              setTransportModes(modes => [...modes, data.mode]);
              toast.success("Fetched transport mode: " + data.mode);
            } else {
              toast.error("In API but failed to fetch user carbon data for teams.");
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            toast.error("Error fetching transport mode.");
          });

        // Resets the sensor data arrays
        sensorDataRef.current = {
          accelerometerData: [],
          gyroscopeData: [],
        };
      }
    }, 7000);

    // Clears the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  // To update the ref whenever sensorData state changes
  useEffect(() => {
    sensorDataRef.current = sensorData;
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
          Accelerometer Data min: {accelerometerMin !== null ? accelerometerMin.toFixed(2) : 'Calculating...'}
        </Typography>
        <Typography variant="h6">
          Accelerometer Data length: {sensorData.accelerometerData.length}
          Gyroscope Data length: {sensorData.gyroscopeData.length}
        </Typography>
        <Typography variant="h6">
          Acceleration X: {accelerationX ? accelerationX.toFixed(2) : 'N/A'}
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
