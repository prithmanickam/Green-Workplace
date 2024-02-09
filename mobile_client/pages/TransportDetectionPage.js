import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, Modal, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import RNPickerSelect from 'react-native-picker-select';
import CustomModal from '../components/CustomModel';
import { WaveIndicator } from 'react-native-indicators';
import { modalStyles } from '../styles/ModalStyles';

const CO2_EMISSIONS_PER_METER = {
	Car: 0.00016637,
	Bicycle: 0,
	Bus: 0.0001195,
	Train: 0.00003694,
	Walking: 0,
	Motorcycle: 0.00010086,
	ElectricCar: 0.00005563,
	Subway: 0.0000275,
	Tram: 0.0000202
};

// multiplied by 500 (Average speed in meters per minute)
const CO2_EMISSIONS_PER_MINUTE = {
	Car: 0.083185,
	Bicycle: 0,
	Bus: 0.03585,
	Train: 0.03077102,
	Walking: 0,
	Motorcycle: 0.05043,
	ElectricCar: 0.027815,
	Subway: 0.011,
	Tram: 0.00404
};

const DIESEL_EMISSION_FACTOR = 0.966;

const PASTEL_COLORS = {
	Car: '#f8a5c2',
	Bicycle: '#b8e994',
	Walking: '#b8e994',
	default: '#ffdd71'
};


