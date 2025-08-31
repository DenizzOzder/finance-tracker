import { createAsyncThunk } from "@reduxjs/toolkit";
import { api, setAuthToken } from "../../shared/api";

const EP = {
  signUp: "/api/auth/sign-up",
  signIn: "/api/auth/sign-in",
  signOut: "/api/auth/sign-out",
  current: "/api/users/current",
};

// REGISTER → backend username bekliyor
export const register = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(EP.signUp, { username, email, password });
      // Çoğu senaryoda { token, user } döner; bazen direkt user dönebilir.
      if (data?.token) setAuthToken(data.token);
      return data; // { token, user }  veya  { id, username, email, balance }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Register failed" });
    }
  }
);

// LOGIN
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(EP.signIn, { email, password });
      if (data?.token) setAuthToken(data.token);
      return data; // { token, user }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Login failed" });
    }
  }
);

// LOGOUT
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (token) setAuthToken(token);
      await api.post(EP.signOut);
      setAuthToken(null);
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Logout failed" });
    }
  }
);

// CURRENT USER →  { id, username, email, balance }
export const getCurrent = createAsyncThunk(
  "auth/current",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) throw new Error("No token");
      setAuthToken(token);
      const { data } = await api.get(EP.current);
      return data; // { id, username, email, balance }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Get current failed" });
    }
  }
);
