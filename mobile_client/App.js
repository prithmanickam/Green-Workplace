import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import Toast from 'react-native-toast-message';

export default function App() {
  const [location, setLocation] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [count, setCount] = useState(0);
  const [currentAcceleration, setCurrentAcceleration] = useState({});
  const [currentGyroscope, setCurrentGyroscope] = useState({});

  const [transportModes, setTransportModes] = useState([]);
  const [currTransport, setCurrTransport] = useState('');

  const [gyroscopeData, setGyroscopeData] = useState([]);
  const [accelerometerData, setAccelerometerData] = useState([]);

  const accelerometerDataRef = useRef([]);
  const gyroscopeDataRef = useRef([]);

  const [currentDistanceTravelled, setCurrentDistanceTravelled] = useState(0);

  const currentDistanceTravelledRef = useRef(0);

  const [isFetching, setIsFetching] = useState(false);


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
            setDistanceTraveled(prevDistance => prevDistance + distance);
            setCurrentDistanceTravelled(current => parseFloat(current) + distance);
            setCount(c => c + 1);
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

    console.log(currentDistanceTravelledRef.current)

    console.log("Accel Data Ref Length:", accelerometerDataRef.current.length);
    console.log("Gyro Data Ref Length:", gyroscopeDataRef.current.length);

    const latestAccelerometerData = accelerometerDataRef.current;
    const latestGyroscopeData = gyroscopeDataRef.current;

    // Only proceed if we have enough data
    if (latestAccelerometerData.length > 10 && latestGyroscopeData.length > 10 && !isFetching) {
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

            if ((currentDistanceTravelledRef.current < 10) && (data.mode != "Walking")) {
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


  return (
    <View style={styles.container}>
      <Toast ref={(ref) => Toast.setRef(ref)} />
      <Text>{text}</Text>
      <Text>Distance travelled since last detection: {currentDistanceTravelledRef.current?.toFixed(2)}</Text>
      <Text>Accelerometer Data:</Text>
      <Text>x: {currentAcceleration.x?.toFixed(2)}, y: {currentAcceleration.y?.toFixed(2)}, z: {currentAcceleration.z?.toFixed(2)}</Text>



      <Text>Gyroscope Data:</Text>
      <Text>x: {currentGyroscope.x?.toFixed(2)}, y: {currentGyroscope.y?.toFixed(2)}, z: {currentGyroscope.z?.toFixed(2)}</Text>

      <Text>Count: {count}</Text>


      <ScrollView style={styles.scrollView}>
        {transportModes.map((item, index) => (
          <Text key={index} style={styles.textItem}>
            {item.mode} - {item.time}
          </Text>
        ))}
      </ScrollView>


      <Text>curr: {currTransport}</Text>

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
