import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/products/HomeScreen';
import { RootState } from '../store';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { accessToken, restoring } = useSelector(
    (state: RootState) => state.auth,
  );

  if (restoring) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {accessToken ? (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
