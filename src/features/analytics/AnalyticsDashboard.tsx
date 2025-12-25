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
import { WeeklyComparison } from './WeeklyComparison';
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

    // Use props filters or defaults
    const dateRange = filters?.dateRange || '30d';
    const selectedCountry = filters?.selectedCountry || null;
    const selectedStage = filters?.selectedStage || null;

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
            {/* Header - simplified since filters are in navbar */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Intelligence Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {applicants.length} applicants • Use navbar controls to filter
                </Typography>
            </Box>

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

            {/* Row 2: Trend Chart and Funnel */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3, alignItems: 'stretch' }}>
                <Box sx={{ flex: '2 1 400px', minWidth: 0, display: 'flex' }}>
                    <ApplicationTrendChart data={trendData} />
                </Box>
                <Box sx={{ flex: '1 1 280px', minWidth: 280, display: 'flex' }}>
                    <RecruitmentFunnel
                        data={funnelCounts}
                        onStageClick={handleStageClick}
                        selectedStage={selectedStage}
                    />
                </Box>
            </Box>

            {/* Row 3: Expandable Insight Cards */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Detailed Insights
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
                <TimeToHireChart applicants={applicants} />
                <ExperienceBreakdown applicants={applicants} />
                <RatingDistribution applicants={applicants} />
                <SkillsCertifications applicants={applicants} />
            </Box>

            {/* Row 4: Regional, Source, Weekly, Activity */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '2 1 400px', minWidth: 0 }}>
                    <RegionalComparison applicants={applicants} onCountryClick={handleCountryClick} />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                    <ApplicationSource applicants={applicants} />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                    <WeeklyComparison applicants={applicants} />
                </Box>
            </Box>

            {/* Row 5: Recent Activity and Top Roles */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 350px', minWidth: 300 }}>
                    <RecentActivity applicants={allApplicants} limit={6} />
                </Box>
                <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
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
        </Box>
    );
};
