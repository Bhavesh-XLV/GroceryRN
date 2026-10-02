import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';

import AppNavigator from './src/navigation/AppNavigator';
import { AppDispatch, store } from './src/store';
import { restoreSession } from './src/store/authSlice';

function AppInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return <AppNavigator />;
}

function App() {
  return (
    <Provider store={store}>
      <AppInitializer />
    </Provider>
  );
}

export default App;
