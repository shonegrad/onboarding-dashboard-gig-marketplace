import { Box, Typography, Paper } from '@mui/material';
import { generateMockApplicants } from '../../data/mockData';
import { GeographicMap } from '../analytics/GeographicMap';
import { useAnalyticsData } from '../analytics/useAnalyticsData';

interface MapOverviewPageProps {
    applicants?: any[];
}

export function MapOverviewPage({ applicants: propApplicants }: MapOverviewPageProps) {
    const applicants = propApplicants || generateMockApplicants();
    const { mapData } = useAnalyticsData(applicants);

    // Calculate country stats for the legend
    const totalApplicants = applicants.length;
    const countryStats = mapData.countries.sort((a, b) => b.value - a.value).slice(0, 6);

    return (
        <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Global Talent Map
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visualize applicant distribution across {mapData.countries.length} countries.
                </Typography>
            </Box>

            {/* Main Map */}
            <Paper sx={{ p: 0, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                <GeographicMap data={mapData} />
            </Paper>

            {/* Country Breakdown */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Applicants by Country
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                    {countryStats.map((country) => (
                        <Box key={country.name} sx={{
                            flex: '1 1 180px',
                            p: 2,
                            bgcolor: 'action.hover',
                            borderRadius: 1,
                            textAlign: 'center'
                        }}>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                                {country.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {country.name}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                {Math.round((country.value / totalApplicants) * 100)}% of total
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
}
