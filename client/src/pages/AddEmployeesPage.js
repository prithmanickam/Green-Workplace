import React, { useState, useEffect } from "react";
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
import TablePagination from '@mui/material/TablePagination';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import { Select, MenuItem, FormControl, InputLabel, Stack, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import useAuth from '../hooks/useAuth';

export default function AddEmployees() {
  const [emailInput, setEmailInput] = useState('');
  const [registeredAccounts, setRegisteredAccounts] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState('');
  const [offices, setOffices] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [showUndo, setShowUndo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);
  const [sendDelay, setSendDelay] = useState(null);
  const { userData } = useUser();

  useAuth(["Admin"]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {

    if (userData) {
      // to get all offices in the company
      fetch(`${baseURL}/getOffices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: userData.company_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            console.log("offices: ", data.data)
            setOffices(data.data);
          } else {
            toast.error("Failed to fetch office data. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching office data.");
        });
    }
  }, [userData]);

  const handleOfficeChange = (event) => {
    setSelectedOffice(event.target.value);
  };

  useEffect(() => {
    if (userData) {
      fetch(`${baseURL}/getAllUsers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: userData.company_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            // Extract user data (emails, first names, last names, and user types)
            const allUsers = data.users.map((user) => ({
              email: user.email,
              firstname: user.firstname,
              lastname: user.lastname,
              office: user.Office.name,
            }));
            setRegisteredAccounts(allUsers);
          } else {
            toast.error("Failed to fetch user data. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching user data.");
        });
    }
  }, [userData]);

  const handleEmailInputChange = (event) => {
    setEmailInput(event.target.value);
  };

  // Send registration emails to emails that were entered in the input box
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress > 0 ? prevProgress - 0.5 : 0));
    }, 23);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleAddEmails = () => {
    if (!emailInput.trim()) {
      toast.error("Please enter at least one email address.");
      return;
    }

    const emails = emailInput.split(',').map(email => email.trim());

    setShowUndo(true);
    setProgress(100);
    setTimeLeft(5); // 5 seconds countdown

    const delay = setTimeout(() => {
      setShowUndo(false);
      sendEmails(emails);
    }, 5000);

    const countdown = setInterval(() => {
      setTimeLeft((t) => t > 0 ? t - 1 : 0);
    }, 1000);

    setTimeout(() => clearInterval(countdown), 5000);

    setSendDelay(delay);
  };

  const sendEmails = (emails) => {
    fetch(`${baseURL}/sendRegistrationEmails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emails, company: userData.company_id, office: selectedOffice }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") {
          toast.success("Registration emails sent successfully!");
        } else {
          toast.error("Failed to send registration emails. Please try again.");
        }
      })
      .catch(error => {
        toast.error("An error occurred while sending registration emails.");
      });
    setEmailInput('');
  };

  const handleUndo = () => {
    clearTimeout(sendDelay);
    setShowUndo(false);
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
                  <Stack spacing={2}>
                    <TextField
                      label="Email Addresses (comma-separated)"
                      variant="outlined"
                      fullWidth
                      value={emailInput}
                      onChange={handleEmailInputChange}
                    />
                    <FormControl fullWidth>
                      <InputLabel id="office-select-label">Select Office</InputLabel>
                      <Select
                        labelId="office-select-label"
                        id="office-select"
                        value={selectedOffice}
                        label="Select Office"
                        onChange={handleOfficeChange}
                      >
                        {offices.map((office) => (
                          <MenuItem key={office.id} value={office.id}>{office.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddEmails}
                      sx={{ marginTop: '16px' }}
                    >
                      Send
                    </Button>

                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    {showUndo && (
                      <>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={handleUndo}
                          sx={{ marginTop: '16px', marginBottom:'16px'  }}
                        >
                          Undo
                        </Button>
                        <LinearProgress variant="determinate" value={progress} />
                        <Typography>
                          Sending in {timeLeft} seconds...
                        </Typography>
                      </>
                    )}
                  </Grid>
                  </Grid>
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
                          <TableCell>First Name</TableCell>
                          <TableCell>Last Name</TableCell>
                          <TableCell>Office</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registeredAccounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, index) => (
                          <TableRow key={index}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.firstname}</TableCell>
                            <TableCell>{user.lastname}</TableCell>
                            <TableCell>{user.office}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={registeredAccounts.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[8, 15, 25]}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Box>
    </Box>
  );
}