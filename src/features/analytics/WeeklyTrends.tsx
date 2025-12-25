import { useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton, Tooltip as MuiTooltip } from '@mui/material';
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
    const [chartType, setChartType] = useState<ChartType>('area');
    const [selectedMetric, setSelectedMetric] = useState<MetricType>('applications');
    const [hoveredWeek, setHoveredWeek] = useState<WeekPoint | null>(null);

    const weeklyData = useMemo((): WeekPoint[] => {
        const now = new Date();
        const weeks: WeekPoint[] = [];

        // Generate last 8 weeks
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

    const metrics: { key: MetricType; label: string; color: string }[] = [
        { key: 'applications', label: 'Applications', color: theme.palette.primary.main },
        { key: 'goLive', label: 'Go Live', color: theme.palette.success.main },
        { key: 'interviews', label: 'Interviews', color: theme.palette.info.main },
        { key: 'declined', label: 'Declined', color: theme.palette.error.main },
    ];

    const currentMetric = metrics.find(m => m.key === selectedMetric)!;

    // Calculate trend
    const trend = useMemo(() => {
        if (weeklyData.length < 2) return 0;
        const recent = weeklyData[weeklyData.length - 1][selectedMetric];
        const previous = weeklyData[weeklyData.length - 2][selectedMetric];
        if (previous === 0) return recent > 0 ? 100 : 0;
        return Math.round(((recent - previous) / previous) * 100);
    }, [weeklyData, selectedMetric]);

    useEffect(() => {
        if (!chartRef.current || weeklyData.length === 0) return;

        const svg = d3.select(chartRef.current);
        svg.selectAll("*").remove();

        const width = 450;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        svg.attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(weeklyData.map(d => d.weekLabel))
            .range([0, innerWidth])
            .padding(0.2);

        const maxVal = Math.max(...weeklyData.map(d => d[selectedMetric]), 10);
        const y = d3.scaleLinear()
            .domain([0, maxVal * 1.1])
            .range([innerHeight, 0]);

        // Grid lines
        g.append("g")
            .attr("class", "grid")
            .selectAll("line")
            .data(y.ticks(5))
            .enter()
            .append("line")
            .attr("x1", 0)
            .attr("x2", innerWidth)
            .attr("y1", d => y(d))
            .attr("y2", d => y(d))
            .attr("stroke", theme.palette.divider)
            .attr("stroke-dasharray", "3,3");

        // X axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).tickSize(0))
            .selectAll("text")
            .attr("fill", theme.palette.text.secondary)
            .attr("font-size", 11);

        g.select(".domain").remove();

        // Y axis
        g.append("g")
            .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth))
            .selectAll("text")
            .attr("fill", theme.palette.text.secondary)
            .attr("font-size", 10);

        g.selectAll(".domain").remove();
        g.selectAll(".tick line").attr("stroke", theme.palette.divider);

        if (chartType === 'line' || chartType === 'area') {
            const line = d3.line<WeekPoint>()
                .x(d => (x(d.weekLabel) || 0) + x.bandwidth() / 2)
                .y(d => y(d[selectedMetric]))
                .curve(d3.curveMonotoneX);

            if (chartType === 'area') {
                const area = d3.area<WeekPoint>()
                    .x(d => (x(d.weekLabel) || 0) + x.bandwidth() / 2)
                    .y0(innerHeight)
                    .y1(d => y(d[selectedMetric]))
                    .curve(d3.curveMonotoneX);

                g.append("path")
                    .datum(weeklyData)
                    .attr("fill", currentMetric.color)
                    .attr("fill-opacity", 0.2)
                    .attr("d", area);
            }

            g.append("path")
                .datum(weeklyData)
                .attr("fill", "none")
                .attr("stroke", currentMetric.color)
                .attr("stroke-width", 2.5)
                .attr("d", line);

            // Data points
            g.selectAll(".dot")
                .data(weeklyData)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", d => (x(d.weekLabel) || 0) + x.bandwidth() / 2)
                .attr("cy", d => y(d[selectedMetric]))
                .attr("r", 5)
                .attr("fill", theme.palette.background.paper)
                .attr("stroke", currentMetric.color)
                .attr("stroke-width", 2)
                .style("cursor", "pointer")
                .on("mouseenter", (_, d) => setHoveredWeek(d))
                .on("mouseleave", () => setHoveredWeek(null));

        } else if (chartType === 'bar') {
            g.selectAll(".bar")
                .data(weeklyData)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", d => x(d.weekLabel) || 0)
                .attr("y", d => y(d[selectedMetric]))
                .attr("width", x.bandwidth())
                .attr("height", d => innerHeight - y(d[selectedMetric]))
                .attr("fill", currentMetric.color)
                .attr("rx", 4)
                .style("cursor", "pointer")
                .on("mouseenter", (_, d) => setHoveredWeek(d))
                .on("mouseleave", () => setHoveredWeek(null));
        }

    }, [weeklyData, chartType, selectedMetric, theme, currentMetric]);

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
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
                        <Timeline fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Weekly Trends
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {trend >= 0 ? (
                                <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                            ) : (
                                <TrendingDown sx={{ fontSize: 14, color: 'error.main' }} />
                            )}
                            <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main' }}>
                                {trend > 0 ? '+' : ''}{trend}% vs last week
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Chart Type Toggle */}
                <ToggleButtonGroup
                    value={chartType}
                    exclusive
                    onChange={(_, val) => val && setChartType(val)}
                    size="small"
                >
                    <ToggleButton value="area">
                        <MuiTooltip title="Area Chart"><ShowChart sx={{ fontSize: 18 }} /></MuiTooltip>
                    </ToggleButton>
                    <ToggleButton value="line">
                        <MuiTooltip title="Line Chart"><Timeline sx={{ fontSize: 18 }} /></MuiTooltip>
                    </ToggleButton>
                    <ToggleButton value="bar">
                        <MuiTooltip title="Bar Chart"><BarChart sx={{ fontSize: 18 }} /></MuiTooltip>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Metric Selector */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {metrics.map(m => (
                    <Box
                        key={m.key}
                        onClick={() => setSelectedMetric(m.key)}
                        sx={{
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            bgcolor: selectedMetric === m.key ? m.color : 'action.hover',
                            color: selectedMetric === m.key ? 'white' : 'text.secondary',
                            transition: 'all 0.2s',
                            '&:hover': { opacity: 0.8 }
                        }}
                    >
                        <Typography variant="caption" fontWeight={500}>
                            {m.label}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Chart */}
            <Box sx={{ position: 'relative' }}>
                <svg ref={chartRef} style={{ width: '100%', height: 200 }} />

                {/* Tooltip */}
                {hoveredWeek && (
                    <Box sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.5,
                        boxShadow: 3,
                        minWidth: 120
                    }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            {hoveredWeek.weekLabel} ({hoveredWeek.weekStart.toLocaleDateString()})
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: currentMetric.color }}>
                            {hoveredWeek[selectedMetric]} {currentMetric.label}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Summary */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">{weeklyData[weeklyData.length - 1]?.[selectedMetric] || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">This Week</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                        {Math.round(weeklyData.reduce((sum, w) => sum + w[selectedMetric], 0) / weeklyData.length)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">8-Week Avg</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                        {Math.max(...weeklyData.map(w => w[selectedMetric]))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">Peak</Typography>
                </Box>
            </Box>
        </Paper>
    );
};
