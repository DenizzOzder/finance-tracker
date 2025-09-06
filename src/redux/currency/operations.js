import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const CURRENCY_KEY = "currencyData";
const ONE_HOUR = 60 * 60 * 1000;

export const monoBankAPI = axios.create({
  baseURL: "https://api.monobank.ua/",
});

export const fetchCurrencyRate = async () => {
  const { data } = await monoBankAPI.get("/bank/currency");

  const getCurrency = (codeA) => {
    const currency = data.find(
      (c) => c.currencyCodeA === codeA && c.currencyCodeB === 980
    );
    if (!currency) return null;
    return {
      buy: currency.rateBuy,
      sell: currency.rateSell,
    };
  };

  return {
    usd: getCurrency(840),
    euro: getCurrency(978),
  };
};

const getCurrencyFromStorage = () => {
  const savedData = localStorage.getItem(CURRENCY_KEY);
  if (!savedData) return null;
  const { timestamp, rate } = JSON.parse(savedData);
  return Date.now() - timestamp < ONE_HOUR ? rate : null;
};

const saveCurrencyToStorage = (rate) => {
  localStorage.setItem(
    CURRENCY_KEY,
    JSON.stringify({ timestamp: Date.now(), rate })
  );
};

export const getCurrency = createAsyncThunk(
  "currency/fetch",
  async (_, thunkAPI) => {
    try {
      const stored = getCurrencyFromStorage();
      if (stored) return stored;

      const updatedRate = await fetchCurrencyRate();
      saveCurrencyToStorage(updatedRate);
      return updatedRate;
    } catch (error) {
      console.log(error);
      toast.error(
        "Unfortunately, we didn't receive the updated currency rate. Please try again."
      );
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
