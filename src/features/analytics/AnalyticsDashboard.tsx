import { useMemo } from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, People, Speed, Timeline, CalendarMonth, CheckCircle, Cancel, Work } from '@mui/icons-material';
import { generateMockApplicants } from '../../data/mockData';
import { useAnalyticsData } from './useAnalyticsData';
import { GeographicMap } from './GeographicMap';
import { ApplicationTrendChart } from './ApplicationTrendChart';
import { RecruitmentFunnel } from './RecruitmentFunnel';
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
import { useTheme } from '@mui/material/styles';

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
    const theme = useTheme();

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

    // Calculate enhanced KPIs
    const kpiData = useMemo(() => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const activeStatuses = ['Applied', 'Invited to Interview', 'Interview Scheduled', 'Invited to Training', 'In Training', 'Under Review'];
        const activePipeline = applicants.filter(a => activeStatuses.includes(a.status)).length;
        const goLive = applicants.filter(a => a.status === 'Go Live').length;
        const declined = applicants.filter(a => a.status === 'Declined').length;
        const conversionRate = applicants.length > 0 ? ((goLive / applicants.length) * 100) : 0;

        const thisWeekApps = applicants.filter(a => new Date(a.appliedDate) >= oneWeekAgo).length;
        const lastWeekApps = applicants.filter(a => {
            const date = new Date(a.appliedDate);
            return date >= twoWeeksAgo && date < oneWeekAgo;
        }).length;
        const weeklyChange = lastWeekApps > 0 ? ((thisWeekApps - lastWeekApps) / lastWeekApps * 100) : 0;

        const goLiveApplicants = applicants.filter(a => a.status === 'Go Live');
        const avgTimeToHire = goLiveApplicants.length > 0
            ? Math.round(goLiveApplicants.reduce((sum, a) => {
                const applied = new Date(a.appliedDate);
                const completed = new Date(a.lastStatusChangeDate);
                return sum + (completed.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / goLiveApplicants.length)
            : 0;

        return {
            total: applicants.length,
            activePipeline,
            goLive,
            declined,
            conversionRate,
            thisWeekApps,
            weeklyChange,
            avgTimeToHire
        };
    }, [applicants]);

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

    // Row style - cards in same row match height (stretch)
    const rowStyle = {
        display: 'grid',
        gap: 3,
        mb: 3,
        alignItems: 'stretch'
    };

    // Card wrapper - fills height of row
    const cardWrapper = {
        display: 'flex',
        '& > *': { flex: 1, width: '100%' }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Intelligence Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Real-time overview of {applicants.length} applicants
                </Typography>
            </Box>

            {/* Enhanced KPI Summary Row */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`
                }}
            >
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(8, 1fr)' }, gap: 3 }}>
                    {/* Total Applicants */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <People sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="caption" color="text.secondary">Total</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="primary.main">{kpiData.total}</Typography>
                        <Typography variant="caption" color="text.disabled">applicants</Typography>
                    </Box>

                    {/* Active Pipeline */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <Timeline sx={{ fontSize: 18, color: 'info.main' }} />
                            <Typography variant="caption" color="text.secondary">Active</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="info.main">{kpiData.activePipeline}</Typography>
                        <Typography variant="caption" color="text.disabled">in pipeline</Typography>
                    </Box>

                    {/* Go Live */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                            <Typography variant="caption" color="text.secondary">Go Live</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="success.main">{kpiData.goLive}</Typography>
                        <Typography variant="caption" color="text.disabled">hired</Typography>
                    </Box>

                    {/* Declined */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <Cancel sx={{ fontSize: 18, color: 'error.main' }} />
                            <Typography variant="caption" color="text.secondary">Declined</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="error.main">{kpiData.declined}</Typography>
                        <Typography variant="caption" color="text.disabled">rejected</Typography>
                    </Box>

                    {/* Conversion Rate */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <Speed sx={{ fontSize: 18, color: 'warning.main' }} />
                            <Typography variant="caption" color="text.secondary">Conversion</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="warning.main">{kpiData.conversionRate.toFixed(1)}%</Typography>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(kpiData.conversionRate, 100)}
                            sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: 'action.hover' }}
                        />
                    </Box>

                    {/* This Week */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <CalendarMonth sx={{ fontSize: 18, color: 'secondary.main' }} />
                            <Typography variant="caption" color="text.secondary">This Week</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold" color="secondary.main">{kpiData.thisWeekApps}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
                            {kpiData.weeklyChange >= 0 ? (
                                <TrendingUp sx={{ fontSize: 12, color: 'success.main' }} />
                            ) : (
                                <TrendingDown sx={{ fontSize: 12, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" sx={{ color: kpiData.weeklyChange >= 0 ? 'success.main' : 'error.main' }}>
                                {kpiData.weeklyChange > 0 ? '+' : ''}{kpiData.weeklyChange.toFixed(0)}%
                            </Typography>
                        </Box>
                    </Box>

                    {/* Avg Time to Hire */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <Timeline sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">Avg Time</Typography>
                        </Box>
                        <Typography variant="h4" fontWeight="bold">{kpiData.avgTimeToHire}d</Typography>
                        <Typography variant="caption" color="text.disabled">to hire</Typography>
                    </Box>

                    {/* Top Role */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 0.5 }}>
                            <Work sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">Top Role</Typography>
                        </Box>
                        <Typography variant="body1" fontWeight="bold" noWrap sx={{ maxWidth: 100, mx: 'auto' }}>
                            {roleDistribution[0]?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {roleDistribution[0]?.value || 0} apps
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Row 1: Map + Regional (2 columns) */}
            <Box sx={{ ...rowStyle, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
                <Box sx={cardWrapper}>
                    <GeographicMap
                        data={mapData}
                        selectedCountry={selectedCountry}
                        onCountryClick={handleCountryClick}
                    />
                </Box>
                <Box sx={cardWrapper}>
                    <RegionalComparison applicants={applicants} onCountryClick={handleCountryClick} selectedCountry={selectedCountry} />
                </Box>
            </Box>

            {/* Row 2: Funnel + Pipeline (2 columns) */}
            <Box sx={{ ...rowStyle, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
                <Box sx={cardWrapper}>
                    <RecruitmentFunnel
                        data={funnelCounts}
                        onStageClick={handleStageClick}
                        selectedStage={selectedStage}
                    />
                </Box>
                <Box sx={cardWrapper}>
                    <PipelineHealth applicants={applicants} onStageClick={handleStageClick} />
                </Box>
            </Box>

            {/* Row 3: Trends (2 columns) */}
            <Box sx={{ ...rowStyle, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
                <Box sx={cardWrapper}>
                    <ApplicationTrendChart data={trendData} />
                </Box>
                <Box sx={cardWrapper}>
                    <WeeklyTrends applicants={applicants} />
                </Box>
            </Box>

            {/* Row 4: Time to Hire, Experience, Rating, Skills (4 columns - same row, same height) */}
            <Box sx={{ ...rowStyle, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>
                <Box sx={cardWrapper}>
                    <TimeToHireChart applicants={applicants} />
                </Box>
                <Box sx={cardWrapper}>
                    <ExperienceBreakdown applicants={applicants} />
                </Box>
                <Box sx={cardWrapper}>
                    <RatingDistribution applicants={applicants} />
                </Box>
                <Box sx={cardWrapper}>
                    <SkillsCertifications applicants={applicants} />
                </Box>
            </Box>

            {/* Row 5: Source + Activity (2 columns) */}
            <Box sx={{ ...rowStyle, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, mb: 0 }}>
                <Box sx={cardWrapper}>
                    <ApplicationSource applicants={applicants} />
                </Box>
                <Box sx={cardWrapper}>
                    <RecentActivity applicants={allApplicants} limit={8} />
                </Box>
            </Box>
        </Box>
    );
};
