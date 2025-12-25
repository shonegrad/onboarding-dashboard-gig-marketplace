import { useState, useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Work } from '@mui/icons-material';
import { generateMockApplicants } from '../../data/mockData';
import { useAnalyticsData } from './useAnalyticsData';
import { GeographicMap } from './GeographicMap';
import { ApplicationTrendChart } from './ApplicationTrendChart';
import { RecruitmentFunnel } from './RecruitmentFunnel';
import { KPICards } from './KPICards';
import { DateRangeFilter, DateRangePreset, getDateRangeFromPreset } from './DateRangeFilter';
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

            {/* Row 3: Time-to-Hire and Small Widgets */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ flex: '2 1 400px', minWidth: 0 }}>
                    <TimeToHireChart applicants={applicants} />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <ExperienceBreakdown applicants={applicants} />
                </Box>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                    <RatingDistribution applicants={applicants} />
                </Box>
            </Box>

            {/* Row 4: Regional, Recent Activity, Top Roles */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '2 1 400px', minWidth: 0 }}>
                    <RegionalComparison applicants={applicants} onCountryClick={handleCountryClick} />
                </Box>
                <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
                    <RecentActivity applicants={allApplicants} limit={5} />
                </Box>
                <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
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
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Top Roles
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Most common
                                </Typography>
                            </Box>
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
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            bgcolor: i === 0 ? 'warning.main' : i === 1 ? 'grey.400' : i === 2 ? 'warning.dark' : 'action.selected',
                                            color: i < 3 ? 'warning.contrastText' : 'text.primary',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 11,
                                            fontWeight: 'bold'
                                        }}>
                                            {i + 1}
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                maxWidth: 130,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontSize: 12
                                            }}
                                        >
                                            {role.name}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                        {role.value}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Box>
            </Box>

            {/* Row 5: Application Source, Weekly Comparison, Skills */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3 }}>
                <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
                    <ApplicationSource applicants={applicants} />
                </Box>
                <Box sx={{ flex: '1 1 280px', minWidth: 280 }}>
                    <WeeklyComparison applicants={applicants} />
                </Box>
                <Box sx={{ flex: '1 1 350px', minWidth: 350 }}>
                    <SkillsCertifications applicants={applicants} />
                </Box>
            </Box>
        </Box>
    );
};
