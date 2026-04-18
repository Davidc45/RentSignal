import { configureStore } from '@reduxjs/toolkit';
import appReducer from '../app/features/appSlice';
import marketSnapshotReducer from '../app/features/marketSnapshotSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    marketSnapshot: marketSnapshotReducer,
  },
});