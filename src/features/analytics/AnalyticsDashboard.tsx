import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { generateMockApplicants } from '../../data/mockData';
import { useAnalyticsData } from './useAnalyticsData';
import { GeographicMap } from './GeographicMap';
import { ApplicationTrendChart } from './ApplicationTrendChart';
import { RecruitmentFunnel } from './RecruitmentFunnel';
import { KPICards } from './KPICards';
import { DateRangeFilter, DateRangePreset, getDateRangeFromPreset } from './DateRangeFilter';
import { PipelineHealth } from './PipelineHealth';
import { RegionalComparison } from './RegionalComparison';
import { Applicant } from '../../types';

interface AnalyticsDashboardProps {
    applicants?: Applicant[];
}

export const AnalyticsDashboard = ({ applicants: propApplicants }: AnalyticsDashboardProps) => {
    const allApplicants = propApplicants || generateMockApplicants();

    // Filter state
    const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);

    // Apply filters
    const applicants = useMemo(() => {
        let filtered = allApplicants;

        // Date filter
        const range = getDateRangeFromPreset(dateRange);
        filtered = filtered.filter(a => {
            const date = new Date(a.appliedDate);
            return date >= range.start && date <= range.end;
        });

        // Country filter
        if (selectedCountry) {
            filtered = filtered.filter(a => a.location.country === selectedCountry);
        }

        // Stage filter
        if (selectedStage) {
            filtered = filtered.filter(a => a.status === selectedStage);
        }

        return filtered;
    }, [allApplicants, dateRange, selectedCountry, selectedStage]);

    const { funnelCounts, mapData, trendData, roleDistribution } = useAnalyticsData(applicants);

    const handleCountryClick = (country: string) => {
        setSelectedCountry(prev => prev === country ? null : country);
    };

    const handleStageClick = (stage: string) => {
        setSelectedStage(prev => prev === stage ? null : stage);
    };

    const clearFilters = () => {
        setSelectedCountry(null);
        setSelectedStage(null);
    };

    const hasActiveFilters = selectedCountry || selectedStage;

    return (
        <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
            {/* Header with filters */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Intelligence Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Real-time insights into global recruitment performance
                    </Typography>
                </Box>
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </Box>

            {/* Active filters indicator */}
            {hasActiveFilters && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Filters:</Typography>
                    {selectedCountry && (
                        <Chip
                            label={selectedCountry}
                            size="small"
                            onDelete={() => setSelectedCountry(null)}
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {selectedStage && (
                        <Chip
                            label={selectedStage}
                            size="small"
                            onDelete={() => setSelectedStage(null)}
                            color="secondary"
                            variant="outlined"
                        />
                    )}
                    <Chip
                        label="Clear all"
                        size="small"
                        onClick={clearFilters}
                        variant="outlined"
                    />
                </Box>
            )}

            {/* KPI Cards */}
            <KPICards applicants={applicants} />

            {/* Row 1: Map and Pipeline Health */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '2 1 500px', minWidth: 0 }}>
                    <GeographicMap
                        data={mapData}
                        selectedCountry={selectedCountry}
                        onCountryClick={handleCountryClick}
                    />
                </Box>
                <Box sx={{ flex: '1 1 350px', minWidth: 300 }}>
                    <PipelineHealth applicants={applicants} onStageClick={handleStageClick} />
                </Box>
            </Box>

            {/* Row 2: Trend, Funnel */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '2 1 400px', minWidth: 0 }}>
                    <ApplicationTrendChart data={trendData} />
                </Box>
                <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
                    <RecruitmentFunnel
                        data={funnelCounts}
                        onStageClick={handleStageClick}
                        selectedStage={selectedStage}
                    />
                </Box>
            </Box>

            {/* Row 3: Regional Comparison and Top Roles */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '2 1 500px', minWidth: 0 }}>
                    <RegionalComparison applicants={applicants} onCountryClick={handleCountryClick} />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top Roles
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Most common job titles
                        </Typography>
                        <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                            {roleDistribution.slice(0, 5).map((role, i) => (
                                <Box component="li" key={role.name} sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    mb: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 'bold'
                                        }}>
                                            {i + 1}
                                        </Box>
                                        <Typography variant="body2" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {role.name}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold">{role.value}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};
