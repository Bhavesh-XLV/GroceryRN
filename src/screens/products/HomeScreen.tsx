import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../store';
import { logoutUser } from '../../store/authSlice';
import { getProfile } from '../../api/profileApi';

function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log(Date.now());
      const profile = await getProfile();

      console.log('PROFILE:', profile);
    } catch (error) {
      console.log('PROFILE ERROR:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grocery App</Text>

      <Text>Welcome to the grocery store</Text>

      <Pressable onPress={loadProfile}>
        <Text>Check Profile</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },

  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#222222',
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default HomeScreen;
