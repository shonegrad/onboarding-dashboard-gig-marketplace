import { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper } from '@mui/material';
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

    const experienceData = useMemo((): ExperienceCategory[] => {
        // Categorize experience levels
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
            theme.palette.error.light,
            theme.palette.warning.light,
            theme.palette.info.light,
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

        const width = 120;
        const height = 120;
        const radius = Math.min(width, height) / 2;
        const innerRadius = radius * 0.6;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie<ExperienceCategory>()
            .value(d => d.count)
            .sort(null);

        const arc = d3.arc<d3.PieArcDatum<ExperienceCategory>>()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .cornerRadius(3)
            .padAngle(0.02);

        const arcs = svg.selectAll(".arc")
            .data(pie(experienceData))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .style("cursor", "pointer")
            .on("mouseover", function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("transform", function (d) {
                        const [x, y] = arc.centroid(d as any);
                        return `translate(${x * 0.05},${y * 0.05})`;
                    });
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("transform", "translate(0,0)");
            });

        // Center text
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.3em")
            .attr("fill", theme.palette.text.primary)
            .attr("font-size", 18)
            .attr("font-weight", "bold")
            .text(applicants.length);

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1em")
            .attr("fill", theme.palette.text.secondary)
            .attr("font-size", 10)
            .text("Total");

    }, [experienceData, theme, applicants.length]);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                height: '100%',
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: 4 }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'secondary.contrastText'
                }}>
                    <School fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Experience Levels
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Applicant background
                    </Typography>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {/* Donut Chart */}
                <Box sx={{ flexShrink: 0 }}>
                    <svg ref={svgRef}></svg>
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
                                mb: 0.75
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    bgcolor: cat.color
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
