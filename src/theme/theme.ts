import { createTheme, ThemeOptions } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        neutral: Palette['primary'];
    }
    interface PaletteOptions {
        neutral?: PaletteOptions['primary'];
    }
}

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
    palette: {
        mode,
        primary: {
            main: '#2563eb', // Modern Blue
            light: '#60a5fa',
            dark: '#1d4ed8',
            contrastText: '#fff',
        },
        secondary: {
            main: '#475569', // Slate
            light: '#94a3b8',
            dark: '#1e293b',
            contrastText: '#fff',
        },
        neutral: {
            main: '#64748B',
            contrastText: '#fff',
        },
        background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
        },
        text: {
            primary: mode === 'light' ? '#1e293b' : '#f8fafc',
            secondary: mode === 'light' ? '#475569' : '#94a3b8',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2rem', fontWeight: 600 },
        h2: { fontSize: '1.5rem', fontWeight: 600 },
        h3: { fontSize: '1.25rem', fontWeight: 600 },
        body1: { fontSize: '1rem', lineHeight: 1.5 },
        body2: { fontSize: '0.875rem', lineHeight: 1.43 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderLeft: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
                }
            }
        }
    },
});

export const theme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));
