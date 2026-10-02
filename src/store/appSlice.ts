import { createSlice } from '@reduxjs/toolkit';

interface AppState {
  initialized: boolean;
}

const initialState: AppState = {
  initialized: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
});

export default appSlice.reducer;
