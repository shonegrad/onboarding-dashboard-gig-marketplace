import React, { useMemo, useState } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from 'react-simple-maps';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Users, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { Applicant, OnboardingStatus } from '../types';
import { getStatusColor } from '../utils/stageUtils';

// World map GeoJSON URL
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Approximate coordinates for cities in the mock data
const CITY_COORDINATES: Record<string, [number, number]> = {
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

    // United States
    'New York': [-74.0060, 40.7128],
    'Los Angeles': [-118.2437, 34.0522],
    'Chicago': [-87.6298, 41.8781],
    'Houston': [-95.3698, 29.7604],
    'Phoenix': [-112.0740, 33.4484],
    'Philadelphia': [-75.1652, 39.9526],
    'San Antonio': [-98.4936, 29.4241],
    'San Diego': [-117.1611, 32.7157],
    'Dallas': [-96.7970, 32.7767],
    'Austin': [-97.7431, 30.2672],
    'Jacksonville': [-81.6557, 30.3322],
    'San Francisco': [-122.4194, 37.7749],
    'Columbus': [-82.9988, 39.9612],
    'Indianapolis': [-86.1581, 39.7684],
    'Fort Worth': [-97.3308, 32.7555],
    'Charlotte': [-80.8431, 35.2271],
    'Seattle': [-122.3321, 47.6062],
    'Denver': [-104.9903, 39.7392],
    'Boston': [-71.0589, 42.3601],
    'El Paso': [-106.4850, 31.7619],

    // South Africa
    'Cape Town': [18.4241, -33.9249],
    'Johannesburg': [28.0473, -26.2041],
    'Durban': [31.0218, -29.8587],
    'Pretoria': [28.1881, -25.7461],
    'Port Elizabeth': [25.8915, -33.9608],
    'Bloemfontein': [26.2041, -29.0852],
    'East London': [27.9116, -33.0153],
    'Nelspruit': [30.9700, -25.4753],
    'Polokwane': [29.4486, -23.9045],
    'Kimberley': [24.7499, -28.7282],

    // Serbia
    'Belgrade': [20.4489, 44.7866],
    'Novi Sad': [19.8335, 45.2671],
    'Niš': [21.8958, 43.3209],
    'Kragujevac': [20.9114, 44.0165],
    'Subotica': [19.6658, 46.1003],
    'Novi Pazar': [20.5167, 43.1367],
    'Zrenjanin': [20.3815, 45.3816],
    'Pančevo': [20.6400, 44.8708],
    'Čačak': [20.3497, 43.8914],
    'Novi Beograd': [20.4144, 44.8154],

    // Croatia
    'Zagreb': [15.9819, 45.8150],
    'Split': [16.4402, 43.5081],
    'Rijeka': [14.4422, 45.3271],
    'Osijek': [18.6955, 45.5550],
    'Zadar': [15.2314, 44.1194],
    'Slavonski Brod': [18.0158, 45.1603],
    'Pula': [13.8496, 44.8666],
    'Karlovac': [15.5475, 45.4929],
    'Sisak': [16.3725, 45.4658],
    'Šibenik': [15.8952, 43.7350],

    // Morocco
    'Casablanca': [-7.5898, 33.5731],
    'Rabat': [-6.8498, 34.0209],
    'Fez': [-5.0003, 34.0331],
    'Marrakech': [-7.9893, 31.6295],
    'Agadir': [-9.5981, 30.4278],
    'Tangier': [-5.8340, 35.7595],
    'Meknès': [-5.5473, 33.8935],
    'Oujda': [-1.9086, 34.6814],
    'Kenitra': [-6.5802, 34.2610],
    'Tetouan': [-5.3684, 35.5889],

    // Mexico
    'Mexico City': [-99.1332, 19.4326],
    'Guadalajara': [-103.3496, 20.6597],
    'Monterrey': [-100.3161, 25.6866],
    'Puebla': [-98.2063, 19.0414],
    'Tijuana': [-117.0382, 32.5149],
    'León': [-101.6860, 21.1250],
    'Juárez': [-106.4245, 31.6904],
    'Torreón': [-103.4068, 25.5428],
    'Querétaro': [-100.3899, 20.5888],
    'San Luis Potosí': [-100.9855, 22.1565],
    'Mérida': [-89.5926, 20.9674],
    'Mexicali': [-115.4523, 32.6245],
};

interface GeoMapViewProps {
    applicants: Applicant[];
}

