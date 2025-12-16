import { useState, useMemo } from 'react';
import { Box, Typography, TextField, InputAdornment, Button, Chip } from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { Applicant, OnboardingStatus } from '../../types';
import { ApplicantsGrid } from './ApplicantsGrid';
import { ApplicantDetailDrawer } from './ApplicantDetailDrawer';

interface ApplicantsPageProps {
    applicants: Applicant[];
    selectedApplicant: Applicant | null;
    onApplicantSelect: (applicant: Applicant | null) => void;
    onStatusUpdate: (id: string, status: OnboardingStatus, data?: Partial<Applicant>) => void;
}

export function ApplicantsPage({ applicants, selectedApplicant, onApplicantSelect, onStatusUpdate }: ApplicantsPageProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Basic filtering logic
    const filteredApplicants = useMemo(() => {
        let result = applicants;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(
                (app) =>
                    app.name.toLowerCase().includes(lowerQuery) ||
                    app.email.toLowerCase().includes(lowerQuery) ||
                    app.location.city.toLowerCase().includes(lowerQuery)
            );
        }
        return result;
    }, [applicants, searchQuery]);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header / Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                        sx={{ bgcolor: 'background.paper' }}
                    />
                    <Button variant="outlined" startIcon={<FilterList />}>
                        Filters
                    </Button>
                </Box>
            </Box>

            {/* Main Grid */}
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ApplicantsGrid
                    applicants={filteredApplicants}
                    onApplicantSelect={onApplicantSelect}
                />
            </Box>

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
