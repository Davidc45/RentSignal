import { configureStore } from "@reduxjs/toolkit";
import citiesReducer from "../app/features/cities/citiesSlice";
import cityTrendsReducer from "../app/features/cityTrends/cityTrendsSlice";

export const store = configureStore({
  reducer: {
    cities: citiesReducer,
    cityTrends: cityTrendsReducer,
  },
});