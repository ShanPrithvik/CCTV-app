import api from "./http";
import { CAMERA_BASE_URL as BASE_URL } from "./config";

export const fetchCameras = async () => {
  const response = await api.get(BASE_URL);
  return response.data;
};

export const fetchCamera = async (id) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const saveCamera = async (rtsp, cameraName) => {
  const nameToUse =
    cameraName && cameraName.trim()
      ? cameraName.trim()
      : `C${Math.floor(10000 + Math.random() * 90000)}`;
  const response = await api.post(BASE_URL, { cameraName: nameToUse, rtsp });
  return response.data;
};

export const deleteCamera = async (id) => {
  const response = await api.delete(`${BASE_URL}/${id}`);
  return response.data;
};
