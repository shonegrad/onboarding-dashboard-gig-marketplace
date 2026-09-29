import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, Chip, Avatar } from '@mui/material';
import { Update, CheckCircle, Warning, Error } from '@mui/icons-material';
import { Applicant } from '../../types';

interface RecentActivityProps {
    applicants: Applicant[];
    limit?: number;
}

export const RecentActivity = ({ applicants, limit = 6 }: RecentActivityProps) => {
    const theme = useTheme();

    const recentActivities = useMemo(() => {
        // Sort by lastStatusChangeDate and take the most recent
        return [...applicants]
            .sort((a, b) => new Date(b.lastStatusChangeDate).getTime() - new Date(a.lastStatusChangeDate).getTime())
            .slice(0, limit)
            .map(a => {
                const changeDate = new Date(a.lastStatusChangeDate);
                const now = new Date();
                const diffMs = now.getTime() - changeDate.getTime();
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDays = Math.floor(diffHours / 24);

                let timeAgo = '';
                if (diffDays > 0) {
                    timeAgo = `${diffDays}d ago`;
                } else if (diffHours > 0) {
                    timeAgo = `${diffHours}h ago`;
                } else {
                    timeAgo = 'Just now';
                }

                return {
                    id: a.id,
                    name: a.name,
                    status: a.status,
                    timeAgo,
                    avatar: a.avatarUrl
                };
            });
    }, [applicants, limit]);

    const getStatusIcon = (status: string) => {
        if (status === 'Go Live') return <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />;
        if (status === 'Declined') return <Error sx={{ fontSize: 16, color: 'error.main' }} />;
        if (status.includes('Under Review')) return <Warning sx={{ fontSize: 16, color: 'warning.main' }} />;
        return <Update sx={{ fontSize: 16, color: 'info.main' }} />;
    };

    const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
        if (status === 'Go Live') return 'success';
        if (status === 'Declined') return 'error';
        if (status.includes('Under Review')) return 'warning';
        return 'info';
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.contrastText'
                    }}>
                        <Update fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Recent Activity
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Latest status changes
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Activity List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recentActivities.map((activity) => (
                    <Box
                        key={activity.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                bgcolor: 'action.selected'
                            }
                        }}
                    >
                        <Avatar
                            src={activity.avatar}
                            sx={{ width: 32, height: 32, fontSize: 12 }}
                        >
                            {activity.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                fontWeight={500}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {activity.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {getStatusIcon(activity.status)}
                                <Typography variant="caption" color="text.secondary">
                                    {activity.status}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="caption" color="text.disabled">
                            {activity.timeAgo}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};
