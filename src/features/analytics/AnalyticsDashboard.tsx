import { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Work } from '@mui/icons-material';
import { generateMockApplicants } from '../../data/mockData';
import { useAnalyticsData } from './useAnalyticsData';
import { GeographicMap } from './GeographicMap';
import { ApplicationTrendChart } from './ApplicationTrendChart';
import { RecruitmentFunnel } from './RecruitmentFunnel';
import { KPICards } from './KPICards';
import { getDateRangeFromPreset } from './DateRangeFilter';
import { PipelineHealth } from './PipelineHealth';
import { RegionalComparison } from './RegionalComparison';
import { TimeToHireChart } from './TimeToHireChart';
import { ExperienceBreakdown } from './ExperienceBreakdown';
import { RatingDistribution } from './RatingDistribution';
import { RecentActivity } from './RecentActivity';
import { ApplicationSource } from './ApplicationSource';
import { WeeklyTrends } from './WeeklyTrends';
import { SkillsCertifications } from './SkillsCertifications';
import { Applicant } from '../../types';
import { FilterState } from '../../App';

interface AnalyticsDashboardProps {
    applicants?: Applicant[];
    filters?: FilterState;
    onFilterChange?: (filters: Partial<FilterState>) => void;
}

export const AnalyticsDashboard = ({
    applicants: propApplicants,
    filters,
    onFilterChange
}: AnalyticsDashboardProps) => {
    const allApplicants = propApplicants || generateMockApplicants();

    const dateRange = filters?.dateRange || '30d';
    const selectedCountry = filters?.selectedCountry || null;
    const selectedStage = filters?.selectedStage || null;

    const applicants = useMemo(() => {
        let filtered = allApplicants;

        const range = getDateRangeFromPreset(dateRange);
        filtered = filtered.filter(a => {
            const date = new Date(a.appliedDate);
            return date >= range.start && date <= range.end;
        });

        if (selectedCountry) {
            filtered = filtered.filter(a => a.location.country === selectedCountry);
        }

        if (selectedStage) {
            filtered = filtered.filter(a => a.status === selectedStage);
        }

        return filtered;
    }, [allApplicants, dateRange, selectedCountry, selectedStage]);

    const { funnelCounts, mapData, trendData, roleDistribution } = useAnalyticsData(applicants);

    const handleCountryClick = (country: string) => {
        if (onFilterChange) {
            onFilterChange({ selectedCountry: selectedCountry === country ? null : country });
        }
    };

    const handleStageClick = (stage: string) => {
        if (onFilterChange) {
            onFilterChange({ selectedStage: selectedStage === stage ? null : stage });
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Intelligence Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {applicants.length} applicants in view
                </Typography>
            </Box>

            {/* KPI Cards */}
            <KPICards applicants={applicants} />

            {/* Row 1: Map + Regional (no border wrapper) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
                <GeographicMap
                    data={mapData}
                    selectedCountry={selectedCountry}
                    onCountryClick={handleCountryClick}
                />
                <RegionalComparison applicants={applicants} onCountryClick={handleCountryClick} />
            </Box>

            {/* Row 2: Funnel + Pipeline (equal heights) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
                <Box sx={{ display: 'flex' }}>
                    <RecruitmentFunnel
                        data={funnelCounts}
                        onStageClick={handleStageClick}
                        selectedStage={selectedStage}
                    />
                </Box>
                <Box sx={{ display: 'flex' }}>
                    <PipelineHealth applicants={applicants} onStageClick={handleStageClick} />
                </Box>
            </Box>

            {/* Row 3: Trends (2:1 ratio) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 3 }}>
                <ApplicationTrendChart data={trendData} />
                <WeeklyTrends applicants={applicants} />
            </Box>

            {/* Row 4: Insight Cards (4-column) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
                <TimeToHireChart applicants={applicants} />
                <ExperienceBreakdown applicants={applicants} />
                <RatingDistribution applicants={applicants} />
                <SkillsCertifications applicants={applicants} />
            </Box>

            {/* Row 5: Source + Activity + Top Roles (3-column) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                <ApplicationSource applicants={applicants} />
                <RecentActivity applicants={allApplicants} limit={6} />
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        height: '100%',
                        borderRadius: 3,
                        border: 1,
                        borderColor: 'divider',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': { boxShadow: 4 }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: 'success.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'success.contrastText'
                        }}>
                            <Work fontSize="small" />
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Top Roles
                        </Typography>
                    </Box>
                    <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                        {roleDistribution.slice(0, 5).map((role, i) => (
                            <Box component="li" key={role.name} sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                py: 1,
                                borderBottom: i < 4 ? '1px solid' : 'none',
                                borderColor: 'divider'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        bgcolor: i === 0 ? 'warning.main' : i === 1 ? 'grey.400' : i === 2 ? 'warning.dark' : 'action.selected',
                                        color: i < 3 ? 'warning.contrastText' : 'text.primary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 10,
                                        fontWeight: 'bold'
                                    }}>
                                        {i + 1}
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            maxWidth: 120,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        {role.name}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" fontWeight="bold" color="primary.main">
                                    {role.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};
