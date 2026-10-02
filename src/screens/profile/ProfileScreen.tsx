import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

import { getProfile } from '../../api/profileApi';
import CommonHeader from '../../components/CommonHeader';
import { AppDispatch } from '../../store';
import { logoutUser } from '../../store/authSlice';
import { User } from '../../types';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getProfile();

      setProfile(response);
    } catch (profileError) {
      setError('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Profile" />

        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.container}>
        <CommonHeader title="Profile" />

        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error || 'Profile not available.'}
          </Text>

          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommonHeader title="Profile" />

      <View style={styles.content}>
        <Image source={{ uri: profile.image }} style={styles.profileImage} />

        <Text style={styles.name}>
          {profile.firstName} {profile.lastName}
        </Text>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{profile.username}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    alignItems: 'center',
    padding: 20,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginTop: 20,
  },

  name: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '700',
  },

  infoContainer: {
    width: '100%',
    marginTop: 24,
  },

  label: {
    fontSize: 13,
    color: '#777',
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
  },

  logoutButton: {
    width: '100%',
    height: 48,
    marginTop: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },

  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#000',
  },

  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;
