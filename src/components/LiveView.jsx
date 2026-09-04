import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { cameraStreamUrl } from "../api/config";

// A multipart/x-mixed-replace response never completes while frames are still
// arriving, so `onLoad` is not a "connected" signal: Chromium fires it only
// once the server closes the stream, Firefox fires it once per frame. Poll
// naturalWidth instead, which turns non-zero as soon as the first part decodes.
const LIVE_POLL_MS = 400;

// Reconnect only while nothing has decoded yet - e.g. Live View was opened
// before the rule's Celery task started publishing. Never tear down a stream
// that is already rendering: browsers allow just six concurrent connections per
// origin, and each abandoned MJPEG response holds one until it times out, which
// starves the live view itself along with every other API call.
const CONNECT_TIMEOUT_MS = 8000;

// Below this gap, repeated `load` events mean per-frame semantics (Firefox)
// rather than end-of-stream (Chromium).
const PER_FRAME_LOAD_GAP_MS = 2000;

// Simple MJPEG live view: a plain <img> pointed at the backend's streaming
// endpoint. The backend publishes the latest annotated frame (ROI, boxes,
// alert overlays) from whichever detection rule is running for this camera.
const LiveView = ({ cameraId }) => {
  const imgRef = useRef(null);
  const lastLoadAtRef = useRef(0);
  const perFrameLoadsRef = useRef(false);
  const [nonce, setNonce] = useState(0);
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleRetry = () => {
    setErrored(false);
    setLoaded(false);
    setNonce((n) => n + 1);
  };

  const handleLoad = () => {
    const now = Date.now();
    const previous = lastLoadAtRef.current;
    lastLoadAtRef.current = now;

    if (previous && now - previous < PER_FRAME_LOAD_GAP_MS) {
      perFrameLoadsRef.current = true;
    }
    if (perFrameLoadsRef.current) {
      setLoaded(true);
      return;
    }

    // Chromium only gets here when the backend closed the response, which it
    // does once the detection task stops publishing frames. Reconnect so the
    // feed picks back up if the task restarts.
    if (imgRef.current?.naturalWidth > 0) {
      setLoaded(false);
      setNonce((n) => n + 1);
      return;
    }
    setLoaded(true);
  };

  useEffect(() => {
    if (errored) return undefined;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      if (imgRef.current?.naturalWidth > 0) {
        setLoaded(true);
        return;
      }
      if (Date.now() - startedAt > CONNECT_TIMEOUT_MS) {
        setNonce((n) => n + 1);
      }
    }, LIVE_POLL_MS);
    return () => clearInterval(interval);
    // Restart the watchdog on every (re)connection attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errored, nonce, cameraId]);

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
            key={`${cameraId}-${nonce}`}
            ref={imgRef}
            src={streamSrc}
            alt={`Live view for camera ${cameraId}`}
            onLoad={handleLoad}
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
