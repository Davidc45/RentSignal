import { createSelector } from "@reduxjs/toolkit";

export const selectCityTrendsState = (state) => state.cityTrends;
export const selectCityTrendsStatus = (state) => state.cityTrends.status;
export const selectCityTrendsError = (state) => state.cityTrends.error;
export const selectCityTrendIds = (state) => state.cityTrends.allIds;
export const selectCityTrendsById = (state) => state.cityTrends.byId;

export const selectAllCityTrends = createSelector(
  [selectCityTrendIds, selectCityTrendsById],
  (ids, byId) => ids.map((id) => byId[id])
);