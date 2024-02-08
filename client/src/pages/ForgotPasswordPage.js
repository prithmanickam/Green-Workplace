import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
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

const ForgotPasswordPage = () => {

  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();


    try {
      //sending request to login api
      fetch(`${baseURL}/sendResetPasswordEmail`, {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })
        .then((res) => res.json())
        .then((data) => {

          if (data.status === "ok") {
            toast.success("Link sent to email");
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
        <Grid
          component={Paper}
          elevation={10}
          item
          xs={12}
          sm={4}
          md={8}
          sx={{
            backgroundImage: `url(${process.env.PUBLIC_URL}/login-screen-bg.png)`,
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
              Forgot Password
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
                Send Reset Password Link
              </Button>
              <Grid container>
                <Grid item xs>
                  <Link href="/login" variant="body2">
                    Navigate Back to Login
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

export default ForgotPasswordPage;
