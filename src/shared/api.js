import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // örn: https://wallet.b.goit.study
});

// ---- Token helpers
let accessToken = null;
export const setAuthToken = (token) => {
  accessToken = token;
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};