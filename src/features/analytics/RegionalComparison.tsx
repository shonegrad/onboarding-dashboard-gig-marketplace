import { Box, Paper, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';
import * as d3 from 'd3';
import { Applicant } from '../../types';

interface RegionalComparisonProps {
    applicants: Applicant[];
    onCountryClick?: (country: string) => void;
    selectedCountry?: string | null;
}

interface CountryStats {
    country: string;
    total: number;
    goLive: number;
    conversionRate: number;
    avgTimeToHire: number;
}

export const RegionalComparison = ({ applicants, onCountryClick, selectedCountry }: RegionalComparisonProps) => {
    const theme = useTheme();

    const countryStats = useMemo((): CountryStats[] => {
        // Group by country
        const byCountry = d3.group(applicants, d => d.location.country);

        return Array.from(byCountry, ([country, apps]) => {
            const goLiveApps = apps.filter(a => a.status === 'Go Live');
            const declinedCount = apps.filter(a => a.status === 'Declined').length;
            const conversionRate = (goLiveApps.length / (apps.length - declinedCount)) * 100;

            // Avg time to hire for go live applicants
            const avgTimeToHire = goLiveApps.length > 0
                ? goLiveApps.reduce((sum, a) => {
                    const applied = new Date(a.appliedDate);
                    const completed = new Date(a.lastStatusChangeDate);
                    return sum + (completed.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24);
                }, 0) / goLiveApps.length
                : 0;

            return {
                country,
                total: apps.length,
                goLive: goLiveApps.length,
                conversionRate,
                avgTimeToHire: Math.round(avgTimeToHire)
            };
        }).sort((a, b) => b.total - a.total);
    }, [applicants]);

    const maxTotal = Math.max(...countryStats.map(s => s.total), 1);

    return (
        <Paper sx={{ p: 2.5, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Regional Performance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Conversion rates and hiring speed by country
            </Typography>

            {/* Header */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 60px 60px 60px',
                gap: 1.5,
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider',
                mb: 1.5
            }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    COUNTRY
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" textAlign="right">
                    TOTAL
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" textAlign="right">
                    CONV.%
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" textAlign="right">
                    DAYS
                </Typography>
            </Box>

            {/* Rows - reduced gap, content hugs */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flex: 1, overflow: 'auto' }}>
                {countryStats.slice(0, 8).map((stat) => {
                    const isSelected = selectedCountry === stat.country;
                    const hasSelection = !!selectedCountry;
                    const opacity = hasSelection ? (isSelected ? 1 : 0.3) : 1;

                    return (
                        <Box
                            key={stat.country}
                            onClick={() => onCountryClick?.(stat.country)}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1.5fr 60px 60px 60px',
                                gap: 1.5,
                                alignItems: 'center',
                                py: 0.75,
                                px: 1,
                                borderRadius: 1,
                                cursor: onCountryClick ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                opacity,
                                bgcolor: isSelected ? 'action.selected' : 'transparent',
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                    opacity: 1
                                }
                            }}
                        >
                            {/* Country with mini bar */}
                            <Box>
                                <Typography variant="body2" fontWeight={isSelected ? 600 : 500} fontSize={13}>
                                    {stat.country}
                                </Typography>
                                <Box sx={{
                                    mt: 0.25,
                                    height: 3,
                                    bgcolor: 'action.hover',
                                    borderRadius: 1,
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        height: '100%',
                                        width: `${(stat.total / maxTotal) * 100}%`,
                                        bgcolor: isSelected ? theme.palette.primary.main : theme.palette.primary.light,
                                        borderRadius: 1
                                    }} />
                                </Box>
                            </Box>

                            <Typography variant="body2" textAlign="right" fontWeight="bold" fontSize={13}>
                                {stat.total}
                            </Typography>

                            <Typography
                                variant="body2"
                                textAlign="right"
                                fontWeight="bold"
                                fontSize={13}
                                sx={{
                                    color: stat.conversionRate >= 50
                                        ? 'success.main'
                                        : stat.conversionRate >= 30
                                            ? 'warning.main'
                                            : 'error.main'
                                }}
                            >
                                {stat.conversionRate.toFixed(0)}%
                            </Typography>

                            <Typography variant="body2" textAlign="right" color="text.secondary" fontSize={13}>
                                {stat.avgTimeToHire}d
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
};
