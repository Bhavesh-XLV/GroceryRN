import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import useNetworkStatus from '../hooks/useNetworkStatus';

const OfflineBanner = () => {
  const { isConnected } = useNetworkStatus();
  console.log('isConnected', isConnected);
  const { colors } = useAppTheme();

  if (isConnected) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.danger }]}>
      <Text style={styles.text}>
        You are offline. Some features may be unavailable.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default OfflineBanner;
