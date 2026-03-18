import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../app/features/appSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers here
    app: appReducer,
  },
});