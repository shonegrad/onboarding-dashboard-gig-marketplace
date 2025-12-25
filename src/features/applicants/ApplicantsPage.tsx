import { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment, Button, Badge, Chip, Stack, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Search, FilterList, People, CheckCircle, HourglassEmpty, Block, TrendingUp } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Applicant, OnboardingStatus } from '../../types';
import { ApplicantsGrid } from './ApplicantsGrid';
import { ApplicantModal } from './ApplicantModal';
import { ApplicantsFilter, FilterState } from './ApplicantsFilter';
import { STATUS_CONFIG, getNextStage } from '../../utils/statusUtils';

interface ApplicantsPageProps {
    applicants: Applicant[];
    selectedApplicant: Applicant | null;
    onApplicantSelect: (applicant: Applicant | null) => void;
    onStatusUpdate: (id: string, status: OnboardingStatus, data?: Partial<Applicant>) => void;
    loading?: boolean;
}

type QuickFilter = 'all' | 'active' | 'completed' | 'declined';

const initialFilters: FilterState = { statuses: [], location: null };

export function ApplicantsPage({ applicants, selectedApplicant, onApplicantSelect, onStatusUpdate, loading = false }: ApplicantsPageProps) {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(null);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filterOpen = Boolean(filterAnchorEl);
    const activeFilterCount = filters.statuses.length + (filters.location ? 1 : 0);

    // Stats calculations
    const stats = useMemo(() => {
        const active = applicants.filter(a =>
            ['Applied', 'Invited to Interview', 'Interview Scheduled', 'Invited to Training', 'In Training', 'Under Review'].includes(a.status)
        ).length;
        const completed = applicants.filter(a => a.status === 'Go Live').length;
        const declined = applicants.filter(a => a.status === 'Declined').length;
        const thisWeek = applicants.filter(a => {
            const days = (Date.now() - new Date(a.appliedDate).getTime()) / (1000 * 60 * 60 * 24);
            return days <= 7;
        }).length;
        const avgRating = applicants.filter(a => a.rating).length > 0
            ? (applicants.filter(a => a.rating).reduce((sum, a) => sum + (a.rating || 0), 0) / applicants.filter(a => a.rating).length).toFixed(1)
            : '—';

        return { total: applicants.length, active, completed, declined, thisWeek, avgRating };
    }, [applicants]);

    // Combined filtering logic 
    const filteredApplicants = useMemo(() => {
        let result = applicants;

        // Quick filter
        if (quickFilter === 'active') {
            result = result.filter(a =>
                ['Applied', 'Invited to Interview', 'Interview Scheduled', 'Invited to Training', 'In Training', 'Under Review'].includes(a.status)
            );
        } else if (quickFilter === 'completed') {
            result = result.filter(a => a.status === 'Go Live');
        } else if (quickFilter === 'declined') {
            result = result.filter(a => a.status === 'Declined');
        }

        // Search filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (app) =>
                    app.name.toLowerCase().includes(lowerQuery) ||
                    app.email.toLowerCase().includes(lowerQuery) ||
                    app.location.city.toLowerCase().includes(lowerQuery) ||
                    app.jobTitle.toLowerCase().includes(lowerQuery)
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
    }, [applicants, searchQuery, filters, quickFilter]);

    // Navigation between applicants
    const currentIndex = selectedApplicant
        ? filteredApplicants.findIndex(a => a.id === selectedApplicant.id)
        : -1;

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentIndex > 0) {
            onApplicantSelect(filteredApplicants[currentIndex - 1]);
        } else if (direction === 'next' && currentIndex < filteredApplicants.length - 1) {
            onApplicantSelect(filteredApplicants[currentIndex + 1]);
        }
    };

    const handleQuickAction = (applicant: Applicant, action: 'advance' | 'decline') => {
        if (action === 'decline') {
            onStatusUpdate(applicant.id, 'Declined');
        } else {
            const nextStage = getNextStage(applicant.status);
            if (nextStage) {
                onStatusUpdate(applicant.id, nextStage);
            }
        }
    };

    const handleClearFilters = () => {
        setFilters(initialFilters);
        setQuickFilter('all');
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3, gap: 2 }}>
            {/* Stats Bar */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Paper elevation={0} sx={{ p: 2, flex: '1 1 120px', borderRadius: 2, border: 1, borderColor: 'divider', minWidth: 120 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People color="primary" />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{stats.total}</Typography>
                            <Typography variant="caption" color="text.secondary">Total</Typography>
                        </Box>
                    </Box>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, flex: '1 1 120px', borderRadius: 2, border: 1, borderColor: 'divider', minWidth: 120 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HourglassEmpty color="warning" />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{stats.active}</Typography>
                            <Typography variant="caption" color="text.secondary">In Progress</Typography>
                        </Box>
                    </Box>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, flex: '1 1 120px', borderRadius: 2, border: 1, borderColor: 'divider', minWidth: 120 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle color="success" />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{stats.completed}</Typography>
                            <Typography variant="caption" color="text.secondary">Go Live</Typography>
                        </Box>
                    </Box>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, flex: '1 1 120px', borderRadius: 2, border: 1, borderColor: 'divider', minWidth: 120 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Block color="error" />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{stats.declined}</Typography>
                            <Typography variant="caption" color="text.secondary">Declined</Typography>
                        </Box>
                    </Box>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, flex: '1 1 120px', borderRadius: 2, border: 1, borderColor: 'divider', minWidth: 120 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendingUp color="info" />
                        <Box>
                            <Typography variant="h5" fontWeight="bold">{stats.thisWeek}</Typography>
                            <Typography variant="caption" color="text.secondary">This Week</Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Search and Filters */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search name, email, role, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ bgcolor: 'background.paper', minWidth: 280 }}
                    />

                    {/* Quick Filter Chips */}
                    <ToggleButtonGroup
                        value={quickFilter}
                        exclusive
                        onChange={(_, val) => val && setQuickFilter(val)}
                        size="small"
                    >
                        <ToggleButton value="all">All</ToggleButton>
                        <ToggleButton value="active" sx={{ color: 'warning.main' }}>In Progress</ToggleButton>
                        <ToggleButton value="completed" sx={{ color: 'success.main' }}>Go Live</ToggleButton>
                        <ToggleButton value="declined" sx={{ color: 'error.main' }}>Declined</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {filteredApplicants.length} of {applicants.length}
                    </Typography>
                    <Badge badgeContent={activeFilterCount} color="primary">
                        <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
                        >
                            More Filters
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
                    onQuickAction={handleQuickAction}
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
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

            {/* Modal Integration */}
            <ApplicantModal
                applicant={selectedApplicant}
                open={Boolean(selectedApplicant)}
                onClose={() => onApplicantSelect(null)}
                onStatusUpdate={onStatusUpdate}
                onNavigate={handleNavigate}
                hasPrev={currentIndex > 0}
                hasNext={currentIndex < filteredApplicants.length - 1}
            />
        </Box>
    );
}
