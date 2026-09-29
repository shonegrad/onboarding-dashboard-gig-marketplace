import { useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Chip, Fade, Table, TableBody, TableCell, TableHead, TableRow, Divider } from '@mui/material';
import { AccessTime, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Applicant } from '../../types';
import { ExpandableCard } from '../../components/ExpandableCard';

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
            const days = Math.round((completed.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));
            return { ...a, daysToHire: days };
        }).filter(d => d.daysToHire >= 0 && d.daysToHire <= 60);

        if (durations.length === 0) return { histogram: [], stats: { median: 0, p25: 0, p75: 0, avg: 0, total: 0 }, details: [] };

        const sorted = [...durations].sort((a, b) => a.daysToHire - b.daysToHire);
        const median = sorted[Math.floor(sorted.length / 2)].daysToHire;
        const p25 = sorted[Math.floor(sorted.length * 0.25)].daysToHire;
        const p75 = sorted[Math.floor(sorted.length * 0.75)].daysToHire;
        const avg = Math.round(durations.reduce((a, b) => a + b.daysToHire, 0) / durations.length);

        const bins = d3.bin().domain([0, 45]).thresholds(9)(durations.map(d => d.daysToHire));

        return {
            histogram: bins.map(bin => ({
                x0: bin.x0 || 0,
                x1: bin.x1 || 0,
                count: bin.length,
                label: `${bin.x0}-${bin.x1} days`
            })),
            stats: { median, p25, p75, avg, total: durations.length },
            details: sorted.slice(0, 10) // Top 10 for detail view
        };
    }, [applicants]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current || hireData.histogram.length === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 15, right: 20, bottom: 35, left: 35 };
        const width = containerRef.current.clientWidth;
        const height = 160;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const defs = svg.append("defs");

        const barGradient = defs.append("linearGradient")
            .attr("id", "tth-bar-gradient")
            .attr("x1", "0%").attr("y1", "100%")
            .attr("x2", "0%").attr("y2", "0%");
        barGradient.append("stop").attr("offset", "0%")
            .attr("stop-color", theme.palette.info.dark);
        barGradient.append("stop").attr("offset", "100%")
            .attr("stop-color", theme.palette.info.light);

        const x = d3.scaleLinear().domain([0, 45]).range([0, innerWidth]);
        const y = d3.scaleLinear()
            .domain([0, (d3.max(hireData.histogram, d => d.count) || 10) * 1.1])
            .nice()
            .range([innerHeight, 0]);

        // Bars
        g.selectAll(".bar")
            .data(hireData.histogram)
            .enter()
            .append("rect")
            .attr("x", d => x(d.x0) + 1)
            .attr("y", innerHeight)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
            .attr("height", 0)
            .attr("fill", "url(#tth-bar-gradient)")
            .attr("rx", 3)
            .style("cursor", "pointer")
            .on("mouseenter", function (event, d) {
                d3.select(this).attr("opacity", 0.8);
                const rect = (this as SVGRectElement).getBoundingClientRect();
                const containerRect = containerRef.current!.getBoundingClientRect();
                setHoveredBar({
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top - 5,
                    range: d.label,
                    count: d.count
                });
            })
            .on("mouseleave", function () {
                d3.select(this).attr("opacity", 1);
                setHoveredBar(null);
            })
            .transition()
            .duration(500)
            .delay((_, i) => i * 50)
            .ease(d3.easeBackOut)
            .attr("y", d => y(d.count))
            .attr("height", d => innerHeight - y(d.count));

        // Median line
        const medianX = x(hireData.stats.median);
        g.append("line")
            .attr("x1", medianX).attr("x2", medianX)
            .attr("y1", 0).attr("y2", innerHeight)
            .attr("stroke", theme.palette.warning.main)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,3");

        // X Axis
        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}d`))
            .call(g => g.select(".domain").attr("stroke", theme.palette.divider))
            .call(g => g.selectAll(".tick text").attr("fill", theme.palette.text.secondary).attr("font-size", 9));

    }, [hireData, theme]);

    const summaryChart = (
        <Box ref={containerRef} sx={{ position: 'relative' }}>
            <svg ref={svgRef}></svg>
            <Fade in={!!hoveredBar}>
                <Box sx={{
                    position: 'absolute',
                    left: hoveredBar?.x || 0,
                    top: hoveredBar?.y || 0,
                    transform: 'translate(-50%, -100%)',
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    pointerEvents: 'none',
                    border: 1,
                    borderColor: 'primary.main',
                    zIndex: 10
                }}>
                    <Typography variant="caption" fontWeight="bold">{hoveredBar?.count} hires</Typography>
                </Box>
            </Fade>
        </Box>
    );

    const detailsView = (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">25th %ile</Typography>
                    <Typography variant="h6" fontWeight="bold">{hireData.stats.p25}d</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Median</Typography>
                    <Typography variant="h6" fontWeight="bold" color="warning.main">{hireData.stats.median}d</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">75th %ile</Typography>
                    <Typography variant="h6" fontWeight="bold">{hireData.stats.p75}d</Typography>
                </Box>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Recent Hires (Fastest)
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ py: 0.5, fontSize: 11 }}>Name</TableCell>
                        <TableCell sx={{ py: 0.5, fontSize: 11 }}>Role</TableCell>
                        <TableCell align="right" sx={{ py: 0.5, fontSize: 11 }}>Days</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {hireData.details.map((hire) => (
                        <TableRow key={hire.id}>
                            <TableCell sx={{ py: 0.5, fontSize: 11 }}>{hire.name}</TableCell>
                            <TableCell sx={{ py: 0.5, fontSize: 11, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {hire.jobTitle}
                            </TableCell>
                            <TableCell align="right" sx={{ py: 0.5, fontSize: 11, fontWeight: 'bold' }}>
                                {hire.daysToHire}d
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );

    return (
        <ExpandableCard
            title="Time to Hire"
            subtitle={`${hireData.stats.total} hires analyzed`}
            icon={<AccessTime />}
            iconBgColor="info.main"
            summaryStats={[
                { label: 'Median', value: `${hireData.stats.median}d` },
                { label: 'Avg', value: `${hireData.stats.avg}d` }
            ]}
            summary={summaryChart}
            details={detailsView}
        />
    );
};
