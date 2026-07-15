import React, { useState } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { cameraStreamUrl } from "../api/config";

// Simple MJPEG live view: a plain <img> pointed at the backend's streaming
// endpoint. The backend publishes the latest annotated frame (ROI, boxes,
// alert overlays) from whichever detection rule is running for this camera.
const LiveView = ({ cameraId }) => {
  const [nonce, setNonce] = useState(0);
  const [errored, setErrored] = useState(false);

  const handleRetry = () => {
    setErrored(false);
    setNonce((n) => n + 1);
  };

  const streamSrc = `${cameraStreamUrl(cameraId)}?t=${nonce}`;

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "black",
        aspectRatio: "16 / 9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!errored ? (
        <img
          key={nonce}
          src={streamSrc}
          alt={`Live view for camera ${cameraId}`}
          onError={() => setErrored(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
      ) : (
        <Box sx={{ textAlign: "center", color: "white", p: 2 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            No live stream yet. Start a detection rule for this camera, then retry.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
          >
            Retry
          </Button>
        </Box>
      )}
      <Chip
        label="LIVE"
        color="error"
        size="small"
        sx={{ position: "absolute", top: 8, left: 8, fontWeight: 700 }}
      />
    </Box>
  );
};

export default LiveView;
