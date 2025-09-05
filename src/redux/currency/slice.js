import { createSlice } from "@reduxjs/toolkit";
import { getCurrency } from "./operations";

const initialState = {
  rate: null,
  isCurrencyLoading: false,
  isCurrencyError: null,
};

export const currencySlice = createSlice({
  name: "currency",
  initialState,

  extraReducers: (builder) =>
    builder
      .addCase(getCurrency.pending, (state) => {
        state.isCurrencyLoading = true;
        state.isCurrencyError = null;
      })
      .addCase(getCurrency.fulfilled, (state, action) => {
        state.isCurrencyLoading = false;
        state.rate = action.payload;
      })
      .addCase(getCurrency.rejected, (state, action) => {
        state.isCurrencyLoading = false;
        state.isCurrencyError = action.payload;
      }),
});

export const currencyReducer = currencySlice.reducer;
