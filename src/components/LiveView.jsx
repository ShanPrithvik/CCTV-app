import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { cameraStreamUrl } from "../api/config";

// The backend's /stream endpoint gives up and closes the connection if no
// detection task has published a frame within ~15s (see STREAM_IDLE_TIMEOUT
// in camera_controller.py). That close is "graceful" (HTTP 200, generator
// just ends), so the <img> tag never fires onError - it just silently stops
// rendering. To recover automatically (e.g. if Live View was opened before
// the rule's Celery task had started publishing), reconnect periodically.
const AUTO_RECONNECT_MS = 12000;

// Simple MJPEG live view: a plain <img> pointed at the backend's streaming
// endpoint. The backend publishes the latest annotated frame (ROI, boxes,
// alert overlays) from whichever detection rule is running for this camera.
const LiveView = ({ cameraId }) => {
  const [nonce, setNonce] = useState(0);
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleRetry = () => {
    setErrored(false);
    setNonce((n) => n + 1);
  };

  useEffect(() => {
    if (errored) return;
    const interval = setInterval(() => {
      setLoaded(false);
      setNonce((n) => n + 1);
    }, AUTO_RECONNECT_MS);
    return () => clearInterval(interval);
    // Re-arm the timer whenever we (re)connect, so it always waits a full
    // AUTO_RECONNECT_MS from the most recent connection attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errored, nonce]);

  const streamBase = cameraStreamUrl(cameraId);
  const streamSrc = `${streamBase}${streamBase.includes("?") ? "&" : "?"}t=${nonce}`;

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
        <>
          <img
            key={nonce}
            src={streamSrc}
            alt={`Live view for camera ${cameraId}`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
            style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
          />
          {!loaded && (
            <Typography
              variant="caption"
              sx={{ position: "absolute", color: "white", opacity: 0.8 }}
            >
              Connecting to live feed...
            </Typography>
          )}
        </>
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
