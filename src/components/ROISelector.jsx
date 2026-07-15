import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Button } from "@mui/material";

const ROISelector = ({ imageUrl, imageWidth, imageHeight, initialROI = [], modelType, onChange }) => {
  const [points, setPoints] = useState(initialROI);
  const canvasRef = useRef(null);

  // Sync local points if parent-provided ROI changes
  useEffect(() => {
    setPoints((current) =>
      JSON.stringify(current) !== JSON.stringify(initialROI) ? initialROI : current
    );
  }, [initialROI]);

  // Draw image and ROI overlay
  const drawROI = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageUrl || "";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);

      if (points.length > 0 && modelType !== "SHOPLIFTING") {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#2563eb";
        ctx.fillStyle = "rgba(37, 99, 235, 0.15)";

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

        // draw handle points
        ctx.fillStyle = "#2563eb";
        for (const p of points) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
  }, [points, imageUrl, modelType]);

  useEffect(() => {
    drawROI();
  }, [drawROI]);

  const handleImageClick = (e) => {
    if (modelType === "SHOPLIFTING" || !modelType) return;
    if (points.length >= 4) return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imageWidth;
    const y = ((e.clientY - rect.top) / rect.height) * imageHeight;
    const newPoints = [...points, { x: Math.round(x), y: Math.round(y) }];

    setPoints(newPoints);
    onChange(newPoints);
  };

  const handleClearROI = () => {
    setPoints([]);
    onChange([]);
  };

  return (
    <Box sx={{ position: "relative", display: "block", width: "100%", borderRadius: 2, overflow: "hidden", boxShadow: 1, border: "1px solid", borderColor: "divider" }}>
      <canvas
        ref={canvasRef}
        onClick={handleImageClick}
        style={{ width: "100%", display: "block", cursor: modelType === "SHOPLIFTING" || !modelType ? "not-allowed" : "crosshair" }}
      />
      {points.length > 0 && (
        <Box sx={{ textAlign: "right", mt: 1 }}>
          <Button variant="outlined" color="warning" size="small" onClick={handleClearROI}>
            Clear ROI
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ROISelector;
