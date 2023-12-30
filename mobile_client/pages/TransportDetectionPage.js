import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, Button, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import Toast from 'react-native-toast-message';
import ModalDropdown from 'react-native-modal-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { WaveIndicator } from 'react-native-indicators';

const CO2_EMISSIONS_PER_MINUTE = {
	Car: 0.009,
	Bicycle: 0,
	Bus: 0.0022,
	Train: 0.0005,
	Walking: 0,
	Motorcycle: 0.005,
	ElectricCar: 0.001,
	Scooter: 0.003,
	Subway: 0.0003,
	Tram: 0.0004
};

export default function TransportDetectionPage() {
	const [location, setLocation] = useState(null);
	const [previousLocation, setPreviousLocation] = useState(null);
	const [distanceTraveled, setDistanceTraveled] = useState(0);
	const [errorMsg, setErrorMsg] = useState(null);

	const [currentAcceleration, setCurrentAcceleration] = useState({});
	const [currentGyroscope, setCurrentGyroscope] = useState({});

	const [transportModes, setTransportModes] = useState([]);

	const [gyroscopeData, setGyroscopeData] = useState([]);
	const [accelerometerData, setAccelerometerData] = useState([]);

	const accelerometerDataRef = useRef([]);
	const gyroscopeDataRef = useRef([]);

	const [currentDistanceTravelled, setCurrentDistanceTravelled] = useState(0);

	const currentDistanceTravelledRef = useRef(0);

	const [isFetching, setIsFetching] = useState(false);

	const [isPredicting, setIsPredicting] = useState(false);
	const [predictionEnded, setPredictionEnded] = useState(false);

	const [selectedDay, setSelectedDay] = useState('');
	const [transportMode, setTransportMode] = useState('');
	const [entries, setEntries] = useState([]);
	const [duration, setDuration] = useState('');
	const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);
	const [teams, setTeams] = useState([]);
	const [teamPercentages, setTeamPercentages] = useState({});
	const [totalPercentage, setTotalPercentage] = useState(0);

	const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
	const transportOptions = ['Car', 'Bicycle', 'Bus', 'Train', 'Walking', 'Motorcycle', 'ElectricCar', 'Scooter', 'Subway', 'Tram'];

	const getIconName = (mode) => {
		switch (mode) {
			case 'Car':
				return 'car';
			case 'Bicycle':
				return 'bicycle';
			case 'Bus':
				return 'bus';
			case 'Train':
				return 'train';
			case 'Still':
				return 'male';
			case 'Walking':
				return 'walking';
			case 'Motorcycle':
				return 'motorcycle';
			case 'ElectricCar':
				return 'bolt';
			case 'Scooter':
				return 'street-view';
			case 'Subway':
				return 'subway';
			case 'Tram':
				return 'train';
			default:
				return 'question-circle';
		}
	};

	const [userData, setUserData] = useState(null);

	useEffect(() => {
		const fetchUserData = async () => {
			const token = await AsyncStorage.getItem('token');
			if (token) {
				try {
					const response = await fetch(`https://green-workplace.onrender.com/api/userData`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ token }),
					});
					const data = await response.json();
					if (data.status === 'ok') {
						console.log("hi")
						setUserData(data.data);
					} else {
						console.log("Cannot get user data")
					}
				} catch (error) {
					console.log("Execption occured when trying to get user data")
				}
			}
		};

		fetchUserData();
	}, []);


	const handleTeamPercentageChange = (teamName, newValue) => {
		const newPercentages = { ...teamPercentages };
		newPercentages[teamName] = newValue;
		setTeamPercentages(newPercentages);

		// Recalculate total percentage
		const total = Object.values(newPercentages).reduce(
			(accumulator, percentage) => accumulator + parseFloat(percentage || 0),
			0
		);
		setTotalPercentage(total);
	};

	// Function to calculate the team's share of the carbon footprint
	const calculateTeamCarbonFootprint = (teamName) => {
		const percentage = parseFloat(teamPercentages[teamName] || 0);
		return ((percentage / 100) * parseFloat(totalCarbonFootprint)).toFixed(2);
	};


	const calculateCarbonFootprint = (mode, time) => {
		const [hours, minutes] = time.split(':').map(Number);
		const totalMinutes = hours * 60 + minutes;
		return (CO2_EMISSIONS_PER_MINUTE[mode] * totalMinutes).toFixed(2);
	};

	const updateTotalCarbonFootprint = () => {
		const total = entries.reduce((sum, entry) => sum + parseFloat(entry.carbonFootprint || 0), 0);
		setTotalCarbonFootprint(total.toFixed(2));
	};

	const addEntry = () => {
		const carbonFootprint = calculateCarbonFootprint(transportMode, duration);
		const newEntries = [...entries, { mode: transportMode, time: duration, carbonFootprint }];

		// Calculate the total using newEntries
		const newTotal = newEntries.reduce((sum, entry) => sum + parseFloat(entry.carbonFootprint || 0), 0);
		setTotalCarbonFootprint(newTotal.toFixed(2));

		setEntries(newEntries);
	};

	const deleteEntry = (index) => {
		const newEntries = entries.filter((_, i) => i !== index);

		// Calculate the total using newEntries
		const newTotal = newEntries.reduce((sum, entry) => sum + parseFloat(entry.carbonFootprint || 0), 0);
		setTotalCarbonFootprint(newTotal.toFixed(2));

		setEntries(newEntries);
	};

	useEffect(() => {
		if (userData) {
			fetch(`https://green-workplace.onrender.com/api/getUserTeamsData`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user_id: userData.id,
				}),
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.status === "ok") {
						console.log("hi")
						console.log(data.data)
						const fetchedTeams = data.data;
						console.log(fetchedTeams)
						setTeams(fetchedTeams);

					} else {
						Toast.show({
							type: 'error',
							text1: 'Fetch Failed',
							text2: 'Failed to fetch teams data. Please try again.'
						});
					}
				})
				.catch((error) => {
					Toast.show({
						type: 'error',
						text1: 'Fetch Failed',
						text2: 'An error occurred while fetching teams data.'
					});
				});
		}
	}, [userData]);


	const handleSubmit = async () => {
		// Validation checks before submitting
		if (!selectedDay || totalCarbonFootprint === '0.00' || totalPercentage !== 100) {
			Toast.show({
				type: 'error',
				text1: 'Incomplete fields',
				text2: 'Please fill all the fields.'
			});
			console.error("Please fill all the fields correctly.");
			return;
		}

		// Prepare data for each team before posting carbon footprint info
		const teamData = teams.map(team => ({
			team_id: team.teamId,
			calculatedCarbonFootprint: calculateTeamCarbonFootprint(team.teamName)
		}));

		try {
			const response = await fetch(`https://green-workplace.onrender.com/api/postCarbonFootprint`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user_id: userData.id,
					day: selectedDay,
					duration: entries.reduce((sum, entry) => sum + entry.time, 0), // Calculate total duration
					carbonFootprint: totalCarbonFootprint,
					teamData,
				}),
			});
			const data = await response.json();
			if (data.status === "ok") {
				console.log("Submission Successful");
				Alert.alert("Success", "Carbon stats saved successfully!");
			} else {
				console.error("Submission Failed");
				Alert.alert("Error", "Failed to save carbon stats.");
			}
		} catch (error) {
			console.error("An error occurred:", error);
			Alert.alert("Error", "An error occurred while saving carbon stats.");
		}
	};


	const startPredicting = () => {
		setIsPredicting(true);
		setPredictionEnded(false);
		setTransportModes([]); // Reset transport modes
		setDistanceTraveled(0);
		setCurrentDistanceTravelled(0);
	};

	const stopPredicting = () => {
		setIsPredicting(false);
		setPredictionEnded(true);
		addPrimaryTransportModeEntries();
	};

	useEffect(() => {
		Accelerometer.setUpdateInterval(1000);
		Gyroscope.setUpdateInterval(1000);

		const accelSubscription = Accelerometer.addListener(data => {
			setCurrentAcceleration(data);
			const gravity = 9.81;
			const x = data.x * gravity;
			const y = data.y * gravity;
			const z = data.z * gravity;

			const accelerationMagnitude = Math.sqrt((x * x) + (y * y) + (z * z));
			setAccelerometerData(currentList => [...currentList, accelerationMagnitude.toFixed(2)]);
		});

		const gyroSubscription = Gyroscope.addListener(data => {
			setCurrentGyroscope(data);
			const gyroscopeMagnitude = Math.sqrt((data.x * data.x) + (data.y * data.y) + (data.z * data.z));
			setGyroscopeData(currentList => [...currentList, gyroscopeMagnitude.toFixed(2)]);
		});

		return () => {
			accelSubscription.remove();
			gyroSubscription.remove();
		};
	}, []);

	useEffect(() => {
		let locationSubscription;

		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied');
				return;
			}

			locationSubscription = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.High,
					timeInterval: 2000,
					distanceInterval: 1,
				},
				(newLocation) => {

					const accelDataLength = accelerometerDataRef.current.length;
					if (accelDataLength === 0) {
						setCurrentDistanceTravelled(0);

					}

					if (previousLocation) {
						const distance = getDistanceFromLatLonInMeters(
							previousLocation.coords.latitude,
							previousLocation.coords.longitude,
							newLocation.coords.latitude,
							newLocation.coords.longitude
						);
						if (isPredicting) {
							setDistanceTraveled(prevDistance => prevDistance + distance);
							setCurrentDistanceTravelled(current => parseFloat(current) + distance);
						}
					}

					setPreviousLocation(newLocation);
					setLocation(newLocation);
				}
			);
		})();

		return () => {
			if (locationSubscription) {
				locationSubscription.remove();
			}
		};
	}, [previousLocation]);

	function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
		var R = 6371000; // Radius of the Earth in meters
		var dLat = deg2rad(lat2 - lat1);
		var dLon = deg2rad(lon2 - lon1);
		var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c; // Distance in meters
		return d;
	}

	function deg2rad(deg) {
		return deg * (Math.PI / 180);
	}

	let text = 'Waiting...';
	if (errorMsg) {
		text = errorMsg;
	} else if (location) {
		text = `Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}\nTotal Distance traveled: ${distanceTraveled.toFixed(2)} meters`;
	}

	// Function to calculate stats
	const calculateStats = (data) => {

		// Ensure that data is an array of numbers 
		const numericData = data.map(d => parseFloat(d)).filter(isFinite);

		console.log("numeric DATA to calculate:", numericData)

		if (numericData.length === 0) {
			console.log("in here where data len is 0")
			return { mean: null, min: null, max: null, std: null };
		}

		const sum = numericData.reduce((a, b) => a + b, 0);
		console.log("sum", sum, "data len", numericData.length)
		const mean = sum / numericData.length;
		const min = Math.min(...numericData);
		const max = Math.max(...numericData);

		// Calculate standard deviation
		const variance = numericData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numericData.length;
		const std = Math.sqrt(variance);

		console.log(mean, min, max, std)

		return {
			mean: parseFloat(mean.toFixed(5)),
			min: parseFloat(min.toFixed(5)),
			max: parseFloat(max.toFixed(5)),
			std: parseFloat(std.toFixed(5)),
		};
	};

	// every 10 seconds it send data and get transport detection result
	useEffect(() => {
		const fetchData = () => {
			console.log(currentDistanceTravelledRef.current);
			console.log("Accel Data Ref Length:", accelerometerDataRef.current.length);
			console.log("Gyro Data Ref Length:", gyroscopeDataRef.current.length);

			if (!isFetching) {
				setIsFetching(true);

				const accelerometerStats = calculateStats(accelerometerDataRef.current);
				const gyroscopeStats = calculateStats(gyroscopeDataRef.current);

				const newData = {
					'android.sensor.accelerometer#mean': accelerometerStats.mean,
					'android.sensor.accelerometer#min': accelerometerStats.min,
					'android.sensor.accelerometer#max': accelerometerStats.max,
					'android.sensor.accelerometer#std': accelerometerStats.std,
					'android.sensor.gyroscope#mean': gyroscopeStats.mean,
					'android.sensor.gyroscope#min': gyroscopeStats.min,
					'android.sensor.gyroscope#max': gyroscopeStats.max,
					'android.sensor.gyroscope#std': gyroscopeStats.std,
				};

				console.log("newData: ", newData);

				// Send this sensor data to the backend
				fetch(`https://green-workplace.onrender.com/api/getTransportMode`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						newData,
						distance:currentDistanceTravelledRef.current,
					}),
						
				})
					.then((response) => response.json())
					.then((data) => {
						if (data.status === "ok") {
							let accurateMode = data.mode;
							if (currentDistanceTravelledRef.current < 20 && data.mode !== "Walking") {
								accurateMode = "Still";
							}

							const currentTime = new Date().toLocaleTimeString();
							const modeWithTime = { mode: accurateMode, time: currentTime };
							setTransportModes(modes => [modeWithTime, ...modes]);
							Toast.show({
								type: 'success',
								text1: 'Transport Mode Fetched',
								text2: 'Fetched transport mode: ' + accurateMode
							});

							setAccelerometerData([]);
							setGyroscopeData([]);
						} else {
							Toast.show({
								type: 'error',
								text1: 'Fetch Failed',
								text2: 'Failed to fetch user carbon data for teams.'
							});
						}
					})
					.catch((error) => {
						console.error('Error:', error);
						Toast.show({
							type: 'error',
							text1: 'Network Error',
							text2: 'Error fetching transport mode.'
						});
					})
					.finally(() => {
						// Reset data and indicate fetch is complete
						accelerometerDataRef.current = [];
						gyroscopeDataRef.current = [];
						currentDistanceTravelledRef.current = 0;
						setIsFetching(false);
					});
			}
		};

		let interval;

		if (isPredicting) {
			interval = setInterval(fetchData, 10000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isPredicting, isFetching]);


	useEffect(() => {
		accelerometerDataRef.current = accelerometerData;
	}, [accelerometerData]);

	useEffect(() => {
		gyroscopeDataRef.current = gyroscopeData;
	}, [gyroscopeData]);

	useEffect(() => {
		currentDistanceTravelledRef.current = currentDistanceTravelled;
	}, [currentDistanceTravelled]);


	// Algorithm to predict overall journey from the transport predicted data
	const getPrimaryTransportModes = (modes) => {
		const addSummaryEntry = (mode, start, end) => {
			summary.push({ mode, startTime: start, endTime: end });
		};

		const vehicleModes = ["Car", "Bus", "Train"];
		let summary = [];
		let currentMode = modes[0].mode === 'Still' ? 'Walking' : modes[0].mode;
		let startTime = modes[0].time;
		let walkingCounter = 0;
		let modeSequence = [];

		modes.forEach((entry, index) => {
			let mode = entry.mode === 'Still' ? 'Walking' : entry.mode;
			let time = entry.time;

			if (vehicleModes.includes(mode)) {
				walkingCounter = 0;
				modeSequence.push(mode);
				if (currentMode === 'Walking') {
					addSummaryEntry(currentMode, startTime, modes[index - 1].time);
					currentMode = mode;
					startTime = time;
				}
			} else if (mode === 'Walking') {
				walkingCounter++;
				if (walkingCounter >= 5 && vehicleModes.includes(currentMode)) {
					let mostCommonMode = modeSequence.sort((a, b) =>
						modeSequence.filter(v => v === a).length - modeSequence.filter(v => v === b).length
					).pop();
					addSummaryEntry(mostCommonMode, startTime, modes[index - 5].time);
					currentMode = 'Walking';
					startTime = modes[index - 4].time;
					modeSequence = [];
				}
			} else {
				walkingCounter = 0;
			}
		});

		if (currentMode === 'Walking' || modeSequence.length) {
			let mostCommonMode = modeSequence.length ? modeSequence.sort((a, b) =>
				modeSequence.filter(v => v === a).length - modeSequence.filter(v => v === b).length
			).pop() : currentMode;
			addSummaryEntry(mostCommonMode, startTime, modes[modes.length - 1].time);
		}

		return summary;
	};


	// Function to calculate the duration between two times in HH:MM format
	const calculateDuration = (startTime, endTime) => {

		const formatTime = (timeStr) => {
			const [hours, minutes, seconds] = timeStr.split(':').map(Number);
			return new Date(2000, 0, 1, hours, minutes, seconds);
		};

		const start = formatTime(endTime);
		const end = formatTime(startTime);

		let durationMinutes = (end - start) / 60000; // Duration in minutes
		if (durationMinutes < 0) {
			durationMinutes += 24 * 60; // Adjust for times past midnight
		}

		const hours = Math.floor(durationMinutes / 60);
		const minutes = Math.floor(durationMinutes % 60);
		console.log(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	};


	// Function to process primary transport modes and add them as entries
	const addPrimaryTransportModeEntries = () => {
		getPrimaryTransportModes(transportModes).forEach(primaryMode => {
			const modeDuration = calculateDuration(primaryMode.startTime, primaryMode.endTime);
			const carbonFootprint = calculateCarbonFootprint(primaryMode.mode, modeDuration);
			setEntries(currentEntries => [
				...currentEntries,
				{ mode: primaryMode.mode, time: modeDuration, carbonFootprint: carbonFootprint }
			]);
		});
	};


	return (
		<View style={styles.container}>
			<Toast ref={(ref) => Toast.setRef(ref)} />

			<Text>Mobile Sensor and GPS Data</Text>
			<ScrollView style={styles.scrollView}>

				<Text>{text}</Text>
				<Text>Distance travelled since last detection: {currentDistanceTravelledRef.current?.toFixed(2)}m</Text>
				<Text>Accelerometer Data:</Text>
				<Text>x: {currentAcceleration.x?.toFixed(2)}, y: {currentAcceleration.y?.toFixed(2)}, z: {currentAcceleration.z?.toFixed(2)}</Text>

				<Text>Gyroscope Data:</Text>
				<Text>x: {currentGyroscope.x?.toFixed(2)}, y: {currentGyroscope.y?.toFixed(2)}, z: {currentGyroscope.z?.toFixed(2)}</Text>
			</ScrollView>


			<Button
				title={isPredicting ? "Stop Predicting" : "Start Predicting"}
				onPress={isPredicting ? stopPredicting : startPredicting}
				color={isPredicting ? "#CC0000" : "green"}
			/>


			{isPredicting &&
				<View style={styles.indicatorContainer}>
					<WaveIndicator color="#1ED760" />
				</View>
			}

			<Text>Transport Detection History</Text>

			<ScrollView style={styles.scrollView}>
				{transportModes.map((item, index) => (
					<View key={index} style={styles.textAndIcon}>
						<Icon name={getIconName(item.mode)} size={20} color="#000" />
						<Text style={styles.textStyle}>
							{item.mode} - {item.time}
						</Text>
					</View>
				))}
			</ScrollView>

			{predictionEnded && (
				<Text>Ammend Your Predicted Commute Journey</Text>
			)}

			{predictionEnded && (
				<ScrollView style={styles.largerScrollView}>

					<Text style={styles.centeredBoldText}>Automatically Added Transport Entries:</Text>
					{getPrimaryTransportModes(transportModes).map((mode, index) => (
						<Text key={index}>{mode.mode} from {mode.endTime} to {mode.startTime}</Text>
					))}

					<View style={styles.divider} />

					<Text style={styles.centeredBoldText}>Add/Delete Transport Entries:</Text>

					<View style={styles.row}>
						<Text style={styles.label}>Select Day:</Text>
						<ModalDropdown
							options={dayOptions}
							onSelect={(index, value) => setSelectedDay(value)}
							style={styles.dropdown}
							textStyle={styles.dropdownText}
							dropdownTextStyle={styles.dropdownTextStyle}
						/>
					</View>

					<View style={styles.row}>
						<Text style={styles.label}>Select Transport Mode:</Text>
						<ModalDropdown
							options={transportOptions}
							onSelect={(index, value) => setTransportMode(value)}
							style={styles.dropdown}
							textStyle={styles.dropdownText}
							dropdownTextStyle={styles.dropdownTextStyle}
						/>
					</View>

					<View style={styles.row}>
						<Text style={styles.label}>Duration of Mode:</Text>
						<TextInput
							placeholder="(HH:MM)"
							value={duration}
							onChangeText={setDuration}
							style={styles.textInput}
						/>
					</View>


					<Button title="Add Entry" onPress={addEntry} />

					{entries.map((entry, index) => (
						<View key={index} style={styles.entryContainer}>
							<Icon
								name={getIconName(entry.mode)}
								size={20}
								color="black"
								onPress={() => deleteEntry(index)}
							/>
							<Text style={styles.entryText}>{entry.mode} - {entry.time} - {entry.carbonFootprint} kg CO2</Text>
							<Icon
								name="trash"
								size={20}
								color="red"
								onPress={() => deleteEntry(index)}
							/>
						</View>
					))}

					<Text>Total Carbon Footprint: {totalCarbonFootprint} kg CO2</Text>

					<View style={styles.divider} />

					<Text style={styles.centeredBoldText}>Distribute Footprint to Your Teams</Text>

					{/* Team Fields */}
					{teams.map((team, index) => (
						<View key={index} >
							<Text style={styles.teamName}>{team.teamName}</Text>
							<TextInput
								style={styles.teamInput}
								value={teamPercentages[team.teamName]}
								onChangeText={(value) => handleTeamPercentageChange(team.teamName, value)}
								keyboardType="numeric"
								placeholder="Percentage"
							/>
							<Text style={styles.teamFootprint}>
								Carbon Footprint: {calculateTeamCarbonFootprint(team.teamName)} kg CO2
							</Text>
						</View>
					))}

					{/* Submit Button */}
					<Button
						title="Submit"
						onPress={handleSubmit}
						color="green"
					/>

				</ScrollView>
			)}
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F5F5',
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollView: {
		maxHeight: 100,
		width: '80%',
		marginHorizontal: 20,
		marginVertical: 10,
		borderWidth: 1,
		borderColor: 'grey',
		borderRadius: 10,
		backgroundColor: '#fff',
	},
	largerScrollView: {
		maxHeight: 250,
		width: '80%',
		marginHorizontal: 20,
		marginVertical: 10,
		borderWidth: 1,
		borderColor: 'grey',
		borderRadius: 10,
		backgroundColor: '#fff',
	},
	textItem: {
		marginVertical: 5,
	},

	indicatorContainer: {
		width: 50,
		height: 50,
		justifyContent: 'center',
		alignItems: 'center',

	},

	textAndIcon: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 4,
	},

	// space between icon and text
	textStyle: {
		marginLeft: 10,
		marginRight: 10,
	},

	entryContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 10,
	},

	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 10,
	},

	label: {
		marginRight: 10,
	},

	divider: {
		width: '90%',
		alignSelf: 'center',
		height: 1,
		backgroundColor: 'grey',
		marginVertical: 10,
	},
	centeredBoldText: {
		textAlign: 'center',
		fontWeight: 'bold',
	},


});