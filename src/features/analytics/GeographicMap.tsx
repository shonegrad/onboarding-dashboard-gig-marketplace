import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Tooltip, Paper, Chip } from '@mui/material';
import { scaleLinear } from 'd3-scale';
import { Public } from '@mui/icons-material';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeographicMapProps {
    data: {
        countries: { name: string; value: number }[];
        cities: { name: string; value: number }[];
    };
    selectedCountry?: string | null;
    onCountryClick?: (country: string) => void;
}

// Approximate lat/lng for major demo cities
const cityCoordinates: Record<string, [number, number]> = {
    // Canada
    'Toronto': [-79.3832, 43.6532],
    'Vancouver': [-123.1207, 49.2827],
    'Montreal': [-73.5673, 45.5017],
    'Calgary': [-114.0719, 51.0447],
    'Ottawa': [-75.6972, 45.4215],
    'Edmonton': [-113.4909, 53.5461],
    'Mississauga': [-79.6441, 43.5890],
    'Winnipeg': [-97.1384, 49.8951],
    'Hamilton': [-79.8711, 43.2557],
    'Quebec City': [-71.2080, 46.8139],
    // USA
    'New York': [-74.0060, 40.7128],
    'Los Angeles': [-118.2437, 34.0522],
    'Chicago': [-87.6298, 41.8781],
    'Houston': [-95.3698, 29.7604],
    'San Francisco': [-122.4194, 37.7749],
    'Phoenix': [-112.0740, 33.4484],
    'Philadelphia': [-75.1652, 39.9526],
    'San Antonio': [-98.4936, 29.4241],
    'San Diego': [-117.1611, 32.7157],
    'Dallas': [-96.7970, 32.7767],
    'Austin': [-97.7431, 30.2672],
    'Jacksonville': [-81.6557, 30.3322],
    'Columbus': [-82.9988, 39.9612],
    'Indianapolis': [-86.1581, 39.7684],
    'Fort Worth': [-97.3308, 32.7555],
    'Charlotte': [-80.8431, 35.2271],
    'Seattle': [-122.3321, 47.6062],
    'Denver': [-104.9903, 39.7392],
    'Boston': [-71.0589, 42.3601],
    'El Paso': [-106.4850, 31.7619],
    // South Africa
    'Cape Town': [18.4232, -33.9249],
    'Johannesburg': [28.0473, -26.2041],
    'Durban': [31.0218, -29.8587],
    'Pretoria': [28.1871, -25.7479],
    'Port Elizabeth': [25.8740, -33.9608],
    'Bloemfontein': [26.2294, -29.0852],
    'East London': [27.9116, -33.0153],
    'Nelspruit': [30.9700, -25.4653],
    'Polokwane': [29.4486, -23.9045],
    'Kimberley': [24.7499, -28.7282],
    // Serbia
    'Belgrade': [20.4489, 44.7866],
    'Novi Sad': [19.8335, 45.2671],
    'Niš': [21.8958, 43.3209],
    'Kragujevac': [20.9114, 44.0165],
    'Subotica': [19.6658, 46.1003],
    // Croatia
    'Zagreb': [15.9819, 45.8150],
    'Split': [16.4401, 43.5081],
    'Rijeka': [14.4422, 45.3271],
    'Osijek': [18.6955, 45.5550],
    'Zadar': [15.2314, 44.1194],
    // Morocco
    'Casablanca': [-7.5898, 33.5731],
    'Rabat': [-6.8417, 34.0209],
    'Fez': [-5.0003, 34.0181],
    'Marrakech': [-7.9811, 31.6295],
    'Agadir': [-9.5981, 30.4278],
    'Tangier': [-5.8326, 35.7595],
    // Mexico
    'Mexico City': [-99.1332, 19.4326],
    'Guadalajara': [-103.3496, 20.6597],
    'Monterrey': [-100.3161, 25.6866],
    'Puebla': [-98.2063, 19.0414],
    'Tijuana': [-117.0382, 32.5149],
    'León': [-101.6866, 21.1250],
    'Juárez': [-106.4245, 31.6904],
    'Mérida': [-89.6165, 20.9674],
};

