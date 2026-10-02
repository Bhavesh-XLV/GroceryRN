import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grocery App</Text>
      <Text>Welcome to the grocery store</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
});

export default HomeScreen;
