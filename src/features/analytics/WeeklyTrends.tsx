import { useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Timeline, TrendingUp, TrendingDown, ShowChart, BarChart } from '@mui/icons-material';
import { Applicant } from '../../types';

interface WeeklyTrendsProps {
    applicants: Applicant[];
}

interface WeekPoint {
    weekStart: Date;
    weekLabel: string;
    applications: number;
    goLive: number;
    interviews: number;
    declined: number;
}

type ChartType = 'line' | 'area' | 'bar';
type MetricType = 'applications' | 'goLive' | 'interviews' | 'declined';

export const WeeklyTrends = ({ applicants }: WeeklyTrendsProps) => {
    const theme = useTheme();
    const chartRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [chartType, setChartType] = useState<ChartType>('area');
    const [selectedMetric, setSelectedMetric] = useState<MetricType>('applications');

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

            weeks.push({
                weekStart,
                weekLabel: `W${8 - i}`,
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

    const metrics: { key: MetricType; label: string; color: string; abbr: string }[] = [
        { key: 'applications', label: 'Apps', color: theme.palette.primary.main, abbr: 'Apps' },
        { key: 'goLive', label: 'Go Live', color: theme.palette.success.main, abbr: 'Live' },
        { key: 'interviews', label: 'Interviews', color: theme.palette.info.main, abbr: 'Int' },
        { key: 'declined', label: 'Declined', color: theme.palette.error.main, abbr: 'Dec' },
    ];

    const currentMetric = metrics.find(m => m.key === selectedMetric)!;

    const trend = useMemo(() => {
        if (weeklyData.length < 2) return 0;
        const recent = weeklyData[weeklyData.length - 1][selectedMetric];
        const previous = weeklyData[weeklyData.length - 2][selectedMetric];
        if (previous === 0) return recent > 0 ? 100 : 0;
        return Math.round(((recent - previous) / previous) * 100);
    }, [weeklyData, selectedMetric]);

    const thisWeek = weeklyData[weeklyData.length - 1]?.[selectedMetric] || 0;
    const avg = Math.round(weeklyData.reduce((sum, w) => sum + w[selectedMetric], 0) / weeklyData.length);
    const peak = Math.max(...weeklyData.map(w => w[selectedMetric]));

    useEffect(() => {
        if (!chartRef.current || weeklyData.length === 0) return;

        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();

        const width = containerRef.current?.clientWidth || 300;
        const height = 140;
        const margin = { top: 10, right: 10, bottom: 20, left: 30 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand().domain(weeklyData.map(d => d.weekLabel)).range([0, innerWidth]).padding(0.2);
        const maxVal = Math.max(...weeklyData.map(d => d[selectedMetric]), 10);
        const y = d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerHeight, 0]);

        // Grid
        g.append("g").selectAll("line").data(y.ticks(4)).enter()
            .append("line").attr("x1", 0).attr("x2", innerWidth)
            .attr("y1", d => y(d)).attr("y2", d => y(d))
            .attr("stroke", theme.palette.divider).attr("stroke-dasharray", "2,2");

        // X axis
        g.append("g").attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).tickSize(0)).selectAll("text")
            .attr("fill", theme.palette.text.secondary).attr("font-size", 9);
        g.select(".domain").remove();

        // Y axis
        g.append("g").call(d3.axisLeft(y).ticks(4).tickSize(0).tickFormat(d => String(d)))
            .selectAll("text").attr("fill", theme.palette.text.secondary).attr("font-size", 9);
        g.selectAll(".domain").remove();

        if (chartType === 'bar') {
            g.selectAll(".bar").data(weeklyData).enter().append("rect")
                .attr("x", d => x(d.weekLabel) || 0).attr("y", d => y(d[selectedMetric]))
                .attr("width", x.bandwidth()).attr("height", d => innerHeight - y(d[selectedMetric]))
                .attr("fill", currentMetric.color).attr("rx", 3);
        } else {
            const line = d3.line<WeekPoint>()
                .x(d => (x(d.weekLabel) || 0) + x.bandwidth() / 2)
                .y(d => y(d[selectedMetric])).curve(d3.curveMonotoneX);

            if (chartType === 'area') {
                const area = d3.area<WeekPoint>()
                    .x(d => (x(d.weekLabel) || 0) + x.bandwidth() / 2)
                    .y0(innerHeight).y1(d => y(d[selectedMetric])).curve(d3.curveMonotoneX);
                g.append("path").datum(weeklyData).attr("fill", currentMetric.color)
                    .attr("fill-opacity", 0.15).attr("d", area);
            }

            g.append("path").datum(weeklyData).attr("fill", "none")
                .attr("stroke", currentMetric.color).attr("stroke-width", 2).attr("d", line);

            g.selectAll(".dot").data(weeklyData).enter().append("circle")
                .attr("cx", d => (x(d.weekLabel) || 0) + x.bandwidth() / 2)
                .attr("cy", d => y(d[selectedMetric])).attr("r", 4)
                .attr("fill", theme.palette.background.paper)
                .attr("stroke", currentMetric.color).attr("stroke-width", 2);
        }
    }, [weeklyData, chartType, selectedMetric, theme, currentMetric]);

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timeline sx={{ fontSize: 20, color: 'info.main' }} />
                    <Typography variant="subtitle2" fontWeight="bold">Weekly Trends</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 1 }}>
                        {trend >= 0 ? <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} /> : <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />}
                        <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main', fontWeight: 500 }}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </Typography>
                    </Box>
                </Box>
                <ToggleButtonGroup value={chartType} exclusive onChange={(_, val) => val && setChartType(val)} size="small" sx={{ '& .MuiToggleButton-root': { p: 0.5 } }}>
                    <ToggleButton value="area"><ShowChart sx={{ fontSize: 14 }} /></ToggleButton>
                    <ToggleButton value="line"><Timeline sx={{ fontSize: 14 }} /></ToggleButton>
                    <ToggleButton value="bar"><BarChart sx={{ fontSize: 14 }} /></ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Metric Selector + Stats Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {metrics.map(m => (
                        <Box key={m.key} onClick={() => setSelectedMetric(m.key)} sx={{
                            px: 1, py: 0.25, borderRadius: 1, cursor: 'pointer', fontSize: 11, fontWeight: 500,
                            bgcolor: selectedMetric === m.key ? m.color : 'action.hover',
                            color: selectedMetric === m.key ? 'white' : 'text.secondary'
                        }}>
                            {m.abbr}
                        </Box>
                    ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="bold" color={currentMetric.color}>{thisWeek}</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>This Week</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">{avg}</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>Avg</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">{peak}</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>Peak</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Chart */}
            <Box ref={containerRef} sx={{ flex: 1, minHeight: 140 }}>
                <svg ref={chartRef} style={{ width: '100%', height: '100%' }} />
            </Box>
        </Paper>
    );
};
