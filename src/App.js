import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from "react-router-dom";
import CamerasPage from "./pages/CamerasPage";
import RuleConfigPage from "./pages/RuleConfigPage";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from "@mui/material";
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="sticky" color="primary" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Smart CCTV Console
            </Typography>
            <Button color="inherit" component={Link} to="/cameras">
              Cameras
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2 }}>
          <Routes>
            <Route path="/cameras" element={<CamerasPage />} />
            <Route path="/cameras/:cameraId/rule_config" element={<RuleConfigPage />} />
            <Route path="*" element={<Navigate to="/cameras" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
