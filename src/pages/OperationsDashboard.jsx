import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { fetchOperationsOverview, updateAlertStatus } from "../api/operationsApi";
import { useAuth } from "../contexts/AuthContext";
import { PageHeader, StatePanel, Surface } from "../components/ui/Surface";

const EMPTY_OVERVIEW = {
  summary: {
    new_alerts: 0,
    active_cameras: 0,
    online_cameras: 0,
    attention_cameras: 0,
  },
  alerts: [],
  camera_health: [],
};

const severityColor = {
  CRITICAL: "error",
  HIGH: "error",
  MEDIUM: "warning",
  LOW: "info",
};

const formatEventType = (value = "") =>
  value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatTime = (value) => {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "Unknown time"
    : parsed.toLocaleString();
};

const SummaryCard = ({ label, value, icon, tone = "primary" }) => (
  <Surface sx={{ p: 2, height: "100%" }}>
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
    >
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 700 }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ color: `${tone}.main` }}>{icon}</Box>
    </Stack>
  </Surface>
);

const OperationsDashboard = () => {
  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingAlertId, setUpdatingAlertId] = useState(null);
  const { activeOrgId } = useAuth();

  const loadOverview = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      setOverview(await fetchOperationsOverview());
    } catch (requestError) {
      setError(
        requestError?.response?.data?.error ||
          "The operations overview could not be loaded.",
      );
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    const interval = window.setInterval(
      () => loadOverview({ quiet: true }),
      15000,
    );
    return () => window.clearInterval(interval);
  }, [activeOrgId, loadOverview]);

  const acknowledge = async (alertId) => {
    setUpdatingAlertId(alertId);
    setError("");
    try {
      const updated = await updateAlertStatus(alertId, "ACKNOWLEDGED");
      setOverview((current) => ({
        ...current,
        summary: {
          ...current.summary,
          new_alerts: Math.max(0, current.summary.new_alerts - 1),
        },
        alerts: current.alerts.map((alert) =>
          alert.id === alertId ? updated : alert,
        ),
      }));
    } catch (requestError) {
      setError(
        requestError?.response?.data?.error ||
          "The alert could not be acknowledged.",
      );
    } finally {
      setUpdatingAlertId(null);
    }
  };

  if (loading) {
    return (
      <StatePanel
        type="loading"
        title="Loading operations"
        description="Fetching alerts and camera signals for the active organization."
      />
    );
  }

  if (error && overview.alerts.length === 0 && overview.camera_health.length === 0) {
    return (
      <StatePanel
        type="error"
        title="Operations unavailable"
        description={error}
        actionLabel="Retry"
        onAction={() => loadOverview()}
      />
    );
  }

  return (
    <Box className="surface-enter">
      <PageHeader
        eyebrow="Security operations"
        title="What needs attention now?"
        description="Verify new alerts and check which cameras have a recent analytics signal."
        action={
          <IconButton
            aria-label="Refresh operations overview"
            onClick={() => loadOverview()}
          >
            <RefreshIcon />
          </IconButton>
        }
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            label="New alerts"
            value={overview.summary.new_alerts}
            tone="error"
            icon={<NotificationsActiveOutlinedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            label="Active cameras"
            value={overview.summary.active_cameras}
            icon={<VideocamOutlinedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            label="Recent signal"
            value={overview.summary.online_cameras}
            tone="success"
            icon={<CheckCircleOutlineIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <SummaryCard
            label="Needs verification"
            value={overview.summary.attention_cameras}
            tone="warning"
            icon={<WarningAmberOutlinedIcon />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Surface sx={{ p: 2.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Alert inbox
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Latest detection events across the active organization.
            </Typography>

            {overview.alerts.length === 0 ? (
              <StatePanel
                compact
                title="No alerts yet"
                description="New structured detection events will appear here."
              />
            ) : (
              <Stack spacing={1.5}>
                {overview.alerts.map((alert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Stack spacing={0.75}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            label={alert.event.severity}
                            color={
                              severityColor[alert.event.severity] || "default"
                            }
                            size="small"
                          />
                          <Chip
                            label={alert.status}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                        <Typography sx={{ fontWeight: 700 }}>
                          {formatEventType(alert.event.event_type)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alert.event.camera_name ||
                            `Camera ${alert.event.camera_id}`}
                          {" · "}
                          {formatTime(alert.event.occurred_at)}
                        </Typography>
                      </Stack>
                      {alert.status === "NEW" && (
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<CheckCircleOutlineIcon />}
                          disabled={updatingAlertId === alert.id}
                          onClick={() => acknowledge(alert.id)}
                          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Surface>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Surface sx={{ p: 2.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Camera signals
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This first health signal measures analytics frames. Independent
              camera reachability is the next foundation step.
            </Typography>
            {overview.camera_health.length === 0 ? (
              <Typography color="text.secondary">
                Add a camera to begin health monitoring.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {overview.camera_health.map((camera) => (
                  <Stack
                    key={camera.camera_id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontWeight: 600 }}>
                        {camera.camera_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {camera.last_frame_at
                          ? `Last signal ${formatTime(camera.last_frame_at)}`
                          : "No analytics signal observed"}
                      </Typography>
                    </Box>
                    <Chip
                      label={camera.status}
                      size="small"
                      color={
                        camera.status === "ONLINE"
                          ? "success"
                          : camera.status === "STALE"
                            ? "warning"
                            : "default"
                      }
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </Surface>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OperationsDashboard;