export function GeoMapView({ applicants }: GeoMapViewProps) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState<[number, number]>([0, 20]);

    // Aggregate applicant data by country
    const countryData = useMemo(() => {
        const data: Record<string, { count: number; statuses: Record<OnboardingStatus, number> }> = {};

        applicants.forEach(app => {
            if (statusFilter !== 'all' && app.status !== statusFilter) return;

            const country = app.location.country;
            if (!data[country]) {
                data[country] = { count: 0, statuses: {} as Record<OnboardingStatus, number> };
            }
            data[country].count++;
            data[country].statuses[app.status] = (data[country].statuses[app.status] || 0) + 1;
        });

        return data;
    }, [applicants, statusFilter]);

    // Aggregate applicant data by city
    const cityData = useMemo(() => {
        const data: Record<string, { count: number; country: string; statuses: Record<OnboardingStatus, number> }> = {};

        applicants.forEach(app => {
            if (statusFilter !== 'all' && app.status !== statusFilter) return;

            const city = app.location.city;
            if (!data[city]) {
                data[city] = { count: 0, country: app.location.country, statuses: {} as Record<OnboardingStatus, number> };
            }
            data[city].count++;
            data[city].statuses[app.status] = (data[city].statuses[app.status] || 0) + 1;
        });

        return data;
    }, [applicants, statusFilter]);

    // Get marker size based on count
    const getMarkerSize = (count: number) => {
        if (count >= 20) return 12;
        if (count >= 10) return 8;
        if (count >= 5) return 6;
        return 4;
    };

    // Get marker color based on dominant status
    const getMarkerColor = (statuses: Record<OnboardingStatus, number>) => {
        let maxStatus: OnboardingStatus = 'Applied';
        let maxCount = 0;

        Object.entries(statuses).forEach(([status, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxStatus = status as OnboardingStatus;
            }
        });

        return getStatusColor(maxStatus);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 8));
    const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 1));
    const handleReset = () => {
        setZoom(1);
        setCenter([0, 20]);
    };

    const totalFiltered = Object.values(countryData).reduce((sum, c) => sum + c.count, 0);

    return (
        <Card className="border-2 border-md-outline-variant rounded-lg shadow-md-elevation-2">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Geographic Distribution
                        </CardTitle>
                        <p className="text-sm text-md-on-surface-variant mt-1">
                            Applicant locations across {Object.keys(countryData).length} countries ({totalFiltered} total)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Applied">Applied</SelectItem>
                                <SelectItem value="Invited to Interview">Invited to Interview</SelectItem>
                                <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                                <SelectItem value="Invited to Training">Invited to Training</SelectItem>
                                <SelectItem value="In Training">In Training</SelectItem>
                                <SelectItem value="Go Live">Go Live</SelectItem>
                                <SelectItem value="Declined">Declined</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-1 bg-md-surface-container-high rounded-lg p-1">
                            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-8 w-8 p-0">
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-8 w-8 p-0">
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0">
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="w-full h-[400px] bg-md-surface-container rounded-lg overflow-hidden">
                    <ComposableMap
                        projection="geoMercator"
                        projectionConfig={{
                            scale: 120,
                        }}
                    >
                        <ZoomableGroup zoom={zoom} center={center} onMoveEnd={({ coordinates, zoom: z }) => {
                            setCenter(coordinates as [number, number]);
                            setZoom(z);
                        }}>
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#e2e8f0"
                                            stroke="#cbd5e1"
                                            strokeWidth={0.5}
                                            style={{
                                                default: { outline: 'none' },
                                                hover: { fill: '#cbd5e1', outline: 'none' },
                                                pressed: { outline: 'none' },
                                            }}
                                        />
                                    ))
                                }
                            </Geographies>

                            {/* City markers */}
                            {Object.entries(cityData).map(([city, data]) => {
                                const coords = CITY_COORDINATES[city];
                                if (!coords) return null;

                                return (
                                    <Marker key={city} coordinates={coords}>
                                        <circle
                                            r={getMarkerSize(data.count)}
                                            fill={getMarkerColor(data.statuses)}
                                            fillOpacity={0.8}
                                            stroke="#fff"
                                            strokeWidth={1}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <title>{`${city}, ${data.country}: ${data.count} applicants`}</title>
                                    </Marker>
                                );
                            })}
                        </ZoomableGroup>
                    </ComposableMap>
                </div>

                {/* Country breakdown */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {Object.entries(countryData)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([country, data]) => (
                            <div
                                key={country}
                                className="bg-md-surface-container-high p-3 rounded-lg text-center"
                            >
                                <p className="text-sm font-medium text-md-on-surface truncate">{country}</p>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                    <Users className="w-4 h-4 text-md-on-surface-variant" />
                                    <span className="text-lg font-bold text-md-primary">{data.count}</span>
                                </div>
                                <div className="flex flex-wrap justify-center gap-1 mt-2">
                                    {Object.entries(data.statuses)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 2)
                                        .map(([status, count]) => (
                                            <Badge
                                                key={status}
                                                variant="secondary"
                                                className="text-xs px-1 py-0"
                                                style={{ backgroundColor: getStatusColor(status as OnboardingStatus, 'light'), color: getStatusColor(status as OnboardingStatus, 'dark') }}
                                            >
                                                {count}
                                            </Badge>
                                        ))}
                                </div>
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    );
}
