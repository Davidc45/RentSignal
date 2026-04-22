import { createAsyncThunk } from "@reduxjs/toolkit";
import { graphqlRequest } from "../../api/graphqlApi";
import { GET_CITIES } from "../queries";

export const fetchCities = createAsyncThunk(
  "cities/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const data = await graphqlRequest(GET_CITIES);
      return data.cities;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);