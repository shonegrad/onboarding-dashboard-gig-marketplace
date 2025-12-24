import { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Tooltip } from '@mui/material';
import { scaleLinear } from 'd3-scale';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeographicMapProps {
    data: {
        countries: { name: string; value: number }[];
        cities: { name: string; value: number }[];
    };
}

// Approximate lat/lng for major demo cities (since we don't have a geocoder)
const cityCoordinates: Record<string, [number, number]> = {
    // Canada
    'Toronto': [-79.3832, 43.6532],
    'Vancouver': [-123.1207, 49.2827],
    'Montreal': [-73.5673, 45.5017],

    // USA
    'New York': [-74.0060, 40.7128],
    'Los Angeles': [-118.2437, 34.0522],
    'Chicago': [-87.6298, 41.8781],
    'Houston': [-95.3698, 29.7604],
    'San Francisco': [-122.4194, 37.7749],

    // South Africa
    'Cape Town': [18.4232, -33.9249],
    'Johannesburg': [28.0473, -26.2041],

    // Serbia
    'Belgrade': [20.4489, 44.7866],

    // Croatia
    'Zagreb': [15.9819, 45.8150],

    // Morocco
    'Casablanca': [-7.5898, 33.5731],
    'Rabat': [-6.8417, 34.0209],

    // Mexico
    'Mexico City': [-99.1332, 19.4326]
};

export const GeographicMap = ({ data }: GeographicMapProps) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Scale for marker size based on applicant density
    const sizeScale = useMemo(() => {
        const maxVal = Math.max(...data.cities.map(d => d.value), 1);
        return scaleLinear()
            .domain([0, maxVal])
            .range([4, 12]);
    }, [data]);

    return (
        <Box sx={{
            width: '100%',
            height: 400,
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative'
        }}>
            <Typography variant="h6" sx={{ p: 2, position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                Global Talent Distribution
            </Typography>

            <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }}>
                <ZoomableGroup center={[0, 20]} zoom={1}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                // Check if this country is in our list
                                const hasApplicants = data.countries.some(c =>
                                    // Simple rough matching. In prod, use ISO codes.
                                    geo.properties.name === c.name ||
                                    (geo.properties.name === "United States of America" && c.name === "United States")
                                );

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={hasApplicants
                                            ? (isDark ? theme.palette.primary.dark : theme.palette.primary.light)
                                            : (isDark ? "#2A2A2A" : "#ECEFF1")
                                        }
                                        stroke={isDark ? "#333" : "#FFF"}
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: { fill: theme.palette.secondary.main, outline: "none" },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>

                    {data.cities.map(({ name, value }) => {
                        const coords = cityCoordinates[name];
                        if (!coords) return null;

                        return (
                            <Marker key={name} coordinates={coords}>
                                <Tooltip title={`${name}: ${value} applicants`}>
                                    <circle
                                        r={sizeScale(value)}
                                        fill={theme.palette.error.main}
                                        stroke="#fff"
                                        strokeWidth={2}
                                        style={{ cursor: 'pointer', opacity: 0.8 }}
                                    />
                                </Tooltip>
                            </Marker>
                        );
                    })}
                </ZoomableGroup>
            </ComposableMap>
        </Box>
    );
};
