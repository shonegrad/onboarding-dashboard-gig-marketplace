import { Box, Typography } from '@mui/material';
import { BarChart } from '@mui/icons-material';

export function AnalyticsPlaceholderPage() {
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                opacity: 0.7
            }}
        >
            <BarChart sx={{ fontSize: 64, mb: 2, color: 'text.disabled' }} />
            <Typography variant="h5" fontWeight="bold">
                Analytics Dashboard
            </Typography>
            <Typography variant="body1">
                Phase 2 Feature - Coming Soon
            </Typography>
        </Box>
    );
}
