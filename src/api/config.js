// Centralized backend URL. Set REACT_APP_API_URL at build time (see
// .env.example) to point the built app at a deployed backend instead of
// localhost.
export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

// Optional shared API key. When the backend has API_KEY set, the frontend
// must send the same value (header for Axios, query param for <img>/MJPEG).
export const API_KEY = (process.env.REACT_APP_API_KEY || "").trim();

export const CAMERA_BASE_URL = `${API_URL}/api/camera`;

const withApiKey = (url) => {
  if (!API_KEY) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}api_key=${encodeURIComponent(API_KEY)}`;
};

const withAuth = (url) => {
  const token = localStorage.getItem("cctv_token");
  if (!token) return withApiKey(url);
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}token=${encodeURIComponent(token)}`;
};

export const cameraStreamUrl = (cameraId) =>
  withAuth(withApiKey(`${CAMERA_BASE_URL}/${cameraId}/stream`));

export const cameraViewUrl = (cameraName) =>
  withApiKey(`${API_URL}/camera-view/${cameraName}.png`);

export const alertClipUrl = (alertId) =>
  withAuth(withApiKey(`${API_URL}/api/alerts/${alertId}/clip`));
