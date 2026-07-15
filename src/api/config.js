// Centralized backend URL. Set REACT_APP_API_URL at build time (see
// .env.example) to point the built app at a deployed backend instead of
// localhost.
export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export const CAMERA_BASE_URL = `${API_URL}/api/camera`;

export const cameraStreamUrl = (cameraId) => `${CAMERA_BASE_URL}/${cameraId}/stream`;
export const cameraViewUrl = (cameraName) => `${API_URL}/camera-view/${cameraName}.png`;
