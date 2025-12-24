import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Skeleton } from '@mui/material';
import { RssFeed as FeedIcon, Circle } from '@mui/icons-material';

export function ActivityFeedPlaceholderPage() {
    // Simulated empty state with skeleton hint
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            <Typography variant="h4" fontWeight="bold">
                Activity Feed
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FeedIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="600">
                        Recent Activity
                    </Typography>
                </Box>

                {/* Skeleton feed items to show intent */}
                <List disablePadding>
                    {[1, 2, 3].map((item) => (
                        <ListItem key={item} sx={{ px: 0, py: 1.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <Circle sx={{ fontSize: 8, color: 'text.disabled' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Skeleton width="60%" />}
                                secondary={<Skeleton width="30%" />}
                            />
                        </ListItem>
                    ))}
                </List>

                <Box sx={{ textAlign: 'center', mt: 4, py: 3, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">
                        Activity tracking and real-time updates coming in Phase 2.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
