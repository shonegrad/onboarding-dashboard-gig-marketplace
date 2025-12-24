import { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { Applicant } from '../../types';

interface TimeToHireChartProps {
    applicants: Applicant[];
}

export const TimeToHireChart = ({ applicants }: TimeToHireChartProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    // Calculate time-to-hire for Go Live applicants
    const hireData = useMemo(() => {
        const goLiveApplicants = applicants.filter(a => a.status === 'Go Live');

        const durations = goLiveApplicants.map(a => {
            const applied = new Date(a.appliedDate);
            const completed = new Date(a.lastStatusChangeDate);
            return Math.round((completed.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
        }).filter(d => d >= 0 && d <= 60); // Filter reasonable values

        if (durations.length === 0) return { histogram: [], stats: { median: 0, p25: 0, p75: 0, avg: 0 } };

        // Calculate statistics
        const sorted = [...durations].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const p25 = sorted[Math.floor(sorted.length * 0.25)];
        const p75 = sorted[Math.floor(sorted.length * 0.75)];
        const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

        // Create histogram bins
        const bins = d3.bin()
            .domain([0, 45])
            .thresholds(9)(durations);

        return {
            histogram: bins.map(bin => ({
                x0: bin.x0 || 0,
                x1: bin.x1 || 0,
                count: bin.length
            })),
            stats: { median, p25, p75, avg }
        };
    }, [applicants]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || hireData.histogram.length === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 20, right: 30, bottom: 40, left: 45 };
        const width = containerRef.current.clientWidth;
        const height = 200;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleLinear()
            .domain([0, 45])
            .range([0, innerWidth]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(hireData.histogram, d => d.count) || 10])
            .nice()
            .range([innerHeight, 0]);

        // Gradient
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "histogram-gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", theme.palette.info.dark);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", theme.palette.info.light);

        // Draw bars
        g.selectAll(".bar")
            .data(hireData.histogram)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.x0) + 1)
            .attr("y", d => y(d.count))
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
            .attr("height", d => innerHeight - y(d.count))
            .attr("fill", "url(#histogram-gradient)")
            .attr("rx", 3)
            .style("cursor", "pointer")
            .on("mouseover", function () {
                d3.select(this).attr("opacity", 0.8);
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
            });

        // Median line
        g.append("line")
            .attr("x1", x(hireData.stats.median))
            .attr("x2", x(hireData.stats.median))
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", theme.palette.warning.main)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,3");

        // X Axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(9).tickFormat(d => `${d}d`))
            .call(g => g.select(".domain").attr("stroke", theme.palette.divider))
            .call(g => g.selectAll(".tick text")
                .attr("fill", theme.palette.text.secondary)
                .attr("font-size", 10)
            );

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
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: 4 }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'info.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'info.contrastText'
                    }}>
                        <AccessTime />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Time to Hire
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Days from application to go-live
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                        label={`Median: ${hireData.stats.median}d`}
                        size="small"
                        color="warning"
                        variant="outlined"
                    />
                    <Chip
                        label={`Avg: ${hireData.stats.avg}d`}
                        size="small"
                        variant="outlined"
                    />
                </Box>
            </Box>

            {/* Chart */}
            <Box ref={containerRef} sx={{ p: 2 }}>
                <svg ref={svgRef}></svg>
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
                <Box sx={{ textAlign: 'center' }}>
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
