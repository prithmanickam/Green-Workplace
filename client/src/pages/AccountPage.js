import React from "react";
import TopNavbar from '../components/TopNavbar';
import { Container } from "@mui/material";
import Box from '@mui/material/Box';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeUtils';
import { useUser } from '../context/UserContext';
import useAuth from '../hooks/useAuth';

export default function UserDetails() {
  const { mode } = React.useContext(ThemeContext)
  const { oppositeThemeColour } = getThemeColors(mode);
  const { userData } = useUser();

  useAuth(["Admin", "Employee"]);

  const logout = () => {
    window.localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <Box sx={{ backgroundColor: mode === 'light' ? 'white' : 'black', minHeight: "100vh" }}>
      <TopNavbar />
      <Container maxWidth={false} disableGutters>
        <Box component="main" sx={{ px: 5 }}>
          <h1 style={{ color: oppositeThemeColour }}>Account Page</h1>
          {userData && (
            <>
              <h2 style={{ color: oppositeThemeColour }}>Name: {userData.firstname} {userData.lastname}</h2>
              <h2 style={{ color: oppositeThemeColour }}>Email: {userData.email}</h2>
              <h2 style={{ color: oppositeThemeColour }}>Account type: {userData.type}</h2>
            </>
          )}
          <button onClick={logout}>Log out</button>
        </Box>
      </Container>
    </Box>
  );
}
