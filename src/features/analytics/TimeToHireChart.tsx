import { useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Chip, Fade } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { Applicant } from '../../types';

interface TimeToHireChartProps {
    applicants: Applicant[];
}

export const TimeToHireChart = ({ applicants }: TimeToHireChartProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const [hoveredBar, setHoveredBar] = useState<{ x: number; y: number; range: string; count: number } | null>(null);

    const hireData = useMemo(() => {
        const goLiveApplicants = applicants.filter(a => a.status === 'Go Live');

        const durations = goLiveApplicants.map(a => {
            const applied = new Date(a.appliedDate);
            const completed = new Date(a.lastStatusChangeDate);
            return Math.round((completed.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
        }).filter(d => d >= 0 && d <= 60);

        if (durations.length === 0) return { histogram: [], stats: { median: 0, p25: 0, p75: 0, avg: 0, total: 0 } };

        const sorted = [...durations].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const p25 = sorted[Math.floor(sorted.length * 0.25)];
        const p75 = sorted[Math.floor(sorted.length * 0.75)];
        const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

        const bins = d3.bin().domain([0, 45]).thresholds(9)(durations);

        return {
            histogram: bins.map(bin => ({
                x0: bin.x0 || 0,
                x1: bin.x1 || 0,
                count: bin.length,
                label: `${bin.x0}-${bin.x1} days`
            })),
            stats: { median, p25, p75, avg, total: durations.length }
        };
    }, [applicants]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || hireData.histogram.length === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 20, right: 30, bottom: 45, left: 45 };
        const width = containerRef.current.clientWidth;
        const height = 220;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const defs = svg.append("defs");

        // Bar gradient
        const barGradient = defs.append("linearGradient")
            .attr("id", "histogram-bar-gradient")
            .attr("x1", "0%").attr("y1", "100%")
            .attr("x2", "0%").attr("y2", "0%");
        barGradient.append("stop").attr("offset", "0%")
            .attr("stop-color", theme.palette.info.dark);
        barGradient.append("stop").attr("offset", "100%")
            .attr("stop-color", theme.palette.info.light);

        // Hover gradient
        const hoverGradient = defs.append("linearGradient")
            .attr("id", "histogram-hover-gradient")
            .attr("x1", "0%").attr("y1", "100%")
            .attr("x2", "0%").attr("y2", "0%");
        hoverGradient.append("stop").attr("offset", "0%")
            .attr("stop-color", theme.palette.primary.dark);
        hoverGradient.append("stop").attr("offset", "100%")
            .attr("stop-color", theme.palette.primary.light);

        const x = d3.scaleLinear().domain([0, 45]).range([0, innerWidth]);
        const y = d3.scaleLinear()
            .domain([0, (d3.max(hireData.histogram, d => d.count) || 10) * 1.1])
            .nice()
            .range([innerHeight, 0]);

        // Grid lines
        g.append("g")
            .call(d3.axisLeft(y).ticks(4).tickSize(-innerWidth).tickFormat(() => ""))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line")
                .attr("stroke", theme.palette.divider)
                .attr("stroke-dasharray", "2,4")
                .attr("opacity", 0.5)
            );

        // Bars with animation
        g.selectAll(".bar")
            .data(hireData.histogram)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.x0) + 2)
            .attr("y", innerHeight)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 4))
            .attr("height", 0)
            .attr("fill", "url(#histogram-bar-gradient)")
            .attr("rx", 4)
            .style("cursor", "pointer")
            .on("mouseenter", function (event, d) {
                d3.select(this)
                    .transition().duration(150)
                    .attr("fill", "url(#histogram-hover-gradient)")
                    .attr("transform", "scale(1.02)")
                    .attr("transform-origin", "center bottom");

                const rect = (this as SVGRectElement).getBoundingClientRect();
                const containerRect = containerRef.current!.getBoundingClientRect();
                setHoveredBar({
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top - 10,
                    range: d.label,
                    count: d.count
                });
            })
            .on("mouseleave", function () {
                d3.select(this)
                    .transition().duration(150)
                    .attr("fill", "url(#histogram-bar-gradient)")
                    .attr("transform", "scale(1)");
                setHoveredBar(null);
            })
            .transition()
            .duration(600)
            .delay((_, i) => i * 60)
            .ease(d3.easeBackOut)
            .attr("y", d => y(d.count))
            .attr("height", d => innerHeight - y(d.count));

        // Median line with animation
        const medianX = x(hireData.stats.median);
        const medianLine = g.append("line")
            .attr("x1", medianX).attr("x2", medianX)
            .attr("y1", innerHeight).attr("y2", innerHeight)
            .attr("stroke", theme.palette.warning.main)
            .attr("stroke-width", 2.5)
            .attr("stroke-dasharray", "6,4");

        medianLine.transition()
            .duration(800)
            .delay(600)
            .attr("y2", 0);

        // Median label
        g.append("text")
            .attr("x", medianX + 5)
            .attr("y", 10)
            .attr("fill", theme.palette.warning.main)
            .attr("font-size", 11)
            .attr("font-weight", 600)
            .attr("opacity", 0)
            .text(`Median: ${hireData.stats.median}d`)
            .transition()
            .delay(1200)
            .duration(300)
            .attr("opacity", 1);

        // X Axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(9).tickFormat(d => `${d}d`))
            .call(g => g.select(".domain").attr("stroke", theme.palette.divider))
            .call(g => g.selectAll(".tick text")
                .attr("fill", theme.palette.text.secondary)
                .attr("font-size", 10)
            );

        // X axis label
        g.append("text")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 35)
            .attr("text-anchor", "middle")
            .attr("fill", theme.palette.text.secondary)
            .attr("font-size", 11)
            .text("Days to Hire");

        // Y Axis
        g.append("g")
            .call(d3.axisLeft(y).ticks(4))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").remove())
            .call(g => g.selectAll(".tick text")
                .attr("fill", theme.palette.text.secondary)
                .attr("font-size", 10)
            );

    }, [hireData, theme]);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 6 }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'info.contrastText',
                        boxShadow: `0 4px 12px ${theme.palette.info.main}40`
                    }}>
                        <AccessTime />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Time to Hire
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {hireData.stats.total} hires analyzed
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                        label={`Median: ${hireData.stats.median}d`}
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 600 }}
                    />
                    <Chip
                        label={`Avg: ${hireData.stats.avg}d`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            </Box>

            {/* Chart */}
            <Box ref={containerRef} sx={{ p: 2, position: 'relative' }}>
                <svg ref={svgRef}></svg>

                {/* Tooltip */}
                <Fade in={!!hoveredBar}>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: hoveredBar?.x || 0,
                            top: hoveredBar?.y || 0,
                            transform: 'translate(-50%, -100%)',
                            bgcolor: 'background.paper',
                            boxShadow: 4,
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            pointerEvents: 'none',
                            border: 1,
                            borderColor: 'primary.main',
                            zIndex: 10
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" display="block">
                            {hoveredBar?.range}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {hoveredBar?.count} hires
                        </Typography>
                    </Box>
                </Fade>
            </Box>

            {/* Stats Footer */}
            <Box sx={{
                px: 2.5,
                py: 1.5,
                bgcolor: 'action.hover',
                display: 'flex',
                justifyContent: 'space-around'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">25th %ile</Typography>
                    <Typography variant="body2" fontWeight="bold">{hireData.stats.p25}d</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', borderLeft: 1, borderRight: 1, borderColor: 'divider', px: 3 }}>
                    <Typography variant="caption" color="text.secondary">Median</Typography>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">{hireData.stats.median}d</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">75th %ile</Typography>
                    <Typography variant="body2" fontWeight="bold">{hireData.stats.p75}d</Typography>
                </Box>
            </Box>
        </Paper>
    );
};
