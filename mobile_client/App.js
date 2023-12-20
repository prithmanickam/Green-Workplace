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
        <Stack.Screen name="MobileLoginPage" component={MobileLoginPage} />
        <Stack.Screen name="TransportDetectionPage" component={TransportDetectionPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
