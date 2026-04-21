//Handles the Redux async thunk for fetching city data from the GraphQL server, including error handling and logging for debugging purposes.
import { createAsyncThunk } from "@reduxjs/toolkit";
import { graphqlRequest } from "../../api/graphqlApi";
import { GET_CITIES } from "../queries";

export const fetchCities = createAsyncThunk(
  "cities/fetchCities",
  async (_, thunkAPI) => {
    try {
      console.log("Fetching cities from GraphQL...");
      const data = await graphqlRequest(GET_CITIES);
      console.log("GraphQL city response:", data);
      return data.cities;
    } catch (err) {
      console.error("GraphQL fetch failed:", err);
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);