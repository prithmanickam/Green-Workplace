import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import SideNavbar from '../components/SideNavbar';
import { baseURL } from "../utils/constant";
import { toast } from "react-toastify";

const TransportModeDetection = () => {
  const [transportMode, setTransportMode] = useState('');
  const [transportModes, setTransportModes] = useState([]);
  const [gyroData, setGyroData] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });

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
    //onst filteredData = movingAverage(numericData, 5);

    // If there's no valid data, return null stats
    if (numericData.length === 0) {
      return { mean: null, min: null, max: null, std: null };
    }

    const sum = numericData.reduce((a, b) => a + b, 0);
    const mean = sum / numericData.length;
    const min = Math.min(...numericData);
    const max = Math.max(...numericData);

    // Calculate standard deviation
    const variance = numericData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numericData.length;
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
      const accelerationIncludingGravity = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };

      console.log("Accel : ", accelerationIncludingGravity)

      const acceleration = {
        x: accelerationIncludingGravity.x || 0,
        y: accelerationIncludingGravity.y || 0,
        z: (accelerationIncludingGravity.z || 0) - 9.81
      };

      const accelerationMagnitude = Math.sqrt(
        acceleration.x ** 2 +
        acceleration.y ** 2 +
        acceleration.z ** 2
      ).toFixed(5);

      setAccelData({
        x: Number(acceleration.x).toFixed(5),
        y: Number(acceleration.y).toFixed(5),
        z: Number(acceleration.z).toFixed(5),
      });

      const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
      console.log("rotation rate: ", rotationRate)

      const alpha = rotationRate.alpha ? Number(((rotationRate.alpha * Math.PI) / 180).toFixed(5)) : 0;
      const beta = rotationRate.beta ? Number(((rotationRate.beta * Math.PI) / 180).toFixed(5)) : 0;
      const gamma = rotationRate.gamma ? Number(((rotationRate.gamma * Math.PI) / 180).toFixed(5)) : 0;

      setGyroData({
        alpha: alpha.toFixed(5),
        beta: beta.toFixed(5),
        gamma: gamma.toFixed(5),
      });

      const gyroscopeMagnitude = Math.sqrt(
        alpha ** 2 +
        beta ** 2 +
        gamma ** 2
      ).toFixed(5);

      setSensorData(prevData => {
        const updatedAccelData = [...prevData.accelerometerData, accelerationMagnitude].filter(isFinite);
        const updatedGyroData = [...prevData.gyroscopeData, gyroscopeMagnitude];

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
        <div>
          <h3>Accelerometer Data</h3>
          <p>X: {accelData.x} m/s²</p>
          <p>Y: {accelData.y} m/s²</p>
          <p>Z: {accelData.z} m/s²</p>
        </div>
        <div>
          <h3>Gyroscope Data (rad/s)</h3>
          <p>Alpha: {gyroData.alpha} rad/s</p>
          <p>Beta: {gyroData.beta} rad/s</p>
          <p>Gamma: {gyroData.gamma} rad/s</p>
        </div>
        <Typography variant="h6">
          Accelerometer Data: {sensorData.accelerometerData.slice(-5).join(', ')}
        </Typography>
        <Typography variant="h6">
          Accelerometer Data length: {sensorData.accelerometerData.length}
          Gyroscope Data length: {sensorData.gyroscopeData.length}
        </Typography>
        <Typography variant="h6">
          Gyroscope Data: {sensorData.gyroscopeData.slice(-5).join(', ')}
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
