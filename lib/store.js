// Redux skeleton for managing city data fetched from a GraphQL API, including thunks for async fetching, reducers for state management, and selectors for accessing city data in UI components.
import { configureStore } from '@reduxjs/toolkit';
import citiesReducer from '../app/features/cities/citiesSlice';
import cityTrendsReducer from '../app/features/cityTrends/cityTrendsSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers here
    cities: citiesReducer,
    cityTrends: cityTrendsReducer,
  },
});