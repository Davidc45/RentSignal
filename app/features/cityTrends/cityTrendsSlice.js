import { createSlice } from "@reduxjs/toolkit";
import { fetchCityTrends } from "./cityTrendsThunks";

const initialState = {
  byId: {},
  allIds: [],
  status: "idle",
  error: null,
};

const cityTrendsSlice = createSlice({
  name: "cityTrends",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCityTrends.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCityTrends.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.byId = {};
        state.allIds = [];

        action.payload.forEach((city) => {
          state.byId[city.id] = city;
          state.allIds.push(city.id);
        });
      })
      .addCase(fetchCityTrends.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export default cityTrendsSlice.reducer;