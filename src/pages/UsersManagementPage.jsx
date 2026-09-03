import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Stack,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SendIcon from "@mui/icons-material/Send";
import {
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  listPendingInvites,
} from "../api/authApi";
import { useAuth } from "../contexts/AuthContext";

const ROLES = ["Owner", "Admin", "Member"];

const UsersManagementPage = () => {
  const { user, memberships, activeOrgId } = useAuth();
  const currentMembership = memberships.find((m) => m.organization_id === activeOrgId);
  const isAdmin = currentMembership && ["Owner", "Admin"].includes(currentMembership.role);
  const orgId = activeOrgId;

  const [members, setMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [removeTarget, setRemoveTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    if (!isAdmin || !orgId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const [membersData, invitesData] = await Promise.all([
          listMembers(orgId),
          listPendingInvites(orgId),
        ]);
        if (!cancelled) {
          setMembers(membersData);
          setPendingInvites(invitesData);
        }
      } catch (error) {
        if (!cancelled) {
          setNotification({
            open: true,
            message: error?.response?.data?.error || "Failed to load users",
            severity: "error",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, orgId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      const result = await inviteMember(orgId, inviteEmail.trim(), inviteRole);
      setNotification({
        open: true,
        message: `Invitation sent to ${inviteEmail}`,
        severity: "success",
      });
      setInviteEmail("");
      setInviteRole("Member");
      setPendingInvites((prev) => [result, ...prev]);
    } catch (error) {
      setNotification({
        open: true,
        message: error?.response?.data?.error || "Failed to send invite",
        severity: "error",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeMember(removeTarget.id);
      setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
      setNotification({
        open: true,
        message: "Member removed successfully",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error?.response?.data?.error || "Failed to remove member",
        severity: "error",
      });
    } finally {
      setRemoveTarget(null);
    }
  };

  const cancelInvite = async (invite) => {
    try {
      await removeMember(invite.id);
      setPendingInvites((prev) => prev.filter((m) => m.id !== invite.id));
      setNotification({
        open: true,
        message: `Invitation to ${invite.email} cancelled`,
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error?.response?.data?.error || "Failed to cancel invite",
        severity: "error",
      });
    }
  };

  const confirmRoleChange = async () => {
    if (!roleTarget || !newRole) return;
    try {
      const updated = await updateMemberRole(roleTarget.id, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === updated.id ? { ...m, role: updated.role } : m))
      );
      setNotification({
        open: true,
        message: "Role updated successfully",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error?.response?.data?.error || "Failed to update role",
        severity: "error",
      });
    } finally {
      setRoleTarget(null);
      setNewRole("");
    }
  };

  const copyInviteLink = (inviteLink) => {
    navigator.clipboard.writeText(inviteLink);
    setNotification({ open: true, message: "Invite link copied", severity: "success" });
  };

  const ownerCount = members.filter((m) => m.role === "Owner").length;
  const isLastOwner = ownerCount === 1 && user && members.some((m) => m.user_id === user.id && m.role === "Owner");

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">You do not have permission to manage users.</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading users...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
          User Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Invite members and manage roles for <strong>{currentMembership?.organization_name || "your organization"}</strong>.
        </Typography>

        <Box component="form" onSubmit={handleInvite} sx={{ mt: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
            <TextField
              label="Email address"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              sx={{ flex: 1, minWidth: 240 }}
              helperText="The user must register with this email to accept the invite."
            />
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel id="invite-role-label">Role</InputLabel>
              <Select
                labelId="invite-role-label"
                value={inviteRole}
                label="Role"
                onChange={(e) => setInviteRole(e.target.value)}
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
              startIcon={<SendIcon />}
              disabled={sendingInvite || !inviteEmail.trim()}
              sx={{ whiteSpace: "nowrap" }}
            >
              {sendingInvite ? "Sending..." : "Send Invite"}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {isLastOwner && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You are the only Owner. You cannot remove yourself or demote to non-Owner until another Owner exists.
        </Alert>
      )}

      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Members ({members.length})
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => {
                  const memberIsLastOwner = member.role === "Owner" && ownerCount === 1;
                  const canChangeRole = isAdmin && !memberIsLastOwner;
                  const canRemove = isAdmin && !memberIsLastOwner;

                  return (
                    <TableRow key={member.id} hover>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={member.role}
                          size="small"
                          color={member.role === "Owner" ? "error" : member.role === "Admin" ? "warning" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={member.role}
                              displayEmpty
                              disabled={!canChangeRole}
                              onChange={(e) => {
                                setRoleTarget(member);
                                setNewRole(e.target.value);
                              }}
                            >
                              {ROLES.map((role) => (
                                <MenuItem key={role} value={role}>
                                  {role}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Tooltip title={canRemove ? "" : "Cannot remove the last Owner"}>
                            <span>
                              <IconButton
                                color="error"
                                size="small"
                                disabled={!canRemove}
                                onClick={() => setRemoveTarget(member)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>

                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No members yet. Invite someone above.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {pendingInvites.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Pending Invites ({pendingInvites.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingInvites.map((invite) => (
                    <TableRow key={invite.id} hover>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>
                        <Chip label={invite.role} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={() => copyInviteLink(invite.invite_link)}
                          >
                            Copy Link
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => cancelInvite(invite)}
                          >
                            Cancel
                          </Button>

                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Stack>

      <Dialog open={Boolean(removeTarget)} onClose={() => setRemoveTarget(null)}>
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove <strong>{removeTarget?.email}</strong> from this organization?
            This is temporary — they can be re-invited later.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(null)}>Cancel</Button>
          <Button onClick={confirmRemove} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(roleTarget)} onClose={() => setRoleTarget(null)}>
        <DialogTitle>Change Role</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change role for <strong>{roleTarget?.email}</strong>:
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="role-change-label">New Role</InputLabel>
            <Select
              labelId="role-change-label"
              value={newRole}
              label="New Role"
              onChange={(e) => setNewRole(e.target.value)}
            >
              {ROLES.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleTarget(null)}>Cancel</Button>
          <Button onClick={confirmRoleChange} variant="contained">
            Update Role
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
      />
    </Container>
  );
};

export default UsersManagementPage;
