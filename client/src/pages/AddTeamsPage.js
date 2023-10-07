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
import DeleteIcon from '@mui/icons-material/Delete';

export default function AddTeams() {
  const [emailInput, setEmailInput] = useState('');

  //to select employees that can be team owners
  const [nonTeamOwners, setNonTeamOwners] = useState([]);

  //to select employees that can be team members
  const [registeredAccounts, setRegisteredAccounts] = useState([]);

  const [selectedTeamOwner, setSelectedTeamOwner] = useState(null);

  const { userData } = useUser();

  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    // to get all teams
    fetch("http://localhost:5000/api/getTeams", {
      method: "GET",
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
            noOfMembers: team.teamMembers.length,
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

    // Get all users (not admins) - for selecting team members
    fetch("http://localhost:5000/api/getAllUsers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          const allEmails = data.users.map((user) => user.email);
          setRegisteredAccounts(allEmails);
        } else {
          toast.error("Failed to fetch user data. Please try again.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching user data.");
      });
  }, []);

  // to register an account / check if details meet validations
  const handleAddTeam = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const teamOwner = selectedTeamOwner; // Use the selected team owner
    const teamName = data.get("teamName");
    const divisions = data.get("divisions");
    const office = data.get("office");
    const company = "Company1";
    const teamMembers = selectedTeamMembers;

    if (teamOwner === null || teamName === "" || divisions === "" || office === "") {
      toast.error("You must fill all required fields.");
    } else {
      fetch("http://localhost:5000/api/addTeam", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
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
            setTeams((prevTeams) => [
              ...prevTeams,
              {
                email: teamOwner,
                teamName,
                noOfMembers: teamMembers.length + 1,
                office,
              },
            ]);
            setNonTeamOwners((prevNonTeamOwners) =>
              prevNonTeamOwners.filter((email) => email !== teamOwner)
            );
            setSelectedTeamOwner(null)
          } else {
            toast.error("Something went wrong");
          }
        });
    }
  };

  const handleDeleteTeam = (email) => {
    fetch("http://localhost:5000/api/deleteTeam", {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",

      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          toast.success("Team has been deleted and team members relations of it are removed.");
          setTeams((prevTeams) => prevTeams.filter((team) => team.email !== email));
          setNonTeamOwners((prevNonTeamOwners) => [...prevNonTeamOwners, email]);
        } else {
          toast.error("Something went wrong");
        }
      });
  };

  if (!userData || (userData.type !== 'Admin')) {
    return <Navigate to="/homepage" replace />;
  }

  // Handle adding a team member to the selectedTeamMembers array
  const handleAddTeamMember = (event, newValue) => {
    if (newValue) {
      setSelectedTeamMembers([...selectedTeamMembers, newValue]);
      setEmailInput(''); // Clear the email input
    }
  };

  // Handle removing a team member from the selectedTeamMembers array
  const handleRemoveTeamMember = (index) => {
    const updatedTeamMembers = [...selectedTeamMembers];
    updatedTeamMembers.splice(index, 1);
    setSelectedTeamMembers(updatedTeamMembers);
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
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          name="company"
                          label="Company"
                          variant="outlined"
                          fullWidth
                          value="Company1"
                          disabled
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          required
                          name="office"
                          label="Office"
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <TextField
                          required
                          name="divisions"
                          label="Divisions (in order from company, separated by commas)"
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Autocomplete
                          id="teamMembers"
                          label="Add Team Members (Optional)"
                          options={registeredAccounts}
                          value={emailInput}
                          onChange={handleAddTeamMember}
                          renderInput={(params) => (
                            <TextField {...params} label="Add Team Members (Optional)" variant="outlined" />
                          )}
                        />
                        {/* Display selected team members */}
                        {selectedTeamMembers.map((member, index) => (
                          <div key={index}>
                            {member}
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => handleRemoveTeamMember(index)}
                            >
                              X
                            </Button>
                          </div>
                        ))}

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
                          <TableCell>No. of Members</TableCell>
                          <TableCell>Office</TableCell>
                          <TableCell>Delete</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teams.map((team, index) => (
                          <TableRow key={index}>
                            <TableCell>{team.email}</TableCell>
                            <TableCell>{team.teamName}</TableCell>
                            <TableCell>{team.noOfMembers}</TableCell>
                            <TableCell>{team.office}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => handleDeleteTeam(team.email)}
                              >
                                <DeleteIcon />
                              </Button>
                            </TableCell>
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
