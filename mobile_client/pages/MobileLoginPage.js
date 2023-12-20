import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';

const LoginPage = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = async () => {
		try {
			const response = await fetch(`https://green-workplace.onrender.com/api/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (data.status === "ok") {
				console.log("success")
				await AsyncStorage.setItem('token', data.token);
				await AsyncStorage.setItem('loggedIn', 'true');

				navigation.navigate('TransportDetectionPage');
			} else {
				Alert.alert("Login Failed", data.error);
			}
		} catch (error) {
			console.log(error.message);
			Alert.alert("Login Error", "An error occurred while logging in.");
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.greenWorkplaceText}>Green-Workplace 
			<Icon name={"leaf"} size={30} color="#1ED760" />
			
			</Text>
			
			<Text style={styles.loginText}>Login</Text>
			<TextInput
				style={styles.input}
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<Button title="Log In" color={"green"} onPress={handleSubmit} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start', 
		alignItems: 'center',
		paddingTop: 100, 
		paddingHorizontal: 20, 
	},
	input: {
		width: '100%',
		margin: 10,
		padding: 10,
		borderWidth: 1,
		borderColor: 'gray',
		borderRadius: 5,
	},
	greenWorkplaceText: {
		fontSize: 30,
		marginBottom: 80, 
	},
	loginText: {
		fontSize: 15,
	},
});


export default LoginPage;
