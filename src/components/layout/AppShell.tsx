import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, useTheme, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Menu as MenuIcon, Brightness4, Brightness7, Clear, CalendarMonth } from '@mui/icons-material';
import { NavDrawer } from './NavDrawer';
import { FilterState } from '../../App';
import { DateRangePreset } from '../../features/analytics/DateRangeFilter';

interface AppShellProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    toggleTheme: () => void;
    isDarkMode: boolean;
    filters?: FilterState;
    onFilterChange?: (filters: Partial<FilterState>) => void;
    onClearFilters?: () => void;
    showFilters?: boolean;
}

const drawerWidth = 240;

export function AppShell({
    children,
    activeTab,
    onTabChange,
    toggleTheme,
    isDarkMode,
    filters,
    onFilterChange,
    onClearFilters,
    showFilters = false
}: AppShellProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleDateRangeChange = (_: React.MouseEvent<HTMLElement>, value: DateRangePreset | null) => {
        if (value && onFilterChange) {
            onFilterChange({ dateRange: value });
        }
    };

    const hasActiveFilters = filters?.selectedCountry || filters?.selectedStage;

    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
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
                <Toolbar sx={{ gap: 2, flexWrap: 'wrap', minHeight: { xs: showFilters ? 80 : 64, sm: 64 } }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 1, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ minWidth: 100 }}>
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </Typography>

                    {/* Filter Controls - Only shown on analytics tab */}
                    {showFilters && filters && onFilterChange && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flex: 1,
                            justifyContent: { xs: 'flex-start', md: 'center' },
                            flexWrap: 'wrap'
                        }}>
                            {/* Date Range Toggle */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <ToggleButtonGroup
                                    value={filters.dateRange}
                                    exclusive
                                    onChange={handleDateRangeChange}
                                    size="small"
                                    sx={{
                                        '& .MuiToggleButton-root': {
                                            px: 1.5,
                                            py: 0.25,
                                            fontSize: 12,
                                            textTransform: 'none'
                                        }
                                    }}
                                >
                                    <ToggleButton value="7d">7D</ToggleButton>
                                    <ToggleButton value="30d">30D</ToggleButton>
                                    <ToggleButton value="90d">90D</ToggleButton>
                                    <ToggleButton value="all">All</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            {/* Active Filters */}
                            {hasActiveFilters && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {filters.selectedCountry && (
                                        <Chip
                                            label={filters.selectedCountry}
                                            size="small"
                                            onDelete={() => onFilterChange({ selectedCountry: null })}
                                            color="primary"
                                            sx={{ height: 24, fontSize: 11 }}
                                        />
                                    )}
                                    {filters.selectedStage && (
                                        <Chip
                                            label={filters.selectedStage}
                                            size="small"
                                            onDelete={() => onFilterChange({ selectedStage: null })}
                                            color="secondary"
                                            sx={{ height: 24, fontSize: 11 }}
                                        />
                                    )}
                                    <IconButton
                                        size="small"
                                        onClick={onClearFilters}
                                        sx={{ p: 0.5 }}
                                        title="Clear all filters"
                                    >
                                        <Clear sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    )}

                    <Box sx={{ flexGrow: showFilters ? 0 : 1 }} />

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
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    height: 'calc(100vh - 64px)',
                    overflow: 'auto',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
