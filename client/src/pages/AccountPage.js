import React, { useEffect, useState } from "react";
import { baseURL } from "../utils/constant";
import TopNavbar from '../components/TopNavbar';
import { Container } from "@mui/material";
import Box from '@mui/material/Box';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeUtils'; 

export default function UserDetails() {
  const [userData, setUserData] = useState("");
  const { mode } = React.useContext(ThemeContext)
  const { oppositeThemeColour } = getThemeColors(mode);

  useEffect(() => {
    fetch(`${baseURL}/userData`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        //console.log(data)

        console.log(data, "userData");
        setUserData(data.data);
      });
  }, []);

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
          <h2 style={{ color: oppositeThemeColour }}>Name: {userData.firstname}</h2>
          <h2 style={{ color: oppositeThemeColour }}>Email: {userData.email}</h2>
          <button onClick={logout}>Log out</button>
        </Box>
      </Container>
    </Box>
  );
}
