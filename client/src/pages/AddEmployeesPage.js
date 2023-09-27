import React from "react";
import SideNavbar from '../components/SideNavbar';
import Box from '@mui/material/Box';

export default function AddEmployees() {

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Add Employees</h1>
        </div>
      </Box>
    </Box>
  );
}
