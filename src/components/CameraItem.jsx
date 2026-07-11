import React, { useState } from "react";
import { saveCamera, deleteCamera } from "../api/camerasApi";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Chip,
  Tooltip,
  InputAdornment,
  Typography,
  Box,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import { useNavigate } from "react-router-dom";
import ToastNotification from "./ToastNotification";

const CameraItem = ({ camera, setCameras, cameras }) => {
  const [name, setName] = useState(camera.camera_name || "");
  const [rtsp, setRtsp] = useState(camera.rtsp_url);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  const validateRtspUrl = (url) => {
    if (!url || !url.trim()) return false;
    const trimmedUrl = url.trim();
    // Regex for basic RTSP URL validation: rtsp://host[:port]/path
    // Host: alphanumeric, ., -
    // Port: optional digits
    // Path: alphanumeric, ., _, /, -
    const rtspRegex = /^rtsp:\/\/[a-zA-Z0-9.-]+(?::\d+)?\/[a-zA-Z0-9._/-]+$/;
    if (!rtspRegex.test(trimmedUrl)) return false;
    try {
      const parsedUrl = new URL(trimmedUrl);
      return parsedUrl.protocol === "rtsp:";
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateRtspUrl(rtsp)) {
      setNotification({
        open: true,
        message: "Invalid RTSP URL. Please enter a valid RTSP URL",
        severity: "error",
      });
      return;
    }
    try {
      const newCamera = await saveCamera(rtsp, name);
      const updatedCameras = cameras.map((c) => {
        if (c.id && c.id === camera.id) return newCamera.camera;
        if (c.tempId && camera.tempId && c.tempId === camera.tempId) return newCamera.camera;
        return c;
      });
      setCameras(updatedCameras);
      setNotification({
        open: true,
        message: "Camera saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving camera:", error);
      setNotification({
        open: true,
        message: "Failed to save camera",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCamera(camera.id);
      setCameras(cameras.filter((c) => c.id !== camera.id));
      setNotification({
        open: true,
        message: "Camera removed successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting camera:", error);
      setNotification({
        open: true,
        message: "Failed to delete camera",
        severity: "error",
      });
    }
  };

  const handleRuleConfig = () => {
    navigate(`/cameras/${camera.id}/rule_config`, { state: { cameraName: camera.camera_name } });
  };

  const isNew = !!camera.isNew;

  return (
    <>
      <Card
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          transition: "transform .05s ease, box-shadow .2s ease",
          "&:hover": { boxShadow: 3 },
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {isNew ? (name?.trim() || "New Camera") : (camera.camera_name || "Camera")}
                </Typography>
                <Chip
                  label={isNew ? "New" : "Saved"}
                  color={isNew ? "warning" : "success"}
                  size="small"
                  variant={isNew ? "filled" : "outlined"}
                />
                {!isNew && camera.id && (
                  <Chip
                    label={`ID: ${camera.id}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Stack>

            <TextField
              label="Camera Name"
              placeholder="e.g., Entrance Lobby"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isNew}
              required
              autoFocus
              fullWidth
              size="small"
            />

            <TextField
              label="RTSP URL"
              placeholder="rtsp://username:password@host:554/stream"
              variant="outlined"
              value={rtsp}
              onChange={(e) => setRtsp(e.target.value)}
              disabled={!isNew}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {isNew ? (
                <Tooltip title="Save this camera endpoint">
                  <span>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={!rtsp || !name.trim()}
                    >
                      Save
                    </Button>
                  </span>
                </Tooltip>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<SettingsIcon />}
                    onClick={handleRuleConfig}
                    sx={{ whiteSpace: "nowrap", minWidth: 130, flexShrink: 0 }}
                  >
                    Rule Config
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    sx={{ whiteSpace: "nowrap", minWidth: 110, flexShrink: 0 }}
                  >
                    Remove
                  </Button>
                </>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <ToastNotification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </>
  );
};

export default CameraItem;
