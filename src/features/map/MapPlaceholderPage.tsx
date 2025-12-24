import { Box, Typography, Paper } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';

export function MapPlaceholderPage() {
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: 1,
                    borderColor: 'divider',
                    maxWidth: 400,
                }}
            >
                <MapIcon sx={{ fontSize: 64, mb: 2, color: 'primary.main', opacity: 0.6 }} />
                <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                    Map Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visualize applicant distribution across regions. Interactive maps and geographic insights coming in Phase 2.
                </Typography>
            </Paper>
        </Box>
    );
}
