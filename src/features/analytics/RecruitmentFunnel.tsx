import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Tooltip, Fade } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { useState } from 'react';

interface FunnelStep {
    stage: string;
    count: number;
}

interface RecruitmentFunnelProps {
    data: FunnelStep[];
    onStageClick?: (stage: string) => void;
    selectedStage?: string | null;
}

export const RecruitmentFunnel = ({ data, onStageClick, selectedStage }: RecruitmentFunnelProps) => {
    const theme = useTheme();
    const maxVal = Math.max(...data.map(d => d.count), 1);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const getConversionRate = (index: number) => {
        if (index === 0) return 100;
        const prevCount = data[index - 1].count;
        return prevCount > 0 ? Math.round((data[index].count / prevCount) * 100) : 0;
    };

    const getTotalConversion = () => {
        if (data.length < 2) return 0;
        const first = data[0].count;
        const last = data[data.length - 1].count;
        return first > 0 ? Math.round((last / first) * 100) : 0;
    };

    const getFunnelColor = (index: number) => {
        const colors = [
            theme.palette.primary.main,
            theme.palette.primary.light,
            theme.palette.info.main,
            theme.palette.info.light,
            theme.palette.success.light,
            theme.palette.success.main,
        ];
        return colors[index % colors.length];
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 6 }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'success.contrastText',
                        boxShadow: `0 4px 12px ${theme.palette.success.main}40`
                    }}>
                        <TrendingUp />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Recruitment Funnel
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Click to filter
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">Total Conv.</Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                        {getTotalConversion()}%
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {data.map((step, index) => {
                    const percentage = Math.round((step.count / maxVal) * 100);
                    const conversionRate = getConversionRate(index);
                    const isSelected = selectedStage === step.stage;
                    const isHovered = hoveredIndex === index;

                    return (
                        <Box
                            key={step.stage}
                            onClick={() => onStageClick?.(step.stage)}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            sx={{
                                position: 'relative',
                                cursor: onStageClick ? 'pointer' : 'default',
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isSelected ? 'action.selected' : isHovered ? 'action.hover' : 'transparent',
                                border: isSelected ? 2 : 1,
                                borderColor: isSelected ? 'primary.main' : 'transparent',
                                transition: 'all 0.25s ease',
                                transform: isHovered ? 'translateX(4px) scale(1.01)' : 'none',
                                boxShadow: isHovered ? 2 : 0
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        bgcolor: getFunnelColor(index),
                                        boxShadow: `0 0 8px ${getFunnelColor(index)}60`
                                    }} />
                                    <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
                                        {step.stage}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                                        {step.count}
                                    </Typography>
                                    {index > 0 && (
                                        <Tooltip title={`${conversionRate}% converted from previous stage`} arrow>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    px: 1,
                                                    py: 0.25,
                                                    borderRadius: 1,
                                                    bgcolor: conversionRate >= 70 ? 'success.main' : conversionRate >= 40 ? 'warning.main' : 'error.main',
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    fontSize: 10
                                                }}
                                            >
                                                {conversionRate}%
                                            </Typography>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>

                            {/* Progress bar with animation */}
                            <Box sx={{
                                height: 12,
                                bgcolor: 'action.hover',
                                borderRadius: 6,
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    borderRadius: 6,
                                    transition: 'width 0.8s ease-out, transform 0.2s',
                                    transform: isHovered ? 'scaleY(1.15)' : 'scaleY(1)',
                                    background: `linear-gradient(90deg, ${getFunnelColor(index)} 0%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)'} 50%, ${getFunnelColor(index)} 100%)`,
                                    backgroundSize: '200% 100%',
                                    animation: isHovered ? 'shimmer 1.5s infinite' : 'none',
                                    '@keyframes shimmer': {
                                        '0%': { backgroundPosition: '200% 0' },
                                        '100%': { backgroundPosition: '-200% 0' }
                                    }
                                }} />
                            </Box>

                            {/* Connector line */}
                            {index < data.length - 1 && (
                                <Box sx={{
                                    position: 'absolute',
                                    left: 20,
                                    bottom: -8,
                                    width: 2,
                                    height: 8,
                                    bgcolor: 'divider',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: -4,
                                        left: -3,
                                        width: 8,
                                        height: 8,
                                        borderLeft: '2px solid',
                                        borderBottom: '2px solid',
                                        borderColor: 'divider',
                                        transform: 'rotate(-45deg)'
                                    }
                                }} />
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
};
