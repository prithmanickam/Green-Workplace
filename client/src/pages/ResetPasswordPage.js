import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { CardContent, Grid } from "@mui/material";
import Link from "@mui/material/Link";
import { toast } from "react-toastify";
import Card from "@mui/material/Card";
import { useParams } from "react-router-dom";
import TopNavbar from '../components/TopNavbar';
import { baseURL } from "../utils/constant";

export default function ResetPasswordPage() {
	const { resetpasswordtoken } = useParams();
	const [email, setEmail] = useState("");
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	useEffect(() => {

		// Fetch the user's email using the registration token
		if (resetpasswordtoken) {
			console.log(resetpasswordtoken)
			fetch(`${baseURL}/getEmail?token=${resetpasswordtoken}`, { method: "POST" })
				.then((res) => res.json())
				.then((data) => {
					if (data.status === "ok" && data.email) {
						setEmail(data.email);
						toast.success("Fetched email address from URL Token.");
					} else {
						console.log("invalid forgot password token");
						toast.error("Invalid forgot password token.");
					}
				});
		}
	}, [resetpasswordtoken]);

	const handlePasswordSave = () => {
		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match!");
			return;
		}

		fetch(`${baseURL}/updatePassword`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userEmail: email, newPassword })
		})
			.then(response => response.json())
			.then(data => {
				// Handle response, show success or error message
				toast.success("Password updated successfully");
			})
			.catch(error => {
				console.error('Error:', error);
				// Handle error, show error message
			});
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

				{/* Password Change Card */}
				<Card variant="outlined" sx={{ mt: 2 }}>
					<CardContent>
						<Typography gutterBottom variant="h5" component="div">
							Reset your password:
						</Typography>
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
						<TextField
							label="New Password"
							type="password"
							fullWidth
							margin="normal"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
						/>
						<TextField
							label="Confirm New Password"
							type="password"
							fullWidth
							margin="normal"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
						/>
						<Button variant="contained" color="primary" onClick={handlePasswordSave}>
							Save
						</Button>
						<Grid container>
							<Grid item xs>
								<Link href="/login" variant="body2">
									Navigate Back to Login
								</Link>
							</Grid>
						</Grid>
					</CardContent>
				</Card>
			</Container>
		</Container>
	);
}
