import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CameraOutlinedIcon from "@mui/icons-material/CameraOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import RadarRoundedIcon from "@mui/icons-material/RadarRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useAuth } from "../contexts/AuthContext";
import usePermissions from "../hooks/usePermissions";

const sidebarWidth = 248;

const Brand = ({ compact = false }) => (
  <Stack direction="row" spacing={1.4} alignItems="center">
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        color: "primary.main",
        border: "1px solid",
        borderColor: "rgba(116,217,247,.22)",
        bgcolor: "rgba(116,217,247,.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
      }}
    >
      <RadarRoundedIcon fontSize="small" />
    </Box>
    {!compact && (
      <Box>
        <Typography
          sx={{ fontWeight: 650, letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          Aegis Vision
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Autonomous security
        </Typography>
      </Box>
    )}
  </Stack>
);

const AppShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, memberships, activeOrgId, switchOrg, signOut } = useAuth();
  const { canManageUsers, membership } = usePermissions();
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [switchingOrg, setSwitchingOrg] = useState(false);

  const cameraActive = location.pathname.startsWith("/cameras");
  const usersActive = location.pathname.startsWith("/users");

  const changeOrganization = async (event) => {
    const organizationId = event.target.value;
    if (organizationId === activeOrgId) return;
    setSwitchingOrg(true);
    try {
      await switchOrg(organizationId);
      navigate("/cameras");
    } finally {
      setSwitchingOrg(false);
    }
  };

  const navItems = [
    {
      label: "Cameras",
      icon: <CameraOutlinedIcon />,
      active: cameraActive,
      path: "/cameras",
    },
    ...(canManageUsers
      ? [
          {
            label: "People",
            icon: <GroupsOutlinedIcon />,
            active: usersActive,
            path: "/users",
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          position: "fixed",
          inset: "0 auto 0 0",
          width: sidebarWidth,
          flexDirection: "column",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(7,9,12,.82)",
          backdropFilter: "blur(22px)",
          zIndex: 1200,
        }}
      >
        <Box sx={{ p: 2.5, pb: 2 }}>
          <Brand />
        </Box>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 1.5, fontWeight: 650 }}
          >
            Workspace
          </Typography>
          <List component="nav" aria-label="Primary navigation" sx={{ mt: 1 }}>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                selected={item.active}
                aria-current={item.active ? "page" : undefined}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  minHeight: 46,
                  color: item.active ? "text.primary" : "text.secondary",
                  "&.Mui-selected": {
                    bgcolor: "rgba(116,217,247,.08)",
                    boxShadow: "inset 0 0 0 1px rgba(116,217,247,.13)",
                  },
                  "&.Mui-selected:hover": { bgcolor: "rgba(116,217,247,.11)" },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: item.active ? "primary.main" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box sx={{ mt: "auto", p: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(255,255,255,.018)",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Active organization
            </Typography>
            {memberships.length > 1 ? (
              <Select
                value={activeOrgId || ""}
                onChange={changeOrganization}
                disabled={switchingOrg}
                fullWidth
                size="small"
                IconComponent={KeyboardArrowDownRoundedIcon}
                aria-label="Active organization"
                sx={{ mt: 0.8, "& .MuiSelect-select": { py: 1 } }}
              >
                {memberships.map((item) => (
                  <MenuItem
                    key={item.organization_id}
                    value={item.organization_id}
                  >
                    {item.organization_name}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Typography
                variant="body2"
                sx={{ mt: 0.4, fontWeight: 600 }}
                noWrap
              >
                {membership?.organization_name || "Organization"}
              </Typography>
            )}
          </Box>
          <Button
            fullWidth
            color="inherit"
            onClick={(event) => setProfileAnchor(event.currentTarget)}
            sx={{ justifyContent: "flex-start", mt: 1.5, px: 1 }}
            startIcon={
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: "rgba(116,217,247,.13)",
                  color: "primary.main",
                  fontSize: 13,
                }}
              >
                {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
              </Avatar>
            }
          >
            <Box sx={{ minWidth: 0, textAlign: "left" }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                {user?.name || "Operator"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {membership?.role || "Member"}
              </Typography>
            </Box>
          </Button>
        </Box>
      </Box>

      <Box
        component="header"
        sx={{
          display: { xs: "flex", md: "none" },
          position: "sticky",
          top: 0,
          zIndex: 1100,
          height: 64,
          px: 2,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(7,9,12,.8)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Brand compact />
        <Tooltip title="Account">
          <IconButton
            onClick={(event) => setProfileAnchor(event.currentTarget)}
            aria-label="Open account menu"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "rgba(116,217,247,.13)",
                color: "primary.main",
                fontSize: 13,
              }}
            >
              {(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          ml: { xs: 0, md: `${sidebarWidth}px` },
          minHeight: "100vh",
          px: { xs: 2, sm: 3, lg: 5 },
          pt: { xs: 3, md: 5 },
          pb: { xs: 12, md: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1380, mx: "auto" }}>{children}</Box>
      </Box>

      <Box
        component="nav"
        aria-label="Mobile navigation"
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          zIndex: 1200,
          left: 12,
          right: 12,
          bottom: 12,
          height: 62,
          p: 0.75,
          gap: 0.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "rgba(12,16,22,.9)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 18px 50px rgba(0,0,0,.45)",
        }}
      >
        {navItems.map((item) => (
          <Button
            key={item.path}
            aria-current={item.active ? "page" : undefined}
            onClick={() => navigate(item.path)}
            startIcon={item.icon}
            sx={{
              flex: 1,
              color: item.active ? "primary.main" : "text.secondary",
              bgcolor: item.active ? "rgba(116,217,247,.08)" : "transparent",
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={() => setProfileAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              minWidth: 220,
              mt: 1,
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.2 }}>
          <Typography variant="body2" sx={{ fontWeight: 650 }}>
            {user?.name || "Operator"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            signOut();
            navigate("/login");
          }}
          sx={{ color: "text.secondary" }}
        >
          <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.5 }} /> Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AppShell;
