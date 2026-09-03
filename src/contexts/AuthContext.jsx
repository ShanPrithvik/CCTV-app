import React, { createContext, useContext, useState, useEffect } from "react";
import { login, register, fetchMe, switchOrganization, acceptInvite } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const token = localStorage.getItem("cctv_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchMe();
      setUser(data.user);
      setMemberships(data.memberships || []);
    } catch {
      localStorage.removeItem("cctv_token");
      setUser(null);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const signIn = async (email, password) => {
    const data = await login(email, password);
    localStorage.setItem("cctv_token", data.token);
    setUser(data.user);
    setMemberships(data.memberships || []);
    return data;
  };

  const signUp = async (email, name, password, organizationName) => {
    const data = await register(email, name, password, organizationName);
    localStorage.setItem("cctv_token", data.token);
    setUser(data.user);
    setMemberships(data.memberships || []);
    return data;
  };

  const acceptInviteWrapper = async (email, name, password, inviteToken) => {
    const data = await acceptInvite(email, name, password, inviteToken);
    localStorage.setItem("cctv_token", data.token);
    setUser(data.user);
    setMemberships(data.memberships || []);
    return data;
  };

  const signOut = () => {
    localStorage.removeItem("cctv_token");
    setUser(null);
    setMemberships([]);
  };

  const switchOrg = async (organizationId) => {
    const data = await switchOrganization(organizationId);
    localStorage.setItem("cctv_token", data.token);
    setUser(data.user);
  };

  const activeOrgId = user?.active_organization_id || memberships[0]?.organization_id || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        memberships,
        loading,
        activeOrgId,
        signIn,
        signUp,
        acceptInvite: acceptInviteWrapper,
        signOut,
        switchOrg,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
