import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import LoginScreen from '../screens/auth/LoginScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import { RootState } from '../store';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CommonHeader from '../components/CommonHeader';
import BottomTabNavigator from './BottomTabNavigator';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ProductDetail: {
    productId: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { accessToken, restoring } = useSelector(
    (state: RootState) => state.auth,
  );

  if (restoring) {
    return null;
  }

  return (
    <NavigationContainer>
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
              name="Home"
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
