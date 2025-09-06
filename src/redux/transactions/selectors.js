// Transaction selectors
export const selectTransactions = (state) => state.transactions?.items || [];
export const selectTransactionsLoading = (state) => state.transactions?.loading || false;
export const selectTransactionsError = (state) => state.transactions?.error || null;
export const selectCategories = (state) => state.transactions?.categories || [];
export const selectDeletingIds = (state) => state.transactions?.deletingIds || [];
