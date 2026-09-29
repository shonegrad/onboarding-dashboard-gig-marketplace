import { Box, Paper, Typography, Tooltip, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { Applicant } from '../../types';

interface PipelineHealthProps {
    applicants: Applicant[];
    onStageClick?: (stage: string) => void;
}

interface StageHealth {
    stage: string;
    count: number;
    avgDays: number;
    healthScore: 'good' | 'warning' | 'critical';
}

export const PipelineHealth = ({ applicants, onStageClick }: PipelineHealthProps) => {
    const theme = useTheme();

    const stageHealth = useMemo((): StageHealth[] => {
        const stages = [
            { name: 'Applied', expectedDays: 3 },
            { name: 'Invited to Interview', expectedDays: 2 },
            { name: 'Interview Scheduled', expectedDays: 5 },
            { name: 'Invited to Training', expectedDays: 2 },
            { name: 'In Training', expectedDays: 7 },
        ];

        const now = new Date();

        return stages.map(stage => {
            const stageApplicants = applicants.filter(a => a.status === stage.name);
            const count = stageApplicants.length;

            // Calculate avg days in this stage
            const avgDays = count > 0
                ? stageApplicants.reduce((sum, a) => {
                    const lastChange = new Date(a.lastStatusChangeDate);
                    const days = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24);
                    return sum + days;
                }, 0) / count
                : 0;

            // Determine health based on expected vs actual
            let healthScore: 'good' | 'warning' | 'critical' = 'good';
            if (avgDays > stage.expectedDays * 2) {
                healthScore = 'critical';
            } else if (avgDays > stage.expectedDays * 1.5) {
                healthScore = 'warning';
            }

            return {
                stage: stage.name,
                count,
                avgDays: Math.round(avgDays * 10) / 10,
                healthScore
            };
        });
    }, [applicants]);

    const getHealthColor = (health: 'good' | 'warning' | 'critical') => {
        switch (health) {
            case 'good': return theme.palette.success.main;
            case 'warning': return theme.palette.warning.main;
            case 'critical': return theme.palette.error.main;
        }
    };

    const maxCount = Math.max(...stageHealth.map(s => s.count), 1);

    return (
        <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        Pipeline Health
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Identify bottlenecks by stage duration
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main' }} />
                        <Typography variant="caption">Healthy</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'warning.main' }} />
                        <Typography variant="caption">Slow</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main' }} />
                        <Typography variant="caption">Bottleneck</Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stageHealth.map((stage) => (
                    <Tooltip
                        key={stage.stage}
                        title={`${stage.count} applicants • Avg ${stage.avgDays} days in stage`}
                        arrow
                        placement="top"
                    >
                        <Box
                            onClick={() => onStageClick?.(stage.stage)}
                            sx={{
                                cursor: onStageClick ? 'pointer' : 'default',
                                '&:hover': onStageClick ? { opacity: 0.8 } : {}
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" fontWeight={500}>
                                    {stage.stage}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {stage.count} applicants
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                        sx={{ color: getHealthColor(stage.healthScore), minWidth: 60 }}
                                    >
                                        {stage.avgDays}d avg
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Progress bar */}
                            <Box sx={{
                                height: 12,
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    width: `${(stage.count / maxCount) * 100}%`,
                                    bgcolor: getHealthColor(stage.healthScore),
                                    borderRadius: 1,
                                    transition: 'width 0.5s ease-in-out'
                                }} />
                            </Box>
                        </Box>
                    </Tooltip>
                ))}
            </Box>
        </Paper>
    );
};
