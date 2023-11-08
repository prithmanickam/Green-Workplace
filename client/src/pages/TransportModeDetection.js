import React, { useState, useEffect } from 'react';
import SideNavbar from '../components/SideNavbar';
import { Box } from '@mui/material';

export default function TransportModeDetection() {
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [rotationRate, setRotationRate] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [stepCount, setStepCount] = useState(0);
  const [isStepDetected, setIsStepDetected] = useState(false);

  const THRESHOLD = 1.5; 

  useEffect(() => {
    const handleMotion = (event) => {
      const { accelerationIncludingGravity } = event;
      setAcceleration({
        x: accelerationIncludingGravity.x,
        y: accelerationIncludingGravity.y,
        z: accelerationIncludingGravity.z,
      });
  
      // Calculate the magnitude of the acceleration
      const accelerationMagnitude = Math.sqrt(
        accelerationIncludingGravity.x * accelerationIncludingGravity.x +
        accelerationIncludingGravity.y * accelerationIncludingGravity.y +
        accelerationIncludingGravity.z * accelerationIncludingGravity.z
      );
  
      // Check if a step is detected based on the acceleration magnitude
      if (accelerationMagnitude > THRESHOLD) {
        // Ensure that multiple steps are not counted for a single event
        if (!isStepDetected) {
          setStepCount(stepCount + 1);
          setIsStepDetected(true);
        }
      } else {
        setIsStepDetected(false);
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    } else {
      console.log("DeviceMotionEvent is not supported");
    }

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      console.log("DeviceOrientationEvent is not supported");
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [stepCount, isStepDetected]);

  

  const handleOrientation = (event) => {
    setRotationRate({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Transport Mode Detector</h1>
          <h3>(Still under development - used for mobile devices)</h3>
        </div>
        <div>
          <h2>Accelerometer Data</h2>
          <p>X: {acceleration.x}</p>
          <p>Y: {acceleration.y}</p>
          <p>Z: {acceleration.z}</p>
        </div>
        <div>
          <h2>Gyroscope Data</h2>
          <p>Alpha: {rotationRate.alpha}</p>
          <p>Beta: {rotationRate.beta}</p>
          <p>Gamma: {rotationRate.gamma}</p>
        </div>
        <div>
          <h1>Step Count</h1>
          <p>Steps: {stepCount}</p>
        </div>
      </Box>
    </Box>
  );
}
