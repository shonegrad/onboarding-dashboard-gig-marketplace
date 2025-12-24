import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

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

        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = containerRef.current.clientWidth;
        const height = 300;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
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
            .attr("id", "area-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", theme.palette.primary.main)
            .attr("stop-opacity", 0.6);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", theme.palette.primary.main)
            .attr("stop-opacity", 0.05);

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

        // Draw Area
        svg.append("path")
            .datum(data)
            .attr("fill", "url(#area-gradient)")
            .attr("d", area);

        // Draw Line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 2)
            .attr("d", line);

        // Axes
        svg.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d => d3.timeFormat("%b %d")(d as Date)))
            .attr("color", theme.palette.text.secondary);

        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .attr("color", theme.palette.text.secondary)
            .call(g => g.select(".domain").remove()) // Hide y-axis line
            .call(g => g.selectAll(".tick line") // Add grid lines
                .attr("x2", innerWidth)
                .attr("stroke-opacity", 0.1)
                .attr("stroke", theme.palette.text.primary)
            );

        // Tooltip logic could be added here overlaying a transparent rect

    }, [data, theme, text => text]); // simple dependency check

    return (
        <Box
            ref={containerRef}
            sx={{
                width: '100%',
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                p: 2,
                boxShadow: 1
            }}
        >
            <Typography variant="h6" gutterBottom>
                Application Velocity
            </Typography>
            <svg ref={svgRef}></svg>
        </Box>
    );
};
