import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { authReducer } from "./auth/slice";
import { transactionsReducer } from "./transactions/slice";
import { currencyReducer } from "./currency/slice";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token"], // user'ı açılışta getCurrent ile çekeceğiz
};

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    transactions: transactionsReducer,
    currency: currencyReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);
