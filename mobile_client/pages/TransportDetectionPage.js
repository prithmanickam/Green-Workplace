import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, Button, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import Toast from 'react-native-toast-message';
import ModalDropdown from 'react-native-modal-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	const transportOptions = ['Car', 'Bicycle', 'Bus', 'Train', 'Walking', 'Motorcycle', 'ElectricCar', 'Scooter', 'Subway', 'Tram'];

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
					timeInterval: 3000,
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
		var R = 6371; // Radius of the Earth in km
		var dLat = deg2rad(lat2 - lat1);
		var dLon = deg2rad(lon2 - lon1);
		var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c; // Distance in km
		return d * 1000; // Convert to meters
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

	// send data and get transport detection result
	useEffect(() => {

		if (isPredicting) {

			console.log(currentDistanceTravelledRef.current)

			console.log("Accel Data Ref Length:", accelerometerDataRef.current.length);
			console.log("Gyro Data Ref Length:", gyroscopeDataRef.current.length);

			const latestAccelerometerData = accelerometerDataRef.current;
			const latestGyroscopeData = gyroscopeDataRef.current;

			// Only proceed if we have enough data
			if (latestAccelerometerData.length > 8 && latestGyroscopeData.length > 8 && !isFetching) {
				setIsFetching(true);

				fetchInProgress = true;
				const accelerometerStats = calculateStats(latestAccelerometerData);
				const gyroscopeStats = calculateStats(latestGyroscopeData);

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

				console.log("newData: ", newData)


				// Send this sensor data to the backend
				fetch(`https://green-workplace.onrender.com/api/getTransportMode`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(newData),
				})
					.then((response) => response.json())
					.then((data) => {
						if (data.status === "ok") {

							let accurateMode = data.mode

							if ((currentDistanceTravelledRef.current < 15) && (data.mode != "Walking")) {
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

							// Resets the sensor data when mode fetched
							setAccelerometerData([])
							setGyroscopeData([])
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
		}

	}, [transportModes, accelerometerData, gyroscopeData]);

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
		if (modes.length === 0) return [];

		const vehicleModes = ['Car', 'Bus', 'Train'];
		const isWalking = (mode) => mode === 'Walking';
		const isVehicle = (mode) => vehicleModes.includes(mode);

		let currentGroup = [];
		let groupedModes = [];
		let walkingCountAfterVehicle = 0;
		let groupStartIndex = 0;

		const addGroup = (groupModes, start, end) => {
			if (groupModes.length === 0) return;

			const mode = getMostFrequentVehicleMode(groupModes);
			groupedModes.push({ mode: mode || 'Walking', startTime: modes[start].time, endTime: modes[end].time });
		};

		modes.forEach((item, index) => {
			if (isWalking(item.mode)) {
				if (currentGroup.some(isVehicle)) {
					walkingCountAfterVehicle++;
				}
			} else if (isVehicle(item.mode)) {
				walkingCountAfterVehicle = 0;
			}

			currentGroup.push(item.mode);

			if (walkingCountAfterVehicle >= 4 || index === modes.length - 1) {
				addGroup(currentGroup, groupStartIndex, index - walkingCountAfterVehicle);
				currentGroup = [];
				groupStartIndex = index + 1 - walkingCountAfterVehicle;
				walkingCountAfterVehicle = 0;
			}
		});

		return groupedModes;
	};

	const getMostFrequentVehicleMode = (groupModes) => {
		const vehicleModes = ['Car', 'Bus', 'Train'];
		const modeCounts = groupModes.reduce((acc, mode) => {
			if (vehicleModes.includes(mode)) {
				acc[mode] = (acc[mode] || 0) + 1;
			}
			return acc;
		}, {});

		let mostFrequentMode = null;
		let maxCount = 0;

		for (const mode in modeCounts) {
			if (modeCounts[mode] > maxCount) {
				mostFrequentMode = mode;
				maxCount = modeCounts[mode];
			}
		}

		return mostFrequentMode;
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
			<Text>{text}</Text>
			<Text>Distance travelled since last detection: {currentDistanceTravelledRef.current?.toFixed(2)}</Text>
			<Text>Accelerometer Data:</Text>
			<Text>x: {currentAcceleration.x?.toFixed(2)}, y: {currentAcceleration.y?.toFixed(2)}, z: {currentAcceleration.z?.toFixed(2)}</Text>

			<Text>Gyroscope Data:</Text>
			<Text>x: {currentGyroscope.x?.toFixed(2)}, y: {currentGyroscope.y?.toFixed(2)}, z: {currentGyroscope.z?.toFixed(2)}</Text>


			<Button
				title={isPredicting ? "Stop Predicting" : "Start Predicting"}
				onPress={isPredicting ? stopPredicting : startPredicting}
			/>


			<ScrollView style={styles.scrollView}>
				{transportModes.map((item, index) => (
					<Text key={index} style={styles.textItem}>
						{item.mode} - {item.time}
					</Text>
				))}
			</ScrollView>

			{predictionEnded && (
				<View>
					<Text>Primary Transport Modes:</Text>
					{getPrimaryTransportModes(transportModes).map((mode, index) => (
						<Text key={index}>{mode.mode} from {mode.endTime} to {mode.startTime}</Text>
					))}

					<Text style={styles.label}>Select Day:</Text>
					<ModalDropdown
						options={daysOfWeek}
						onSelect={(index, value) => setSelectedDay(value)}
						style={styles.dropdown}
						textStyle={styles.dropdownText}
						dropdownTextStyle={styles.dropdownTextStyle}
					/>
					<Text style={styles.label}>{userData?.firstname}:</Text>

					<Text style={styles.label}>Select Transport Mode:</Text>
					<ModalDropdown
						options={transportOptions}
						onSelect={(index, value) => setTransportMode(value)}
						style={styles.dropdown}
						textStyle={styles.dropdownText}
						dropdownTextStyle={styles.dropdownTextStyle}
					/>


					<TextInput
						placeholder="Duration (HH:MM)"
						value={duration}
						onChangeText={setDuration}
						style={styles.textInput}
					/>

					<Button title="Add Entry" onPress={addEntry} />

					{entries.map((entry, index) => (
						<View key={index} style={styles.entryContainer}>
							<Text style={styles.entryText}>{entry.mode} - {entry.time} - {entry.carbonFootprint} kg CO2</Text>
							<Button title="Delete" onPress={() => deleteEntry(index)} />
						</View>
					))}

					<Text>Total Carbon Footprint: {totalCarbonFootprint} kg CO2</Text>

					{/* Team Fields */}
					{teams.map((team, index) => (
						<View key={index} style={styles.teamContainer}>
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
						color="green" // Or your preferred color
					/>

				</View>
			)}

			<StatusBar style="auto" />

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	scrollView: {
		maxHeight: 100,
		width: '80%',
		marginHorizontal: 20,
		borderWidth: 1,
		borderColor: '#007bff',
		borderRadius: 10,
	},
	textItem: {
		marginVertical: 5,
	}
});