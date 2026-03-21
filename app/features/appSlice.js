import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  ready: true,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
});

export default appSlice.reducer;