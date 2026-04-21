import { createAsyncThunk } from "@reduxjs/toolkit";
import { graphqlRequest } from "../../api/graphqlApi";
import { GET_CITY_TRENDS } from "../queries";

export const fetchCityTrends = createAsyncThunk(
  "cityTrends/fetchCityTrends",
  async (_, thunkAPI) => {
    try {
      const data = await graphqlRequest(GET_CITY_TRENDS);
      return data.cityTrends;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);