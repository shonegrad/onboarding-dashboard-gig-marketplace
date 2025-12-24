import { Box, Paper, Typography, useTheme } from '@mui/material';
import { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Applicant } from '../../types';

interface RegionalComparisonProps {
    applicants: Applicant[];
    onCountryClick?: (country: string) => void;
}

interface CountryStats {
    country: string;
    total: number;
    goLive: number;
    conversionRate: number;
    avgTimeToHire: number;
}

export const RegionalComparison = ({ applicants, onCountryClick }: RegionalComparisonProps) => {
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
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                Regional Performance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Conversion rates and hiring speed by country
            </Typography>

            {/* Header */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 80px 80px 80px',
                gap: 2,
                pb: 1,
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2
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
                    AVG DAYS
                </Typography>
            </Box>

            {/* Rows */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {countryStats.slice(0, 7).map((stat) => (
                    <Box
                        key={stat.country}
                        onClick={() => onCountryClick?.(stat.country)}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 80px 80px 80px',
                            gap: 2,
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: 1,
                            cursor: onCountryClick ? 'pointer' : 'default',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        {/* Country with mini bar */}
                        <Box>
                            <Typography variant="body2" fontWeight={500}>
                                {stat.country}
                            </Typography>
                            <Box sx={{
                                mt: 0.5,
                                height: 4,
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    width: `${(stat.total / maxTotal) * 100}%`,
                                    bgcolor: theme.palette.primary.main,
                                    borderRadius: 1
                                }} />
                            </Box>
                        </Box>

                        <Typography variant="body2" textAlign="right" fontWeight="bold">
                            {stat.total}
                        </Typography>

                        <Typography
                            variant="body2"
                            textAlign="right"
                            fontWeight="bold"
                            sx={{
                                color: stat.conversionRate >= 50
                                    ? 'success.main'
                                    : stat.conversionRate >= 30
                                        ? 'warning.main'
                                        : 'error.main'
                            }}
                        >
                            {stat.conversionRate.toFixed(1)}%
                        </Typography>

                        <Typography variant="body2" textAlign="right" color="text.secondary">
                            {stat.avgTimeToHire}d
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
