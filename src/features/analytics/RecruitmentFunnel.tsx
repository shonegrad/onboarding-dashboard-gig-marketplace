import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Tooltip, LinearProgress } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

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

    // Calculate conversion rates
    const getConversionRate = (index: number) => {
        if (index === 0) return 100;
        const prevCount = data[index - 1].count;
        return prevCount > 0 ? Math.round((data[index].count / prevCount) * 100) : 0;
    };

    // Get funnel colors (gradient from primary to success)
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
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                    boxShadow: 4
                }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'success.contrastText'
                }}>
                    <TrendingUp />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        Recruitment Funnel
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Click stage to filter
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {data.map((step, index) => {
                    const percentage = Math.round((step.count / maxVal) * 100);
                    const conversionRate = getConversionRate(index);
                    const isSelected = selectedStage === step.stage;

                    return (
                        <Tooltip
                            key={step.stage}
                            title={`${step.count} applicants at this stage`}
                            arrow
                            placement="left"
                        >
                            <Box
                                onClick={() => onStageClick?.(step.stage)}
                                sx={{
                                    position: 'relative',
                                    cursor: onStageClick ? 'pointer' : 'default',
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                                    border: isSelected ? 2 : 0,
                                    borderColor: 'primary.main',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                        transform: 'translateX(4px)'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
                                        {step.stage}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                                            {step.count}
                                        </Typography>
                                        {index > 0 && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: conversionRate >= 70 ? 'success.main' : conversionRate >= 40 ? 'warning.main' : 'error.main',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {conversionRate}%
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Progress bar with funnel effect */}
                                <Box sx={{
                                    height: 10,
                                    bgcolor: 'action.hover',
                                    borderRadius: 5,
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <Box sx={{
                                        height: '100%',
                                        width: `${percentage}%`,
                                        bgcolor: getFunnelColor(index),
                                        borderRadius: 5,
                                        transition: 'width 0.8s ease-out',
                                        background: `linear-gradient(90deg, ${getFunnelColor(index)} 0%, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 100%)`
                                    }} />
                                </Box>

                                {/* Connector line */}
                                {index < data.length - 1 && (
                                    <Box sx={{
                                        position: 'absolute',
                                        left: '50%',
                                        bottom: -10,
                                        width: 2,
                                        height: 8,
                                        bgcolor: 'divider',
                                        transform: 'translateX(-50%)'
                                    }} />
                                )}
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>
        </Paper>
    );
};
