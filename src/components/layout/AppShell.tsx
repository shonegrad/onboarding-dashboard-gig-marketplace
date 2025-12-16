import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, useTheme, useMediaQuery, CssBaseline } from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { NavDrawer } from './NavDrawer';

interface AppShellProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    toggleTheme: () => void;
    isDarkMode: boolean;
}

const drawerWidth = 240;

export function AppShell({ children, activeTab, onTabChange, toggleTheme, isDarkMode }: AppShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    // isBelowSm checking if needing hamburger
    // Actually NavDrawer handles display: none logic, but we need to know for AppBar offset.

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </Typography>
                    <IconButton onClick={toggleTheme} color="inherit">
                        {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <NavDrawer
                activeTab={activeTab}
                onTabChange={onTabChange}
                mobileOpen={mobileOpen}
                onDrawerToggle={handleDrawerToggle}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8, // Toolbar height approx
                    height: '100%',
                    overflow: 'hidden', // Let children handle scroll
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
