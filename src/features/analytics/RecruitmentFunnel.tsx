import { useTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

interface FunnelStep {
    stage: string;
    count: number;
}

interface RecruitmentFunnelProps {
    data: FunnelStep[];
}

export const RecruitmentFunnel = ({ data }: RecruitmentFunnelProps) => {
    const theme = useTheme();
    const maxVal = Math.max(...data.map(d => d.count), 1);

    return (
        <Box sx={{
            width: '100%',
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            p: 3,
            boxShadow: 1
        }}>
            <Typography variant="h6" gutterBottom>
                Recruitment Conversion
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                {data.map((step, index) => {
                    const percentage = Math.round((step.count / maxVal) * 100);
                    const prevCount = index > 0 ? data[index - 1].count : step.count;
                    const conversionRate = index > 0 ? Math.round((step.count / prevCount) * 100) : 100;

                    return (
                        <Box key={step.stage} sx={{ position: 'relative' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" fontWeight="medium">
                                    {step.stage}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {step.count} ({conversionRate}% sat)
                                </Typography>
                            </Box>

                            {/* Bar container */}
                            <Box sx={{
                                height: 24,
                                width: '100%',
                                bgcolor: theme.palette.action.hover,
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    bgcolor: theme.palette.primary.main,
                                    borderRadius: 1,
                                    transition: 'width 1s ease-in-out'
                                }} />
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};
