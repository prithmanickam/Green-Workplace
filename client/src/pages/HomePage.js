import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Container } from "@mui/material";
import { Card, CardContent, Typography } from "@mui/material";
import greyBackground from "../images/greyBackground.png";
import TopNavbar from '../components/TopNavbar';
import Box from '@mui/material/Box';
import { ThemeContext } from '../context/ThemeContext';
import { getThemeColors } from '../utils/themeUtils'; 
import "../css/HomePage.css";

export default function HomePage() {
  const { mode, toggleMode } = React.useContext(ThemeContext)
  const { sameThemeColour, oppositeThemeColour } = getThemeColors(mode);

  const cardData = [
    {
      id: 1,
      name: "Company Dashboard",
      description: "View all teams' carbon footprint and sort by highest. See company collective metrics.",
      picture: greyBackground,
      link: "CompanyDashboard"
    },
    {
      id: 2,
      name: "Company Admin Functions",
      description: "Access all administrative functions for managing your company's data and settings.",
      picture: greyBackground,
      link: "CompanyAdminFunctions"
    },
    {
      id: 3,
      name: "Add Teams",
      description: "Add new teams to your company's profile and manage their data.",
      picture: greyBackground,
      link: "AddTeams"
    },
    {
      id: 4,
      name: "Add Employees",
      description: "Add new employees to your company's teams and track their performance.",
      picture: greyBackground,
      link: "AddEmployees"
    },
  ];

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ backgroundColor: mode === 'light' ? 'white' : 'black' }} // Apply background color based on mode
    >
      <TopNavbar />
      <Box className="home-page" component="main" sx={{ flexGrow: 1, px: 5 }}>


        <h1 style={{ color: oppositeThemeColour }}>Homepage</h1>
        <Box className="user-grid" display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3} justifyContent="center" marginTop={2}>
          {cardData.map((card) => (
            <Link to={`/${card.link}`} key={card.id} className="user-card">
              <Card
                sx={{
                  borderRadius: "20px",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  textDecoration: "none",
                  color: "#333",
                  transition: "transform 0.2s ease-in-out",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    backgroundImage: `url(${card.picture})`,
                    backgroundPosition: "center top",
                    backgroundSize: "100% 50%",
                    height: "150px",
                  }}
                ></div>

                <CardContent>
                  <Typography variant="h6" sx={{ color: oppositeThemeColour }}>{card.name}</Typography>
                  <Typography variant="body2" color="grey">
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          ))}
        </Box>
      </Box>
    </Container>
  );
}
