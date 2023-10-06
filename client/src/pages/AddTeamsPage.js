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
import { toast } from "react-toastify";
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Autocomplete from '@mui/material/Autocomplete';

export default function AddTeams() {
  const [emailInput, setEmailInput] = useState('');

  //to select pick team owners
  const [nonTeamOwners, setNonTeamOwners] = useState([]);

  //to select pick team members
  //const [registeredAccounts, setRegisteredAccounts] = useState([]);

  const [selectedTeamOwner, setSelectedTeamOwner] = useState(null);

  const { userData } = useUser();

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // to get all teams
    fetch("http://localhost:5000/api/getTeams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          const allTeams = data.teams.map((team) => ({
            email: team.teamOwner.email,
            teamName: team.teamName,
            office: team.office,
          }));
          setTeams(allTeams);
        } else {
          toast.error("Failed to fetch teams data. Please try again.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching teams data.");
      });


    //for selecting team owners
    fetch("http://localhost:5000/api/getAllNonTeamOwners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          // Extract user emails
          const allEmails = data.users.map((user) => user.email);
          setNonTeamOwners(allEmails);
        } else {
          toast.error("Failed to fetch user data. Please try again.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching user data.");
      });
  }, []);

  console.log(teams)

  //console.log(registeredAccounts)

  //console.log(nonTeamOwners)

  // to register an account / check if details meet validations
  const handleAddTeam = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const teamOwner = selectedTeamOwner; // Use the selected team owner
    const teamName = data.get("teamName");
    const divisions = data.get("divisions");
    const office = data.get("office");
    const company = "Company1";
    const teamMembers = data.get("teamMembers");
    console.log(teamOwner, teamName, divisions, office)


    if (teamOwner === null || teamName === "" || divisions === "" || office === "") {
      toast.error("You must fill all required fields.");
    } else {
      fetch("http://localhost:5000/api/addTeam", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          teamOwner,
          teamName,
          divisions,
          office,
          company,
          teamMembers,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            toast.success("Team has been added");
          } else {
            toast.error("Something went wrong");
          }
        });
    }
  };

  if (!userData || (userData.type !== 'Admin')) {
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
          <h1>Add Teams</h1>
          <Grid container spacing={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} >
            <Grid item xs={12}>
              <Box
                component="form"
                noValidate
                onSubmit={handleAddTeam}
                sx={{ mt: 3 }}
              >
                <Card>
                  <CardContent>
                    <Grid container spacing={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Grid item xs={4}>
                        <Autocomplete
                          required
                          id="teamOwner"
                          label="Team Owner"
                          options={nonTeamOwners}
                          value={selectedTeamOwner}
                          onChange={(event, newValue) => {
                            setSelectedTeamOwner(newValue);
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Team Owner" variant="outlined" />
                          )}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          required
                          name="teamName"
                          label="Team Name"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          required
                          name="divisions"
                          label="Divisions"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          required
                          name="office"
                          label="Office"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          name="company"
                          label="Company"
                          variant="outlined"
                          fullWidth
                          value="Company1"
                          disabled
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          id="teamMembers"
                          label="Add Team Members (Optional)"
                          variant="outlined"
                          fullWidth
                          value={emailInput}
                          onChange={handleEmailInputChange}
                        />

                      </Grid>
                    </Grid>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      sx={{ marginTop: '16px' }}
                    >
                      Add Team
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <h2>Teams Created</h2>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Team Owner Email</TableCell>
                          <TableCell>Team Name</TableCell>
                          <TableCell>Office</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teams.map((team, index) => (
                          <TableRow key={index}>
                            <TableCell>{team.email}</TableCell>
                            <TableCell>{team.teamName}</TableCell>
                            <TableCell>{team.office}</TableCell>
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
