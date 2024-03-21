import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
			<Image
                source={require('../assets/green-workplace-logo.png')} 
                style={styles.logo}
            />

			<Text style={styles.loginText}>Login</Text>
			<TextInput
				style={styles.input}
				placeholder="Email"
				placeholderTextColor="white" 
				value={email}
				onChangeText={setEmail}
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				placeholderTextColor="white" 
				value={password}
				onChangeText={setPassword}
				secureTextEntry
			/>
			<TouchableOpacity
				style={[styles.customButton, { backgroundColor: "green" }]}
				onPress={handleSubmit}
				activeOpacity={0.7}
			>
				<Text style={styles.customButtonText}>
					{"Submit"}
				</Text>
			</TouchableOpacity>
			
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
	  backgroundColor: '#121212', 
	},
	input: {
	  width: '100%',
	  margin: 10,
	  padding: 10,
	  borderWidth: 1,
	  borderColor: 'gray',
	  borderRadius: 5,
	  backgroundColor: '#383838', 
	  color: 'white', 
	},
	greenWorkplaceText: {
	  fontSize: 30,
	  marginBottom: 80,
	  color: 'white',
	},
	loginText: {
	  fontSize: 18,
	  color: 'white', 
	},
	logo: {
        width: 280, 
        height: 37, 
        marginBottom: 80,
    },
	customButton: {
	  backgroundColor: 'green',
	  paddingVertical: 10,
	  paddingHorizontal: 20,
	  borderRadius: 5,
	  alignItems: 'center',
	  justifyContent: 'center',
	  elevation: 2,
	  marginTop: 10,
	  marginBottom: 10,
	},
	customButtonText: {
	  color: '#ffffff', 
	  fontSize: 16,
	},
  });  

export default LoginPage;
