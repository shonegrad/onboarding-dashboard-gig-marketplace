import { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';
import { CompareArrows, TrendingUp, TrendingDown } from '@mui/icons-material';
import { Applicant } from '../../types';

interface WeeklyComparisonProps {
    applicants: Applicant[];
}

interface WeekData {
    metric: string;
    thisWeek: number;
    lastWeek: number;
    change: number;
    isPositive: boolean;
}

export const WeeklyComparison = ({ applicants }: WeeklyComparisonProps) => {
    const theme = useTheme();
    const chartRef = useRef<SVGSVGElement>(null);

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
                change: calcChange(thisWeekApps.length, lastWeekApps.length),
                isPositive: thisWeekApps.length >= lastWeekApps.length
            },
            {
                metric: 'Go Live',
                thisWeek: thisWeekGoLive,
                lastWeek: lastWeekGoLive,
                change: calcChange(thisWeekGoLive, lastWeekGoLive),
                isPositive: thisWeekGoLive >= lastWeekGoLive
            },
            {
                metric: 'Interviews',
                thisWeek: thisWeekInterviews,
                lastWeek: lastWeekInterviews,
                change: calcChange(thisWeekInterviews, lastWeekInterviews),
                isPositive: thisWeekInterviews >= lastWeekInterviews
            },
            {
                metric: 'Declined',
                thisWeek: thisWeekDeclined,
                lastWeek: lastWeekDeclined,
                change: calcChange(thisWeekDeclined, lastWeekDeclined),
                isPositive: thisWeekDeclined <= lastWeekDeclined // Lower is better for declines
            }
        ];
    }, [applicants]);

    useEffect(() => {
        if (!chartRef.current) return;

        d3.select(chartRef.current).selectAll("*").remove();

        const width = 200;
        const height = 80;
        const margin = { top: 10, right: 10, bottom: 20, left: 10 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(chartRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const data = weekData.slice(0, 3);
        const barWidth = innerWidth / data.length - 10;

        const y = d3.scaleLinear()
            .domain([0, Math.max(...data.flatMap(d => [d.thisWeek, d.lastWeek]), 10)])
            .range([innerHeight, 0]);

        data.forEach((d, i) => {
            const x = i * (barWidth + 10);

            // Last week bar (background)
            svg.append("rect")
                .attr("x", x)
                .attr("y", y(d.lastWeek))
                .attr("width", barWidth / 2 - 2)
                .attr("height", innerHeight - y(d.lastWeek))
                .attr("fill", theme.palette.action.hover)
                .attr("rx", 3);

            // This week bar
            svg.append("rect")
                .attr("x", x + barWidth / 2)
                .attr("y", y(d.thisWeek))
                .attr("width", barWidth / 2 - 2)
                .attr("height", innerHeight - y(d.thisWeek))
                .attr("fill", d.isPositive ? theme.palette.success.main : theme.palette.error.main)
                .attr("rx", 3);

            // Label
            svg.append("text")
                .attr("x", x + barWidth / 2)
                .attr("y", innerHeight + 14)
                .attr("text-anchor", "middle")
                .attr("fill", theme.palette.text.secondary)
                .attr("font-size", 9)
                .text(d.metric.slice(0, 4));
        });

    }, [weekData, theme]);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                height: '100%',
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: 4 }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Weekly Comparison
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        This week vs last week
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <svg ref={chartRef}></svg>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {weekData.map((item) => (
                    <Box
                        key={item.metric}
                        sx={{
                            flex: '1 1 45%',
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                            {item.metric}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography variant="body2" fontWeight="bold">
                                {item.thisWeek}
                            </Typography>
                            {item.isPositive ? (
                                <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                            ) : (
                                <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                            )}
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: 10,
                                    color: item.isPositive ? 'success.main' : 'error.main'
                                }}
                            >
                                {item.change > 0 ? '+' : ''}{item.change}%
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