// Country name mapping for geo matching
const countryNameMap: Record<string, string> = {
    'United States of America': 'United States',
    'Serbia': 'Serbia',
    'Croatia': 'Croatia',
    'Morocco': 'Morocco',
    'Mexico': 'Mexico',
    'South Africa': 'South Africa',
    'Canada': 'Canada'
};

export const GeographicMap = ({ data, selectedCountry, onCountryClick }: GeographicMapProps) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

    // Scale for marker size based on applicant density
    const sizeScale = useMemo(() => {
        const maxVal = Math.max(...data.cities.map(d => d.value), 1);
        return scaleLinear()
            .domain([0, maxVal])
            .range([4, 14]);
    }, [data]);

    const getCountryName = (geoName: string) => {
        return countryNameMap[geoName] || geoName;
    };

    const getCountryStats = (countryName: string) => {
        return data.countries.find(c => c.name === countryName);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                height: 420,
                borderRadius: 3,
                overflow: 'hidden',
                position: 'relative',
                border: 1,
                borderColor: 'divider',
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                    boxShadow: 4
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.contrastText'
                    }}>
                        <Public />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            Global Talent Distribution
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {data.countries.length} countries • Click to filter
                        </Typography>
                    </Box>
                </Box>
                {hoveredCountry && (
                    <Chip
                        label={`${hoveredCountry}: ${getCountryStats(hoveredCountry)?.value || 0} applicants`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                )}
            </Box>

            {/* Map */}
            <Box sx={{ height: 'calc(100% - 80px)', bgcolor: isDark ? '#1a1a2e' : '#f8fafc' }}>
                <ComposableMap
                    projection="geoMercator"
                    projectionConfig={{ scale: 120, center: [0, 30] }}
                    style={{ width: '100%', height: '100%' }}
                >
                    <ZoomableGroup center={[0, 20]} zoom={1}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => {
                                    const countryName = getCountryName(geo.properties.name);
                                    const countryStats = getCountryStats(countryName);
                                    const hasApplicants = !!countryStats;
                                    const isSelected = selectedCountry === countryName;
                                    const isHovered = hoveredCountry === countryName;

                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill={isSelected
                                                ? theme.palette.secondary.main
                                                : isHovered && hasApplicants
                                                    ? theme.palette.primary.main
                                                    : hasApplicants
                                                        ? (isDark ? theme.palette.primary.dark : theme.palette.primary.light)
                                                        : (isDark ? "#2A2A2A" : "#E2E8F0")
                                            }
                                            stroke={isDark ? "#374151" : "#CBD5E1"}
                                            strokeWidth={0.5}
                                            onClick={() => hasApplicants && onCountryClick?.(countryName)}
                                            onMouseEnter={() => hasApplicants && setHoveredCountry(countryName)}
                                            onMouseLeave={() => setHoveredCountry(null)}
                                            style={{
                                                default: {
                                                    outline: "none",
                                                    cursor: hasApplicants ? 'pointer' : 'default',
                                                    transition: 'fill 0.2s ease'
                                                },
                                                hover: {
                                                    outline: "none",
                                                    cursor: hasApplicants ? 'pointer' : 'default'
                                                },
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
                                    <Tooltip
                                        title={
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="body2" fontWeight="bold">{name}</Typography>
                                                <Typography variant="caption">{value} applicants</Typography>
                                            </Box>
                                        }
                                        arrow
                                    >
                                        <circle
                                            r={sizeScale(value)}
                                            fill={theme.palette.error.main}
                                            stroke="#fff"
                                            strokeWidth={2}
                                            style={{
                                                cursor: 'pointer',
                                                opacity: 0.85,
                                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                            }}
                                        />
                                    </Tooltip>
                                </Marker>
                            );
                        })}
                    </ZoomableGroup>
                </ComposableMap>
            </Box>
        </Paper>
    );
};
