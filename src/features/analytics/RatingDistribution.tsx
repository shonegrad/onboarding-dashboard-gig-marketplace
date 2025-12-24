import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Rating, LinearProgress } from '@mui/material';
import { Star } from '@mui/icons-material';
import { Applicant } from '../../types';

interface RatingDistributionProps {
    applicants: Applicant[];
}

export const RatingDistribution = ({ applicants }: RatingDistributionProps) => {
    const theme = useTheme();

    const ratingData = useMemo(() => {
        // Count ratings by star level
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRating = 0;
        let ratedCount = 0;

        applicants.forEach(a => {
            if (a.rating) {
                const rounded = Math.round(a.rating);
                if (rounded >= 1 && rounded <= 5) {
                    distribution[rounded as keyof typeof distribution]++;
                }
                totalRating += a.rating;
                ratedCount++;
            }
        });

        const average = ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : '0.0';
        const maxCount = Math.max(...Object.values(distribution), 1);

        return {
            distribution: Object.entries(distribution)
                .map(([stars, count]) => ({
                    stars: parseInt(stars),
                    count,
                    percentage: Math.round((count / maxCount) * 100)
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'warning.contrastText'
                }}>
                    <Star fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Rating Distribution
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {ratingData.totalRated} rated applicants
                    </Typography>
                </Box>
            </Box>

            {/* Average Rating */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {ratingData.average}
                </Typography>
                <Rating
                    value={ratingData.average}
                    precision={0.1}
                    readOnly
                    size="small"
                    sx={{ color: 'warning.main' }}
                />
                <Typography variant="caption" color="text.secondary" display="block">
                    Average Rating
                </Typography>
            </Box>

            {/* Distribution Bars */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {ratingData.distribution.map(({ stars, count, percentage }) => (
                    <Box key={stars} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: 36 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mr: 0.5 }}>
                                {stars}
                            </Typography>
                            <Star sx={{ fontSize: 14, color: getStarColor(stars) }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: 'action.hover',
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 4,
                                        bgcolor: getStarColor(stars)
                                    }
                                }}
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ width: 28, textAlign: 'right' }}>
                            {count}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
