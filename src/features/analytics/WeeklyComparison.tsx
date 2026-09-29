import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, LinearProgress, Chip, Tooltip } from '@mui/material';
import { CompareArrows, TrendingUp, TrendingDown, TrendingFlat, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { Applicant } from '../../types';

interface WeeklyComparisonProps {
    applicants: Applicant[];
}

interface WeekData {
    metric: string;
    thisWeek: number;
    lastWeek: number;
    change: number;
    changePercent: number;
    isPositive: boolean;
    color: string;
}

export const WeeklyComparison = ({ applicants }: WeeklyComparisonProps) => {
    const theme = useTheme();

    const weekData = useMemo((): WeekData[] => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const thisWeekApps = applicants.filter(a => new Date(a.appliedDate) >= oneWeekAgo);
        const lastWeekApps = applicants.filter(a => {
            const date = new Date(a.appliedDate);
            return date >= twoWeeksAgo && date < oneWeekAgo;
        });

        const thisWeekGoLive = thisWeekApps.filter(a => a.status === 'Go Live').length;
        const lastWeekGoLive = lastWeekApps.filter(a => a.status === 'Go Live').length;

        const thisWeekDeclined = thisWeekApps.filter(a => a.status === 'Declined').length;
        const lastWeekDeclined = lastWeekApps.filter(a => a.status === 'Declined').length;

        const thisWeekInterviews = thisWeekApps.filter(a =>
            a.status === 'Interview Scheduled' || a.status === 'Invited to Interview'
        ).length;
        const lastWeekInterviews = lastWeekApps.filter(a =>
            a.status === 'Interview Scheduled' || a.status === 'Invited to Interview'
        ).length;

        const calcChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        return [
            {
                metric: 'Applications',
                thisWeek: thisWeekApps.length,
                lastWeek: lastWeekApps.length,
                change: thisWeekApps.length - lastWeekApps.length,
                changePercent: calcChange(thisWeekApps.length, lastWeekApps.length),
                isPositive: thisWeekApps.length >= lastWeekApps.length,
                color: theme.palette.primary.main
            },
            {
                metric: 'Go Live',
                thisWeek: thisWeekGoLive,
                lastWeek: lastWeekGoLive,
                change: thisWeekGoLive - lastWeekGoLive,
                changePercent: calcChange(thisWeekGoLive, lastWeekGoLive),
                isPositive: thisWeekGoLive >= lastWeekGoLive,
                color: theme.palette.success.main
            },
            {
                metric: 'Interviews',
                thisWeek: thisWeekInterviews,
                lastWeek: lastWeekInterviews,
                change: thisWeekInterviews - lastWeekInterviews,
                changePercent: calcChange(thisWeekInterviews, lastWeekInterviews),
                isPositive: thisWeekInterviews >= lastWeekInterviews,
                color: theme.palette.info.main
            },
            {
                metric: 'Declined',
                thisWeek: thisWeekDeclined,
                lastWeek: lastWeekDeclined,
                change: thisWeekDeclined - lastWeekDeclined,
                changePercent: calcChange(thisWeekDeclined, lastWeekDeclined),
                isPositive: thisWeekDeclined <= lastWeekDeclined, // Lower is better
                color: theme.palette.error.main
            }
        ];
    }, [applicants, theme]);

    // Calculate overall trend
    const overallTrend = useMemo(() => {
        const positiveCount = weekData.filter(d => d.isPositive).length;
        if (positiveCount >= 3) return 'up';
        if (positiveCount <= 1) return 'down';
        return 'flat';
    }, [weekData]);

    const TrendIcon = overallTrend === 'up' ? TrendingUp : overallTrend === 'down' ? TrendingDown : TrendingFlat;
    const trendColor = overallTrend === 'up' ? 'success.main' : overallTrend === 'down' ? 'error.main' : 'warning.main';
    const trendText = overallTrend === 'up' ? 'Trending Up' : overallTrend === 'down' ? 'Trending Down' : 'Stable';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                height: '100%',
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: 4 }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: 'info.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'info.contrastText'
                    }}>
                        <CompareArrows fontSize="small" />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Weekly Trends
                    </Typography>
                </Box>
                <Chip
                    icon={<TrendIcon sx={{ fontSize: 16 }} />}
                    label={trendText}
                    size="small"
                    sx={{
                        bgcolor: `${trendColor}`,
                        color: 'white',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: 'inherit' }
                    }}
                />
            </Box>

            {/* Metrics */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {weekData.map((item) => {
                    const maxVal = Math.max(item.thisWeek, item.lastWeek, 1);
                    const thisWeekProgress = (item.thisWeek / maxVal) * 100;
                    const lastWeekProgress = (item.lastWeek / maxVal) * 100;

                    return (
                        <Tooltip
                            key={item.metric}
                            title={`This week: ${item.thisWeek} | Last week: ${item.lastWeek}`}
                            placement="top"
                        >
                            <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'action.hover',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'action.selected' }
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="caption" fontWeight={500} color="text.secondary">
                                        {item.metric}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {item.change !== 0 && (
                                            item.isPositive ? (
                                                <ArrowUpward sx={{ fontSize: 12, color: 'success.main' }} />
                                            ) : (
                                                <ArrowDownward sx={{ fontSize: 12, color: 'error.main' }} />
                                            )
                                        )}
                                        <Typography
                                            variant="caption"
                                            fontWeight={600}
                                            sx={{ color: item.change === 0 ? 'text.secondary' : item.isPositive ? 'success.main' : 'error.main' }}
                                        >
                                            {item.change > 0 ? '+' : ''}{item.change} ({item.changePercent > 0 ? '+' : ''}{item.changePercent}%)
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ minWidth: 24 }}>
                                        {item.thisWeek}
                                    </Typography>
                                    <Box sx={{ flex: 1, position: 'relative' }}>
                                        {/* Last week bar (background) */}
                                        <LinearProgress
                                            variant="determinate"
                                            value={lastWeekProgress}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'action.disabledBackground',
                                                position: 'absolute',
                                                width: '100%',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: 'action.disabled',
                                                    borderRadius: 4
                                                }
                                            }}
                                        />
                                        {/* This week bar */}
                                        <LinearProgress
                                            variant="determinate"
                                            value={thisWeekProgress}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: 'transparent',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: item.color,
                                                    borderRadius: 4
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" color="text.disabled" sx={{ minWidth: 20, textAlign: 'right' }}>
                                        {item.lastWeek}
                                    </Typography>
                                </Box>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 4, borderRadius: 2, bgcolor: 'primary.main' }} />
                    <Typography variant="caption" color="text.secondary">This Week</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 4, borderRadius: 2, bgcolor: 'action.disabled' }} />
                    <Typography variant="caption" color="text.secondary">Last Week</Typography>
                </Box>
            </Box>
        </Paper>
    );
};
