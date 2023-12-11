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
  const [noGravityAccelerationData, setNoGravityAccelerationData] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);

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

  // Function to calculate stats
  const calculateStats = (data) => {

    // Ensure that data is an array of numbers 
    const numericData = data.map(d => parseFloat(d)).filter(isFinite);

    console.log("numeric DATA to calculate:", numericData)

    // Apply the moving average filter to the numeric data
    //const filteredData = movingAverage(numericData, 5);

    // If there's no valid data, return null stats
    if (numericData.length === 0) {
      console.log("in here where data len is 0")
      return { mean: null, min: null, max: null, std: null };
    }

    const sum = numericData.reduce((a, b) => a + b, 0);
    console.log("sum", sum, "data len", numericData.length)
    const mean = sum / numericData.length;
    const min = Math.min(...numericData);
    const max = Math.max(...numericData);

    // Calculate standard deviation
    const variance = numericData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numericData.length;
    const std = Math.sqrt(variance);

    console.log(mean, min, max, std)

    return {
      mean: parseFloat(mean.toFixed(5)),
      min: parseFloat(min.toFixed(5)),
      max: parseFloat(max.toFixed(5)),
      std: parseFloat(std.toFixed(5)),
    };
  };

  
  const calculateMean = (numbers) => {
    if (!numbers.length) return 0;
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    return sum / numbers.length;
  };
  

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (noGravityAccelerationData.length > 0) {
        console.log("5 sec passed, refreshing speed")
        const meanAcceleration = calculateMean(noGravityAccelerationData);
        setCurrentSpeed(meanAcceleration * 3.6); // Convert m/s to km/h
        setNoGravityAccelerationData([]); // Reset the data array
      }
    }, 5000); // 5 seconds
  
    return () => clearInterval(intervalId);
  }, []);
  


  useEffect(() => {
    const handleMotion = (event) => {
      const { accelerationIncludingGravity, acceleration } = event;

      const accelerationMagnitude = Math.sqrt(
        Math.pow(accelerationIncludingGravity.x || 0, 2) +
        Math.pow(accelerationIncludingGravity.y || 0, 2) +
        Math.pow(accelerationIncludingGravity.z || 0, 2)
      ).toFixed(5);

      const noGravityAccelerationMagnitude = Math.sqrt(
        Math.pow(acceleration.x || 0, 2) +
        Math.pow(acceleration.y || 0, 2) +
        Math.pow(acceleration.z || 0, 2)
      ).toFixed(5);

      console.log("noGravityAccelerationMagnitude: ", noGravityAccelerationMagnitude)

      setNoGravityAccelerationData(currentData => [...currentData, noGravityAccelerationMagnitude]);

      setAccelData({
        x: Number(accelerationIncludingGravity.x).toFixed(5),
        y: Number(accelerationIncludingGravity.y).toFixed(5),
        z: Number(accelerationIncludingGravity.z).toFixed(5),
      });

      const rotationRate = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
      //console.log("rotation rate: ", rotationRate)

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
        const updatedAccelData = [...prevData.accelerometerData, accelerationMagnitude];
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
      if (accelerometerData.length > 5 && gyroscopeData.length > 5) {
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
          <h3>Current Mean Speed (Last 5 Seconds)</h3>
          <p>{currentSpeed.toFixed(2)} km/h</p> 
        </div>
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
          No Gravity Accelerometer Data: {noGravityAccelerationData.slice(-5).join(', ')}
        </Typography>
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