import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import toast from "react-hot-toast";
import Card from "@mui/material/Card";
import { useParams } from "react-router-dom";

const defaultTheme = createTheme();

export default function Registration() {
    const { registrationtoken } = useParams(); // Get registration token from URL
    const [email, setEmail] = useState("");
    console.log(registrationtoken)

    //Todo need to finish
    useEffect(() => {
        console.log("in useeffect");
        // Fetch the user's email using the registration token
        if (registrationtoken) {
            console.log("there is a reg token");
            fetch(`http://localhost:5000/api/getEmail?token=${registrationtoken}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("Email should show:");
                    handleEmailValidation(data.email);

                    if (data.status === "ok" && data.email) {
                        setEmail(data.email);
                    } else {
                        console.log("invalid registration token");
                        toast.error("Invalid registration token.");
                    }
                });
        }
    }, [registrationtoken]);

    // for testing purposes (will remove)
    const handleEmailValidation = (validatedEmail) => {
        console.log("validatedEmail:");
        console.log(validatedEmail);
    };

    // to register an account / check if detail meet validations
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get("email"),
            password: data.get("password"),
        });
        const firstname = data.get("firstname");
        const lastname = data.get("lastname");
        const email = data.get("email");
        const password = data.get("password");
        const confirmPassword = data.get("confirmPassword");
        const passwordRegex = /^(?=.*\d).{6,}$/;

        if (!passwordRegex.test(password)) {
            toast.error(
                "Password should be at least 6 characters long and contain at least 1 digit."
            );
        } else if (password !== confirmPassword) {
            toast.error("Password and Confirm Password do not match.");
        } else {
            toast.success("Sign up successful!");
            fetch("http://localhost:5000/api/register", {
                method: "POST",
                crossDomain: true,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    password,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data, "userRegister");
                    if (data.status === "ok") {
                        alert("Registration Successful");
                    } else {
                        alert("Something went wrong");
                    }
                });
        }
    };

    //testing (ignore)
    console.log("email outside of functions");
    console.log(email);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container
                component="main"
                sx={{
                    backgroundImage:
                        "url(https://source.unsplash.com/random?wallpapers)",
                    backgroundSize: "cover",
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CssBaseline />

                <Card
                    variant="outlined"
                    sx={{
                        width: "100%",
                        maxWidth: 500,
                        m: 1,
                        px: 5,
                        my: 5,
                        boxShadow: 3,
                        borderWidth: 2,
                        borderColor: "navy",
                    }}
                >
                    <Box
                        sx={{
                            marginTop: 5,
                            marginBottom: 5,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography component="h1" variant="h5">
                            Register Your Account
                        </Typography>
                        <Box
                            component="form"
                            noValidate
                            onSubmit={handleSubmit}
                            sx={{ mt: 3 }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        autoComplete="given-name"
                                        name="firstname"
                                        required
                                        fullWidth
                                        id="firstname"
                                        label="First Name"
                                        autoFocus
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="lastname"
                                        label="Last Name"
                                        name="lastname"
                                        autoComplete="family-name"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                    //value={email}
                                    //disabled // Make the email field uneditable
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type="password"
                                        id="confirmPassword"
                                        autoComplete="new-password"
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Register
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="/login" variant="body2" p={5}>
                                        Already have an account? Log in
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Card>
            </Container>
        </ThemeProvider>
    );
}
