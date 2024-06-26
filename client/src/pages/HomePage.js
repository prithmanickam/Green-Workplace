import React, { useEffect } from "react";
import { baseURL } from "../utils/constant";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography, CardMedia, Container } from "@mui/material";
import TopNavbar from '../components/TopNavbar';
import Box from '@mui/material/Box';
import { ThemeContext } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { getThemeColors } from '../utils/themeUtils';
import useAuth from '../hooks/useAuth';
const companyDashboardPicture = process.env.PUBLIC_URL + '/company-dashboard-picture.png';
const teamDashboardPicture = process.env.PUBLIC_URL + '/team-dashboard-picture.png';
const yourDashboardPicture = process.env.PUBLIC_URL + '/your-dashboard-picture.png';
const teamChatPicture = process.env.PUBLIC_URL + '/team-chat-picture.png';
const teamOwnerFunctionsPicture = process.env.PUBLIC_URL + '/team-owner-functions-picture.png';
const setFootprintPicture = process.env.PUBLIC_URL + '/set-footprint-picture.png';
const addEmployeesPicture = process.env.PUBLIC_URL + '/add-employees-picture.png';
const addTeamsPicture = process.env.PUBLIC_URL + '/add-teams-picture.png';
const adminFunctionsPicture = process.env.PUBLIC_URL + '/admin-functions-picture.png';

export default function HomePage() {
  const { mode } = React.useContext(ThemeContext)
  const { oppositeThemeColour } = getThemeColors(mode);
  const { userData, setUserData } = useUser();

  useAuth(["Admin", "Employee"]);

  useEffect(() => {
    fetch(`${baseURL}/userData`, {
      method: "POST",
      crossDomain: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data, "userData");
        localStorage.setItem('userData', JSON.stringify(data.data));
        setUserData(data.data);
      });
  }, [setUserData]);


  const cardDataforAdmin = [
    {
      id: 1,
      name: "Company Dashboard",
      description: "View all teams' carbon footprint and sort by highest. See company collective metrics.",
      picture: companyDashboardPicture,
      link: "CompanyDashboard"
    },
    {
      id: 2,
      name: "Company Admin Functions",
      description: "Functions such as set the company carbon footprint standard, add/delete office, and delete employees.",
      picture: adminFunctionsPicture,
      link: "CompanyAdminFunctions"
    },
    {
      id: 3,
      name: "Add Teams",
      description: "Create teams with an assigned team owner and view all teams.",
      picture: addTeamsPicture,
      link: "AddTeams"
    },
    {
      id: 4,
      name: "Add Employees",
      description: "Add new employees and see who has registered.",
      picture: addEmployeesPicture,
      link: "AddEmployees"
    },
  ];

  const cardDataForEmployee = [
    {
      id: 1,
      name: "Set Carbon Footprint",
      description: "Calculate and set your carbon footprint by either Google Maps API or Manually entering your journey.",
      picture: setFootprintPicture,
      link: "SetCarbonFootprint"
    },
    {
      id: 2,
      name: "Your Dashboard",
      description: "Show your carbon footprint metrics and history. Also to set your Work At Office days preference.",
      picture: yourDashboardPicture,
      link: "YourDashboard"
    },
    {
      id: 3,
      name: "Team Chat",
      description: "Communicate with your team via chat.",
      picture: teamChatPicture,
      link: "TeamChat"
    },
    {
      id: 4,
      name: "Team Dashboard",
      description: "Show the teams weekly carbon footprint and what the team decided set your preference for WAO.",
      picture: teamDashboardPicture,
      link: "TeamDashboard"
    },
    {
      id: 5,
      name: "Team Owner Functions",
      description: "Team owner functions i.e. Add/delete team members, set the teams WAO days, and edit team name.",
      picture: teamOwnerFunctionsPicture,
      link: "TeamOwnerFunctions"
    },
    {
      id: 6,
      name: "Company Dashboard",
      description: "View all teams' carbon footprint and sort by highest. See company collective metrics.",
      picture: companyDashboardPicture,
      link: "CompanyDashboard"
    },
  ];

  //display the right cards for the type of user logged in
  let cardData = cardDataForEmployee;

  if (userData && userData.type === 'Admin') {
    cardData = cardDataforAdmin;
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ backgroundColor: mode === 'light' ? 'white' : 'black' }} // Apply background color based on mode
    >
      <TopNavbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >

        <h1 style={{ color: oppositeThemeColour }}>Homepage</h1>
        <Box className="user-grid" display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={6} justifyContent="center" marginTop={2}>

          {cardData.map((card) => (
            <Link to={`/${card.link}`} key={card.id} style={{ textDecoration: 'none' }}>
              <Card
                sx={{
                  maxWidth: 345,
                  minHeight: 285,
                  borderRadius: '15px', // Rounded corners
                  transition: 'transform 0.2s', // Smooth transition on hover
                  '&:hover': {
                    transform: 'scale(1.05)', // Scale up by 5% on hover
                  },
                }}
              >
                <CardMedia sx={{ height: 140 }} image={card.picture} title={card.name} />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {card.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
