import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MobileLoginPage from './pages/MobileLoginPage';
import TransportDetectionPage from './pages/TransportDetectionPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LoginPage" component={MobileLoginPage} options={{ title: 'Login Page' }} />
        <Stack.Screen name="TransportDetectionPage" component={TransportDetectionPage} options={{ title: 'Transport Detection Page' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
