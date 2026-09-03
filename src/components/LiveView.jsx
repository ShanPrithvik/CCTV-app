import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
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
        borderRadius: 2.5,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#030506",
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
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
          {!loaded && (
            <Stack
              alignItems="center"
              spacing={1.5}
              sx={{ position: "absolute", color: "white" }}
            >
              <CircularProgress size={22} thickness={3} color="inherit" />
              <Typography variant="caption" sx={{ opacity: 0.68 }}>
                Negotiating stream
              </Typography>
            </Stack>
          )}
        </>
      ) : (
        <Box sx={{ textAlign: "center", color: "white", p: 2 }}>
          <Typography variant="h6" sx={{ mb: 0.75 }}>
            Stream unavailable
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 2, color: "rgba(255,255,255,.6)", maxWidth: 420 }}
          >
            A detection rule may need to be running before annotated frames are
            published.
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
      <Box
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          display: "flex",
          alignItems: "center",
          gap: 0.8,
          px: 1,
          py: 0.55,
          borderRadius: 1.5,
          bgcolor: "rgba(3,5,6,.68)",
          border: "1px solid rgba(255,255,255,.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: errored
              ? "error.main"
              : loaded
                ? "success.main"
                : "warning.main",
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,.82)",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: ".08em",
          }}
        >
          {errored ? "OFFLINE" : loaded ? "LIVE" : "CONNECTING"}
        </Typography>
      </Box>
      <Box role="status" aria-live="polite" className="visually-hidden">
        {errored
          ? "Live stream unavailable"
          : loaded
            ? "Live stream connected"
            : "Connecting to live stream"}
      </Box>
    </Box>
  );
};

export default LiveView;
