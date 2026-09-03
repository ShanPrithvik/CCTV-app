import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CamerasPage from "./pages/CamerasPage";
import OperationsDashboard from "./pages/OperationsDashboard";
import RuleConfigPage from "./pages/RuleConfigPage";
import UsersManagementPage from "./pages/UsersManagementPage";
import LoginPage from "./pages/LoginPage";
import AppShell from "./components/AppShell";
import usePermissions from "./hooks/usePermissions";
import theme from "./theme";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AppLoading />;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
};

const ManagementRoute = ({ children }) => {
  const { canManage } = usePermissions();
  if (!canManage) return <Navigate to="/operations" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <AppLoading />;
  if (user) return <Navigate to="/operations" replace />;
  return children;
};

const AppLoading = () => (
  <Box
    role="status"
    aria-live="polite"
    sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
  >
    <Stack alignItems="center" spacing={2}>
      <Box className="brand-orbit">
        <Box className="brand-orbit-core" />
      </Box>
      <CircularProgress size={20} thickness={3} />
      <Typography variant="caption" color="text.secondary">
        Synchronizing workspace
      </Typography>
    </Stack>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/accept-invite"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
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
                  <ManagementRoute>
                    <RuleConfigPage />
                  </ManagementRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <ManagementRoute>
                    <UsersManagementPage />
                  </ManagementRoute>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/operations" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
