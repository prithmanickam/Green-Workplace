import React, { useState } from "react";
import TopNavbar from '../components/TopNavbar';
import { Container, Box, Card, CardContent, Button, TextField, Typography, IconButton, Stack } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeUtils';
import { baseURL } from "../utils/constant";
import { useUser } from '../context/UserContext';
import useAuth from '../hooks/useAuth';
import { toast } from "react-toastify";

export default function UserDetails() {
  const { mode } = React.useContext(ThemeContext);
  const { oppositeThemeColour } = getThemeColors(mode);
  const { userData, setUserData } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...userData });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useAuth(["Admin", "Employee"]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    fetch(`${baseURL}/updateUsername`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userData.id, editedUser: editedUser })
    })
      .then(response => response.json())
      .then(data => {
        setUserData(prev => ({ ...prev, firstname: editedUser.firstname, lastname: editedUser.lastname }));
        setEditMode(false);
        toast.success("Username updated");
      })
      .catch(error => console.error('Error:', error));
  };

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    fetch(`${baseURL}/updatePassword`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: userData.email, newPassword })
    })
      .then(response => response.json())
      .then(data => {
        toast.success("Password updated successfully");
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <Box sx={{ backgroundColor: mode === 'light' ? 'white' : 'black', minHeight: "100vh" }}>
      <TopNavbar />
      <Container maxWidth={false} disableGutters>
        <Box component="main" sx={{ px: 5 }}>
          <h1 style={{ color: oppositeThemeColour }}>Account Page</h1>
          <Card variant="outlined">
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Change your name:
              </Typography>
              {editMode ? (
                <Stack direction="row" spacing={2} alignItems="center">

                  <TextField
                    label="First Name"
                    name="firstname"
                    value={editedUser.firstname}
                    onChange={handleChange}
                  />
                  <TextField
                    label="Last Name"
                    name="lastname"
                    value={editedUser.lastname}
                    onChange={handleChange}
                  />
                  <Button variant="contained" color="primary" onClick={handleSave}>
                    Save
                  </Button>
                </Stack>

              ) : (
                <>
                  <Box display="flex" alignItems="center">
                    <Typography gutterBottom variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      Name: {userData.firstname} {userData.lastname}
                    </Typography>
                    <IconButton onClick={handleEdit}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Change your password:
              </Typography>
              <TextField
                label="New Password"
                type="password"
                fullWidth
                margin="normal"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button variant="contained" color="primary" onClick={handlePasswordSave}>
                Save
              </Button>
            </CardContent>
          </Card>

        </Box>
      </Container>
    </Box>
  );
}
