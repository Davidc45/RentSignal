import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchMarketSnapshot } from "../../lib/api/marketSnapshot";

export const loadMarketComparison = createAsyncThunk(
  "marketSnapshot/loadComparison",
  async ({ citySlugs, income, bedrooms }, { rejectWithValue }) => {
    try {
      const results = await Promise.all(
        citySlugs.map((citySlug) => fetchMarketSnapshot({ citySlug, income, bedrooms }))
      );
      return results;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : String(err));
    }
  }
);

const marketSnapshotSlice = createSlice({
  name: "marketSnapshot",
  initialState: {
    results: [],
    status: "idle",
    error: null,
    params: null,
  },
  reducers: {
    clearComparison(state) {
      state.results = [];
      state.status = "idle";
      state.error = null;
      state.params = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMarketComparison.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.params = action.meta.arg;
      })
      .addCase(loadMarketComparison.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;
      })
      .addCase(loadMarketComparison.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export const { clearComparison } = marketSnapshotSlice.actions;
export default marketSnapshotSlice.reducer;

export const selectComparisonResults = (state) => state.marketSnapshot.results;
export const selectComparisonStatus = (state) => state.marketSnapshot.status;
export const selectComparisonError = (state) => state.marketSnapshot.error;
export const selectComparisonParams = (state) => state.marketSnapshot.params;
