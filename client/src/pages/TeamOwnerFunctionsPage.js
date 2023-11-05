import React, { useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import SideNavbar from '../components/SideNavbar';
import { Box, Typography, Select, MenuItem, Stack, Button, TextField } from '@mui/material';
import { toast } from "react-toastify";
import { useUser } from '../context/UserContext';
import { baseURL } from "../utils/constant";
import EditIcon from '@mui/icons-material/Edit';
import InputLabel from '@mui/material/InputLabel';
import Autocomplete from '@mui/material/Autocomplete';
import Divider from '@mui/material/Divider';

export default function TeamOwnerFunctions() {
  const { userData } = useUser();
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [editingTeamName, setEditingTeamName] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [teamMembersToAdd, setTeamMembersToAdd] = useState([]);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('');
  const [teamMembersToRemove, setTeamMembersToRemove] = useState([]);
  const [selectedMemberToRemove, setSelectedMemberToRemove] = useState('');
  const [teamPreferences, setTeamPreferences] = useState([]);
  const [confirmedPreferences, setConfirmedPreferences] = useState([]);

  const teamOptions = userTeams.map(team => ({
    team_id: team.id,
    team_name: team.name,
  }));

  useEffect(() => {
    fetch(`${baseURL}/getUserTeamOwnerTeams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userData.id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setUserTeams(data.user_teams);
          if (data.user_teams.length > 0 && selectedTeam === '') {
            // Set the initial selected team to the first team only if it's not already set
            setSelectedTeam(data.user_teams[0].name);
            setSelectedTeamId(data.user_teams[0].id);
          }
        } else {
          toast.error("Failed to fetch user's teams.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while fetching teams data.");
      });
  }, [userData, selectedTeam]);

  useEffect(() => {
    if (selectedTeamId) {
      fetch(`${baseURL}/getTeamOwnerFunctionsData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_id: userData.company_id,
          user_email: userData.email,
          team_id: selectedTeamId,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setConfirmedPreferences(data.teamInfo[0].wao_days)
            setTeamMembersToAdd(data.teamMembersToAdd);
            setTeamMembersToRemove(data.teamMembersToRemove);
          } else {
            toast.error("Failed to fetch team dashboard data.");
          }
        })
        .catch((error) => {
          toast.error("An error occurred while fetching team dashboard data.");
        });
    }
  }, [selectedTeamId, userData]);

  const handleEditTeamName = () => {
    setEditingTeamName(true);
    setNewTeamName(selectedTeam);
  };

  const handleSaveTeamName = () => {
    fetch(`${baseURL}/editTeamName`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: selectedTeamId,
        new_team_name: newTeamName,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setSelectedTeam(newTeamName);
          setEditingTeamName(false);
          toast.success("Team name updated successfully.");
        } else {
          toast.error("Failed to update team name.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while updating team name.");
      });
  };

  const handleCancelEditTeamName = () => {
    setEditingTeamName(false);
    // Reset the newTeamName to the current selected team name
    setNewTeamName(selectedTeam);
  };

  // Add the added team member
  const handleAddTeamMember = () => {
    fetch(`${baseURL}/addTeamMember`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: selectedTeamId,
        new_team_member: selectedMemberToAdd,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          toast.success("Team Member has been added to the team.");
          // Remove the added member from the dropdown
          setTeamMembersToAdd((prevMembers) => prevMembers.filter(member => member !== selectedMemberToAdd));
          // Add the added member to the "remove" list
          setTeamMembersToRemove((prevMembers) => [...prevMembers, selectedMemberToAdd]);
        } else {
          toast.error("Failed to add team member.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while adding team member.");
      });
    // remove the selected member from the dropdown.
    setSelectedMemberToAdd(null);
  };

  // remove the team member
  const handleRemoveTeamMember = () => {
    fetch(`${baseURL}/removeTeamMember`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: selectedTeamId,
        team_member: selectedMemberToRemove,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          toast.success("Team Member has been removed from the team.");
          // Remove the removed member from the dropdown
          setTeamMembersToRemove((prevMembers) => prevMembers.filter(member => member !== selectedMemberToRemove));
          // Add the removed member to the "add" list
          setTeamMembersToAdd((prevMembers) => [...prevMembers, selectedMemberToRemove]);
        } else {
          toast.error("Failed to remove team member.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while removing team member.");
      });
    setSelectedMemberToRemove(null);
  };

  const handleDayToggle = (day) => {
    setTeamPreferences((prevPreferences) => {
      const updatedPreferences = prevPreferences.includes(day)
        ? prevPreferences.filter((d) => d !== day)
        : [...prevPreferences, day];

      return updatedPreferences;
    });
  };

  const handleSavePreferences = () => {
    const selectedDays = teamPreferences;
    const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].filter(day => selectedDays.includes(day));

    fetch(`${baseURL}/editTeamWAODays`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: selectedTeamId,
        selected_days: orderedDays,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          console.log("hiiii")
          toast.success("Preferences saved successfully");
          setConfirmedPreferences(
            orderedDays
          );
        } else {
          toast.error("Failed to save preferences. Please try again.");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while saving preferences.");
      });
  };

  if (!userData || (userData.type !== 'Employee')) {
    return <Navigate to="/homepage" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNavbar />
      <Box component="main" sx={{ flexGrow: 1, py: 10, px: 5, display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" py={1} spacing={5} alignItems="center" >
          <h1>Team Owner Functions</h1>
          {/* Dropdown to switch team dashboard for different teams */}
          <InputLabel>You are viewing team:</InputLabel>
          <Select
            value={selectedTeamId}
            sx={{ width: 300 }}
            onChange={(e) => {
              const newSelectedTeamId = e.target.value;
              setSelectedTeamId(newSelectedTeamId);
              const selectedTeamObject = teamOptions.find(option => option.team_id === newSelectedTeamId);
              if (selectedTeamObject) {
                setSelectedTeam(selectedTeamObject.team_name);
                setTeamPreferences(confirmedPreferences[selectedTeamObject.team_id] || []);
              }
            }}
            style={{ marginBottom: '16px' }}
          >
            {teamOptions.map((option, index) => (
              <MenuItem key={option.team_id} value={option.team_id}>
                {option.team_name}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <Divider variant="middle" sx={{ py: 2 }} />

        <Stack direction="row" py={1} spacing={5} alignItems="center" >
          <InputLabel>Team Name:</InputLabel>
          {editingTeamName ? (
            <>
              <TextField
                label="New Team Name"
                variant="outlined"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <Button variant="contained" color="primary" onClick={handleSaveTeamName}>Save</Button>
              <Button variant="contained" color="secondary" onClick={handleCancelEditTeamName}>Cancel</Button>
            </>
          ) : (
            <>
              <Typography variant="h6">{selectedTeam}</Typography>
              <Button variant="contained" color="primary" onClick={handleEditTeamName}>Edit <EditIcon /></Button>
            </>
          )}
        </Stack>

        <Divider variant="middle" sx={{ py: 2 }} />
        <Stack direction="row" py={1} spacing={5} alignItems="center">
          <InputLabel>Current Set Teams Work At Office Days: </InputLabel>
          {confirmedPreferences ? confirmedPreferences.join(', ') : 'None selected'}
        </Stack>

        <Stack direction="row" py={1} spacing={5} alignItems="center">
          <InputLabel>Select WAO Days:</InputLabel>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <Button
              key={day}
              variant="outlined"
              onClick={() => handleDayToggle(day)}
              sx={{
                backgroundColor: teamPreferences.includes(day) ? '#eed202' : 'primary',
                color: teamPreferences.includes(day) ? 'black' : 'primary',
                border: teamPreferences.includes(day) ? '1px solid black' : 'primary',
                marginRight: '8px',
              }}
            >
              {day}
            </Button>
          ))}
          <Button
            variant="outlined"
            color="success"
            style={{ marginRight: '8px' }}
            onClick={handleSavePreferences}
            sx={{
              backgroundColor: '#1ED760',
              color: 'black',
            }}
          >
            Save
          </Button>
        </Stack>

        <Divider variant="middle" sx={{ py: 2 }} />

        <Stack direction="row" py={1} spacing={5} alignItems="center">
          <InputLabel>Add Team Member:</InputLabel>
          <Autocomplete
            value={selectedMemberToAdd}
            onChange={(event, newValue) => {
              setSelectedMemberToAdd(newValue);
            }}
            options={teamMembersToAdd}
            sx={{ width: 300 }}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField {...params} label="Search/Add Team Member" variant="outlined" />
            )}
          />
          <Button variant="contained" color="primary" onClick={handleAddTeamMember}>Add</Button>
        </Stack>

        <Divider variant="middle" sx={{ py: 2 }} />

        <Stack direction="row" py={1} spacing={5} alignItems="center">
          <InputLabel>Remove Team Member:</InputLabel>
          <Autocomplete
            value={selectedMemberToRemove}
            onChange={(event, newValue) => {
              setSelectedMemberToRemove(newValue);
            }}
            options={teamMembersToRemove}
            sx={{ width: 300 }}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField {...params} label="Search/Remove Team Member" variant="outlined" />
            )}
          />
          <Button variant="contained" color="secondary" onClick={handleRemoveTeamMember}>Remove</Button>
        </Stack>
        <div style={{ flex: 1, display: 'flex' }}>

        </div>
      </Box>
    </Box >
  );
}
