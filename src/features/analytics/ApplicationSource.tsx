import { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { Share, Smartphone, Language, Email, Person } from '@mui/icons-material';
import { Applicant } from '../../types';

interface ApplicationSourceProps {
    applicants: Applicant[];
}

interface SourceData {
    name: string;
    count: number;
    percentage: number;
    icon: React.ReactNode;
    color: string;
}

export const ApplicationSource = ({ applicants }: ApplicationSourceProps) => {
    const theme = useTheme();
    const svgRef = useRef<SVGSVGElement>(null);

    const sourceData = useMemo((): SourceData[] => {
        // Simulate source data based on applicant characteristics
        const sources: Record<string, number> = {
            'Mobile App': 0,
            'Website': 0,
            'Referral': 0,
            'Email Campaign': 0,
            'Direct': 0
        };

        applicants.forEach((_, i) => {
            // Distribute based on pattern to simulate real data
            const mod = i % 10;
            if (mod < 4) sources['Mobile App']++;
            else if (mod < 7) sources['Website']++;
            else if (mod < 8) sources['Referral']++;
            else if (mod < 9) sources['Email Campaign']++;
            else sources['Direct']++;
        });

        const total = applicants.length || 1;
        const icons = [
            <Smartphone fontSize="small" />,
            <Language fontSize="small" />,
            <Person fontSize="small" />,
            <Email fontSize="small" />,
            <Share fontSize="small" />
        ];
        const colors = [
            theme.palette.primary.main,
            theme.palette.info.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.secondary.main
        ];

        return Object.entries(sources)
            .map(([name, count], i) => ({
                name,
                count,
                percentage: Math.round((count / total) * 100),
                icon: icons[i],
                color: colors[i]
            }))
            .sort((a, b) => b.count - a.count);
    }, [applicants, theme]);

    useEffect(() => {
        if (!svgRef.current || sourceData.length === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const width = 100;
        const height = 100;
        const radius = Math.min(width, height) / 2;
        const innerRadius = radius * 0.55;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie<SourceData>()
            .value(d => d.count)
            .sort(null);

        const arc = d3.arc<d3.PieArcDatum<SourceData>>()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .cornerRadius(2)
            .padAngle(0.02);

        svg.selectAll(".arc")
            .data(pie(sourceData))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.color)
            .style("cursor", "pointer")
            .on("mouseover", function () {
                d3.select(this).attr("opacity", 0.8);
            })
            .on("mouseout", function () {
                d3.select(this).attr("opacity", 1);
            });

    }, [sourceData]);

    const topSource = sourceData[0];

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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.contrastText'
                }}>
                    <Share fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Application Source
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Traffic channels
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flexShrink: 0 }}>
                    <svg ref={svgRef}></svg>
                </Box>
                <Box sx={{ flex: 1 }}>
                    {sourceData.slice(0, 4).map((source) => (
                        <Box
                            key={source.name}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 0.75,
                                py: 0.5
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: source.color
                                }} />
                                <Typography variant="caption" sx={{ fontSize: 11 }}>
                                    {source.name}
                                </Typography>
                            </Box>
                            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: 11 }}>
                                {source.percentage}%
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {topSource && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">Top Source</Typography>
                    <Chip
                        icon={topSource.icon as any}
                        label={`${topSource.name} (${topSource.percentage}%)`}
                        size="small"
                        sx={{ mt: 0.5, bgcolor: `${topSource.color}20`, color: topSource.color }}
                    />
                </Box>
            )}
        </Paper>
    );
};
