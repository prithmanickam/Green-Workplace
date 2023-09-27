import React from "react";
import SideNavbar from '../components/SideNavbar';
import Box from '@mui/material/Box';

export default function CompanyAdminFunctions() {

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Company Admin Functions</h1>
        </div>
      </Box>
    </Box>
  );
}