//Stores GraphQL city data in Redux state, including loading and error status for UI components to consume
import { createSlice } from "@reduxjs/toolkit";
import { fetchCities } from "./citiesThunks";

const initialState = {
  byId: {},
  allIds: [],
  status: "idle",
  error: null,
};

const citiesSlice = createSlice({
  name: "cities",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.byId = {};
        state.allIds = [];

        action.payload.forEach((city) => {
          state.byId[city.id] = city;
          state.allIds.push(city.id);
        });
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      });
  },
});

export default citiesSlice.reducer;