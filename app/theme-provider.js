'use client';

import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f3f6ff', paper: '#ffffff' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
  },
  components: {
    MuiTextField: { defaultProps: { fullWidth: true, variant: 'outlined', size: 'small' } },
    MuiFormControl: { defaultProps: { fullWidth: true, size: 'small' } },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' },
      },
    },
  },
});

export default function AppThemeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
