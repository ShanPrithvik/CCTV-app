import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Typography,
  IconButton,
  Box,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import {
  fetchRules,
  saveRule,
  updateRule,
  deleteRule,
} from "../api/ruleConfigApi";
import { fetchCamera } from "../api/camerasApi";
import { cameraViewUrl } from "../api/config";
import ROISelector from "../components/ROISelector";
import ToastNotification from "../components/ToastNotification";
import { useParams, useLocation } from "react-router-dom";

const models = [
  { label: "Shoplifting", value: "SHOPLIFTING" },
  { label: "Crowd Detection", value: "CROWD_DETECTION" },
  { label: "Restricted Area", value: "RESTRICTED_AREA" },
];

const getModelLabel = (value) =>
  models.find((m) => m.value === value)?.label || "Not set";

const RuleConfigPage = () => {
  const { cameraId } = useParams();
  const location = useLocation();
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [cameraView, setCameraView] = useState(null);
  const [cameraName, setCameraName] = useState(location.state?.cameraName || "");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const loadRules = async () => {
      try {
        const fetchedRules = await fetchRules(cameraId);
        const formattedRules = fetchedRules.rules.map((rule) => ({
          id: rule.id,
          rule_name: rule.name,
          modelType: rule.modelType,
          roi: rule.rule?.[0]?.roi || [],
          numPeople:
            rule.rule?.[0]?.ruleTypes?.find((r) => r.type === "Number of Person")
              ?.value || "",
          timeLookout:
            rule.rule?.[0]?.ruleTypes?.find((r) => r.type === "Time to Lookout")
              ?.value || "",
        }));
        setRules(formattedRules);
      } catch (error) {
        console.error("Error loading rules:", error);
        setNotification({
          open: true,
          message: "Error loading rules",
          severity: "error",
        });
      }
    };

    const loadCameraView = async () => {
      try {
        const cameraDataRaw = await fetchCamera(cameraId);
        const cameraData = {
          imageUrl: cameraViewUrl(cameraDataRaw.camera_name),
          width: 1280,
          height: 720,
        };
        setCameraName(cameraDataRaw.camera_name || "");
        setCameraView(cameraData);
      } catch (error) {
        console.error("Error fetching camera view:", error);
        setNotification({
          open: true,
          message: "Error fetching camera view",
          severity: "error",
        });
      }
    };

    loadRules();
    loadCameraView();
  }, [cameraId]);

  const handleAddRule = () => {
    const newRule = {
      id: null,
      rule_name: "New Rule",
      modelType: "",
      roi: [],
      numPeople: "",
      timeLookout: "",
    };
    setRules([...rules, newRule]);
    setSelectedRule(newRule);
  };

  const handleDeleteRule = async (index) => {
    try {
      if (rules[index].id) {
        await deleteRule(cameraId, rules[index].id);
      }
      const updatedRules = rules.filter((_, i) => i !== index);
      setRules(updatedRules);
      if (selectedRule?.id === rules[index].id) {
        setSelectedRule(null);
      }
      setNotification({
        open: true,
        message: "Rule deleted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting rule:", error);
      setNotification({
        open: true,
        message: "Error deleting rule",
        severity: "error",
      });
    }
  };

  const handleSaveRule = async () => {
    if (!selectedRule) return;

    try {
      let ruleToSave = {
        name: selectedRule.rule_name,
        modelType: selectedRule.modelType,
        rule: [],
      };

      let ruleEntry = { roi: selectedRule.roi || [], ruleTypes: [] };

      if (selectedRule.modelType === "CROWD_DETECTION") {
        ruleEntry.ruleTypes = [
          { type: "Number of Person", value: selectedRule.numPeople },
          { type: "Time to Lookout", value: selectedRule.timeLookout },
        ];
      }

      if (selectedRule.modelType === "SHOPLIFTING") {
        ruleToSave.rule.push({ roi: [], ruleTypes: [] });
      } else {
        ruleToSave.rule.push(ruleEntry);
      }

      const response = selectedRule.id
        ? await updateRule(cameraId, selectedRule.id, ruleToSave)
        : await saveRule(cameraId, ruleToSave);

      if (!selectedRule.id) {
        setSelectedRule((prev) => ({
          ...prev,
          id: response.id,
        }));

        setRules((prevRules) =>
          prevRules.map((r) => (r === selectedRule ? { ...r, id: response.id } : r))
        );
      } else {
        setSelectedRule((prev) => ({
          ...prev,
          ...response,
        }));
      }

      setNotification({
        open: true,
        message: "Rule saved successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error saving rule:", error);
      setNotification({
        open: true,
        message: "Error saving rule",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Page header */}
      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
              Rule Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure detection rules for camera{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                {cameraName || "Loading..."}
              </Box>
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddRule}
          >
            Add Rule
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2}>
        {/* Left Side: Rule List */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1.2}>
                {rules.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No rules yet. Click "Add Rule" to create one.
                  </Typography>
                )}
                {rules.map((rule, index) => {
                  const selected = selectedRule === rule;
                  return (
                    <Card
                      key={index}
                      onClick={() => setSelectedRule(rule)}
                      sx={{
                        borderRadius: 2,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: selected ? "primary.main" : "divider",
                        bgcolor: selected ? "rgba(37,99,235,0.06)" : "background.paper",
                        transition: "box-shadow .2s ease",
                        "&:hover": { boxShadow: 2 },
                      }}
                      elevation={0}
                    >
                      <CardContent
                        sx={{
                          py: 1.25,
                          px: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 600 }} noWrap title={rule.rule_name}>
                            {rule.rule_name}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Chip
                              size="small"
                              variant="outlined"
                              label={getModelLabel(rule.modelType)}
                            />
                          </Stack>
                        </Box>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRule(index);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Config Panel */}
        <Grid item xs={12} md={8}>
          {selectedRule ? (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.25}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Configure: {selectedRule.rule_name}
                  </Typography>
                  <Divider />

                  <TextField
                    fullWidth
                    label="Rule Name"
                    value={selectedRule.rule_name}
                    onChange={(e) => {
                      setSelectedRule({ ...selectedRule, rule_name: e.target.value });
                      setRules(
                        rules.map((r) =>
                          r === selectedRule ? { ...r, rule_name: e.target.value } : r
                        )
                      );
                    }}
                  />

                  <TextField
                    select
                    fullWidth
                    label="Model Type"
                    value={selectedRule.modelType}
                    onChange={(e) =>
                      setSelectedRule({
                        ...selectedRule,
                        modelType: e.target.value,
                        roi: [],
                      })
                    }
                    helperText="Choose the detection model for this rule."
                  >
                    {models.map((model) => (
                      <MenuItem key={model.value} value={model.value}>
                        {model.label}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Camera View Header */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      {selectedRule.modelType === "SHOPLIFTING"
                        ? "Camera View"
                        : "Camera View — draw the Region of Interest (up to 4 points)"}
                    </Typography>

                    {/* ROI Selector */}
                    {cameraView ? (
                      <Box
                        sx={{
                          borderRadius: 2,
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <ROISelector
                          imageUrl={cameraView.imageUrl}
                          imageWidth={cameraView.width}
                          imageHeight={cameraView.height}
                          initialROI={selectedRule.roi}
                          modelType={selectedRule.modelType}
                          onChange={(roi) =>
                            setSelectedRule({
                              ...selectedRule,
                              roi,
                            })
                          }
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          bgcolor: "background.default",
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 2,
                          p: 3,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Loading camera view...
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Additional Inputs for Crowd Detection */}
                  {selectedRule.modelType === "CROWD_DETECTION" && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Number of People"
                          type="number"
                          value={selectedRule.numPeople}
                          onChange={(e) =>
                            setSelectedRule({ ...selectedRule, numPeople: e.target.value })
                          }
                          helperText="Trigger when the number of people exceeds this value."
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Time to Lookout (seconds)"
                          type="number"
                          value={selectedRule.timeLookout}
                          onChange={(e) =>
                            setSelectedRule({ ...selectedRule, timeLookout: e.target.value })
                          }
                          helperText="Trigger if the condition persists for this duration."
                        />
                      </Grid>
                    </Grid>
                  )}

                  <Box sx={{ textAlign: "right" }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveRule}
                    >
                      Save Rule
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                  No rule selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Select a rule from the list or click "Add Rule" to create a new one.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Toast Notification */}
      <ToastNotification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Container>
  );
};

export default RuleConfigPage;
