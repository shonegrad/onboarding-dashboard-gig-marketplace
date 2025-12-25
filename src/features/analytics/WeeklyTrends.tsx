import { useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import { TrendingUp, TrendingDown, CalendarToday } from '@mui/icons-material';
import { Applicant } from '../../types';

interface WeeklyTrendsProps {
    applicants: Applicant[];
}

interface WeekPoint {
    weekStart: Date;
    weekEnd: Date;
    weekLabel: string;
    dateLabel: string;
    applications: number;
    goLive: number;
    interviews: number;
    declined: number;
}

type MetricType = 'applications' | 'goLive' | 'interviews' | 'declined';

export const WeeklyTrends = ({ applicants }: WeeklyTrendsProps) => {
    const theme = useTheme();
    const chartRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedMetric, setSelectedMetric] = useState<MetricType>('applications');
    const [hoveredWeek, setHoveredWeek] = useState<WeekPoint | null>(null);

    const weeklyData = useMemo((): WeekPoint[] => {
        const now = new Date();
        const weeks: WeekPoint[] = [];

        for (let i = 7; i >= 0; i--) {
            const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

            const weekApps = applicants.filter(a => {
                const date = new Date(a.appliedDate);
                return date >= weekStart && date < weekEnd;
            });

            const month = weekStart.toLocaleDateString('en-US', { month: 'short' });
            const day = weekStart.getDate();

            weeks.push({
                weekStart,
                weekEnd,
                weekLabel: i === 0 ? 'Now' : i === 1 ? 'Last' : `${month} ${day}`,
                dateLabel: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                applications: weekApps.length,
                goLive: weekApps.filter(a => a.status === 'Go Live').length,
                interviews: weekApps.filter(a =>
                    a.status === 'Interview Scheduled' || a.status === 'Invited to Interview'
                ).length,
                declined: weekApps.filter(a => a.status === 'Declined').length
            });
        }

        return weeks;
    }, [applicants]);

    const metrics: { key: MetricType; label: string; color: string }[] = [
        { key: 'applications', label: 'Applications', color: theme.palette.primary.main },
        { key: 'goLive', label: 'Hired', color: theme.palette.success.main },
        { key: 'interviews', label: 'Interviews', color: theme.palette.info.main },
        { key: 'declined', label: 'Declined', color: theme.palette.error.main },
    ];

    const currentMetric = metrics.find(m => m.key === selectedMetric)!;

    // Stats calculations
    const thisWeek = weeklyData[weeklyData.length - 1]?.[selectedMetric] || 0;
    const lastWeek = weeklyData[weeklyData.length - 2]?.[selectedMetric] || 0;
    const trend = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : (thisWeek > 0 ? 100 : 0);
    const total = weeklyData.reduce((sum, w) => sum + w[selectedMetric], 0);
    const avg = Math.round(total / weeklyData.length);
    const peak = Math.max(...weeklyData.map(w => w[selectedMetric]));
    const peakWeek = weeklyData.find(w => w[selectedMetric] === peak);

    useEffect(() => {
        if (!chartRef.current || !containerRef.current || weeklyData.length === 0) return;

        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();

        const containerWidth = containerRef.current.clientWidth;
        const width = containerWidth;
        const height = 160;
        const margin = { top: 15, right: 15, bottom: 25, left: 35 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand().domain(weeklyData.map((_, i) => String(i))).range([0, innerWidth]).padding(0.15);
        const maxVal = Math.max(...weeklyData.map(d => d[selectedMetric]), 10);
        const y = d3.scaleLinear().domain([0, maxVal * 1.15]).range([innerHeight, 0]);

        // Subtle grid
        g.append("g").selectAll("line").data(y.ticks(4)).enter()
            .append("line").attr("x1", 0).attr("x2", innerWidth)
            .attr("y1", d => y(d)).attr("y2", d => y(d))
            .attr("stroke", theme.palette.divider).attr("stroke-opacity", 0.5);

        // Average line
        g.append("line")
            .attr("x1", 0).attr("x2", innerWidth)
            .attr("y1", y(avg)).attr("y2", y(avg))
            .attr("stroke", currentMetric.color).attr("stroke-opacity", 0.4)
            .attr("stroke-dasharray", "4,4").attr("stroke-width", 1.5);

        // Bars with gradient effect
        const barWidth = x.bandwidth();
        weeklyData.forEach((d, i) => {
            const barHeight = innerHeight - y(d[selectedMetric]);
            const xPos = x(String(i)) || 0;
            const isHovered = hoveredWeek?.weekLabel === d.weekLabel;
            const isCurrent = i === weeklyData.length - 1;

            g.append("rect")
                .attr("x", xPos)
                .attr("y", y(d[selectedMetric]))
                .attr("width", barWidth)
                .attr("height", barHeight)
                .attr("fill", currentMetric.color)
                .attr("fill-opacity", isHovered ? 1 : isCurrent ? 0.9 : 0.6)
                .attr("rx", 4)
                .style("cursor", "pointer")
                .on("mouseenter", () => setHoveredWeek(d))
                .on("mouseleave", () => setHoveredWeek(null));

            // Value label on top of bar
            if (d[selectedMetric] > 0) {
                g.append("text")
                    .attr("x", xPos + barWidth / 2)
                    .attr("y", y(d[selectedMetric]) - 5)
                    .attr("text-anchor", "middle")
                    .attr("font-size", 10)
                    .attr("font-weight", isHovered || isCurrent ? 600 : 400)
                    .attr("fill", isHovered || isCurrent ? currentMetric.color : theme.palette.text.secondary)
                    .text(d[selectedMetric]);
            }
        });

        // X axis labels
        g.append("g")
            .attr("transform", `translate(0,${innerHeight + 8})`)
            .selectAll("text")
            .data(weeklyData)
            .enter()
            .append("text")
            .attr("x", (_, i) => (x(String(i)) || 0) + barWidth / 2)
            .attr("text-anchor", "middle")
            .attr("font-size", 9)
            .attr("fill", (d, i) => i === weeklyData.length - 1 ? currentMetric.color : theme.palette.text.disabled)
            .attr("font-weight", (_, i) => i === weeklyData.length - 1 ? 600 : 400)
            .text(d => d.weekLabel);

    }, [weeklyData, selectedMetric, theme, currentMetric, hoveredWeek, avg]);

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight="bold">Weekly Trends</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1, bgcolor: trend >= 0 ? 'success.main' : 'error.main', color: 'white' }}>
                    {trend >= 0 ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
                    <Typography variant="caption" fontWeight="bold">{trend > 0 ? '+' : ''}{trend}%</Typography>
                </Box>
            </Box>

            {/* Metric Chips */}
            <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
                {metrics.map(m => (
                    <Chip
                        key={m.key}
                        label={m.label}
                        size="small"
                        onClick={() => setSelectedMetric(m.key)}
                        sx={{
                            height: 24,
                            fontSize: 11,
                            fontWeight: selectedMetric === m.key ? 600 : 400,
                            bgcolor: selectedMetric === m.key ? m.color : 'transparent',
                            color: selectedMetric === m.key ? 'white' : 'text.secondary',
                            border: 1,
                            borderColor: selectedMetric === m.key ? m.color : 'divider',
                            '&:hover': { bgcolor: selectedMetric === m.key ? m.color : 'action.hover' }
                        }}
                    />
                ))}
            </Box>

            {/* Chart */}
            <Box ref={containerRef} sx={{ flex: 1, minHeight: 160, position: 'relative' }}>
                <svg ref={chartRef} style={{ width: '100%', height: '100%' }} />

                {/* Hover tooltip */}
                {hoveredWeek && (
                    <Box sx={{
                        position: 'absolute', top: 0, right: 0,
                        bgcolor: 'background.paper', border: 1, borderColor: 'divider',
                        borderRadius: 1.5, p: 1, boxShadow: 2, minWidth: 100
                    }}>
                        <Typography variant="caption" color="text.secondary" display="block">{hoveredWeek.dateLabel}</Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: currentMetric.color }}>
                            {hoveredWeek[selectedMetric]} {currentMetric.label}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Stats footer */}
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: currentMetric.color, lineHeight: 1 }}>{thisWeek}</Typography>
                    <Typography variant="caption" color="text.disabled">This Week</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1}>{total}</Typography>
                    <Typography variant="caption" color="text.disabled">8-Week Total</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1}>{avg}</Typography>
                    <Typography variant="caption" color="text.disabled">Weekly Avg</Typography>
                </Box>
            </Box>
        </Paper>
    );
};
