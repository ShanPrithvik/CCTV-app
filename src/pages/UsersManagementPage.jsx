import React, { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import {
  inviteMember,
  listMembers,
  listPendingInvites,
  removeMember,
  updateMemberRole,
} from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";
import usePermissions from "../hooks/usePermissions";
import ToastNotification from "../components/ToastNotification";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { PageHeader, StatePanel, Surface } from "../components/ui/Surface";

const ROLES = ["Owner", "Admin", "Member"];

const initials = (name, email) => {
  const source = name?.trim() || email?.trim() || "?";
  const words = source.split(/\s+/);
  return words.length > 1
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : source.slice(0, 2).toUpperCase();
};

const RoleChip = ({ role }) => (
  <Chip
    size="small"
    variant="outlined"
    label={role}
    color={
      role === "Owner" ? "primary" : role === "Admin" ? "secondary" : "default"
    }
  />
);

const UsersManagementPage = () => {
  const { user, activeOrgId } = useAuth();
  const { canManageUsers, membership } = usePermissions();
  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [updatingRole, setUpdatingRole] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const loadPeople = useCallback(async () => {
    if (!canManageUsers || !activeOrgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError("");
    try {
      const [memberData, inviteData] = await Promise.all([
        listMembers(activeOrgId),
        listPendingInvites(activeOrgId),
      ]);
      setMembers(memberData);
      setPendingInvites(inviteData);
    } catch (error) {
      setLoadError(
        error?.response?.data?.error ||
          "Organization access data is unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, [activeOrgId, canManageUsers]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const ownerCount = members.filter((member) => member.role === "Owner").length;
  const onlyOwner = members.find((member) => member.role === "Owner");
  const currentUserIsOnlyOwner =
    ownerCount === 1 && onlyOwner?.user_id === user?.id;

  const handleInvite = async (event) => {
    event.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      const result = await inviteMember(
        activeOrgId,
        inviteEmail.trim(),
        inviteRole,
      );
      setPendingInvites((current) => [result, ...current]);
      setNotification({
        open: true,
        message: `Invitation created for ${inviteEmail.trim()}`,
        severity: "success",
      });
      setInviteEmail("");
      setInviteRole("Member");
    } catch (error) {
      setNotification({
        open: true,
        message:
          error?.response?.data?.error || "Invitation could not be created.",
        severity: "error",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeMember(removeTarget.id);
      if (removeTarget.kind === "invite") {
        setPendingInvites((current) =>
          current.filter((invite) => invite.id !== removeTarget.id),
        );
        setNotification({
          open: true,
          message: "Pending invitation cancelled",
          severity: "success",
        });
      } else {
        setMembers((current) =>
          current.filter((member) => member.id !== removeTarget.id),
        );
        setNotification({
          open: true,
          message: "Member removed from organization",
          severity: "success",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message:
          error?.response?.data?.error || "Access record could not be removed.",
        severity: "error",
      });
    } finally {
      setRemoving(false);
      setRemoveTarget(null);
    }
  };

  const confirmRoleChange = async () => {
    if (!roleTarget || !newRole) return;
    setUpdatingRole(true);
    try {
      const updated = await updateMemberRole(roleTarget.id, newRole);
      setMembers((current) =>
        current.map((member) =>
          member.id === updated.id ? { ...member, role: updated.role } : member,
        ),
      );
      setNotification({
        open: true,
        message: `${roleTarget.name || roleTarget.email} is now ${updated.role}`,
        severity: "success",
      });
      setRoleTarget(null);
      setNewRole("");
    } catch (error) {
      setNotification({
        open: true,
        message: error?.response?.data?.error || "Role could not be updated.",
        severity: "error",
      });
    } finally {
      setUpdatingRole(false);
    }
  };

  const copyInvite = async (invite) => {
    try {
      await navigator.clipboard.writeText(invite.invite_link);
      setNotification({
        open: true,
        message: "Invite link copied",
        severity: "success",
      });
    } catch {
      setNotification({
        open: true,
        message:
          "Clipboard access was denied. Copy the link from your browser manually.",
        severity: "error",
      });
    }
  };

  const openRoleDialog = (member, role) => {
    setRoleTarget(member);
    setNewRole(role);
  };

  if (!canManageUsers) {
    return (
      <StatePanel
        type="error"
        title="Administrator access required"
        description="Your current organization role cannot manage members."
      />
    );
  }

  return (
    <Box className="surface-enter">
      <PageHeader
        eyebrow="Organization access"
        title="People and permissions"
        description={`Control who can access ${membership?.organization_name || "this organization"} and what they are allowed to manage.`}
      >
        {!loading && !loadError && (
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Surface
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <GroupOutlinedIcon sx={{ color: "primary.main", fontSize: 18 }} />
              <Typography variant="caption">
                <strong>{members.length}</strong> members
              </Typography>
            </Surface>
            <Surface
              sx={{
                py: 1,
                px: 1.5,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <MailOutlineRoundedIcon
                sx={{ color: "warning.main", fontSize: 18 }}
              />
              <Typography variant="caption">
                <strong>{pendingInvites.length}</strong> pending
              </Typography>
            </Surface>
          </Stack>
        )}
      </PageHeader>

      {loading && (
        <StatePanel
          type="loading"
          title="Synchronizing access"
          description="Reading organization membership and invitations."
        />
      )}
      {!loading && loadError && (
        <StatePanel
          type="error"
          title="Access data unavailable"
          description={loadError}
          actionLabel="Try again"
          onAction={loadPeople}
        />
      )}

      {!loading && !loadError && (
        <Stack spacing={2.5}>
          <Surface sx={{ p: { xs: 2.25, md: 3 } }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ mb: 2.5 }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  bgcolor: "rgba(116,217,247,.06)",
                  border: "1px solid rgba(116,217,247,.13)",
                }}
              >
                <SendRoundedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="h4">Invite a teammate</Typography>
                <Typography variant="caption" color="text.secondary">
                  Create a secure invitation for an email address.
                </Typography>
              </Box>
            </Stack>
            <Box component="form" onSubmit={handleInvite}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ md: "flex-start" }}
              >
                <TextField
                  label="Email address"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  required
                  disabled={sendingInvite}
                  autoComplete="email"
                  sx={{ flex: 1 }}
                />
                <FormControl sx={{ minWidth: { xs: "100%", md: 150 } }}>
                  <InputLabel id="invite-role-label">Access role</InputLabel>
                  <Select
                    labelId="invite-role-label"
                    label="Access role"
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value)}
                    disabled={sendingInvite}
                  >
                    {ROLES.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={sendingInvite || !inviteEmail.trim()}
                  startIcon={
                    sendingInvite ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SendRoundedIcon />
                    )
                  }
                  sx={{ minHeight: 56, px: 2.5 }}
                >
                  {sendingInvite ? "Creating…" : "Create invite"}
                </Button>
              </Stack>
            </Box>
          </Surface>

          {currentUserIsOnlyOwner && (
            <Surface
              sx={{
                px: 2,
                py: 1.5,
                borderColor: "rgba(242,198,109,.24)",
                bgcolor: "rgba(242,198,109,.035)",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                You are the only Owner. Assign another Owner before changing or
                removing your own access.
              </Typography>
            </Surface>
          )}

          <Surface>
            <Box
              sx={{
                px: { xs: 2.25, md: 3 },
                py: 2.25,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h3">Members</Typography>
              <Typography variant="body2" color="text.secondary">
                Active identities with access to this organization.
              </Typography>
            </Box>

            <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Identity</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Controls</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => {
                    const protectedOwner =
                      member.role === "Owner" && ownerCount === 1;
                    return (
                      <TableRow key={member.id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "rgba(116,217,247,.08)",
                                color: "primary.main",
                                fontSize: 12,
                              }}
                            >
                              {initials(member.name, member.email)}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 650 }}
                              >
                                {member.name || "Unnamed member"}
                                {member.user_id === user?.id ? " · You" : ""}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <RoleChip role={member.role} />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            justifyContent="flex-end"
                            spacing={1}
                          >
                            <Button
                              size="small"
                              color="inherit"
                              startIcon={<ManageAccountsOutlinedIcon />}
                              disabled={protectedOwner}
                              onClick={() =>
                                openRoleDialog(member, member.role)
                              }
                            >
                              Change role
                            </Button>
                            <Tooltip
                              title={
                                protectedOwner
                                  ? "The last Owner cannot be removed"
                                  : "Remove member"
                              }
                            >
                              <span>
                                <IconButton
                                  aria-label={`Remove ${member.email}`}
                                  disabled={protectedOwner}
                                  color="error"
                                  onClick={() =>
                                    setRemoveTarget({
                                      ...member,
                                      kind: "member",
                                    })
                                  }
                                >
                                  <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack
              sx={{ display: { xs: "flex", md: "none" }, p: 1.5 }}
              spacing={1}
            >
              {members.map((member) => {
                const protectedOwner =
                  member.role === "Owner" && ownerCount === 1;
                return (
                  <Box
                    key={member.id}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: "rgba(116,217,247,.08)",
                          color: "primary.main",
                          fontSize: 12,
                        }}
                      >
                        {initials(member.name, member.email)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: 650 }}
                        >
                          {member.name || "Unnamed member"}
                          {member.user_id === user?.id ? " · You" : ""}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: "block" }}
                        >
                          {member.email}
                        </Typography>
                      </Box>
                      <RoleChip role={member.role} />
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                      <Button
                        fullWidth
                        size="small"
                        color="inherit"
                        disabled={protectedOwner}
                        onClick={() => openRoleDialog(member, member.role)}
                      >
                        Change role
                      </Button>
                      <Button
                        fullWidth
                        size="small"
                        color="error"
                        disabled={protectedOwner}
                        onClick={() =>
                          setRemoveTarget({ ...member, kind: "member" })
                        }
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Surface>

          <Surface>
            <Box
              sx={{
                px: { xs: 2.25, md: 3 },
                py: 2.25,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h3">Pending invitations</Typography>
              <Typography variant="body2" color="text.secondary">
                Links waiting to be accepted by a teammate.
              </Typography>
            </Box>
            {pendingInvites.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No invitations are waiting.
                </Typography>
              </Box>
            ) : (
              <Stack sx={{ p: 1.5 }} spacing={1}>
                {pendingInvites.map((invite) => (
                  <Box
                    key={invite.id}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: 650 }}
                        >
                          {invite.email}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{ mt: 0.5 }}
                        >
                          <RoleChip role={invite.role} />
                          <Typography variant="caption" color="text.secondary">
                            Awaiting acceptance
                          </Typography>
                        </Stack>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopyRoundedIcon />}
                          onClick={() => copyInvite(invite)}
                        >
                          Copy link
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() =>
                            setRemoveTarget({ ...invite, kind: "invite" })
                          }
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Surface>
        </Stack>
      )}

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title={
          removeTarget?.kind === "invite"
            ? "Cancel invitation?"
            : "Remove member?"
        }
        description={
          removeTarget?.kind === "invite"
            ? `The invitation for ${removeTarget?.email} will no longer be usable.`
            : `${removeTarget?.name || removeTarget?.email} will lose access to this organization.`
        }
        confirmLabel={
          removeTarget?.kind === "invite"
            ? "Cancel invitation"
            : "Remove member"
        }
        destructive
        busy={removing}
        onClose={() => setRemoveTarget(null)}
        onConfirm={confirmRemove}
      />

      <Dialog
        open={Boolean(roleTarget)}
        onClose={updatingRole ? undefined : () => setRoleTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Change access role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2.5 }}>
            Select the role for {roleTarget?.name || roleTarget?.email}. This
            changes what they can manage.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="change-role-label">New role</InputLabel>
            <Select
              labelId="change-role-label"
              label="New role"
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
            >
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            color="inherit"
            onClick={() => setRoleTarget(null)}
            disabled={updatingRole}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmRoleChange}
            disabled={updatingRole || !newRole || newRole === roleTarget?.role}
          >
            {updatingRole ? "Updating…" : "Update role"}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastNotification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() =>
          setNotification((current) => ({ ...current, open: false }))
        }
      />
    </Box>
  );
};

export default UsersManagementPage;
