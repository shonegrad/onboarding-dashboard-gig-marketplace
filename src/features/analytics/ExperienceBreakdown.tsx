import { useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { School } from '@mui/icons-material';
import { Applicant } from '../../types';

interface ExperienceBreakdownProps {
    applicants: Applicant[];
}

interface ExperienceCategory {
    name: string;
    count: number;
    percentage: number;
    color: string;
}

export const ExperienceBreakdown = ({ applicants }: ExperienceBreakdownProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const theme = useTheme();
    const [hovered, setHovered] = useState<{ name: string; count: number; percentage: number } | null>(null);

    const experienceData = useMemo((): ExperienceCategory[] => {
        const categories = {
            'No Experience': 0,
            '< 1 Year': 0,
            '1-2 Years': 0,
            '3-4 Years': 0,
            '5+ Years': 0
        };

        applicants.forEach(a => {
            const exp = a.experience?.toLowerCase() || '';
            if (exp.includes('no prior') || exp.includes('new to')) {
                categories['No Experience']++;
            } else if (exp.includes('6 months') || exp.includes('1 year') && !exp.includes('2')) {
                categories['< 1 Year']++;
            } else if (exp.includes('1 year') || exp.includes('2 year')) {
                categories['1-2 Years']++;
            } else if (exp.includes('3 year') || exp.includes('4 year')) {
                categories['3-4 Years']++;
            } else if (exp.includes('5 year') || exp.includes('years')) {
                categories['5+ Years']++;
            } else {
                categories['No Experience']++;
            }
        });

        const total = applicants.length || 1;
        const colors = [
            theme.palette.error.main,
            theme.palette.warning.main,
            theme.palette.info.main,
            theme.palette.success.light,
            theme.palette.success.main,
        ];

        return Object.entries(categories).map(([name, count], i) => ({
            name,
            count,
            percentage: Math.round((count / total) * 100),
            color: colors[i]
        }));
    }, [applicants, theme]);

    useEffect(() => {
        if (!svgRef.current) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const width = 140;
        const height = 140;
        const radius = Math.min(width, height) / 2;
        const innerRadius = radius * 0.58;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie<ExperienceCategory>()
            .value(d => d.count)
            .sort(null)
            .padAngle(0.03);

        const arc = d3.arc<d3.PieArcDatum<ExperienceCategory>>()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .cornerRadius(4);

        const hoverArc = d3.arc<d3.PieArcDatum<ExperienceCategory>>()
            .innerRadius(innerRadius)
            .outerRadius(radius + 6)
            .cornerRadius(4);

        const arcs = svg.selectAll(".arc")
            .data(pie(experienceData))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .style("cursor", "pointer")
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.15))")
            .attr("opacity", 0)
            .transition()
            .duration(600)
            .delay((_, i) => i * 100)
            .attrTween("d", function (d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return (t) => arc(interpolate(t)) || "";
            })
            .attr("opacity", 1);

        // Re-select for event handlers after animation
        svg.selectAll(".arc path")
            .on("mouseenter", function (event, d: any) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", hoverArc(d));
                setHovered({ name: d.data.name, count: d.data.count, percentage: d.data.percentage });
            })
            .on("mouseleave", function (event, d: any) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("d", arc(d));
                setHovered(null);
            });

        // Center circle background
        svg.append("circle")
            .attr("r", innerRadius - 4)
            .attr("fill", theme.palette.background.paper)
            .attr("opacity", 0)
            .transition()
            .delay(600)
            .duration(300)
            .attr("opacity", 1);

        // Center text
        const centerGroup = svg.append("g").attr("opacity", 0);

        centerGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.2em")
            .attr("fill", theme.palette.text.primary)
            .attr("font-size", 22)
            .attr("font-weight", "bold")
            .text(applicants.length);

        centerGroup.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.2em")
            .attr("fill", theme.palette.text.secondary)
            .attr("font-size", 11)
            .text("Total");

        centerGroup
            .transition()
            .delay(700)
            .duration(300)
            .attr("opacity", 1);

    }, [experienceData, theme, applicants.length]);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 6 }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'secondary.contrastText',
                    boxShadow: `0 4px 12px ${theme.palette.secondary.main}40`
                }}>
                    <School fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Experience Levels
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Hover for details
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Donut Chart */}
                <Box sx={{ flexShrink: 0, position: 'relative' }}>
                    <svg ref={svgRef}></svg>

                    {/* Hover overlay */}
                    <Fade in={!!hovered}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            pointerEvents: 'none'
                        }}>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                                {hovered?.percentage}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                {hovered?.name}
                            </Typography>
                        </Box>
                    </Fade>
                </Box>

                {/* Legend */}
                <Box sx={{ flex: 1 }}>
                    {experienceData.map((cat) => (
                        <Box
                            key={cat.name}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 0.75,
                                p: 0.5,
                                borderRadius: 1,
                                transition: 'background-color 0.2s',
                                bgcolor: hovered?.name === cat.name ? 'action.hover' : 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: cat.color,
                                    boxShadow: `0 2px 4px ${cat.color}40`
                                }} />
                                <Typography variant="caption" sx={{ fontSize: 11 }}>
                                    {cat.name}
                                </Typography>
                            </Box>
                            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: 11 }}>
                                {cat.percentage}%
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Paper>
    );
};
