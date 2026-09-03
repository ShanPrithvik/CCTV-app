import React, { useState, useEffect } from "react";
import CameraItem from "../components/CameraItem";
import { fetchCameras } from "../api/camerasApi";
import { Button, Container, Grid, Typography, Paper, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../contexts/AuthContext";

const CamerasPage = () => {
  const [cameras, setCameras] = useState([]);
  const { user, memberships } = useAuth();
  const activeOrgId = user?.active_organization_id || memberships[0]?.organization_id || null;
  const currentMembership = memberships.find((m) => m.organization_id === activeOrgId);
  const canManage = currentMembership && ["Owner", "Admin"].includes(currentMembership.role);

  useEffect(() => {
    fetchCameras().then(setCameras).catch(console.error);
  }, [activeOrgId]);

  const handleAddCamera = () => {
    const tempId = `tmp_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setCameras([
      ...cameras,
      { id: null, tempId, camera_name: "", rtsp_url: "", isNew: true },
    ]);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Smart - Camera Management
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Manage your camera endpoints and configure detection rules.
        </Typography>
        <Box sx={{ textAlign: "center", mt: 2 }}>
          {canManage && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddCamera}
              size="medium"
            >
              Add Camera
            </Button>
          )}
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {cameras.map((camera, index) => (
          <Grid item xs={12} key={camera.id || index}>
            <CameraItem camera={camera} setCameras={setCameras} cameras={cameras} canManage={canManage} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CamerasPage;
