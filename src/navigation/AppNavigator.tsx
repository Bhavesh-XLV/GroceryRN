import React from 'react';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import LoginScreen from '../screens/auth/LoginScreen';
import { RootState } from '../store';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CommonHeader from '../components/CommonHeader';
import BottomTabNavigator from './BottomTabNavigator';
import { useAppTheme } from '../hooks/useAppTheme';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ProductDetail: {
    productId: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { accessToken, restoring } = useSelector(
    (state: RootState) => state.auth,
  );

  const { colors, mode } = useAppTheme();

  if (restoring) {
    return null;
  }

  const navigationTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: colors.background,
          card: colors.background,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          header: ({ options, route, navigation }) => (
            <CommonHeader
              title={
                typeof options.headerTitle === 'string'
                  ? options.headerTitle
                  : route.name
              }
              showBack={navigation.canGoBack()}
            />
          ),
        }}
      >
        {accessToken ? (
          <>
            <Stack.Screen
              name="Main"
              component={BottomTabNavigator}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ProductDetail"
              component={ProductDetailScreen}
              options={{
                headerTitle: 'Product Details',
              }}
            />
          </>
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
