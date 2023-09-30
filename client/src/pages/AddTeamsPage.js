import React from "react";
import SideNavbar from '../components/SideNavbar';
import Box from '@mui/material/Box';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function AddTeams() {
  const { userData } = useUser();

  if (userData && userData.type !== 'Admin') {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Add Teams</h1>
        </div>
      </Box>
    </Box>
  );
}