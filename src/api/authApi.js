import api from "./http";
import { API_URL } from "./config";

export const login = async (email, password) => {
  const response = await api.post(`${API_URL}/api/auth/login`, { email, password });
  return response.data;
};

export const register = async (email, name, password, organizationName) => {
  const response = await api.post(`${API_URL}/api/auth/register`, {
    email,
    name,
    password,
    organization_name: organizationName,
  });
  return response.data;
};

export const acceptInvite = async (email, name, password, inviteToken) => {
  const response = await api.post(`${API_URL}/api/auth/register`, {
    email,
    name,
    password,
    invite_token: inviteToken,
  });
  return response.data;
};

export const fetchMe = async () => {
  const response = await api.get(`${API_URL}/api/auth/me`);
  return response.data;
};

export const listOrganizations = async () => {
  const response = await api.get(`${API_URL}/api/org`);
  return response.data;
};

export const createOrganization = async (name) => {
  const response = await api.post(`${API_URL}/api/org`, { name });
  return response.data;
};

export const switchOrganization = async (organizationId) => {
  const response = await api.post(`${API_URL}/api/org/${organizationId}/switch`);
  return response.data;
};

export const listPendingInvites = async (organizationId) => {
  const response = await api.get(`${API_URL}/api/org/invites`, {
    params: { organization_id: organizationId },
  });
  return response.data;
};

export const listMembers = async (organizationId) => {
  const response = await api.get(`${API_URL}/api/org/members`, {
    params: { organization_id: organizationId },
  });
  return response.data;
};

export const inviteMember = async (organizationId, email, role) => {
  const response = await api.post(`${API_URL}/api/org/members`, {
    organization_id: organizationId,
    email,
    role,
  });
  return response.data;
};

export const updateMemberRole = async (membershipId, role) => {
  const response = await api.patch(`${API_URL}/api/org/members/${membershipId}`, { role });
  return response.data;
};

export const removeMember = async (membershipId) => {
  const response = await api.delete(`${API_URL}/api/org/members/${membershipId}`);
  return response.data;
};


