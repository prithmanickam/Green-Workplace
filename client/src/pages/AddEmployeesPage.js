import React, { useState } from "react";
import SideNavbar from '../components/SideNavbar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { toast } from "react-toastify";
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function AddEmployees() {
  const [emailInput, setEmailInput] = useState('');
  const [registeredAccounts] = useState([]);
  const { userData } = useUser();

  if (userData && userData.type !== 'Admin') {
    return <Navigate to="/homepage" replace />;
  }

  const handleEmailInputChange = (event) => {
    setEmailInput(event.target.value);
  };

  // Send registration emails to emails that were entered in the input box
  const handleAddEmails = () => {
    const emails = emailInput.split(',').map((email) => email.trim());

    // Make a POST request to the backend API
    fetch("http://localhost:5000/api/sendRegistrationEmails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emails }), // Send the list of emails to the server
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          toast.success("Registration emails sent successfully!");
        } else {
          toast.error("Failed to send registration emails. Please try again.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while sending registration emails.");
      });

    setEmailInput('');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5 }}>
        <div>
          <h1>Add Employees</h1>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <TextField
                    label="Email Addresses (comma-separated)"
                    variant="outlined"
                    fullWidth
                    value={emailInput}
                    onChange={handleEmailInputChange}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddEmails}
                    sx={{ marginTop: '16px' }}
                  >
                    Send
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <h2>Registered Accounts</h2>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Email</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registeredAccounts.map((email, index) => (
                          <TableRow key={index}>
                            <TableCell>{email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Box>
    </Box>
  );
}
