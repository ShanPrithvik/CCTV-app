import axios from "axios";
import { API_KEY, API_URL } from "./config";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cctv_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  } else if (API_KEY) {
    config.headers = config.headers || {};
    config.headers["X-API-Key"] = API_KEY;
  }
  return config;
});

const originalGet = api.get.bind(api);
api.get = function(url, config) {
  if (typeof url === "string" && url.startsWith("http://") === false && url.startsWith("https://") === false && API_URL) {
    return originalGet(`${API_URL}/${url.replace(/^\/+/, "")}`, config);
  }
  return originalGet(url, config);
};

const originalPost = api.post.bind(api);
api.post = function(url, data, config) {
  if (typeof url === "string" && url.startsWith("http://") === false && url.startsWith("https://") === false && API_URL) {
    return originalPost(`${API_URL}/${url.replace(/^\/+/, "")}`, data, config);
  }
  return originalPost(url, data, config);
};

const originalPut = api.put.bind(api);
api.put = function(url, data, config) {
  if (typeof url === "string" && url.startsWith("http://") === false && url.startsWith("https://") === false && API_URL) {
    return originalPut(`${API_URL}/${url.replace(/^\/+/, "")}`, data, config);
  }
  return originalPut(url, data, config);
};

const originalDelete = api.delete.bind(api);
api.delete = function(url, config) {
  if (typeof url === "string" && url.startsWith("http://") === false && url.startsWith("https://") === false && API_URL) {
    return originalDelete(`${API_URL}/${url.replace(/^\/+/, "")}`, config);
  }
  return originalDelete(url, config);
};

// Tokens expire after 12h. Without this, a session that expires while the tab
// is open turns every action into an opaque 401 until the user reloads.
// Login/register 401s are genuine credential errors and must reach the caller.
const isCredentialCheck = (url = "") =>
  url.includes("/api/auth/login") || url.includes("/api/auth/register");

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    if (status === 401 && !isCredentialCheck(url) && localStorage.getItem("cctv_token")) {
      localStorage.removeItem("cctv_token");
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
