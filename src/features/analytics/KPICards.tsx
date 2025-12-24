import { Box, Paper, Typography, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, People, Speed, Timeline, CalendarMonth } from '@mui/icons-material';
import { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Applicant } from '../../types';

interface KPICardsProps {
    applicants: Applicant[];
    dateRange?: { start: Date; end: Date };
}

interface KPIData {
    title: string;
    value: string | number;
    trend: number; // percentage change
    trendLabel: string;
    icon: React.ReactNode;
    color: string;
    sparklineData: number[];
}

const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const theme = useTheme();

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = 80;
        const height = 32;
        const margin = { top: 4, right: 4, bottom: 4, left: 4 };

        const x = d3.scaleLinear()
            .domain([0, data.length - 1])
            .range([margin.left, width - margin.right]);

        const y = d3.scaleLinear()
            .domain([0, Math.max(...data)])
            .range([height - margin.bottom, margin.top]);

        const line = d3.line<number>()
            .x((_, i) => x(i))
            .y(d => y(d))
            .curve(d3.curveMonotoneX);

        const area = d3.area<number>()
            .x((_, i) => x(i))
            .y0(height - margin.bottom)
            .y1(d => y(d))
            .curve(d3.curveMonotoneX);

        // Area fill
        svg.append("path")
            .datum(data)
            .attr("fill", color)
            .attr("fill-opacity", 0.15)
            .attr("d", area);

        // Line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("d", line);

    }, [data, color]);

    return <svg ref={svgRef} width={80} height={32} />;
};

export const KPICards = ({ applicants, dateRange }: KPICardsProps) => {
    const theme = useTheme();

    const kpis = useMemo((): KPIData[] => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Active pipeline (non-declined, non-Go Live)
        const activeStatuses = ['Applied', 'Invited to Interview', 'Interview Scheduled', 'Invited to Training', 'In Training', 'Under Review'];
        const activePipeline = applicants.filter(a => activeStatuses.includes(a.status)).length;

        // Conversion rate (Go Live / Total excluding declined)
        const goLive = applicants.filter(a => a.status === 'Go Live').length;
        const declined = applicants.filter(a => a.status === 'Declined').length;
        const conversionRate = ((goLive / (applicants.length - declined)) * 100).toFixed(1);

        // This week applications
        const thisWeekApps = applicants.filter(a => new Date(a.appliedDate) >= oneWeekAgo).length;
        const lastWeekApps = applicants.filter(a => {
            const date = new Date(a.appliedDate);
            return date >= twoWeeksAgo && date < oneWeekAgo;
        }).length;
        const weeklyChange = lastWeekApps > 0 ? ((thisWeekApps - lastWeekApps) / lastWeekApps * 100) : 0;

        // Avg time to hire (approximation based on appliedDate to lastStatusChangeDate for Go Live)
        const goLiveApplicants = applicants.filter(a => a.status === 'Go Live');
        const avgTimeToHire = goLiveApplicants.length > 0
            ? Math.round(goLiveApplicants.reduce((sum, a) => {
                const applied = new Date(a.appliedDate);
                const completed = new Date(a.lastStatusChangeDate);
                return sum + (completed.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / goLiveApplicants.length)
            : 0;

        // Generate sparkline data (last 7 days of applications)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            const dayStr = date.toISOString().split('T')[0];
            return applicants.filter(a => a.appliedDate === dayStr).length;
        });

        return [
            {
                title: 'Active Pipeline',
                value: activePipeline,
                trend: 0,
                trendLabel: 'in progress',
                icon: <People />,
                color: theme.palette.primary.main,
                sparklineData: last7Days
            },
            {
                title: 'Conversion Rate',
                value: `${conversionRate}%`,
                trend: 2.3, // mock trend
                trendLabel: 'vs last month',
                icon: <Speed />,
                color: theme.palette.success.main,
                sparklineData: [42, 45, 43, 47, 44, 48, 46]
            },
            {
                title: 'Avg Time-to-Hire',
                value: `${avgTimeToHire}d`,
                trend: -5.2,
                trendLabel: 'faster than avg',
                icon: <Timeline />,
                color: theme.palette.info.main,
                sparklineData: [28, 25, 27, 24, 26, 23, 22]
            },
            {
                title: 'This Week',
                value: thisWeekApps,
                trend: weeklyChange,
                trendLabel: 'vs last week',
                icon: <CalendarMonth />,
                color: theme.palette.warning.main,
                sparklineData: last7Days
            }
        ];
    }, [applicants, theme]);

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />;
        if (trend < 0) return <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />;
        return <TrendingFlat sx={{ fontSize: 16, color: 'text.secondary' }} />;
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            {kpis.map((kpi) => (
                <Paper
                    key={kpi.title}
                    sx={{
                        flex: '1 1 200px',
                        minWidth: 200,
                        p: 2.5,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4
                        }
                    }}
                >
                    {/* Icon badge */}
                    <Box sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: `${kpi.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: kpi.color
                    }}>
                        {kpi.icon}
                    </Box>

                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {kpi.title}
                    </Typography>

                    <Typography variant="h4" fontWeight="bold" sx={{ color: kpi.color }}>
                        {kpi.value}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getTrendIcon(kpi.trend)}
                        <Typography variant="caption" color={kpi.trend > 0 ? 'success.main' : kpi.trend < 0 ? 'error.main' : 'text.secondary'}>
                            {kpi.trend > 0 ? '+' : ''}{kpi.trend.toFixed(1)}%
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                            {kpi.trendLabel}
                        </Typography>
                    </Box>

                    {/* Sparkline */}
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                        <Sparkline data={kpi.sparklineData} color={kpi.color} />
                    </Box>
                </Paper>
            ))}
        </Box>
    );
};
