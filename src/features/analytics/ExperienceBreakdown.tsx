import { useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Fade, Table, TableBody, TableCell, TableHead, TableRow, Divider, Chip } from '@mui/material';
import { School } from '@mui/icons-material';
import { Applicant } from '../../types';
import { ExpandableCard } from '../../components/ExpandableCard';

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
    const [hovered, setHovered] = useState<string | null>(null);

    const experienceData = useMemo(() => {
        const categories: Record<string, { count: number; applicants: Applicant[] }> = {
            'No Experience': { count: 0, applicants: [] },
            '< 1 Year': { count: 0, applicants: [] },
            '1-2 Years': { count: 0, applicants: [] },
            '3-4 Years': { count: 0, applicants: [] },
            '5+ Years': { count: 0, applicants: [] }
        };

        applicants.forEach(a => {
            const exp = a.experience?.toLowerCase() || '';
            let category = 'No Experience';
            if (exp.includes('5 year') || (exp.includes('years') && !exp.includes('1') && !exp.includes('2'))) {
                category = '5+ Years';
            } else if (exp.includes('3 year') || exp.includes('4 year')) {
                category = '3-4 Years';
            } else if (exp.includes('1 year') || exp.includes('2 year')) {
                category = '1-2 Years';
            } else if (exp.includes('6 months') || exp.includes('month')) {
                category = '< 1 Year';
            }
            categories[category].count++;
            categories[category].applicants.push(a);
        });

        const total = applicants.length || 1;
        const colors = [
            theme.palette.error.main,
            theme.palette.warning.main,
            theme.palette.info.main,
            theme.palette.success.light,
            theme.palette.success.main,
        ];

        return Object.entries(categories).map(([name, data], i): ExperienceCategory & { applicants: Applicant[] } => ({
            name,
            count: data.count,
            percentage: Math.round((data.count / total) * 100),
            color: colors[i],
            applicants: data.applicants
        }));
    }, [applicants, theme]);

    useEffect(() => {
        if (!svgRef.current) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const width = 120;
        const height = 120;
        const radius = Math.min(width, height) / 2;
        const innerRadius = radius * 0.55;

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
            .cornerRadius(3);

        svg.selectAll(".arc")
            .data(pie(experienceData))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .attr("opacity", d => hovered === d.data.name ? 1 : hovered ? 0.4 : 1)
            .style("transition", "opacity 0.2s");

        // Center text
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "-0.1em")
            .attr("fill", theme.palette.text.primary)
            .attr("font-size", 18)
            .attr("font-weight", "bold")
            .text(applicants.length);

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "1.3em")
            .attr("fill", theme.palette.text.secondary)
            .attr("font-size", 10)
            .text("Total");

    }, [experienceData, theme, applicants.length, hovered]);

    const summaryView = (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flexShrink: 0 }}>
                <svg ref={svgRef}></svg>
            </Box>
            <Box sx={{ flex: 1 }}>
                {experienceData.map((cat) => (
                    <Box
                        key={cat.name}
                        onMouseEnter={() => setHovered(cat.name)}
                        onMouseLeave={() => setHovered(null)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                            p: 0.5,
                            borderRadius: 1,
                            bgcolor: hovered === cat.name ? 'action.hover' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cat.color }} />
                            <Typography variant="caption" sx={{ fontSize: 10 }}>{cat.name}</Typography>
                        </Box>
                        <Typography variant="caption" fontWeight="bold" sx={{ fontSize: 10 }}>{cat.percentage}%</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );

    const detailsView = (
        <Box>
            {experienceData.map((cat) => (
                <Box key={cat.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: cat.color }} />
                        <Typography variant="body2" fontWeight="bold">{cat.name}</Typography>
                        <Chip label={cat.count} size="small" sx={{ height: 18, fontSize: 10 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {cat.applicants.slice(0, 5).map(a => (
                            <Chip
                                key={a.id}
                                label={a.name.split(' ')[0]}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: 9 }}
                            />
                        ))}
                        {cat.applicants.length > 5 && (
                            <Chip
                                label={`+${cat.applicants.length - 5}`}
                                size="small"
                                sx={{ height: 20, fontSize: 9, bgcolor: 'action.selected' }}
                            />
                        )}
                    </Box>
                </Box>
            ))}
        </Box>
    );

    const topCategory = experienceData.reduce((a, b) => a.count > b.count ? a : b);

    return (
        <ExpandableCard
            title="Experience Levels"
            subtitle="Distribution breakdown"
            icon={<School />}
            iconBgColor="secondary.main"
            summaryStats={[{ label: 'Top', value: topCategory.name }]}
            summary={summaryView}
            details={detailsView}
        />
    );
};
