import { useAuth } from "../contexts/AuthContext";

const MANAGEMENT_ROLES = ["Owner", "Admin"];

const usePermissions = () => {
  const { user, memberships, activeOrgId } = useAuth();
  const membership =
    memberships.find((item) => item.organization_id === activeOrgId) || null;
  const canManage = Boolean(
    membership && MANAGEMENT_ROLES.includes(membership.role),
  );

  return {
    user,
    membership,
    role: membership?.role || null,
    canManage,
    canManageUsers: canManage,
  };
};

export default usePermissions;
