import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import RadarRoundedIcon from "@mui/icons-material/RadarRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CameraOutlinedIcon from "@mui/icons-material/CameraOutlined";
import PolylineOutlinedIcon from "@mui/icons-material/PolylineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useAuth } from "../contexts/AuthContext";

const modes = [
  { value: 0, label: "Sign in" },
  { value: 1, label: "Create" },
  { value: 2, label: "Invite" },
];

const LoginPage = () => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, acceptInvite } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      setTab(2);
      setInviteToken(token);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (tab === 0) await signIn(email, password);
      if (tab === 1) await signUp(email, name, password, orgName);
      if (tab === 2) {
        const token =
          new URLSearchParams(window.location.search).get("token") ||
          inviteToken;
        if (!token) throw new Error("Invite token is required");
        await acceptInvite(email, name, password, token);
      }
      navigate("/cameras");
    } catch (err) {
      setError(
        err?.response?.data?.error || err.message || "Authentication failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const changeMode = (_, value) => {
    if (value === null) return;
    setTab(value);
    setError("");
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: "minmax(400px, 1.08fr) minmax(520px, .92fr)",
        },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          p: "clamp(48px, 6vw, 96px)",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid",
          borderColor: "divider",
          background:
            "radial-gradient(circle at 28% 28%, rgba(116,217,247,.13), transparent 27%), linear-gradient(145deg, rgba(255,255,255,.025), transparent 55%)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              border: "1px solid rgba(116,217,247,.24)",
              bgcolor: "rgba(116,217,247,.06)",
            }}
          >
            <RadarRoundedIcon />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 650, letterSpacing: "-.025em" }}>
              Aegis Vision
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Autonomous security operations
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ maxWidth: 680, my: 8 }}>
          <Typography variant="h1" component="h1">
            Awareness,
            <Box component="span" sx={{ color: "primary.main" }}>
              {" "}
              without noise.
            </Box>
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 3, maxWidth: 540, fontSize: 17 }}
          >
            Connect camera infrastructure, define intelligent detection
            boundaries, and keep your team aligned in one precise workspace.
          </Typography>
        </Box>

        <Stack direction="row" spacing={4}>
          {[
            [CameraOutlinedIcon, "Live camera operations"],
            [PolylineOutlinedIcon, "Spatial detection rules"],
            [GroupsOutlinedIcon, "Organization controls"],
          ].map(([Icon, label]) => (
            <Stack key={label} spacing={1}>
              <Icon sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ maxWidth: 110 }}
              >
                {label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 5, lg: 7 },
        }}
      >
        <Box className="surface-enter" sx={{ width: "100%", maxWidth: 480 }}>
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ display: { lg: "none" }, mb: 6 }}
          >
            <RadarRoundedIcon sx={{ color: "primary.main" }} />
            <Typography sx={{ fontWeight: 650 }}>Aegis Vision</Typography>
          </Stack>

          <Typography variant="h2" component="h1">
            {tab === 0
              ? "Welcome back"
              : tab === 1
                ? "Create your workspace"
                : "Join your team"}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3.5 }}>
            {tab === 0
              ? "Enter your credentials to continue to operations."
              : tab === 1
                ? "Set up an organization and become its owner."
                : "Use the invitation details provided by your administrator."}
          </Typography>

          <ToggleButtonGroup
            exclusive
            fullWidth
            value={tab}
            onChange={changeMode}
            aria-label="Authentication mode"
            sx={{
              p: 0.5,
              mb: 3,
              bgcolor: "rgba(255,255,255,.025)",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2.5,
              "& .MuiToggleButton-root": {
                py: 1,
                minWidth: 0,
                border: 0,
                borderRadius: "8px !important",
                color: "text.secondary",
                textTransform: "none",
                fontSize: { xs: 12, sm: 13 },
              },
              "& .Mui-selected": {
                color: "text.primary !important",
                bgcolor: "rgba(116,217,247,.09) !important",
                boxShadow: "inset 0 0 0 1px rgba(116,217,247,.15)",
              },
            }}
          >
            {modes.map((mode) => (
              <ToggleButton key={mode.value} value={mode.value}>
                {mode.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} aria-busy={submitting}>
            <Stack spacing={2}>
              {tab !== 0 && (
                <TextField
                  label="Full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoComplete="name"
                  disabled={submitting}
                />
              )}
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                disabled={submitting}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete={tab === 0 ? "current-password" : "new-password"}
                disabled={submitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((visible) => !visible)}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {tab === 1 && (
                <TextField
                  label="Organization name"
                  value={orgName}
                  onChange={(event) => setOrgName(event.target.value)}
                  required
                  helperText="You will become the Owner of this workspace."
                  autoComplete="organization"
                  disabled={submitting}
                />
              )}
              {tab === 2 && (
                <TextField
                  label="Invite token"
                  value={inviteToken}
                  onChange={(event) => setInviteToken(event.target.value)}
                  required
                  helperText="Paste the token you received from an admin."
                  disabled={submitting}
                />
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                endIcon={
                  submitting ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ArrowForwardRoundedIcon />
                  )
                }
                sx={{ mt: 1, minHeight: 50 }}
              >
                {submitting
                  ? "Authenticating…"
                  : tab === 0
                    ? "Enter workspace"
                    : tab === 1
                      ? "Create workspace"
                      : "Accept invitation"}
              </Button>
            </Stack>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 3, textAlign: "center" }}
          >
            Secure access is scoped to your active organization.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
