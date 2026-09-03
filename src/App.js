import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CamerasPage from "./pages/CamerasPage";
import OperationsDashboard from "./pages/OperationsDashboard";
import RuleConfigPage from "./pages/RuleConfigPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";

const theme = createTheme({
  palette: {
    primary: { main: "#2563eb" },
    secondary: { main: "#7c3aed" },
    background: {
      default: "#f7f9fc",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "Fira Sans",
      "Droid Sans",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { transition: "box-shadow .2s ease, transform .1s ease" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppLayout = () => {
  const { user, signOut, memberships, activeOrgId, switchOrg } = useAuth();
  const currentMembership = memberships.find((m) => m.organization_id === activeOrgId);
  const isAdmin = currentMembership && ["Owner", "Admin"].includes(currentMembership.role);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="sticky" color="primary" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Smart CCTV Console
            </Typography>
            {user && (
              <>
                <Button color="inherit" component={Link} to="/operations">
                  Operations
                </Button>
                <Button color="inherit" component={Link} to="/cameras">
                  Cameras
                </Button>
                {isAdmin && (
                  <Button color="inherit" component={Link} to="/users">
                    Users
                  </Button>
                )}
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {user.name}
                </Typography>
                {memberships.length > 1 && (
                  <Button
                    color="inherit"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      const next = memberships.find((m) => m.organization_id !== activeOrgId);
                      if (next) switchOrg(next.organization_id);
                    }}
                  >
                    Switch Org
                  </Button>
                )}
                <Button color="inherit" onClick={signOut}>
                  Sign out
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/accept-invite" element={<LoginPage />} />
            <Route
              path="/operations"
              element={
                <ProtectedRoute>
                  <OperationsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cameras"
              element={
                <ProtectedRoute>
                  <CamerasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cameras/:cameraId/rule_config"
              element={
                <ProtectedRoute>
                  <RuleConfigPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersManagementPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/operations" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
