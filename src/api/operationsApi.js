import api from "./http";
import { API_URL } from "./config";

export const fetchOperationsOverview = async () => {
  const response = await api.get(`${API_URL}/api/operations/overview`);
  return response.data;
};

export const updateAlertStatus = async (alertId, status) => {
  const response = await api.patch(
    `${API_URL}/api/alerts/${alertId}`,
    { status }
  );
  return response.data;
};
