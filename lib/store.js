import { configureStore } from "@reduxjs/toolkit";
import citiesReducer from "../app/features/cities/citiesSlice";
import marketSnapshotReducer from "../app/features/marketSnapshotSlice";

export const store = configureStore({
  reducer: {
    cities: citiesReducer,
    marketSnapshot: marketSnapshotReducer,
  },
});