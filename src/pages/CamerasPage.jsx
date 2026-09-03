import React, { useCallback, useEffect, useState } from "react";
import CameraItem from "../components/CameraItem";
import { fetchCameras } from "../api/camerasApi";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CameraOutlinedIcon from "@mui/icons-material/CameraOutlined";
import { useAuth } from "../contexts/AuthContext";
import usePermissions from "../hooks/usePermissions";
import AddCameraDialog from "../components/AddCameraDialog";
import ToastNotification from "../components/ToastNotification";
import { PageHeader, StatePanel, Surface } from "../components/ui/Surface";

const CamerasPage = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const { activeOrgId } = useAuth();
  const { canManage, membership } = usePermissions();

  const loadCameras = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCameras(await fetchCameras());
    } catch (requestError) {
      setError(
        requestError?.response?.data?.error ||
          "Camera inventory is unavailable.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCameras();
  }, [activeOrgId, loadCameras]);

  return (
    <Box className="surface-enter">
      <PageHeader
        eyebrow="Camera network"
        title="Operational awareness"
        description={`Monitor connected feeds and configure detection behavior for ${membership?.organization_name || "your organization"}.`}
        action={
          canManage && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddOpen(true)}
            >
              Connect camera
            </Button>
          )
        }
      >
        {!loading && !error && (
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Surface
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.2,
                py: 1,
                px: 1.5,
                borderRadius: 2,
              }}
            >
              <CameraOutlinedIcon
                sx={{ color: "primary.main", fontSize: 18 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 650 }}>
                {cameras.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {cameras.length === 1 ? "camera" : "cameras"}
              </Typography>
            </Surface>
            <Surface sx={{ py: 1, px: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Access ·{" "}
              </Typography>
              <Typography
                component="span"
                variant="caption"
                sx={{ color: "text.primary", fontWeight: 650 }}
              >
                {membership?.role || "Member"}
              </Typography>
            </Surface>
          </Stack>
        )}
      </PageHeader>

      {loading && (
        <StatePanel
          type="loading"
          title="Synchronizing cameras"
          description="Reading the active organization’s camera inventory."
        />
      )}
      {!loading && error && (
        <StatePanel
          type="error"
          title="Camera network unavailable"
          description={error}
          actionLabel="Try again"
          onAction={loadCameras}
        />
      )}
      {!loading && !error && cameras.length === 0 && (
        <StatePanel
          title="No cameras connected"
          description={
            canManage
              ? "Connect your first RTSP endpoint to begin configuring intelligent detection."
              : "An administrator has not connected any cameras to this organization yet."
          }
          actionLabel={canManage ? "Connect camera" : undefined}
          onAction={canManage ? () => setAddOpen(true) : undefined}
        />
      )}
      {!loading && !error && cameras.length > 0 && (
        <Grid container spacing={2.5}>
          {cameras.map((camera) => (
            <Grid item xs={12} xl={6} key={camera.id}>
              <CameraItem
                camera={camera}
                canManage={canManage}
                onDeleted={(id) =>
                  setCameras((items) => items.filter((item) => item.id !== id))
                }
                onNotify={(message, severity = "success") =>
                  setNotification({ open: true, message, severity })
                }
              />
            </Grid>
          ))}
        </Grid>
      )}

      <AddCameraDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(camera) => {
          setCameras((items) => [camera, ...items]);
          setNotification({
            open: true,
            message: `${camera.camera_name || "Camera"} connected`,
            severity: "success",
          });
        }}
        onError={(message) =>
          setNotification({ open: true, message, severity: "error" })
        }
      />
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

export default CamerasPage;
