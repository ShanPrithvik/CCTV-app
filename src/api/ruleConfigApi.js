import api from "./http";
import { CAMERA_BASE_URL as BASE_URL } from "./config";

// Fetch all rules for a camera
export const fetchRules = async (cameraId) => {
  try {
    const response = await api.get(`${BASE_URL}/${cameraId}/rule`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rules:", error);
    throw error;
  }
};

// Save a new rule
export const saveRule = async (cameraId, rule) => {
  try {
    const response = await api.post(`${BASE_URL}/${cameraId}/rule`, rule);
    return response.data;
  } catch (error) {
    console.error("Error saving rule:", error);
    throw error;
  }
};

// Update an existing rule
export const updateRule = async (cameraId, ruleId, rule) => {
  try {
    const response = await api.put(`${BASE_URL}/${cameraId}/rule/${ruleId}`, rule);
    return response.data;
  } catch (error) {
    console.error("Error updating rule:", error);
    throw error;
  }
};

// Delete a rule
export const deleteRule = async (cameraId, ruleId) => {
  try {
    await api.delete(`${BASE_URL}/${cameraId}/rule/${ruleId}`);
  } catch (error) {
    console.error("Error deleting rule:", error);
    throw error;
  }
};

// Fetch camera view image and its actual width/height
export const fetchCameraView = async (cameraId) => {
  try {
    const response = await api.get(`${BASE_URL}/${cameraId}/view`);
    return response.data; // Returns { imageUrl, width, height }
  } catch (error) {
    console.error("Error fetching camera view:", error);
    throw error;
  }
};
