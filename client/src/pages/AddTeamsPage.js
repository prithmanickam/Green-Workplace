import React from "react";
import SideNavbar from '../components/SideNavbar';
import Box from '@mui/material/Box';

export default function AddTeams() {

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