import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import ProductListScreen from '../screens/products/ProductListScreen';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useAppTheme } from '../hooks/useAppTheme';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  icon: string;
  focused: boolean;
  color: string;
}

const TabIcon = ({ icon, focused, color }: TabIconProps) => {
  return (
    <Text
      style={{
        fontSize: 22,
        color,
        opacity: focused ? 1 : 0.5,
      }}
    >
      {icon}
    </Text>
  );
};

const BottomTabNavigator = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          color: colors.text,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ProductListScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⌂" focused={focused} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="♡" focused={focused} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🛒" focused={focused} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="▣" focused={focused} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="♙" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
