import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CameraOutlinedIcon from "@mui/icons-material/CameraOutlined";
import { saveCamera } from "../api/camerasApi";

const isValidRtspUrl = (value) => {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value.trim());
    return (
      url.protocol === "rtsp:" && Boolean(url.hostname) && url.pathname !== "/"
    );
  } catch {
    return false;
  }
};

const AddCameraDialog = ({ open, onClose, onCreated, onError }) => {
  const [name, setName] = useState("");
  const [rtsp, setRtsp] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const validUrl = isValidRtspUrl(rtsp);

  useEffect(() => {
    if (!open) {
      setName("");
      setRtsp("");
      setTouched(false);
      setSaving(false);
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (!name.trim() || !validUrl) return;
    setSaving(true);
    try {
      const result = await saveCamera(rtsp.trim(), name.trim());
      onCreated(result.camera);
      onClose();
    } catch (error) {
      onError(error?.response?.data?.error || "Camera could not be added");
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>Connect a camera</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a named RTSP endpoint to this organization. Credentials remain
            part of the secure stream URL.
          </Typography>
          <Stack spacing={2.25}>
            <TextField
              autoFocus
              label="Camera name"
              placeholder="North entrance"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={touched && !name.trim()}
              helperText={
                touched && !name.trim()
                  ? "Enter a recognizable camera name."
                  : "Use a physical location or coverage area."
              }
              disabled={saving}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CameraOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="RTSP endpoint"
              placeholder="rtsp://user:password@host:554/stream"
              value={rtsp}
              onChange={(event) => setRtsp(event.target.value)}
              onBlur={() => setTouched(true)}
              error={touched && !validUrl}
              helperText={
                touched && !validUrl
                  ? "Enter a valid rtsp:// endpoint with a stream path."
                  : "The backend uses this endpoint to ingest the feed."
              }
              disabled={saving}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button color="inherit" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving || !name.trim() || !rtsp}
          >
            {saving ? (
              <>
                <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />{" "}
                Connecting…
              </>
            ) : (
              "Connect camera"
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddCameraDialog;
