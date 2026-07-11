import axios from "axios";

const BASE_URL = "http://localhost:5000/api/camera";

// Fetch all rules for a camera
export const fetchRules = async (cameraId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${cameraId}/rule`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rules:", error);
    throw error;
  }
};

// Save a new rule
export const saveRule = async (cameraId, rule) => {
  try {
    const response = await axios.post(`${BASE_URL}/${cameraId}/rule`, rule);
    return response.data;
  } catch (error) {
    console.error("Error saving rule:", error);
    throw error;
  }
};

// Update an existing rule
export const updateRule = async (cameraId, ruleId, rule) => {
  try {
    const response = await axios.put(`${BASE_URL}/${cameraId}/rule/${ruleId}`, rule);
    return response.data;
  } catch (error) {
    console.error("Error updating rule:", error);
    throw error;
  }
};

// Delete a rule
export const deleteRule = async (cameraId, ruleId) => {
  try {
    await axios.delete(`${BASE_URL}/${cameraId}/rule/${ruleId}`);
  } catch (error) {
    console.error("Error deleting rule:", error);
    throw error;
  }
};

// Fetch camera view image and its actual width/height
export const fetchCameraView = async (cameraId) => {
  try {
    const response = await axios.get(`${BASE_URL}/${cameraId}/view`);
    return response.data; // Returns { imageUrl, width, height }
  } catch (error) {
    console.error("Error fetching camera view:", error);
    throw error;
  }
};
