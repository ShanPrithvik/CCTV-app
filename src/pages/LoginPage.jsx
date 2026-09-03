import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");
  const { signIn, signUp, acceptInvite } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setTab(2);
      setInviteToken(token);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (tab === 0) {
        await signIn(email, password);
      } else if (tab === 1) {
        await signUp(email, name, password, orgName);
      } else if (tab === 2) {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token") || inviteToken;
        if (!token) {
          setError("Invite token is required");
          return;
        }
        await acceptInvite(email, name, password, token);
      }
      navigate("/cameras");
    } catch (err) {
      setError(err?.response?.data?.error || "Authentication failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Smart CCTV Console
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to manage cameras and detection rules.
        </Typography>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Sign in" />
          <Tab label="Register" />
          <Tab label="Accept Invite" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {tab !== 0 && (
              <TextField
                label="Full name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={tab !== 0}
              />
            )}
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {tab === 1 && (
              <TextField
                label="Organization name"
                fullWidth
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                helperText="Creates a new organization and makes you its Owner."
              />
            )}
            {tab === 2 && (
              <TextField
                label="Invite token"
                fullWidth
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                required
                helperText="Paste the token you received from an admin."
              />
            )}
            <Button type="submit" variant="contained" size="large">
              {tab === 0 ? "Sign in" : tab === 1 ? "Create account" : "Accept invite"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
