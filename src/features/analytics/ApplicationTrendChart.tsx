import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';
import { ShowChart } from '@mui/icons-material';

interface TrendData {
    date: string;
    count: number;
}

interface ApplicationTrendChartProps {
    data: TrendData[];
}

export const ApplicationTrendChart = ({ data }: ApplicationTrendChartProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

        // Clear previous render
        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = containerRef.current.clientWidth;
        const height = 280;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
            .range([0, innerWidth]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.count) || 10])
            .nice()
            .range([innerHeight, 0]);

        // Gradient
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
            .attr("id", "trend-area-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", theme.palette.primary.main)
            .attr("stop-opacity", 0.4);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", theme.palette.primary.main)
            .attr("stop-opacity", 0.02);

        // Glow filter for line
        const filter = defs.append("filter")
            .attr("id", "glow");
        filter.append("feGaussianBlur")
            .attr("stdDeviation", "2")
            .attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Grid lines
        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickSize(-innerWidth)
                .tickFormat(() => "")
            )
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line")
                .attr("stroke", theme.palette.divider)
                .attr("stroke-dasharray", "3,3")
            );

        // Area Generator
        const area = d3.area<TrendData>()
            .x(d => x(new Date(d.date)))
            .y0(innerHeight)
            .y1(d => y(d.count))
            .curve(d3.curveMonotoneX);

        // Line Generator
        const line = d3.line<TrendData>()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.count))
            .curve(d3.curveMonotoneX);

        // Draw Area with animation
        const areaPath = g.append("path")
            .datum(data)
            .attr("fill", "url(#trend-area-gradient)")
            .attr("d", area);

        // Draw Line with glow
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 3)
            .attr("filter", "url(#glow)")
            .attr("d", line);

        // Data points
        g.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(new Date(d.date)))
            .attr("cy", d => y(d.count))
            .attr("r", 4)
            .attr("fill", theme.palette.background.paper)
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 6);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 4);
            });

        // X Axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x)
                .ticks(6)
                .tickFormat(d => d3.timeFormat("%b %d")(d as Date))
            )
            .call(g => g.select(".domain").attr("stroke", theme.palette.divider))
            .call(g => g.selectAll(".tick line").attr("stroke", theme.palette.divider))
            .call(g => g.selectAll(".tick text")
                .attr("fill", theme.palette.text.secondary)
                .attr("font-size", 11)
            );

        // Y Axis
        g.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").remove())
            .call(g => g.selectAll(".tick text")
                .attr("fill", theme.palette.text.secondary)
                .attr("font-size", 11)
            );

        // Y axis label
        g.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -40)
            .attr("x", -innerHeight / 2)
            .attr("text-anchor", "middle")
            .attr("fill", theme.palette.text.secondary)
            .attr("font-size", 11)
            .text("Applications");

    }, [data, theme]);

    // Calculate summary stats
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const avg = data.length > 0 ? Math.round(total / data.length) : 0;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                    boxShadow: 4
                }
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
                        <ShowChart />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Application Velocity
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Weekly application volume
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Total</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">{total}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Avg/Week</Typography>
                        <Typography variant="h6" fontWeight="bold">{avg}</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Chart */}
            <Box ref={containerRef} sx={{ p: 2, pt: 1 }}>
                <svg ref={svgRef}></svg>
            </Box>
        </Paper>
    );
};
