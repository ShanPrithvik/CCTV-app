import { alpha, createTheme } from "@mui/material/styles";

const colors = {
  void: "#07090C",
  canvas: "#0B0E13",
  surface: "#10151C",
  elevated: "#151B24",
  interactive: "#1A222D",
  line: "#26303D",
  text: "#F3F7FA",
  muted: "#95A2B3",
  cyan: "#74D9F7",
  cyanStrong: "#33BFE8",
  green: "#72E6B1",
  amber: "#F2C66D",
  red: "#FF8E95",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: colors.cyan,
      light: "#B8ECFA",
      dark: colors.cyanStrong,
      contrastText: "#061016",
    },
    secondary: { main: "#AEBBFF" },
    success: { main: colors.green },
    warning: { main: colors.amber },
    error: { main: colors.red },
    info: { main: colors.cyan },
    background: { default: colors.canvas, paper: colors.surface },
    text: { primary: colors.text, secondary: colors.muted },
    divider: colors.line,
  },
  shape: { borderRadius: 14 },
  spacing: 8,
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: "clamp(2rem, 5vw, 3.75rem)",
      lineHeight: 1.02,
      fontWeight: 560,
      letterSpacing: "-0.045em",
    },
    h2: {
      fontSize: "clamp(1.65rem, 3vw, 2.35rem)",
      lineHeight: 1.12,
      fontWeight: 560,
      letterSpacing: "-0.035em",
    },
    h3: {
      fontSize: "1.35rem",
      lineHeight: 1.25,
      fontWeight: 560,
      letterSpacing: "-0.02em",
    },
    h4: {
      fontSize: "1.1rem",
      lineHeight: 1.3,
      fontWeight: 560,
      letterSpacing: "-0.015em",
    },
    h5: { fontWeight: 560 },
    h6: { fontWeight: 560, letterSpacing: "-0.01em" },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.55 },
    caption: { letterSpacing: "0.02em" },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "-0.005em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          backgroundColor: colors.canvas,
          backgroundImage: `
            radial-gradient(circle at 12% -8%, ${alpha(colors.cyanStrong, 0.1)}, transparent 34%),
            radial-gradient(circle at 92% 8%, ${alpha("#AEBBFF", 0.07)}, transparent 28%),
            linear-gradient(180deg, ${colors.void} 0%, ${colors.canvas} 46%, #090C11 100%)
          `,
          backgroundAttachment: "fixed",
        },
        "*": { boxSizing: "border-box" },
        "::selection": {
          background: alpha(colors.cyan, 0.26),
          color: colors.text,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 11,
          paddingInline: 16,
          transition:
            "background-color 160ms ease, border-color 160ms ease, transform 160ms ease",
          "&:active": { transform: "translateY(1px)" },
          "&:focus-visible": {
            outline: `2px solid ${colors.cyan}`,
            outlineOffset: 2,
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.cyan} 0%, #9BE6FA 100%)`,
          color: "#071017",
          "&:hover": {
            background: `linear-gradient(135deg, #94E5FA 0%, #C0EFFA 100%)`,
          },
        },
        outlined: {
          borderColor: colors.line,
          "&:hover": {
            borderColor: alpha(colors.cyan, 0.55),
            background: alpha(colors.cyan, 0.05),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&:focus-visible": {
            outline: `2px solid ${colors.cyan}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: `linear-gradient(145deg, ${alpha("#FFFFFF", 0.025)}, transparent 38%)`,
          borderColor: colors.line,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          backgroundImage: `linear-gradient(145deg, ${alpha("#FFFFFF", 0.03)}, transparent 42%)`,
          border: `1px solid ${colors.line}`,
          boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
        },
      },
    },
    MuiTextField: { defaultProps: { variant: "outlined" } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 11,
          background: alpha(colors.interactive, 0.62),
          transition: "background-color 160ms ease, box-shadow 160ms ease",
          "&:hover": { background: alpha(colors.interactive, 0.86) },
          "&.Mui-focused": {
            boxShadow: `0 0 0 3px ${alpha(colors.cyan, 0.09)}`,
          },
          "& fieldset": { borderColor: colors.line },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${colors.line}`,
          backgroundColor: colors.elevated,
          boxShadow: "0 36px 120px rgba(0,0,0,0.58)",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: "#EAF2F6",
          color: "#0A1118",
          fontSize: 12,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        outlined: { borderColor: colors.line },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: colors.line },
        head: {
          color: colors.muted,
          fontSize: 12,
          fontWeight: 650,
          letterSpacing: "0.04em",
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: alpha(colors.muted, 0.08) } },
    },
  },
});

theme.custom = colors;

export default theme;