export default function TransportDetectionPage() {
	const [location, setLocation] = useState(null);
	const [previousLocation, setPreviousLocation] = useState(null);
	const [distanceTraveled, setDistanceTraveled] = useState(0);
	const [errorMsg, setErrorMsg] = useState(null);
	const [transportModes, setTransportModes] = useState([]);

	const [currentAcceleration, setCurrentAcceleration] = useState({});
	const [currentGyroscope, setCurrentGyroscope] = useState({});

	const currentWindowRef = useRef(1);

	//window1

	const [gyroscopeData, setGyroscopeData] = useState([]);
	const [accelerometerData, setAccelerometerData] = useState([]);
	const accelerometerDataRef = useRef([]);
	const gyroscopeDataRef = useRef([]);

	const [currentDistanceTravelled, setCurrentDistanceTravelled] = useState(0);
	const currentDistanceTravelledRef = useRef(0);

	//window2

	const [gyroscopeDataW2, setGyroscopeDataW2] = useState([]);
	const [accelerometerDataW2, setAccelerometerDataW2] = useState([]);
	const accelerometerDataRefW2 = useRef([]);
	const gyroscopeDataRefW2 = useRef([]);

	const [currentDistanceTravelledW2, setCurrentDistanceTravelledW2] = useState(0);
	const currentDistanceTravelledRefW2 = useRef(0);


	const [showSensorData, setShowSensorData] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [isPredicting, setIsPredicting] = useState(false);
	const [predictionEnded, setPredictionEnded] = useState(false);
	const [transportMode, setTransportMode] = useState(null);
	const [entries, setEntries] = useState([]);
	const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(0);
	const [teams, setTeams] = useState([]);
	const [teamPercentages, setTeamPercentages] = useState({});
	const [totalPercentage, setTotalPercentage] = useState(0);

	const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
	const transportOptions = ['Car', 'Bicycle', 'Bus', 'Train', 'Walking', 'Motorcycle', 'ElectricCar', 'Subway', 'Tram'];
	const percentageOptions = Array.from({ length: 101 }, (_, i) => ({ label: `${i}%`, value: i.toString() }));
	const dayPickerItems = dayOptions.map(day => ({ label: day, value: day }));
	const transportPickerItems = transportOptions.map(mode => ({ label: mode, value: mode }));
	const hourOptions = Array.from({ length: 24 }, (_, i) => ({ label: `${i}`.padStart(2, '0'), value: `${i}`.padStart(2, '0') }));
	const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ label: `${i}`.padStart(2, '0'), value: `${i}`.padStart(2, '0') }));
	const [durationHour, setDurationHour] = useState('');
	const [durationMinute, setDurationMinute] = useState('');
	const [sameReturnJourney, setSameReturnJourney] = useState("Yes");
	const [carSettings, setCarSettings] = useState({ engineType: 'petrol', passengers: 1 });
	const [showCarSettingsModal, setShowCarSettingsModal] = useState(false);
	const [editingEntryIndex, setEditingEntryIndex] = useState(-1);

	const getCurrentDay = () => {
		const today = new Date().getDay();
		const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
		if (today === 0 || today === 6) {
			return '';
		}
		return weekdays[today - 1];
	};

	const [selectedDay, setSelectedDay] = useState(getCurrentDay());
	const [successModalVisible, setSuccessModalVisible] = useState(false);
	const [errorTransportModalVisible, setErrorTransportModalVisible] = useState(false);
	const [errorDayModalVisible, setErrorDayModalVisible] = useState(false);
	const [errorPercentagesModalVisible, setErrorPercentagesModalVisible] = useState(false);
	const [errorSubmitModalVisible, setErrorSubmitModalVisible] = useState(false);
	const [showHelpModal, setShowHelpModal] = useState(false);


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
		setTeamPercentages(prevPercentages => ({
			...prevPercentages,
			[teamName]: newValue
		}));

		const total = Object.values({ ...teamPercentages, [teamName]: newValue })
			.reduce((acc, value) => acc + Number(value), 0);
		setTotalPercentage(total);
	};


	// Function to calculate the team's share of the carbon footprint
	const calculateTeamCarbonFootprint = (teamName) => {
		const percentage = parseFloat(teamPercentages[teamName] || 0);
		let newFootprint = totalCarbonFootprint
		if (sameReturnJourney == "Yes") {
			newFootprint = totalCarbonFootprint * 2
		}
		return ((percentage / 100) * parseFloat(newFootprint)).toFixed(2);
	};


	const calculateCarbonFootprintUsingTime = (mode, time, engineType = 'petrol', passengers = 1) => {
		const [hours, minutes] = time.split(':').map(Number);
		const totalMinutes = hours * 60 + minutes;
		let emissionRate = CO2_EMISSIONS_PER_MINUTE[mode];

		if (mode === 'Car') {
			emissionRate *= engineType === 'diesel' ? DIESEL_EMISSION_FACTOR : 1;
		}

		return (emissionRate * totalMinutes / passengers).toFixed(1);
	};

	const calculateCarbonFootprintUsingDistance = (mode, distance, engineType = 'petrol', passengers = 1) => {
		let emissionRate = CO2_EMISSIONS_PER_METER[mode];

		if (mode === 'Car') {
			emissionRate *= engineType === 'diesel' ? DIESEL_EMISSION_FACTOR : 1;
		}

		return (emissionRate * distance / passengers).toFixed(1);
	};

	const updateTotalCarbonFootprint = (updatedEntries) => {
		const total = updatedEntries.reduce((sum, entry) => {
			return sum + parseFloat(entry.carbonFootprint || 0);
		}, 0);
		setTotalCarbonFootprint(total.toFixed(2));
	};

	const addEntry = () => {
		if (transportMode === null) {
			setErrorTransportModalVisible(true);
			return;
		}

		// Reset carSettings to default values when adding a new Car entry
		if (transportMode === 'Car') {
			setCarSettings({ engineType: 'petrol', passengers: 1 });
		}

		let combinedDuration;

		if (durationHour == '') {
			combinedDuration = `00:${durationMinute}`;
		}
		if (durationMinute == '') {
			combinedDuration = `${durationHour}:00`;
		}
		if ((durationMinute == '') && (durationHour == '')) {
			combinedDuration = `00:00`;
		}

		let carbonFootprint;
		if (transportMode === 'Car') {
			// Use default car settings for new entry
			carbonFootprint = calculateCarbonFootprintUsingTime(transportMode, combinedDuration, 'petrol', 1);
		} else {
			carbonFootprint = calculateCarbonFootprintUsingTime(transportMode, combinedDuration);
		}
		const newEntry = { mode: transportMode, time: combinedDuration, carbonFootprint, distance: "N/A" };

		setEntries([...entries, newEntry]);
		updateTotalCarbonFootprint([...entries, newEntry]); // Recalculate total carbon footprint
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
						const fetchedTeams = data.data;
						setTeams(fetchedTeams);
						const initialPercentages = fetchedTeams.reduce((acc, team) => {
							acc[team.teamName] = '0';
							return acc;
						}, {});
						setTeamPercentages(initialPercentages);

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
		if (!selectedDay) {
			setErrorDayModalVisible(true);
			return;
		}
		if (totalPercentage !== 100) {
			setErrorPercentagesModalVisible(true);
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
					duration: calculateTotalDuration(),
					carbonFootprint: totalCarbonFootprint,
					teamData,
				}),
			});
			const data = await response.json();
			if (data.status === "ok") {
				setSuccessModalVisible(true);
			} else {
				setErrorSubmitModalVisible(true);
			}
		} catch (error) {
			setErrorSubmitModalVisible(true);
		}
	};

	const startPredicting = () => {
		setIsPredicting(true);
		setPredictionEnded(false);
		setTransportModes([]);
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
			setAccelerometerDataW2(currentList => [...currentList, accelerationMagnitude.toFixed(2)]);
		});

		const gyroSubscription = Gyroscope.addListener(data => {
			setCurrentGyroscope(data);
			const gyroscopeMagnitude = Math.sqrt((data.x * data.x) + (data.y * data.y) + (data.z * data.z));
			setGyroscopeData(currentList => [...currentList, gyroscopeMagnitude.toFixed(2)]);
			setGyroscopeDataW2(currentList => [...currentList, gyroscopeMagnitude.toFixed(2)]);
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
					timeInterval: 8000,
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
							setCurrentDistanceTravelledW2(current => parseFloat(current) + distance);
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
		const R = 6371000; // Radius of the Earth in meters
		const dLat = deg2rad(lat2 - lat1);
		const dLon = deg2rad(lon2 - lon1);
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
			Math.sin(dLon / 2) * Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		const d = R * c; // Distance in meters
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

		if (numericData.length === 0) {
			return { mean: null, min: null, max: null, std: null };
		}

		const sum = numericData.reduce((a, b) => a + b, 0);
		const mean = sum / numericData.length;
		const min = Math.min(...numericData);
		const max = Math.max(...numericData);

		// Calculate standard deviation
		const variance = numericData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numericData.length;
		const std = Math.sqrt(variance);

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


			if (!isFetching) {
				setIsFetching(true);

				console.log(currentWindowRef.current)
				let newData = {}

				if (currentWindowRef.current === 1) {
					const accelerometerStats = calculateStats(accelerometerDataRef.current);
					const gyroscopeStats = calculateStats(gyroscopeDataRef.current);

					newData = {
						'distance_meters_ten_sec': currentDistanceTravelledRef.current,
						'android.sensor.accelerometer#mean': accelerometerStats.mean,
						'android.sensor.accelerometer#min': accelerometerStats.min,
						'android.sensor.accelerometer#max': accelerometerStats.max,
						'android.sensor.accelerometer#std': accelerometerStats.std,
						'android.sensor.gyroscope#mean': gyroscopeStats.mean,
						'android.sensor.gyroscope#min': gyroscopeStats.min,
						'android.sensor.gyroscope#max': gyroscopeStats.max,
						'android.sensor.gyroscope#std': gyroscopeStats.std,
					};
				} else {
					const accelerometerStats = calculateStats(accelerometerDataRefW2.current);
					const gyroscopeStats = calculateStats(gyroscopeDataRefW2.current);

					newData = {
						'distance_meters_ten_sec': currentDistanceTravelledRefW2.current,
						'android.sensor.accelerometer#mean': accelerometerStats.mean,
						'android.sensor.accelerometer#min': accelerometerStats.min,
						'android.sensor.accelerometer#max': accelerometerStats.max,
						'android.sensor.accelerometer#std': accelerometerStats.std,
						'android.sensor.gyroscope#mean': gyroscopeStats.mean,
						'android.sensor.gyroscope#min': gyroscopeStats.min,
						'android.sensor.gyroscope#max': gyroscopeStats.max,
						'android.sensor.gyroscope#std': gyroscopeStats.std,
					}
				}

				// Send this sensor data to the backend
				fetch(`https://green-workplace.onrender.com/api/getTransportMode`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ newData }),
				})
					.then((response) => response.json())
					.then((data) => {
						if (data.status === "ok") {
							let accurateMode = data.mode;
							if (currentDistanceTravelledRef.current < 40 && data.mode !== "Walking") {
								accurateMode = "Still";
							}

							const currentTime = new Date().toLocaleTimeString();
							const modeWithTime = { mode: accurateMode, time: currentTime, distance: currentDistanceTravelledRef.current };
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
						Toast.show({
							type: 'error',
							text1: 'Network Error',
							text2: 'Error fetching transport mode.'
						});
					})
					.finally(() => {

						if (currentWindowRef === 1) {
							accelerometerDataRef.current = [];
							gyroscopeDataRef.current = [];
							currentDistanceTravelledRef.current = 0;
							currentWindowRef.current = 2;

						} else {
							accelerometerDataRefW2.current = [];
							gyroscopeDataRefW2.current = [];
							currentDistanceTravelledRefW2.current = 0;
							currentWindowRef.current = 1;
						}

						// Reset data and indicate fetch is complete
						setIsFetching(false);
					});
			}
		};

		let interval;

		if (isPredicting) {
			interval = setInterval(fetchData, 20000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			} 6
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

	//window2

	useEffect(() => {
		accelerometerDataRefW2.current = accelerometerDataW2;
	}, [accelerometerDataW2]);

	useEffect(() => {
		gyroscopeDataRefW2.current = gyroscopeDataW2;
	}, [gyroscopeDataW2]);

	useEffect(() => {
		currentDistanceTravelledRefW2.current = currentDistanceTravelledW2;
	}, [currentDistanceTravelledW2]);

	// Algorithm to predict overall journey from the transport predicted data
	const getPrimaryTransportModes = (modes) => {

		if (!modes || modes.length === 0) {
			return []; // Return an empty array if no valid modes are provided
		}

		const vehicleModes = ["Car", "Bus", "Train"];
		const addSummaryEntry = (mode, start, end, totalDistance) => {
			// Only add entry if start time and end time are different (else its likely a mis-detection)
			if ((start !== end) || (mode == "Walking")) {
				summary.push({ mode, startTime: start, endTime: end, distance: totalDistance });
			}
		};

		let summary = [];
		let currentMode = modes[0].mode === 'Still' ? 'Walking' : modes[0].mode;
		let startTime = modes[0].time;
		let totalDistance = 0;
		let walkingCounter = 0;
		let modeSequence = [];

		modes.forEach((entry, index) => {
			let mode = entry.mode === 'Still' ? 'Walking' : entry.mode;
			let time = entry.time;
			totalDistance += entry.distance;

			if (vehicleModes.includes(mode)) {
				walkingCounter = 0;
				modeSequence.push(mode);
				if (currentMode === 'Walking') {
					addSummaryEntry(currentMode, startTime, modes[index - 1].time, totalDistance);
					currentMode = mode;
					startTime = time;
					totalDistance = 0;
				}
			} else if (mode === 'Walking') {
				walkingCounter++;
				if (walkingCounter >= 6 && vehicleModes.includes(currentMode)) {
					let mostCommonMode = modeSequence.sort((a, b) =>
						modeSequence.filter(v => v === a).length - modeSequence.filter(v => v === b).length
					).pop();
					addSummaryEntry(mostCommonMode, startTime, modes[index - 6].time, totalDistance);
					currentMode = 'Walking';
					startTime = modes[index - 5].time;
					totalDistance = 0;
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
			addSummaryEntry(mostCommonMode, startTime, modes[modes.length - 1].time, totalDistance);
		}

		return summary.reverse();
	};

	// Function to calculate the duration between two times in HH:MM format
	const calculateDuration = (startTime, endTime) => {

		const formatTime = (timeStr) => {
			const [hours, minutes, seconds] = timeStr.split(':').map(Number);
			return new Date(2000, 0, 1, hours, minutes, seconds);
		};

		const start = formatTime(endTime);
		const end = formatTime(startTime);

		let durationMinutes = (end - start) / 60000;
		if (durationMinutes < 0) {
			durationMinutes += 24 * 60;
		}

		const hours = Math.floor(durationMinutes / 60);
		const minutes = Math.floor(durationMinutes % 60);
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	};


	// Function to process primary transport modes and add them as entries
	const addPrimaryTransportModeEntries = () => {
		getPrimaryTransportModes(transportModes).forEach(primaryMode => {
			const modeDuration = calculateDuration(primaryMode.startTime, primaryMode.endTime);
			const carbonFootprint = calculateCarbonFootprintUsingDistance(primaryMode.mode, primaryMode.distance);
			setEntries(currentEntries => [
				...currentEntries,
				{ mode: primaryMode.mode, time: modeDuration, carbonFootprint: carbonFootprint, distance: primaryMode.distance }
			]);
		});
	};

	useEffect(() => {
		if (entries.length > 0) {
			updateTotalCarbonFootprint(entries);
		}
	}, [entries]);

	// Function to convert HH:MM string to minutes
	const durationToMinutes = (duration) => {
		const [hours, minutes] = duration.split(':').map(Number);
		return hours * 60 + minutes;
	};

	// Function to convert minutes to hours minutes format
	const minutesToDuration = (totalMinutes) => {
		const hours = Math.floor(totalMinutes / 60);
		const minutes = totalMinutes % 60;
		if (hours === 0) {
			return `${minutes} min`;
		} else {
			return `${hours} hours ${minutes} min`;
		}
	};

	// Function to calculate total duration
	const calculateTotalDuration = () => {
		let totalMinutes = entries.reduce((sum, entry) => {
			return sum + durationToMinutes(entry.time);
		}, 0);

		if (sameReturnJourney === "Yes") {
			totalMinutes *= 2;
		}

		return minutesToDuration(totalMinutes);
	};

	const handlePassengerChange = (text) => {
		// Set to 1 if the input is empty or non-numeric
		const numPassengers = text === '' || isNaN(text) ? '' : parseInt(text);
		setCarSettings(prev => ({ ...prev, passengers: numPassengers }));
	};


	const editCarEntry = (index) => {
		const entry = entries[index];
		if (entry && entry.mode === 'Car') {
			setCarSettings({ engineType: entry.engineType || 'petrol', passengers: entry.passengers || 1 });
			setEditingEntryIndex(index);
			setShowCarSettingsModal(true);
		}
	};

	const saveCarSettings = () => {
		if (editingEntryIndex >= 0) {
			const updatedCarbonFootprint = calculateCarbonFootprintUsingTime(
				'Car',
				entries[editingEntryIndex].time,
				carSettings.engineType,
				carSettings.passengers
			);

			let updatedEntries = [...entries];
			updatedEntries[editingEntryIndex] = {
				...updatedEntries[editingEntryIndex],
				...carSettings,
				carbonFootprint: updatedCarbonFootprint
			};
			setEntries(updatedEntries);

			// Recalculate total carbon footprint
			updateTotalCarbonFootprint(updatedEntries);

			// Reset editing index
			setEditingEntryIndex(-1);
		}
		setShowCarSettingsModal(false);
	};


	return (
		<ScrollView style={styles.mainScrollView} contentContainerStyle={styles.contentContainer}>
			<View style={styles.container}>
				<Toast ref={(ref) => Toast.setRef(ref)} />

				<TouchableOpacity
					style={styles.helpButton}
					onPress={() => setShowHelpModal(true)}
				>
					<Text style={styles.helpButtonText}>Help / Documentation</Text>
				</TouchableOpacity>


				{/* Button to toggle sensor data and detection history visibility */}

				<TouchableOpacity
					style={[styles.button, { backgroundColor: '#ff8547' }]}
					onPress={() => setShowSensorData(!showSensorData)}
					activeOpacity={0.7}
				>
					<Icon name={showSensorData ? "minus" : "plus"} size={20} color="black" style={styles.iconStyle} />
					<Text style={styles.buttonText}>
						{showSensorData ? "STOP VIEWING DATA" : "VIEW SENSOR DATA & DETECTION HISTORY"}
					</Text>
				</TouchableOpacity>

				{/* Conditional rendering based on showSensorData */}
				{showSensorData && (
					<>
						<Text style={styles.generalText}>Mobile Sensor and GPS Data</Text>
						<ScrollView style={styles.scrollView}>

							<Text style={styles.textWithPadding}>{text}</Text>
							<Text style={styles.textWithPadding}>Window 1 Distance travelled: {currentDistanceTravelledRef.current?.toFixed(2)}m</Text>
							<Text style={styles.textWithPadding}>Window 2 Distance travelled: {currentDistanceTravelledRefW2.current?.toFixed(2)}m</Text>
							<Text style={styles.textWithPadding}>Accelerometer Data:</Text>
							<Text style={styles.textWithPadding}>x: {currentAcceleration.x?.toFixed(2)}, y: {currentAcceleration.y?.toFixed(2)}, z: {currentAcceleration.z?.toFixed(2)}</Text>
							<Text style={styles.textWithPadding}>Gyroscope Data:</Text>
							<Text style={styles.textWithPadding}>x: {currentGyroscope.x?.toFixed(2)}, y: {currentGyroscope.y?.toFixed(2)}, z: {currentGyroscope.z?.toFixed(2)}</Text>
						</ScrollView>

						<Text style={styles.generalText}>Transport Detection History</Text>
						<ScrollView style={styles.scrollView}>
							{transportModes.map((item, index) => (
								<View key={index} style={styles.textAndIcon}>
									<Icon name={getIconName(item.mode)} size={20} color="white" />
									<Text style={styles.textStyle}>
										{item.mode} - {item.time} - {item.distance.toFixed(2)}m
									</Text>
								</View>
							))}
						</ScrollView>
					</>
				)}


				<TouchableOpacity
					style={[styles.customButton, { backgroundColor: isPredicting ? "#CC0000" : "green" }]}
					onPress={isPredicting ? stopPredicting : startPredicting}
					activeOpacity={0.7}
				>
					<Text style={styles.customButtonText}>
						{isPredicting ? "Stop Predicting" : "Start Predicting"}
					</Text>
				</TouchableOpacity>


				{isPredicting &&
					<View style={styles.indicatorContainer}>
						<WaveIndicator color="#1ED760" />
					</View>
				}

				{predictionEnded && (
					<Text style={styles.headingText}>Amend Your Predicted Commute Journey</Text>
				)}

				{predictionEnded && (
					<>

						<Text style={styles.centeredBoldText}>Automatically Added Transport Entries:</Text>

						{(
							getPrimaryTransportModes(transportModes).map((mode, index) => (
								<Text key={index} style={styles.generalText}>
									{mode.mode} from {mode.endTime} to {mode.startTime} | {mode.distance.toFixed(2)}m
								</Text>
							))
						)}

						<View style={styles.divider} />

						<Text style={styles.centeredBoldText}>Additional Information:</Text>

						<View style={styles.row}>
							<Text style={styles.label}>Select Day:</Text>
							<RNPickerSelect
								onValueChange={(value) => setSelectedDay(value)}
								items={dayPickerItems}
								style={pickerSelectStyles}
								value={selectedDay}
								placeholder={{
									label: 'Select a day.',
									value: null,
								}}
								useNativeAndroidPickerStyle={false}
							/>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Same Return Journey:</Text>
							<RNPickerSelect
								onValueChange={(value) => setSameReturnJourney(value)}
								items={[
									{ label: "Yes", value: "Yes" },
									{ label: "No", value: "No" }
								]}
								style={pickerSelectStyles}
								value={sameReturnJourney}
								placeholder={{}}
								useNativeAndroidPickerStyle={false}
							/>
						</View>

						<View style={styles.divider} />

						<Text style={styles.centeredBoldText}>Add/Delete Transport Entries:</Text>

						<View style={styles.row}>
							<Text style={styles.label}>Select Transport Mode:</Text>
							<RNPickerSelect
								onValueChange={(value) => setTransportMode(value)}
								items={transportPickerItems}
								style={pickerSelectStyles}
								value={transportMode}
								placeholder={{
									label: 'Select mode.',
									value: null,
								}}
								useNativeAndroidPickerStyle={false}
							/>
						</View>

						<View style={styles.row}>
							<Text style={styles.label}>Duration of Mode:</Text>
							<View style={styles.durationPicker}>
								<RNPickerSelect
									onValueChange={(value) => setDurationHour(value)}
									items={hourOptions}
									style={pickerSelectStyles}
									value={durationHour}
									placeholder={{ label: 'HH', value: null }}
									useNativeAndroidPickerStyle={false}
								/>
							</View>
							<Text style={styles.label}>:</Text>
							<View style={styles.durationPicker}>
								<RNPickerSelect
									onValueChange={(value) => setDurationMinute(value)}
									items={minuteOptions}
									style={pickerSelectStyles}
									value={durationMinute}
									placeholder={{ label: 'MM', value: null }}
									useNativeAndroidPickerStyle={false}
								/>
							</View>
						</View>

						<TouchableOpacity
							style={[styles.customButton, { backgroundColor: "#2488DD" }]}
							onPress={addEntry}
							activeOpacity={0.7}
						>
							<Text style={styles.customButtonText}>
								{"Add Entry"}
							</Text>
						</TouchableOpacity>

						{entries.map((entry, index) => (
							<View key={index} style={[styles.entryContainer, { backgroundColor: PASTEL_COLORS[entry.mode] || PASTEL_COLORS.default }]}>
								<Icon
									name={getIconName(entry.mode)}
									size={20}
									color="black"
									onPress={() => deleteEntry(index)}
									style={styles.iconStyle}
								/>
								{entry.mode === 'Car' && (
									<Icon
										name="edit"
										size={20}
										color="#2488DD"
										onPress={() => editCarEntry(index)}
									/>
								)}
								<Text style={styles.entryText}>
									{entry.mode} - {entry.time} - {typeof entry.distance === 'number' ? entry.distance.toFixed(1) : 'N/A'}m - {entry.carbonFootprint} kg CO2e
								</Text>
								<Icon
									name="trash"
									size={20}
									color="red"
									onPress={() => deleteEntry(index)}
								/>
							</View>
						))}

						<View style={styles.totalContainer}>
							<Text style={styles.totalText}>
								Total Carbon Footprint: {sameReturnJourney === "Yes" ? "(x2) " + (totalCarbonFootprint * 2) : totalCarbonFootprint} kg CO2e
							</Text>

							<Text style={styles.totalText}>
								Total Duration: {sameReturnJourney === "Yes" ? "(x2) " + calculateTotalDuration() : calculateTotalDuration()}
							</Text>
						</View>



						<View style={styles.divider} />

						<Text style={styles.centeredBoldText}>Distribute Footprint to Your Teams</Text>

						{/* Team Fields */}
						{teams.map((team, index) => (
							<View key={index} style={styles.teamRow}>
								<Text style={styles.teamName}>{team.teamName}</Text>
								<RNPickerSelect
									onValueChange={(value) => handleTeamPercentageChange(team.teamName, value)}
									items={percentageOptions}
									style={pickerSelectStyles}
									value={teamPercentages[team.teamName]}
									placeholder={{ label: '0%', value: '0' }}
									useNativeAndroidPickerStyle={false}
								/>
								<Text style={styles.teamFootprint}>
									Carbon Footprint: {calculateTeamCarbonFootprint(team.teamName)} kg CO2e
								</Text>
							</View>
						))}

						<TouchableOpacity
							style={[styles.customButton, { backgroundColor: "green" }]}
							onPress={handleSubmit}
							activeOpacity={0.7}
						>
							<Text style={styles.customButtonText}>
								{"Submit"}
							</Text>
						</TouchableOpacity>
					</>

				)}
				<StatusBar style="auto" />
				<CustomModal
					modalVisible={errorTransportModalVisible}
					setModalVisible={setErrorTransportModalVisible}
					modalText="Please select a transport mode."
					color="red"
				/>
				<CustomModal
					modalVisible={errorDayModalVisible}
					setModalVisible={setErrorDayModalVisible}
					modalText="Select the day before submitting."
					color="red"
				/>
				<CustomModal
					modalVisible={errorPercentagesModalVisible}
					setModalVisible={setErrorPercentagesModalVisible}
					modalText="Enter percentage distribution for your teams. Needs to add to 100."
					color="red"
				/>
				<CustomModal
					modalVisible={errorSubmitModalVisible}
					setModalVisible={setErrorSubmitModalVisible}
					modalText="Error submitting carbon footprint. Check your connection."
					color="red"
				/>
				<CustomModal
					modalVisible={successModalVisible}
					setModalVisible={setSuccessModalVisible}
					modalText="Successfully Saved Carbon Footprint."
					color="green"
				/>
				<Modal
					visible={showCarSettingsModal}
					animationType="slide"
					transparent={true}
					onRequestClose={() => setShowCarSettingsModal(false)}
				>
					<View style={modalStyles.centeredView}>
						<View style={modalStyles.modalView}>
							<Text style={styles.modalLabelText}>Select Engine Type:</Text>
							{/* Dropdown or Picker for engine type */}
							<RNPickerSelect
								onValueChange={(value) => setCarSettings(prev => ({ ...prev, engineType: value }))}
								items={[{ label: 'Petrol', value: 'petrol' }, { label: 'Diesel', value: 'diesel' }]}
								value={carSettings.engineType}
								style={pickerSelectStyles}
							/>
							<Text style={styles.modalLabelText}>No. of Employee Passengers:</Text>
							<RNPickerSelect
								onValueChange={(value) => setCarSettings(prev => ({ ...prev, passengers: value }))}
								items={[
									{ label: '1', value: '1' },
									{ label: '2', value: '2' },
									{ label: '3', value: '3' },
									{ label: '4', value: '4' },
									{ label: '5', value: '5' }
								]}
								value={carSettings.passengers.toString()}
								style={pickerSelectStyles}
								useNativeAndroidPickerStyle={false}
							/>

							<TouchableOpacity
								style={[styles.customButton, { backgroundColor: "#2488DD" }]}
								onPress={saveCarSettings}
								activeOpacity={0.7}
							>
								<Text style={styles.customButtonText}>
									{"Save Settings"}
								</Text>
							</TouchableOpacity>

						</View>
					</View>
				</Modal>
				<Modal
					animationType="slide"
					transparent={true}
					visible={showHelpModal}
					onRequestClose={() => setShowHelpModal(false)} // This allows Android users to close the modal using the back button.
				>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<Text style={styles.modalText}>
								Press the start button when you leave your home and press the stop button when you arrive at your office. Once stopped, you can amend the transport entries that have been automatically added. If you commute the same way back home today, select "Yes" for Return Journey. Distribute the carbon footprint score that has been calculated amongst your teams, which needs to add to 100, and then press submit.
							</Text>
							<TouchableOpacity
								style={[styles.button, styles.buttonClose]}
								onPress={() => setShowHelpModal(false)} // Correctly toggles the visibility off.
							>
								<Text style={styles.textStyle}>Close</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>



			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#121212',
		alignItems: 'center',
		justifyContent: 'center',
	},

	mainScrollView: {
		backgroundColor: '#121212',
		flexGrow: 1,
	},

	contentContainer: {
		flexGrow: 1,
		justifyContent: 'center',

	},

	generalText: {
		color: '#ffffff',
	},

	scrollView: {
		minHeight: 100,
		maxHeight: 100,
		width: '80%',
		marginHorizontal: 20,
		marginVertical: 10,
		borderWidth: 1,
		borderColor: 'grey',
		borderRadius: 10,
		backgroundColor: '#282828',
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

	buttonContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
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

	headingText: {
		color: '#ffffff',
		textDecorationLine: 'underline',
		fontWeight: 'bold',
		fontSize: 17,
		textAlign: 'center',
		paddingTop: 15,
		paddingBottom: 15,
	},

	textAndIcon: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 4,
		color: '#fff',
	},

	textStyle: {
		marginLeft: 10,
		marginRight: 10,
		color: '#fff',
	},

	entryContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 10,
		borderRadius: 10,
		marginVertical: 4,
		marginHorizontal: 10,
	},

	entryText: {
		flex: 1,
		marginLeft: 10,
	},

	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 10,
	},

	label: {
		marginRight: 10,
		color: '#fff',
	},

	textWithPadding: {
		marginLeft: 6,
		color: '#fff',
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
		color: '#ffffff',
	},

	durationPicker: {
		width: 80,
	},

	teamRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 10,
	},

	teamName: {
		flex: 2,
		marginRight: 10,
		color: '#fff',
	},

	teamInput: {
		flex: 1,
		borderWidth: 1,
		borderColor: 'gray',
		padding: 8,
		marginRight: 10,
	},

	teamFootprint: {
		flex: 2,
		color: '#fff',
	},

	inputBox: {
		borderWidth: 1,
		borderColor: 'gray',
		borderRadius: 5,
		padding: 10,
		marginTop: 5,
		marginBottom: 5,
		width: '80%',
	},

	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 20,
		marginVertical: 10,
	},

	buttonText: {
		marginLeft: 10,
		color: 'white',
		textTransform: 'uppercase',
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

	iconStyle: {
		marginRight: 4,
	},

	totalContainer: {
		backgroundColor: '#ECEEF3',
		borderWidth: 1,
		borderColor: 'grey',
		borderRadius: 10,
		padding: 10,
		marginVertical: 5,
		alignItems: 'center',
	},

	totalText: {
		color: 'black',
		fontSize: 16,
	},

	modalLabelText: {
		color: '#ffffff',
		paddingTop: 12,
		paddingBottom: 12,
	},
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22
	},
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5
	},
	helpButton: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
		backgroundColor: "#2196F3",
		marginTop: 25,
	},
	helpButtonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center"
	},
	modalText: {
		marginBottom: 15,
		textAlign: "center"
	},
	buttonClose: {
		backgroundColor: "#2196F3",
		marginTop: 15,
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
	},

});

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		fontSize: 16,
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: 'gray',
		borderRadius: 4,
		color: 'white',
		paddingRight: 10,
		backgroundColor: '#383838',
		marginRight: 10,
	},
	inputAndroid: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 5, borderWidth: 0.5,
		borderColor: 'gray',
		borderRadius: 8,
		color: 'white',
		paddingRight: 10,
		backgroundColor: '#383838',
		marginRight: 10,
	},
});