import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Container } from "@mui/material";
import React, { useState } from "react";
import { baseURL } from "../utils/constant";
import TopNavbar from '../components/TopNavbar';
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
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
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
            toast.success("Login successful")

            window.localStorage.setItem("token", data.token);
            window.localStorage.setItem("loggedIn", true);

            window.location.href = "./homepage";
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
        <Grid
          component={Paper}
          elevation={10}
          item
          xs={12}
          sm={4}
          md={8}
          sx={{
            backgroundImage:
              "url(https://source.unsplash.com/random?wallpapers)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
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
                  <Link href="#" variant="body2">
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
