import React, { useState, useEffect } from "react";
import CameraItem from "../components/CameraItem";
import { fetchCameras } from "../api/camerasApi";
import { Button, Container, Grid, Typography, Paper, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const CamerasPage = () => {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    fetchCameras().then(setCameras).catch(console.error);
  }, []);

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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddCamera}
            size="medium"
          >
            Add Camera
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {cameras.map((camera, index) => (
          <Grid item xs={12} key={index}>
            <CameraItem camera={camera} setCameras={setCameras} cameras={cameras} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default CamerasPage;
