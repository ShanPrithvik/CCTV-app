import React, { useState } from "react";
import { deleteCamera } from "../api/camerasApi";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import CameraOutlinedIcon from "@mui/icons-material/CameraOutlined";
import { useNavigate } from "react-router-dom";
import LiveView from "./LiveView";
import ConfirmDialog from "./ui/ConfirmDialog";
import { StatusDot, Surface } from "./ui/Surface";

const CameraItem = ({ camera, canManage = true, onDeleted, onNotify }) => {
  const [showLiveView, setShowLiveView] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const endpointLabel = (() => {
    try {
      const parsed = new URL(camera.rtsp_url);
      return `${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}${parsed.pathname}`;
    } catch {
      return "RTSP endpoint";
    }
  })();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCamera(camera.id);
      onDeleted(camera.id);
      onNotify("Camera removed from this organization");
    } catch (error) {
      onNotify(
        error?.response?.data?.error || "Camera could not be removed",
        "error",
      );
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Surface
        component="article"
        sx={{
          height: "100%",
          transition: "border-color 180ms ease, transform 180ms ease",
          "&:hover": {
            borderColor: "rgba(116,217,247,.22)",
            transform: "translateY(-1px)",
          },
        }}
      >
        <Box sx={{ p: { xs: 2.25, sm: 2.75 } }}>
          <Stack spacing={2.5}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(116,217,247,.06)",
                    color: "primary.main",
                    border: "1px solid rgba(116,217,247,.13)",
                  }}
                >
                  <CameraOutlinedIcon fontSize="small" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    noWrap
                    title={camera.camera_name || "Camera"}
                  >
                    {camera.camera_name || "Unnamed camera"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ display: "block", mt: 0.4 }}
                    title={endpointLabel}
                  >
                    {endpointLabel}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Chip
                  label={`ID ${camera.id}`}
                  size="small"
                  variant="outlined"
                />
                {canManage && (
                  <Tooltip title="Remove camera">
                    <IconButton
                      aria-label={`Remove ${camera.camera_name || "camera"}`}
                      size="small"
                      color="error"
                      onClick={() => setConfirmOpen(true)}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <StatusDot
                label={
                  showLiveView
                    ? "Feed viewport open"
                    : canManage
                      ? "Ready for monitoring"
                      : "View access"
                }
                color={showLiveView ? "success.main" : "text.secondary"}
                pulse={showLiveView}
              />
              <Stack direction="row" spacing={1}>
                {canManage && (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<TuneRoundedIcon />}
                    onClick={() =>
                      navigate(`/cameras/${camera.id}/rule_config`, {
                        state: { cameraName: camera.camera_name },
                      })
                    }
                  >
                    Rules
                  </Button>
                )}
                <Button
                  size="small"
                  variant={showLiveView ? "contained" : "outlined"}
                  startIcon={
                    showLiveView ? (
                      <KeyboardArrowUpRoundedIcon />
                    ) : (
                      <VideocamOutlinedIcon />
                    )
                  }
                  onClick={() => setShowLiveView((visible) => !visible)}
                  aria-expanded={showLiveView}
                >
                  {showLiveView ? "Close" : "Live view"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {showLiveView && (
          <Box
            sx={{
              borderTop: "1px solid",
              borderColor: "divider",
              p: { xs: 1, sm: 1.5 },
              bgcolor: "rgba(0,0,0,.16)",
            }}
          >
            <LiveView cameraId={camera.id} />
          </Box>
        )}
      </Surface>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove camera?"
        description={`This removes ${camera.camera_name || "this camera"} and its endpoint from the organization. This action cannot be undone.`}
        confirmLabel="Remove camera"
        destructive
        busy={deleting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default CameraItem;
