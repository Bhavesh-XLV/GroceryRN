import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import { AppDispatch, store } from './src/store';
import { restoreSession } from './src/store/authSlice';
import { StyleSheet } from 'react-native';
import { restoreFavorites } from './src/store/favoriteSlice';
import { restoreCart } from './src/store/cartSlice';
import { restoreOrders } from './src/store/orderSlice';
import { restoreTheme } from './src/store/themeSlice';

function AppInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(restoreSession());
    dispatch(restoreFavorites());
    dispatch(restoreCart());
    dispatch(restoreOrders());
    dispatch(restoreTheme());
  }, [dispatch]);

  return (
    <SafeAreaView style={styles.container}>
      <AppNavigator />
    </SafeAreaView>
  );
}

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppInitializer />
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
