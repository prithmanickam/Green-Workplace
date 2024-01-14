import React, { useState, useEffect } from "react";
import SideNavbar from '../components/SideNavbar';
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Autocomplete,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { baseURL } from "../utils/constant";
import useAuth from '../hooks/useAuth';

export default function AddTeams() {
  const [emailInput, setEmailInput] = useState('');

  //to select employees that can be team members
  const [registeredAccounts, setRegisteredAccounts] = useState([]);

  const [selectedTeamOwner, setSelectedTeamOwner] = useState(null);

  const { userData } = useUser();

  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const [teams, setTeams] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  const handleClickOpenDeleteDialog = (team) => {
    setTeamToDelete(team);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const confirmDeleteTeam = () => {
    handleDeleteTeam(teamToDelete.teamId);
    handleCloseDeleteDialog();
  };


  useAuth(["Admin"]);

  useEffect(() => {
    if (userData) {
      // to get all teams
      fetch(`${baseURL}/getTeams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company: userData.company_id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            const allTeams = data.teams.map((team) => ({
              teamId: team.team_id,
              email: team.team_owner_email,
              teamName: team.name,
              noOfMembers: team.team_members_count,
              canDelete: team.can_delete,
            }));
            setTeams(allTeams);
          } else {
            toast.error("Failed to fetch teams data. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching teams data.");
        });


      // Get all users (not admins) - for selecting team members
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
            const allEmails = data.users.map((user) => user.email);
            setRegisteredAccounts(allEmails);
          } else {
            toast.error("Failed to fetch user data. Please try again.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching user data.");
        });

    }
  }, [userData]);

  // to register an account / check if details meet validations
  const handleAddTeam = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const teamOwner = selectedTeamOwner; // Use the selected team owner
    const teamName = data.get("teamName");
    const divisions = data.get("divisions");
    const company = userData.company_id;
    const teamMembers = selectedTeamMembers;

    // Check for duplicates
    const emailSet = new Set();
    let hasDuplicates = false;

    if (teamOwner) {
      emailSet.add(teamOwner);
    }

    teamMembers.forEach((member) => {
      if (emailSet.has(member)) {
        hasDuplicates = true;
      } else {
        emailSet.add(member);
      }
    });

    if (teamOwner === null || teamName === "" || divisions === "") {
      toast.error("You must fill all required fields.");
    } else if (hasDuplicates) {
      toast.error("Duplicate email addresses detected. Please remove duplicates.");
    } else {
      fetch(`${baseURL}/addTeam`, {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamOwner,
          teamName,
          divisions,
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
                canDelete: true,
              },
            ]);

          } else {
            toast.error("Something went wrong");
          }
        });
    }
  };

  const handleDeleteTeam = (teamId) => {
    fetch(`${baseURL}/deleteTeam`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",

      },
      body: JSON.stringify({
        teamId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          toast.success("Team has been deleted and team members relations of it are removed.");
          setTeams((prevTeams) => prevTeams.filter((team) => team.teamId !== teamId));

        } else {
          toast.error("Something went wrong");
        }
      });
  };

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
                      <Grid item xs={6}>
                        <Autocomplete
                          required
                          id="teamOwner"
                          label="Team Owner"
                          options={registeredAccounts}
                          value={selectedTeamOwner}
                          onChange={(event, newValue) => {
                            setSelectedTeamOwner(newValue);
                          }}
                          renderInput={(params) => (
                            <TextField {...params} label="Team Owner" variant="outlined" />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          name="teamName"
                          label="Team Name"
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>

                      <Grid item xs={12}>
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

                          <TableCell>Delete</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((team, index) => (
                          <TableRow key={index}>
                            <TableCell>{team.email}</TableCell>
                            <TableCell>{team.teamName}</TableCell>
                            <TableCell>{team.noOfMembers}</TableCell>

                            <TableCell>
                              {team.canDelete && (  // only delete if canDelete is true
                                <Button
                                  variant="outlined"
                                  color="secondary"
                                  onClick={() => handleClickOpenDeleteDialog(team)}
                                >
                                  <DeleteIcon />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={teams.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[8, 15, 25]}
                  />
                  <Dialog
                    open={openDeleteDialog}
                    onClose={handleCloseDeleteDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                  >
                    <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                    <DialogContent>
                      <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this team?
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                      </Button>
                      <Button onClick={confirmDeleteTeam} color="primary" autoFocus>
                        Confirm
                      </Button>
                    </DialogActions>
                  </Dialog>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Box>
    </Box>
  );
}
