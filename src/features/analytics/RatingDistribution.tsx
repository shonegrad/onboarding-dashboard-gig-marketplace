import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Rating, LinearProgress, Table, TableBody, TableCell, TableRow, Divider } from '@mui/material';
import { Star } from '@mui/icons-material';
import { Applicant } from '../../types';
import { ExpandableCard } from '../../components/ExpandableCard';

interface RatingDistributionProps {
    applicants: Applicant[];
}

export const RatingDistribution = ({ applicants }: RatingDistributionProps) => {
    const theme = useTheme();

    const ratingData = useMemo(() => {
        const distribution: Record<number, Applicant[]> = { 5: [], 4: [], 3: [], 2: [], 1: [] };
        let totalRating = 0;
        let ratedCount = 0;

        applicants.forEach(a => {
            if (a.rating) {
                const rounded = Math.round(a.rating);
                if (rounded >= 1 && rounded <= 5) {
                    distribution[rounded].push(a);
                }
                totalRating += a.rating;
                ratedCount++;
            }
        });

        const average = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '0.0';
        const maxCount = Math.max(...Object.values(distribution).map(arr => arr.length), 1);

        return {
            distribution: Object.entries(distribution)
                .map(([stars, apps]) => ({
                    stars: parseInt(stars),
                    count: apps.length,
                    percentage: Math.round((apps.length / maxCount) * 100),
                    applicants: apps
                }))
                .sort((a, b) => b.stars - a.stars),
            average: parseFloat(average),
            totalRated: ratedCount
        };
    }, [applicants]);

    const getStarColor = (stars: number) => {
        if (stars >= 4) return theme.palette.success.main;
        if (stars >= 3) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const summaryView = (
        <Box>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {ratingData.average}
                </Typography>
                <Rating value={ratingData.average} precision={0.1} readOnly size="small" sx={{ color: 'warning.main' }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {ratingData.distribution.map(({ stars, count, percentage }) => (
                    <Box key={stars} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: 32 }}>
                            <Typography variant="caption" fontWeight="bold" sx={{ mr: 0.5 }}>{stars}</Typography>
                            <Star sx={{ fontSize: 12, color: getStarColor(stars) }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: 'action.hover',
                                    '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: getStarColor(stars) }
                                }}
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ width: 24, textAlign: 'right' }}>
                            {count}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );

    const detailsView = (
        <Box>
            {ratingData.distribution.filter(d => d.count > 0).map(({ stars, applicants: apps }) => (
                <Box key={stars} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Rating value={stars} readOnly size="small" sx={{ color: getStarColor(stars) }} />
                        <Typography variant="caption" color="text.secondary">({apps.length})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {apps.slice(0, 4).map(a => (
                            <Box key={a.id} sx={{
                                px: 1,
                                py: 0.25,
                                bgcolor: 'action.selected',
                                borderRadius: 1,
                                fontSize: 10
                            }}>
                                {a.name.split(' ')[0]}
                            </Box>
                        ))}
                        {apps.length > 4 && (
                            <Box sx={{ px: 1, py: 0.25, bgcolor: 'action.hover', borderRadius: 1, fontSize: 10 }}>
                                +{apps.length - 4}
                            </Box>
                        )}
                    </Box>
                </Box>
            ))}
        </Box>
    );

    return (
        <ExpandableCard
            title="Rating Distribution"
            subtitle={`${ratingData.totalRated} rated`}
            icon={<Star />}
            iconBgColor="warning.main"
            summaryStats={[{ label: 'Avg', value: ratingData.average.toString() }]}
            summary={summaryView}
            details={detailsView}
        />
    );
};
