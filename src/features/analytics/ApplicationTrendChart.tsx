import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Fade } from '@mui/material';
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
    const tooltipRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

    useEffect(() => {
        if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

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
            .domain([0, (d3.max(data, d => d.count) || 10) * 1.1])
            .nice()
            .range([innerHeight, 0]);

        // Defs for gradients and filters
        const defs = svg.append("defs");

        // Area gradient
        const areaGradient = defs.append("linearGradient")
            .attr("id", "trend-area-gradient-v2")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");
        areaGradient.append("stop").attr("offset", "0%")
            .attr("stop-color", theme.palette.primary.main).attr("stop-opacity", 0.5);
        areaGradient.append("stop").attr("offset", "100%")
            .attr("stop-color", theme.palette.primary.main).attr("stop-opacity", 0.02);

        // Line gradient
        const lineGradient = defs.append("linearGradient")
            .attr("id", "trend-line-gradient")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");
        lineGradient.append("stop").attr("offset", "0%")
            .attr("stop-color", theme.palette.primary.light);
        lineGradient.append("stop").attr("offset", "50%")
            .attr("stop-color", theme.palette.primary.main);
        lineGradient.append("stop").attr("offset", "100%")
            .attr("stop-color", theme.palette.primary.dark);

        // Glow filter
        const filter = defs.append("filter").attr("id", "glow-v2");
        filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "blur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Grid lines
        g.append("g")
            .attr("class", "grid")
            .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ""))
            .call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line")
                .attr("stroke", theme.palette.divider)
                .attr("stroke-dasharray", "2,4")
                .attr("opacity", 0.6)
            );

        // Area Generator
        const area = d3.area<TrendData>()
            .x(d => x(new Date(d.date)))
            .y0(innerHeight)
            .y1(d => y(d.count))
            .curve(d3.curveCatmullRom.alpha(0.5));

        // Line Generator
        const line = d3.line<TrendData>()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.count))
            .curve(d3.curveCatmullRom.alpha(0.5));

        // Draw Area with animation
        const areaPath = g.append("path")
            .datum(data)
            .attr("fill", "url(#trend-area-gradient-v2)")
            .attr("d", area)
            .attr("opacity", 0)
            .transition()
            .duration(800)
            .attr("opacity", 1);

        // Draw Line with gradient and glow
        const linePath = g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "url(#trend-line-gradient)")
            .attr("stroke-width", 3.5)
            .attr("stroke-linecap", "round")
            .attr("filter", "url(#glow-v2)")
            .attr("d", line);

        // Animate line drawing
        const pathLength = linePath.node()?.getTotalLength() || 0;
        linePath
            .attr("stroke-dasharray", pathLength)
            .attr("stroke-dashoffset", pathLength)
            .transition()
            .duration(1200)
            .ease(d3.easeCubicOut)
            .attr("stroke-dashoffset", 0);

        // Interactive overlay for tooltip
        const bisect = d3.bisector<TrendData, Date>(d => new Date(d.date)).left;

        const overlay = g.append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "transparent")
            .style("cursor", "crosshair");

        // Focus elements
        const focusLine = g.append("line")
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4,4")
            .attr("opacity", 0);

        const focusCircle = g.append("circle")
            .attr("r", 8)
            .attr("fill", theme.palette.background.paper)
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 3)
            .attr("opacity", 0)
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");

        overlay
            .on("mousemove", function (event) {
                const [mouseX] = d3.pointer(event);
                const x0 = x.invert(mouseX);
                const i = bisect(data, x0, 1);
                const d0 = data[i - 1];
                const d1 = data[i];
                if (!d0 || !d1) return;
                const d = x0.getTime() - new Date(d0.date).getTime() > new Date(d1.date).getTime() - x0.getTime() ? d1 : d0;

                const xPos = x(new Date(d.date));
                const yPos = y(d.count);

                focusLine
                    .attr("x1", xPos).attr("x2", xPos)
                    .attr("y1", 0).attr("y2", innerHeight)
                    .attr("opacity", 0.5);

                focusCircle
                    .attr("cx", xPos)
                    .attr("cy", yPos)
                    .attr("opacity", 1);

                setTooltip({
                    x: xPos + margin.left,
                    y: yPos + margin.top - 10,
                    date: d3.timeFormat("%b %d, %Y")(new Date(d.date)),
                    count: d.count
                });
            })
            .on("mouseleave", function () {
                focusLine.attr("opacity", 0);
                focusCircle.attr("opacity", 0);
                setTooltip(null);
            });

        // Data points with animation
        g.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(new Date(d.date)))
            .attr("cy", d => y(d.count))
            .attr("r", 0)
            .attr("fill", theme.palette.background.paper)
            .attr("stroke", theme.palette.primary.main)
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .transition()
            .delay((_, i) => 1200 + i * 50)
            .duration(300)
            .attr("r", 5);

        // X Axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(6).tickFormat(d => d3.timeFormat("%b %d")(d as Date)))
            .call(g => g.select(".domain").attr("stroke", theme.palette.divider))
            .call(g => g.selectAll(".tick line").attr("stroke", theme.palette.divider))
            .call(g => g.selectAll(".tick text")
                .attr("fill", theme.palette.text.secondary)
                .attr("font-size", 11)
                .attr("font-weight", 500)
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

    }, [data, theme]);

    const total = data.reduce((sum, d) => sum + d.count, 0);
    const avg = data.length > 0 ? Math.round(total / data.length) : 0;
    const max = Math.max(...data.map(d => d.count));
    const trend = data.length > 1 ? data[data.length - 1].count - data[0].count : 0;

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
                        <ShowChart />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Application Velocity
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Hover to explore data points
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Total</Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">{total}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Peak</Typography>
                        <Typography variant="h6" fontWeight="bold">{max}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Trend</Typography>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={trend >= 0 ? 'success.main' : 'error.main'}
                        >
                            {trend >= 0 ? '+' : ''}{trend}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Chart */}
            <Box ref={containerRef} sx={{ p: 2, pt: 1, position: 'relative' }}>
                <svg ref={svgRef}></svg>

                {/* Tooltip */}
                <Fade in={!!tooltip}>
                    <Box
                        sx={{
                            position: 'absolute',
                            left: tooltip?.x || 0,
                            top: tooltip?.y || 0,
                            transform: 'translate(-50%, -100%)',
                            bgcolor: 'background.paper',
                            boxShadow: 4,
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            pointerEvents: 'none',
                            border: 1,
                            borderColor: 'divider',
                            zIndex: 10
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" display="block">
                            {tooltip?.date}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {tooltip?.count} applications
                        </Typography>
                    </Box>
                </Fade>
            </Box>
        </Paper>
    );
};
