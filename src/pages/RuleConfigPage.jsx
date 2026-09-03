import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import {
  deleteRule,
  fetchRules,
  saveRule,
  updateRule,
} from "../api/ruleConfigApi";
import { fetchCamera } from "../api/camerasApi";
import { cameraViewUrl } from "../api/config";
import ROISelector from "../components/ROISelector";
import ToastNotification from "../components/ToastNotification";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { PageHeader, StatePanel, Surface } from "../components/ui/Surface";

const models = [
  {
    label: "Shoplifting",
    value: "SHOPLIFTING",
    description: "Scene-wide behavioral analysis",
  },
  {
    label: "Crowd detection",
    value: "CROWD_DETECTION",
    description: "Density threshold within a selected area",
  },
  {
    label: "Restricted area",
    value: "RESTRICTED_AREA",
    description: "Presence detection inside a protected zone",
  },
];

const modelLabel = (value) =>
  models.find((model) => model.value === value)?.label || "Model not set";
const localKey = () =>
  `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeRule = (rule) => ({
  id: rule.id,
  key: rule.id ? `rule-${rule.id}` : localKey(),
  rule_name: rule.name,
  modelType: rule.modelType,
  roi: rule.rule?.[0]?.roi || [],
  numPeople:
    rule.rule?.[0]?.ruleTypes?.find((item) => item.type === "Number of Person")
      ?.value || "",
  timeLookout:
    rule.rule?.[0]?.ruleTypes?.find((item) => item.type === "Time to Lookout")
      ?.value || "",
});

const RuleConfigPage = () => {
  const { cameraId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [cameraView, setCameraView] = useState(null);
  const [cameraName, setCameraName] = useState(
    location.state?.cameraName || "",
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const selectedRule = rules.find((rule) => rule.key === selectedKey) || null;

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [rulesData, cameraData] = await Promise.all([
        fetchRules(cameraId),
        fetchCamera(cameraId),
      ]);
      const normalized = (rulesData.rules || []).map(normalizeRule);
      setRules(normalized);
      setCameraName(
        cameraData.camera_name || location.state?.cameraName || "Camera",
      );
      setCameraView({ imageUrl: cameraViewUrl(cameraData.camera_name) });
      setSelectedKey((current) =>
        current && normalized.some((rule) => rule.key === current)
          ? current
          : normalized[0]?.key || null,
      );
    } catch (error) {
      setLoadError(
        error?.response?.data?.error ||
          "Rule workspace could not be synchronized.",
      );
    } finally {
      setLoading(false);
    }
  }, [cameraId, location.state?.cameraName]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const addRule = () => {
    const nextRule = {
      id: null,
      key: localKey(),
      rule_name: "Untitled rule",
      modelType: "",
      roi: [],
      numPeople: "",
      timeLookout: "",
    };
    setRules((current) => [nextRule, ...current]);
    setSelectedKey(nextRule.key);
  };

  const updateSelected = (changes) => {
    setRules((current) =>
      current.map((rule) =>
        rule.key === selectedKey ? { ...rule, ...changes } : rule,
      ),
    );
  };

  const saveSelected = async () => {
    if (!selectedRule) return;
    if (!selectedRule.rule_name.trim() || !selectedRule.modelType) {
      setNotification({
        open: true,
        message: "Add a rule name and detection model before saving.",
        severity: "warning",
      });
      return;
    }

    const ruleEntry = {
      roi: selectedRule.roi || [],
      ruleTypes:
        selectedRule.modelType === "CROWD_DETECTION"
          ? [
              { type: "Number of Person", value: selectedRule.numPeople },
              { type: "Time to Lookout", value: selectedRule.timeLookout },
            ]
          : [],
    };
    const payload = {
      name: selectedRule.rule_name.trim(),
      modelType: selectedRule.modelType,
      rule: [
        selectedRule.modelType === "SHOPLIFTING"
          ? { roi: [], ruleTypes: [] }
          : ruleEntry,
      ],
    };

    setSaving(true);
    try {
      const response = selectedRule.id
        ? await updateRule(cameraId, selectedRule.id, payload)
        : await saveRule(cameraId, payload);
      setRules((current) =>
        current.map((rule) =>
          rule.key === selectedRule.key
            ? { ...rule, id: rule.id || response.id }
            : rule,
        ),
      );
      setNotification({
        open: true,
        message: "Detection rule synchronized",
        severity: "success",
      });
    } catch (error) {
      const updateUnavailable =
        selectedRule.id && [404, 405].includes(error?.response?.status);
      setNotification({
        open: true,
        message: updateUnavailable
          ? "This backend deployment does not support updating existing rules yet."
          : error?.response?.data?.error || "Rule could not be saved.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.id) await deleteRule(cameraId, deleteTarget.id);
      setRules((current) =>
        current.filter((rule) => rule.key !== deleteTarget.key),
      );
      if (selectedKey === deleteTarget.key) setSelectedKey(null);
      setNotification({
        open: true,
        message: "Detection rule removed",
        severity: "success",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error?.response?.data?.error || "Rule could not be removed.",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Box className="surface-enter">
      <Button
        color="inherit"
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => navigate("/cameras")}
        sx={{ mb: 2 }}
      >
        Camera network
      </Button>
      <PageHeader
        eyebrow="Detection intelligence"
        title={cameraName || "Rule workspace"}
        description="Define how this camera interprets activity. Each rule combines a detection model with the spatial context it needs."
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={addRule}
          >
            New rule
          </Button>
        }
      />

      {loading && (
        <StatePanel
          type="loading"
          title="Preparing rule workspace"
          description="Loading camera context and detection policies."
        />
      )}
      {!loading && loadError && (
        <StatePanel
          type="error"
          title="Rules unavailable"
          description={loadError}
          actionLabel="Try again"
          onAction={loadWorkspace}
        />
      )}

      {!loading && !loadError && (
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={4} lg={3.5}>
            <Surface sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
              <Box
                sx={{
                  px: 2.25,
                  py: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h4">Detection rules</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rules.length} configured
                    </Typography>
                  </Box>
                  <Tooltip title="Add rule">
                    <IconButton
                      aria-label="Add detection rule"
                      onClick={addRule}
                    >
                      <AddRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              {rules.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <AutoAwesomeOutlinedIcon
                    sx={{ color: "primary.main", mb: 1 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    No detection logic yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Create a rule to begin interpreting this feed.
                  </Typography>
                </Box>
              ) : (
                <List aria-label="Detection rules" disablePadding sx={{ p: 1 }}>
                  {rules.map((rule) => (
                    <ListItemButton
                      key={rule.key}
                      selected={selectedKey === rule.key}
                      onClick={() => setSelectedKey(rule.key)}
                      sx={{
                        mb: 0.5,
                        borderRadius: 2,
                        alignItems: "flex-start",
                        "&.Mui-selected": {
                          bgcolor: "rgba(116,217,247,.08)",
                          boxShadow: "inset 0 0 0 1px rgba(116,217,247,.12)",
                        },
                      }}
                    >
                      <ListItemText
                        primary={rule.rule_name || "Untitled rule"}
                        secondary={modelLabel(rule.modelType)}
                        primaryTypographyProps={{
                          noWrap: true,
                          fontWeight: 600,
                          fontSize: 14,
                        }}
                        secondaryTypographyProps={{
                          noWrap: true,
                          fontSize: 12,
                          mt: 0.4,
                        }}
                      />
                      <IconButton
                        size="small"
                        aria-label={`Delete ${rule.rule_name || "rule"}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleteTarget(rule);
                        }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Surface>
          </Grid>

          <Grid item xs={12} md={8} lg={8.5}>
            {!selectedRule ? (
              <StatePanel
                title="Select a rule"
                description="Choose a detection rule from the navigator or create a new one."
                actionLabel="Create rule"
                onAction={addRule}
              />
            ) : (
              <Surface>
                <Box sx={{ p: { xs: 2.25, sm: 3 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.5}
                  >
                    <Box>
                      <Typography variant="h3">Rule parameters</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Configure the model, spatial boundary, and trigger
                        conditions.
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={selectedRule.id ? "success" : "warning"}
                      label={selectedRule.id ? "Synchronized" : "Unsaved"}
                    />
                  </Stack>
                  <Divider sx={{ my: 3 }} />

                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Rule name"
                          value={selectedRule.rule_name}
                          onChange={(event) =>
                            updateSelected({ rule_name: event.target.value })
                          }
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          label="Detection model"
                          value={selectedRule.modelType}
                          onChange={(event) =>
                            updateSelected({
                              modelType: event.target.value,
                              roi: [],
                            })
                          }
                        >
                          {models.map((model) => (
                            <MenuItem key={model.value} value={model.value}>
                              {model.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>

                    {selectedRule.modelType && (
                      <Alert
                        severity="info"
                        icon={false}
                        sx={{
                          border: "1px solid rgba(116,217,247,.14)",
                          bgcolor: "rgba(116,217,247,.045)",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {modelLabel(selectedRule.modelType)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {
                            models.find(
                              (model) => model.value === selectedRule.modelType,
                            )?.description
                          }
                        </Typography>
                      </Alert>
                    )}

                    <Box>
                      <Stack
                        direction="row"
                        alignItems="flex-end"
                        justifyContent="space-between"
                        sx={{ mb: 1.25 }}
                      >
                        <Box>
                          <Typography variant="h4">Spatial context</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedRule.modelType === "SHOPLIFTING"
                              ? "This model analyzes the complete scene."
                              : "Place up to four points around the monitored area."}
                          </Typography>
                        </Box>
                        {selectedRule.roi?.length > 0 && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${selectedRule.roi.length} points`}
                          />
                        )}
                      </Stack>
                      {cameraView ? (
                        <ROISelector
                          imageUrl={cameraView.imageUrl}
                          initialROI={selectedRule.roi}
                          modelType={selectedRule.modelType}
                          onChange={(roi) => updateSelected({ roi })}
                        />
                      ) : (
                        <StatePanel
                          compact
                          type="loading"
                          title="Loading camera snapshot"
                        />
                      )}
                    </Box>

                    {selectedRule.modelType === "CROWD_DETECTION" && (
                      <Box>
                        <Typography variant="h4" sx={{ mb: 1.5 }}>
                          Trigger threshold
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="People count"
                              type="number"
                              value={selectedRule.numPeople}
                              onChange={(event) =>
                                updateSelected({
                                  numPeople: event.target.value,
                                })
                              }
                              helperText="Trigger above this number of people."
                              inputProps={{ min: 1 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Persistence time"
                              type="number"
                              value={selectedRule.timeLookout}
                              onChange={(event) =>
                                updateSelected({
                                  timeLookout: event.target.value,
                                })
                              }
                              helperText="Seconds the condition must persist."
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Stack>
                </Box>
                <Box
                  sx={{
                    px: { xs: 2.25, sm: 3 },
                    py: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: "rgba(0,0,0,.12)",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={
                      saving ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <SaveRoundedIcon />
                      )
                    }
                    disabled={saving}
                    onClick={saveSelected}
                  >
                    {saving ? "Synchronizing…" : "Save rule"}
                  </Button>
                </Box>
              </Surface>
            )}
          </Grid>
        </Grid>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete detection rule?"
        description={`Delete ${deleteTarget?.rule_name || "this rule"} from this camera? This action cannot be undone.`}
        confirmLabel="Delete rule"
        destructive
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
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

export default RuleConfigPage;
