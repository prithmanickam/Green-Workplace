import React, { useEffect } from "react";
import { baseURL } from "../utils/constant";
import { Link } from "react-router-dom";
import { Container } from "@mui/material";
import { Card, CardContent, Typography } from "@mui/material";
import greyBackground from "../images/greyBackground.png";
import TopNavbar from '../components/TopNavbar';
import Box from '@mui/material/Box';
import { ThemeContext } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getThemeColors } from '../utils/themeUtils';
import "../css/HomePage.css";

export default function HomePage() {
  const { mode } = React.useContext(ThemeContext)
  const { oppositeThemeColour } = getThemeColors(mode);
  const { userData, setUserData } = useUser();

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
        console.log(data, "userData");
        setUserData(data.data);
      });
  }, [setUserData]);


  const cardDataforAdmin = [
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
      description: "Manage team owners and team members. Can set the company carbon footprint standard.",
      picture: greyBackground,
      link: "CompanyAdminFunctions"
    },
    {
      id: 3,
      name: "Add Teams",
      description: "Create teams and set team owners for them.",
      picture: greyBackground,
      link: "AddTeams"
    },
    {
      id: 4,
      name: "Add Employees",
      description: "Add new employees and see who has registered.",
      picture: greyBackground,
      link: "AddEmployees"
    },
  ];

  const cardDataForEmployee = [
    {
      id: 1,
      name: "Set Carbon Footprint",
      description: "Set your route to work based on the days you are working in office. You can use a map or do it manually, and it will calculate your carbon footprint.",
      picture: greyBackground,
      link: "SetCarbonFootprint"
    },
    {
      id: 2,
      name: "Individual Dashboard",
      description: "Show your carbon footprint metrics and history. Also to set your prefernce for WAO.",
      picture: greyBackground,
      link: "IndividualDashboard"
    },
    {
      id: 3,
      name: "Team Chat",
      description: "Communicate with your team via chat.",
      picture: greyBackground,
      link: "TeamChat"
    },
    {
      id: 4,
      name: "Team Dashboard",
      description: "Show the teams weekly carbon footprint and what the team decided set your preference for WAO.",
      picture: greyBackground,
      link: "TeamDashboard"
    },
    {
      id: 5,
      name: "Team Ownership Functions",
      description: "Team owner functions i.e. Add/delete team members, set the teams WAO days, and edit team name.",
      picture: greyBackground,
      link: "TeamOwnershipFunctions"
    },
    {
      id: 6,
      name: "Join or Leave a Team",
      description: "Join or leave a team as a Team member.",
      picture: greyBackground,
      link: "JoinOrLeaveTeam"
    },
    {
      id: 7,
      name: "Company Dashboard",
      description: "View all teams' carbon footprint and sort by highest. See company collective metrics.",
      picture: greyBackground,
      link: "CompanyDashboard"
    },
  ];
  
  //display the right cards for the type of user logged in
  let cardData = cardDataForEmployee;

  if (userData && userData.type === 'Admin') {
    cardData = cardDataforAdmin;
  }
  if (userData && userData.type === 'Team Member') {
    cardData = cardDataForEmployee.filter(card => card.id !== 5);
  }

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
