export const selectCurrencyData = (state) => state.currency.rate;
export const selectCurrencyLoading = (state) =>
  state.currency.isCurrencyLoading;
export const selectCurrencyError = (state) => state.currency.isCurrencyError;
