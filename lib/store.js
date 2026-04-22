import { configureStore } from "@reduxjs/toolkit";
import citiesReducer from "../app/features/cities/citiesSlice";

export const store = configureStore({
  reducer: {
    cities: citiesReducer,
  },
});