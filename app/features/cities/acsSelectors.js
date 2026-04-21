//Clean resuable helpedr for reading cities state from the Redux store, including memoized selector for getting all cities as an array.
import { createSelector } from "@reduxjs/toolkit";

export const selectCitiesState = (state) => state.cities;
export const selectCitiesStatus = (state) => state.cities.status;
export const selectCitiesError = (state) => state.cities.error;
export const selectCityIds = (state) => state.cities.allIds;
export const selectCitiesById = (state) => state.cities.byId;

export const selectAllCities = createSelector(
  [selectCityIds, selectCitiesById],
  (ids, byId) => ids.map((id) => byId[id])
);