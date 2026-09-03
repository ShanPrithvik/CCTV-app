import React from "react";
import { alpha } from "@mui/material/styles";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

export const Surface = ({ children, sx, ...props }) => (
  <Paper
    elevation={0}
    {...props}
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 3,
      backgroundColor: "background.paper",
      overflow: "hidden",
      ...sx,
    }}
  >
    {children}
  </Paper>
);

export const Eyebrow = ({ children, sx }) => (
  <Typography
    variant="caption"
    sx={{
      color: "primary.main",
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      ...sx,
    }}
  >
    {children}
  </Typography>
);

export const PageHeader = ({
  eyebrow,
  title,
  description,
  action,
  children,
  sx,
}) => (
  <Box component="header" sx={{ mb: { xs: 3, md: 4 }, ...sx }}>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "stretch", sm: "flex-end" }}
      justifyContent="space-between"
      spacing={2.5}
    >
      <Box sx={{ maxWidth: 700 }}>
        {eyebrow && (
          <Eyebrow sx={{ display: "block", mb: 1 }}>{eyebrow}</Eyebrow>
        )}
        <Typography variant="h2" component="h1">
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 640 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
    {children}
  </Box>
);

export const StatusDot = ({ label, color = "success.main", pulse = false }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box
      aria-hidden="true"
      sx={{
        width: 7,
        height: 7,
        borderRadius: "50%",
        bgcolor: color,
        boxShadow: pulse
          ? (theme) => `0 0 0 4px ${alpha(theme.palette.success.main, 0.12)}`
          : "none",
      }}
    />
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontWeight: 600 }}
    >
      {label}
    </Typography>
  </Stack>
);

export const StatePanel = ({
  type = "empty",
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) => {
  const loading = type === "loading";
  const error = type === "error";
  const Icon = error ? ErrorOutlineRoundedIcon : InboxRoundedIcon;

  return (
    <Surface
      role={loading ? "status" : error ? "alert" : undefined}
      aria-live={loading ? "polite" : undefined}
      sx={{ p: compact ? 3 : { xs: 4, md: 7 }, textAlign: "center" }}
    >
      <Stack alignItems="center" spacing={1.5}>
        {loading ? (
          <CircularProgress size={26} thickness={3} />
        ) : (
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              color: error ? "error.main" : "primary.main",
              bgcolor: error
                ? "rgba(255,142,149,.08)"
                : "rgba(116,217,247,.07)",
              border: "1px solid",
              borderColor: error
                ? "rgba(255,142,149,.2)"
                : "rgba(116,217,247,.16)",
            }}
          >
            <Icon fontSize="small" />
          </Box>
        )}
        <Typography variant="h4">{title}</Typography>
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 460 }}
          >
            {description}
          </Typography>
        )}
        {actionLabel && onAction && (
          <Button
            variant={error ? "outlined" : "contained"}
            onClick={onAction}
            sx={{ mt: 1 }}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Surface>
  );
};
