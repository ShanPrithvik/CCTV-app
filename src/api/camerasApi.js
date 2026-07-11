import axios from "axios";

const BASE_URL = "http://localhost:5000/api/camera";

export const fetchCameras = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const fetchCamera = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const saveCamera = async (rtsp, cameraName) => {
  const nameToUse =
    cameraName && cameraName.trim()
      ? cameraName.trim()
      : `C${Math.floor(10000 + Math.random() * 90000)}`;
  const response = await axios.post(BASE_URL, { cameraName: nameToUse, rtsp });
  return response.data;
};

export const deleteCamera = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};
