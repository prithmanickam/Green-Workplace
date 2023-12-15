import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import SideNavbar from '../components/SideNavbar';

const TransportModeDetection = () => {

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

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <Typography variant="h4" gutterBottom>
          Transport Mode Detection
        </Typography>
        <Typography variant="h6">
          Download the phone app to use this feature. [insert picture]
        </Typography>
        <Typography variant="h6">
          Accessing from: {deviceType}
        </Typography>
      </Box>
    </Box>
  );
};

export default TransportModeDetection;