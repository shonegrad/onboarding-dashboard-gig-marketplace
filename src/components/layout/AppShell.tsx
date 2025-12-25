import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, useTheme, Chip, ToggleButton, ToggleButtonGroup, Button, Divider } from '@mui/material';
import { Brightness4, Brightness7, Clear, CalendarMonth, Dashboard, People } from '@mui/icons-material';
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
    const theme = useTheme();

    const handleDateRangeChange = (_: React.MouseEvent<HTMLElement>, value: DateRangePreset | null) => {
        if (value && onFilterChange) {
            onFilterChange({ dateRange: value });
        }
    };

    const hasActiveFilters = filters?.selectedCountry || filters?.selectedStage;

    const navItems = [
        { id: 'applicants', label: 'Applicants', icon: <People sx={{ fontSize: 18 }} /> },
        { id: 'analytics', label: 'Analytics', icon: <Dashboard sx={{ fontSize: 18 }} /> },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Toolbar sx={{ gap: 2, minHeight: 56 }}>
                    {/* Logo / Brand */}
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mr: 2
                        }}
                    >
                        GigBoard
                    </Typography>

                    {/* Navigation Tabs */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {navItems.map((item) => (
                            <Button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                startIcon={item.icon}
                                sx={{
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: activeTab === item.id ? 600 : 400,
                                    color: activeTab === item.id ? 'primary.main' : 'text.secondary',
                                    bgcolor: activeTab === item.id ? 'action.selected' : 'transparent',
                                    '&:hover': {
                                        bgcolor: activeTab === item.id ? 'action.selected' : 'action.hover'
                                    }
                                }}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {/* Filter Controls - Only shown on analytics tab */}
                    {showFilters && filters && onFilterChange && (
                        <>
                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                        </>
                    )}

                    <IconButton onClick={toggleTheme} color="inherit" size="small">
                        {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    mt: '56px',
                    height: 'calc(100vh - 56px)',
                    overflow: 'auto',
                    bgcolor: 'background.default'
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
