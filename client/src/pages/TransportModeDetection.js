import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import SideNavbar from '../components/SideNavbar';
import { baseURL } from "../utils/constant";
import { toast } from "react-toastify";

const TransportModeDetection = () => {
  const [transportMode, setTransportMode] = useState('');
  const [transportModes, setTransportModes] = useState([]);


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
    // Ensure that data is an array of numbers 
    const numericData = data.filter(isFinite);

    // Apply the moving average filter to the numeric data
    const filteredData = movingAverage(numericData, 5);

    // If there's no valid data, return null stats
    if (filteredData.length === 0) {
      return { mean: null, min: null, max: null, std: null };
    }

    const sum = filteredData.reduce((a, b) => a + b, 0);
    const mean = sum / filteredData.length;
    const min = Math.min(...filteredData);
    const max = Math.max(...filteredData);

    // Calculate standard deviation
    const variance = filteredData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / filteredData.length;
    const std = Math.sqrt(variance);

    return {
      mean: parseFloat(mean.toFixed(5)),
      min: parseFloat(min.toFixed(5)),
      max: parseFloat(max.toFixed(5)),
      std: parseFloat(std.toFixed(5)),
    };
  };

  const movingAverage = (arr, windowSize) => {
    let result = [];

    for (let i = 0; i < arr.length; i++) {
      if (i < windowSize) {
        // Not enough data points yet
        result.push(arr[i]);
      } else {
        let sum = 0;
        for (let j = i; j > i - windowSize; j--) {
          sum += arr[j];
        }
        result.push(sum / windowSize);
      }
    }

    return result;
  };

  useEffect(() => {
    const handleMotion = (event) => {
      const { accelerationIncludingGravity } = event;
  
      const accelSum = (accelerationIncludingGravity.x + accelerationIncludingGravity.y + accelerationIncludingGravity.z);
  
      const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
      const { alpha, beta, gamma } = rotationRate;
      const gyroSum = (alpha + beta + gamma);
  
      setSensorData(prevData => {
        const updatedAccelData = [...prevData.accelerometerData, accelSum].filter(isFinite);
        const updatedGyroData = [...prevData.gyroscopeData, gyroSum];
  
        return {
          ...prevData,
          accelerometerData: updatedAccelData,
          gyroscopeData: updatedGyroData
        };
      });
    };
  
    window.addEventListener('devicemotion', handleMotion);
  
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
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
              // Resets the sensor data when mode fetched
              setSensorData({
                accelerometerData: [],
                gyroscopeData: [],
              });
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
          Accelerometer Data: {sensorData.accelerometerData.join(', ')}
        </Typography>
        <Typography variant="h6">
          Accelerometer Data length: {sensorData.accelerometerData.length}
          Gyroscope Data length: {sensorData.gyroscopeData.length}
        </Typography>
        <Typography variant="h6">
          Gyroscope Data: {sensorData.gyroscopeData.join(', ')}
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
