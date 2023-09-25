import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Typography } from "@mui/material";
import "../css/HomePage.css";
import greyBackground from "../images/greyBackground.png";

export default function HomePage() {
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
    <div className="home-page">
      <h1>HomePage</h1>
      <div className="user-grid">
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
                <Typography variant="h6">{card.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
