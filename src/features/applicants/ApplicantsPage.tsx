import { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment, Button, Badge, Chip, Stack } from '@mui/material';
import { Search, FilterList, Close } from '@mui/icons-material';
import { Applicant, OnboardingStatus } from '../../types';
import { ApplicantsGrid } from './ApplicantsGrid';
import { ApplicantDetailDrawer } from './ApplicantDetailDrawer';
import { ApplicantsFilter, FilterState } from './ApplicantsFilter';
import { STATUS_CONFIG } from '../../utils/statusUtils';

interface ApplicantsPageProps {
    applicants: Applicant[];
    selectedApplicant: Applicant | null;
    onApplicantSelect: (applicant: Applicant | null) => void;
    onStatusUpdate: (id: string, status: OnboardingStatus, data?: Partial<Applicant>) => void;
    loading?: boolean;
}

const initialFilters: FilterState = { statuses: [], location: null };

export function ApplicantsPage({ applicants, selectedApplicant, onApplicantSelect, onStatusUpdate, loading = false }: ApplicantsPageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    const filterOpen = Boolean(filterAnchorEl);
    const activeFilterCount = filters.statuses.length + (filters.location ? 1 : 0);

    // Combined filtering logic 
    const filteredApplicants = useMemo(() => {
        let result = applicants;

        // Search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (app) =>
                    app.name.toLowerCase().includes(lowerQuery) ||
                    app.email.toLowerCase().includes(lowerQuery) ||
                    app.location.city.toLowerCase().includes(lowerQuery)
            );
        }

        // Status filter
        if (filters.statuses.length > 0) {
            result = result.filter((app) => filters.statuses.includes(app.status));
        }

        // Location filter
        if (filters.location) {
            result = result.filter(
                (app) => `${app.location.city}, ${app.location.region}` === filters.location
            );
        }

        return result;
    }, [applicants, searchQuery, filters]);

    const handleClearFilters = () => {
        setFilters(initialFilters);
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header / Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Applicants
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search applicants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ bgcolor: 'background.paper', minWidth: 220 }}
                    />
                    <Badge badgeContent={activeFilterCount} color="primary">
                        <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                        >
                            Filters
                        </Button>
                    </Badge>
                </Box>
            </Box>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {filters.statuses.map((status) => (
                        <Chip
                            key={status}
                            label={STATUS_CONFIG[status].label}
                            size="small"
                            onDelete={() => setFilters(prev => ({
                                ...prev,
                                statuses: prev.statuses.filter(s => s !== status)
                            }))}
                            sx={{
                                bgcolor: STATUS_CONFIG[status].bgcolor,
                                color: STATUS_CONFIG[status].textColor,
                            }}
                        />
                    ))}
                    {filters.location && (
                        <Chip
                            label={filters.location}
                            size="small"
                            onDelete={() => setFilters(prev => ({ ...prev, location: null }))}
                        />
                    )}
                    <Button size="small" onClick={handleClearFilters} sx={{ ml: 1 }}>
                        Clear All
                    </Button>
                </Stack>
            )}

            {/* Main Grid */}
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ApplicantsGrid
                    applicants={filteredApplicants}
                    loading={loading}
                    onApplicantSelect={onApplicantSelect}
                />
            </Box>

            {/* Filter Popover */}
            <ApplicantsFilter
                anchorEl={filterAnchorEl}
                open={filterOpen}
                onClose={() => setFilterAnchorEl(null)}
                filters={filters}
                onFiltersChange={setFilters}
                applicants={applicants}
            />

            {/* Drawer Integration */}
            <ApplicantDetailDrawer
                applicant={selectedApplicant}
                open={Boolean(selectedApplicant)}
                onClose={() => onApplicantSelect(null)}
                onStatusUpdate={onStatusUpdate}
            />
        </Box>
    );
}
