import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { toast } from "react-toastify";
import Card from "@mui/material/Card";
import { useParams } from "react-router-dom";
import TopNavbar from '../components/TopNavbar';
import { baseURL } from "../utils/constant";

export default function Registration() {
	const { registrationtoken } = useParams(); // Get registration token from URL
	const [email, setEmail] = useState("");
	const [company, setCompany] = useState("");
	const [office, setOffice] = useState("");

	useEffect(() => {
		// Fetch the user's email using the registration token
		if (registrationtoken) {
			fetch(`${baseURL}/getEmail?token=${registrationtoken}`, { method: "POST" })
				.then((res) => res.json())
				.then((data) => {
					if (data.status === "ok" && data.email) {
						setEmail(data.email);
						setCompany(data.company);
						setOffice(data.office);
						toast.success("Fetched email address from URL Token.");
					} else {
						console.log("invalid registration token");
						toast.error("Invalid registration token.");
					}
				});
		}
	}, [registrationtoken]);

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
		const password = data.get("password");
		const confirmPassword = data.get("confirmPassword");
		const passwordRegex = /^(?=.*\d).{6,}$/;

		if (firstname.trim() === "" || lastname.trim() === "") {
			toast.error("First Name and Last Name are required.");
		} else if (!passwordRegex.test(password)) {
			toast.error(
				"Password should be at least 6 characters long and contain at least 1 digit."
			);
		} else if (password !== confirmPassword) {
			toast.error("Password and Confirm Password do not match.");
		} else {
			fetch(`${baseURL}/register`, {
				method: "POST",
				crossDomain: true,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstname,
					lastname,
					email,
					password,
					company,
					office
				}),
			})
				.then((res) => res.json())
				.then((data) => {
					console.log(data, "userRegister");
					if (data.status === "ok") {
						toast.success("Registration Successful");
					} else {
						toast.error("Something went wrong");
					}
				});
		}
	};

	return (
		<Container maxWidth={false} disableGutters>
			<TopNavbar />
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
										//label="Email Address"
										name="email"
										autoComplete="email"
										value={email}
										disabled // Make the email field uneditable
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
		</Container>
	);
}
