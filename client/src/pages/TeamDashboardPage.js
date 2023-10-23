import React from 'react';
import SideNavbar from '../components/SideNavbar';
import { Box } from '@mui/material';
import { Navigate } from "react-router-dom";
//import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
//import { baseURL } from "../utils/constant";

export default function YourDashboard() {
  const { userData } = useUser();

  if (!userData || (userData.type !== 'Employee')) {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5, display: 'flex', flexDirection: 'column' }}>
        <h1>Team Dashboard</h1>
      </Box>
    </Box>
  );
}
