import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Container } from "@mui/material";
import React, { useState } from "react";
import { baseURL } from "../utils/constant";
import TopNavbar from '../components/TopNavbar';
import AuthBackground from '../components/AuthBackground';
import { toast } from "react-toastify";

const LoginPage = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    console.log(email, password);

    try {
      //sending request to login api
      fetch(`${baseURL}/login`, {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
        },
        //and passing in email and password
        body: JSON.stringify({
          email,
          password,
        }),
      }) //in response, we are recieving the data
        .then((res) => res.json())
        .then((data) => {
          console.log(data, "userRegister");
          //if login is successful we store the token, and var loggedIn is set to true
          if (data.status === "ok") {
            toast.success("Login successful");

            window.localStorage.setItem("token", data.token);
            window.localStorage.setItem("loggedIn", true);
            window.location.href = "./homepage";
          }
          else {
            toast.error(data.error);
          }
        });
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <Container maxWidth={false} disableGutters>
      <TopNavbar />
      <Grid
        container
        sx={{ height: "90vh", width: "100%", px: 4 }}
      >
        <CssBaseline />
        
        <AuthBackground backgroundImageUrl={`${process.env.PUBLIC_URL}/login-screen-bg.png`} />

        <Grid item xs={12} sm={8} md={4} component={Card} elevation={10} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >

            <Typography component="h1" variant="h5">
              Log in
            </Typography>
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{ mt: 1 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3, mb: 2,
                  color: "white",
                  font: "Arial",
                  backgroundColor: "green",
                  borderRadius: "10px",
                  "&:hover": {
                    backgroundColor: "darkgreen",
                  },
                }}
              >
                Log In
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="/ForgotPassword" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
