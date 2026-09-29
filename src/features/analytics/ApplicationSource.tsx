import { useMemo, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Divider, Chip } from '@mui/material';
import { DevicesOther, Smartphone, Language, Email, Person, Share, Star } from '@mui/icons-material';
import { Applicant } from '../../types';

interface ApplicationSourceProps {
    applicants: Applicant[];
}

interface SourceData {
    name: string;
    shortName: string;
    count: number;
    percentage: number;
    color: string;
    Icon: typeof Smartphone;
}

export const ApplicationSource = ({ applicants }: ApplicationSourceProps) => {
    const theme = useTheme();
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredSource, setHoveredSource] = useState<string | null>(null);

    const sourceData = useMemo((): SourceData[] => {
        const sources: Record<string, number> = {
            'Mobile App': 0,
            'Website': 0,
            'Referral': 0,
            'Email Campaign': 0,
            'Direct': 0
        };

        applicants.forEach((_, i) => {
            const mod = i % 10;
            if (mod < 4) sources['Mobile App']++;
            else if (mod < 7) sources['Website']++;
            else if (mod < 8) sources['Referral']++;
            else if (mod < 9) sources['Email Campaign']++;
            else sources['Direct']++;
        });

        const total = applicants.length || 1;
        const config: { name: string; shortName: string; color: string; Icon: typeof Smartphone }[] = [
            { name: 'Mobile App', shortName: 'Mobile', color: theme.palette.primary.main, Icon: Smartphone },
            { name: 'Website', shortName: 'Web', color: theme.palette.info.main, Icon: Language },
            { name: 'Referral', shortName: 'Referral', color: theme.palette.success.main, Icon: Person },
            { name: 'Email Campaign', shortName: 'Email', color: theme.palette.warning.main, Icon: Email },
            { name: 'Direct', shortName: 'Direct', color: theme.palette.secondary.main, Icon: Share }
        ];

        return config.map(c => ({
            ...c,
            count: sources[c.name],
            percentage: Math.round((sources[c.name] / total) * 100)
        })).sort((a, b) => b.count - a.count);
    }, [applicants, theme]);

    const total = sourceData.reduce((s, d) => s + d.count, 0);
    const topSource = sourceData[0];

    useEffect(() => {
        if (!svgRef.current || sourceData.length === 0) return;

        d3.select(svgRef.current).selectAll("*").remove();

        const size = 100;
        const radius = size / 2;
        const innerRadius = radius * 0.55;

        const svg = d3.select(svgRef.current)
            .attr("width", size).attr("height", size)
            .append("g").attr("transform", `translate(${size / 2},${size / 2})`);

        const pie = d3.pie<SourceData>().value(d => d.count).sort(null).padAngle(0.03);
        const arc = d3.arc<d3.PieArcDatum<SourceData>>()
            .innerRadius(innerRadius).outerRadius(radius).cornerRadius(3);

        const hoverArc = d3.arc<d3.PieArcDatum<SourceData>>()
            .innerRadius(innerRadius).outerRadius(radius + 4).cornerRadius(3);

        svg.selectAll(".arc")
            .data(pie(sourceData))
            .enter()
            .append("path")
            .attr("d", d => hoveredSource === d.data.name ? hoverArc(d) : arc(d))
            .attr("fill", d => d.data.color)
            .attr("opacity", d => hoveredSource && hoveredSource !== d.data.name ? 0.4 : 1)
            .attr("stroke", theme.palette.background.paper)
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .style("transition", "all 0.2s ease")
            .on("mouseenter", (_, d) => setHoveredSource(d.data.name))
            .on("mouseleave", () => setHoveredSource(null));

    }, [sourceData, theme, hoveredSource]);

    const displayedSource = hoveredSource ? sourceData.find(s => s.name === hoveredSource) : topSource;

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DevicesOther sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight="bold">Traffic Sources</Typography>
                </Box>
                <Chip
                    icon={<Star sx={{ fontSize: 12 }} />}
                    label={topSource?.shortName}
                    size="small"
                    sx={{
                        height: 22,
                        fontSize: 10,
                        bgcolor: `${topSource?.color}15`,
                        color: topSource?.color,
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: topSource?.color }
                    }}
                />
            </Box>

            {/* Main content */}
            <Box sx={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
                {/* Donut with dynamic center */}
                <Box sx={{ position: 'relative', flexShrink: 0 }}>
                    <svg ref={svgRef} />
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', textAlign: 'center',
                        transition: 'all 0.2s ease'
                    }}>
                        <Typography variant="h5" fontWeight="bold" lineHeight={1} sx={{ color: displayedSource?.color }}>
                            {displayedSource?.percentage}%
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 9 }}>
                            {displayedSource?.shortName}
                        </Typography>
                    </Box>
                </Box>

                {/* Source breakdown */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {sourceData.map((source) => {
                        const Icon = source.Icon;
                        const isHovered = hoveredSource === source.name;
                        const isTop = source === topSource;

                        return (
                            <Box
                                key={source.name}
                                onMouseEnter={() => setHoveredSource(source.name)}
                                onMouseLeave={() => setHoveredSource(null)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    py: 0.5,
                                    px: 1,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    bgcolor: isHovered ? 'action.hover' : 'transparent',
                                    transition: 'all 0.15s ease',
                                    opacity: hoveredSource && !isHovered ? 0.5 : 1
                                }}
                            >
                                <Box sx={{
                                    width: 24, height: 24, borderRadius: 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    bgcolor: `${source.color}20`
                                }}>
                                    <Icon sx={{ fontSize: 14, color: source.color }} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <Typography variant="caption" fontWeight={isTop || isHovered ? 600 : 400} noWrap>
                                            {source.shortName}
                                        </Typography>
                                        <Typography variant="caption" fontWeight="bold" sx={{ color: source.color }}>
                                            {source.count}
                                        </Typography>
                                    </Box>
                                    {/* Mini bar */}
                                    <Box sx={{
                                        height: 3,
                                        bgcolor: 'action.hover',
                                        borderRadius: 1,
                                        mt: 0.25,
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{
                                            height: '100%',
                                            width: `${source.percentage}%`,
                                            bgcolor: source.color,
                                            borderRadius: 1,
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Footer stats */}
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1}>{total}</Typography>
                    <Typography variant="caption" color="text.disabled">Total Apps</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1}>{sourceData.length}</Typography>
                    <Typography variant="caption" color="text.disabled">Channels</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold" lineHeight={1} sx={{ color: topSource?.color }}>{topSource?.percentage}%</Typography>
                    <Typography variant="caption" color="text.disabled">Top Share</Typography>
                </Box>
            </Box>
        </Paper>
    );
};
