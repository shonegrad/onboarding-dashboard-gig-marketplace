import { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import { Share, Smartphone, Language, Email, Person, TrendingUp } from '@mui/icons-material';
import { Applicant } from '../../types';

interface ApplicationSourceProps {
    applicants: Applicant[];
}

interface SourceData {
    name: string;
    count: number;
    percentage: number;
    color: string;
    icon: React.ReactNode;
}

export const ApplicationSource = ({ applicants }: ApplicationSourceProps) => {
    const theme = useTheme();
    const svgRef = useRef<SVGSVGElement>(null);

    const sourceData = useMemo((): SourceData[] => {
        const sources: Record<string, number> = {
            'Mobile App': 0,
            'Website': 0,
            'Referral': 0,
            'Email': 0,
            'Direct': 0
        };

        applicants.forEach((_, i) => {
            const mod = i % 10;
            if (mod < 4) sources['Mobile App']++;
            else if (mod < 7) sources['Website']++;
            else if (mod < 8) sources['Referral']++;
            else if (mod < 9) sources['Email']++;
            else sources['Direct']++;
        });

        const total = applicants.length || 1;
        const colors = [
            theme.palette.primary.main,
            theme.palette.info.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.secondary.main
        ];
        const icons = [
            <Smartphone sx={{ fontSize: 14 }} />,
            <Language sx={{ fontSize: 14 }} />,
            <Person sx={{ fontSize: 14 }} />,
            <Email sx={{ fontSize: 14 }} />,
            <Share sx={{ fontSize: 14 }} />
        ];

        return Object.entries(sources)
            .map(([name, count], i) => ({
                name,
                count,
                percentage: Math.round((count / total) * 100),
                color: colors[i],
                icon: icons[i]
            }))
            .sort((a, b) => b.count - a.count);
    }, [applicants, theme]);

    useEffect(() => {
        if (!svgRef.current || sourceData.length === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const size = 80;
        const radius = size / 2;
        const innerRadius = radius * 0.6;

        const svg = d3.select(svgRef.current)
            .attr("width", size).attr("height", size)
            .append("g").attr("transform", `translate(${size / 2},${size / 2})`);

        const pie = d3.pie<SourceData>().value(d => d.count).sort(null);
        const arc = d3.arc<d3.PieArcDatum<SourceData>>()
            .innerRadius(innerRadius).outerRadius(radius).cornerRadius(2).padAngle(0.02);

        svg.selectAll(".arc").data(pie(sourceData)).enter()
            .append("path").attr("d", arc).attr("fill", d => d.data.color);
    }, [sourceData]);

    const topSource = sourceData[0];
    const total = sourceData.reduce((s, d) => s + d.count, 0);

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Share sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight="bold">Application Source</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{total} total</Typography>
            </Box>

            {/* Main content - donut + list */}
            <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                {/* Donut with center stat */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <svg ref={svgRef} />
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" lineHeight={1}>{topSource?.percentage}%</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 8 }}>Top</Typography>
                    </Box>
                </Box>

                {/* Source list with bars */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.75 }}>
                    {sourceData.map((source) => (
                        <Box key={source.name}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ color: source.color }}>{source.icon}</Box>
                                    <Typography variant="caption" sx={{ fontSize: 11 }}>{source.name}</Typography>
                                </Box>
                                <Typography variant="caption" fontWeight="bold" sx={{ fontSize: 11 }}>{source.count}</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={source.percentage}
                                sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: 'action.hover',
                                    '& .MuiLinearProgress-bar': { bgcolor: source.color, borderRadius: 2 }
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Top source highlight */}
            {topSource && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography variant="caption" color="text.secondary">Top: <strong>{topSource.name}</strong></Typography>
                    </Box>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: topSource.color }}>{topSource.percentage}%</Typography>
                </Box>
            )}
        </Paper>
    );
};
