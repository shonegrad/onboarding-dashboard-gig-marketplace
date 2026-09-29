import { useState, useMemo } from 'react';
import {
    Popover,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Chip,
    Stack,
    TextField,
    Autocomplete,
    Divider,
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import { OnboardingStatus, Applicant } from '../../types';
import { PIPELINE_STAGES, STATUS_CONFIG } from '../../utils/statusUtils';

export interface FilterState {
    statuses: OnboardingStatus[];
    location: string | null;
}

interface ApplicantsFilterProps {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    applicants: Applicant[]; // For location autocomplete options
}

const ALL_STATUSES: OnboardingStatus[] = [
    ...PIPELINE_STAGES,
    'Declined',
    'Under Review',
];

export function ApplicantsFilter({
    anchorEl,
    open,
    onClose,
    filters,
    onFiltersChange,
    applicants,
}: ApplicantsFilterProps) {
    const [localFilters, setLocalFilters] = useState<FilterState>(filters);

    // Get unique locations for autocomplete
    const locationOptions = useMemo(() => {
        const locations = new Set<string>();
        applicants.forEach((app) => {
            locations.add(`${app.location.city}, ${app.location.region}`);
        });
        return Array.from(locations).sort();
    }, [applicants]);

    const handleStatusToggle = (status: OnboardingStatus) => {
        setLocalFilters((prev) => {
            const newStatuses = prev.statuses.includes(status)
                ? prev.statuses.filter((s) => s !== status)
                : [...prev.statuses, status];
            return { ...prev, statuses: newStatuses };
        });
    };

    const handleApply = () => {
        onFiltersChange(localFilters);
        onClose();
    };

    const handleClear = () => {
        const cleared: FilterState = { statuses: [], location: null };
        setLocalFilters(cleared);
        onFiltersChange(cleared);
    };

    const hasActiveFilters = localFilters.statuses.length > 0 || localFilters.location;

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
                paper: { sx: { width: 360, p: 2.5 } }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Filter Applicants
                </Typography>
                {hasActiveFilters && (
                    <Button size="small" onClick={handleClear} startIcon={<Close />}>
                        Clear All
                    </Button>
                )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Status Filter */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Status
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {ALL_STATUSES.map((status) => {
                        const config = STATUS_CONFIG[status];
                        const isSelected = localFilters.statuses.includes(status);
                        return (
                            <Chip
                                key={status}
                                label={config.label}
                                size="small"
                                onClick={() => handleStatusToggle(status)}
                                sx={{
                                    backgroundColor: isSelected ? config.bgcolor : 'transparent',
                                    color: isSelected ? config.textColor : 'text.secondary',
                                    border: '1px solid',
                                    borderColor: isSelected ? config.textColor : 'divider',
                                    fontWeight: isSelected ? 600 : 400,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: config.bgcolor,
                                        color: config.textColor,
                                    },
                                }}
                            />
                        );
                    })}
                </Box>
            </Box>

            {/* Location Filter */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Location
                </Typography>
                <Autocomplete
                    size="small"
                    options={locationOptions}
                    value={localFilters.location}
                    onChange={(_, value) => setLocalFilters((prev) => ({ ...prev, location: value }))}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Select location..." />
                    )}
                    sx={{ width: '100%' }}
                />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <Button onClick={onClose} variant="text">
                    Cancel
                </Button>
                <Button onClick={handleApply} variant="contained">
                    Apply Filters
                </Button>
            </Box>
        </Popover>
    );
}
