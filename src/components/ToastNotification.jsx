import React from "react";
import { Snackbar, Alert } from "@mui/material";

const ToastNotification = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="outlined"
        sx={{
          width: "100%",
          minWidth: { sm: 320 },
          bgcolor: "rgba(16,21,28,.94)",
          backdropFilter: "blur(18px)",
          borderColor: "divider",
          boxShadow: "0 18px 50px rgba(0,0,0,.38)",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification;
