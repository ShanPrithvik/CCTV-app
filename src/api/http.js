import axios from "axios";
import { API_KEY, API_URL } from "./config";

// Shared Axios instance so every API call can attach the optional API key.
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (API_KEY) {
    config.headers = config.headers || {};
    config.headers["X-API-Key"] = API_KEY;
  }
  return config;
});

export default api;
