import React, { useState } from "react";
import SideNavbar from '../components/SideNavbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import { toast } from "react-toastify";

export default function CompanyAdminFunctions() {
  const { userData } = useUser();
  const [greenStandard, setGreenStandard] = useState('');
  const [amberStandard, setAmberStandard] = useState('');
  const [redStandard, setRedStandard] = useState('');

  const handleSaveStandards = () => {
    // Send the standards to the server
    fetch(`${baseURL}/editCompanyCarbonStandard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_id: userData.company_id,
        greenStandard,
        amberStandard,
        redStandard,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          // Handle a successful response, e.g., show a success message.
          toast.success('Standards saved successfully');
        } else {
          // Handle an error response, e.g., show an error message.
          toast.error('Failed to save standards');
        }
      })
      .catch((error) => {
        // Handle any network or request error.
        toast.error('An error occurred while saving standards', error);
      });
  };

  if (userData && userData.type !== 'Admin') {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Company Admin Functions</h1>

          {/* Input fields for standards */}
          <TextField
            label="Green Standard"
            variant="outlined"
            fullWidth
            value={greenStandard}
            onChange={(e) => setGreenStandard(e.target.value)}
            margin="normal"
          />

          <TextField
            label="Amber Standard"
            variant="outlined"
            fullWidth
            value={amberStandard}
            onChange={(e) => setAmberStandard(e.target.value)}
            margin="normal"
          />

          <TextField
            label="Red Standard"
            variant="outlined"
            fullWidth
            value={redStandard}
            onChange={(e) => setRedStandard(e.target.value)}
            margin="normal"
          />

          {/* Save button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveStandards}
          >
            Save
          </Button>
        </div>
      </Box>
    </Box>
  );
}
