import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const ROISelector = ({ imageUrl, initialROI = [], modelType, onChange }) => {
  const [points, setPoints] = useState(initialROI);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720 });
  const canvasRef = useRef(null);

  useEffect(() => {
    setPoints((current) =>
      JSON.stringify(current) !== JSON.stringify(initialROI)
        ? initialROI
        : current,
    );
  }, [initialROI]);

  const drawROI = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageUrl || "";

    img.onload = () => {
      const width = img.naturalWidth || img.width || 1280;
      const height = img.naturalHeight || img.height || 720;
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);

      if (points.length > 0 && modelType !== "SHOPLIFTING") {
        ctx.lineWidth = Math.max(2, width / 500);
        ctx.strokeStyle = "#74D9F7";
        ctx.fillStyle = "rgba(116, 217, 247, 0.14)";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        if (points.length >= 3) {
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.closePath();
        }
        ctx.stroke();

        for (const [index, point] of points.entries()) {
          ctx.fillStyle = "#071017";
          ctx.beginPath();
          ctx.arc(point.x, point.y, Math.max(7, width / 180), 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = Math.max(2, width / 600);
          ctx.strokeStyle = "#B8ECFA";
          ctx.stroke();
          ctx.fillStyle = "#F3F7FA";
          ctx.font = `600 ${Math.max(11, width / 100)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(index + 1), point.x, point.y);
        }
      }
    };
  }, [points, imageUrl, modelType]);

  useEffect(() => {
    drawROI();
  }, [drawROI]);

  const commitPoints = (nextPoints) => {
    setPoints(nextPoints);
    onChange(nextPoints);
  };

  const handleImageClick = (event) => {
    if (modelType === "SHOPLIFTING" || !modelType) return;
    if (points.length >= 4) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const newPoints = [...points, { x: Math.round(x), y: Math.round(y) }];
    commitPoints(newPoints);
  };

  const updateCoordinate = (index, axis, value) => {
    const limit = axis === "x" ? dimensions.width : dimensions.height;
    const numericValue = Math.max(0, Math.min(limit, Number(value) || 0));
    commitPoints(
      points.map((point, pointIndex) =>
        pointIndex === index ? { ...point, [axis]: numericValue } : point,
      ),
    );
  };

  const disabled = modelType === "SHOPLIFTING" || !modelType;

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#030506",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handleImageClick}
          role="img"
          aria-label={
            disabled
              ? "Camera snapshot. Region drawing is unavailable for this model."
              : `Camera snapshot with ${points.length} of 4 region points placed. Use the coordinate editor for keyboard access.`
          }
          style={{
            width: "100%",
            display: "block",
            cursor: disabled
              ? "not-allowed"
              : points.length >= 4
                ? "default"
                : "crosshair",
            touchAction: "manipulation",
          }}
        />
        {!disabled && (
          <Box
            sx={{
              position: "absolute",
              left: 10,
              bottom: 10,
              px: 1,
              py: 0.6,
              borderRadius: 1.5,
              bgcolor: "rgba(3,5,6,.72)",
              border: "1px solid rgba(255,255,255,.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,.76)", fontWeight: 650 }}
            >
              {points.length}/4 points
            </Typography>
          </Box>
        )}
      </Box>
      {!disabled && (
        <Box
          sx={{
            p: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="caption" color="text.secondary">
              {points.length < 3
                ? "Place at least 3 points to define an area."
                : points.length < 4
                  ? "Area defined. Add one more point if needed."
                  : "Maximum 4-point area defined."}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                color="inherit"
                onClick={() => setShowCoordinates((visible) => !visible)}
                aria-expanded={showCoordinates}
              >
                {showCoordinates ? "Hide coordinates" : "Edit coordinates"}
              </Button>
              {points.length > 0 && (
                <Button
                  size="small"
                  color="warning"
                  onClick={() => commitPoints([])}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>
          <Collapse in={showCoordinates}>
            <Stack spacing={1.25} sx={{ pt: 2 }}>
              {points.map((point, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 52 }}
                  >
                    Point {index + 1}
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    label="X"
                    value={point.x}
                    onChange={(event) =>
                      updateCoordinate(index, "x", event.target.value)
                    }
                    inputProps={{
                      min: 0,
                      max: dimensions.width,
                      "aria-label": `Point ${index + 1} X coordinate`,
                    }}
                  />
                  <TextField
                    size="small"
                    type="number"
                    label="Y"
                    value={point.y}
                    onChange={(event) =>
                      updateCoordinate(index, "y", event.target.value)
                    }
                    inputProps={{
                      min: 0,
                      max: dimensions.height,
                      "aria-label": `Point ${index + 1} Y coordinate`,
                    }}
                  />
                  <IconButton
                    aria-label={`Remove point ${index + 1}`}
                    onClick={() =>
                      commitPoints(
                        points.filter((_, pointIndex) => pointIndex !== index),
                      )
                    }
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              {points.length < 4 && (
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={() =>
                    commitPoints([
                      ...points,
                      {
                        x: Math.round(dimensions.width / 2),
                        y: Math.round(dimensions.height / 2),
                      },
                    ])
                  }
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add center point
                </Button>
              )}
              <Box role="status" aria-live="polite" className="visually-hidden">
                {points.length} region points configured
              </Box>
            </Stack>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export default ROISelector;
