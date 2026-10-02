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
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppDispatch } from '../../store';
import { logoutUser } from '../../store/authSlice';
import { saveTheme, setTheme } from '../../store/themeSlice';
import { User } from '../../types';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, mode } = useAppTheme();

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

  const handleThemeToggle = () => {
    dispatch(setTheme(mode === 'light' ? 'dark' : 'light'));
    dispatch(saveTheme(mode === 'light' ? 'dark' : 'light'));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <CommonHeader title="Profile" />

        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <CommonHeader title="Profile" />

        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {error || 'Profile not available.'}
          </Text>

          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadProfile}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CommonHeader title="Profile" />

      <View style={styles.content}>
        <Image source={{ uri: profile.image }} style={styles.profileImage} />

        <Text style={[styles.name, { color: colors.text }]}>
          {profile.firstName} {profile.lastName}
        </Text>

        <View style={styles.infoContainer}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>
            Username
          </Text>

          <Text style={[styles.value, { color: colors.text }]}>
            {profile.username}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.label, { color: colors.secondaryText }]}>
            Email
          </Text>

          <Text style={[styles.value, { color: colors.text }]}>
            {profile.email}
          </Text>
        </View>

        <View style={styles.themeRow}>
          <Text style={[styles.themeLabel, { color: colors.text }]}>
            Dark Mode
          </Text>

          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: colors.primary }]}
            onPress={handleThemeToggle}
          >
            <Text style={styles.themeButtonText}>
              {mode === 'light' ? 'OFF' : 'ON'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.danger }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  loadingText: {
    marginTop: 12,
    fontSize: 15,
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
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
  },

  themeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 20,
  },

  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  themeButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },

  themeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  logoutButton: {
    width: '100%',
    height: 48,
    marginTop: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  },

  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;
