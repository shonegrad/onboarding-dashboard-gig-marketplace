import { Box, Button, ButtonGroup, Paper, Typography } from '@mui/material';
import { useState } from 'react';

export type DateRangePreset = '7d' | '30d' | '90d' | 'all';

interface DateRangeFilterProps {
    value: DateRangePreset;
    onChange: (preset: DateRangePreset) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
    const presets: { key: DateRangePreset; label: string }[] = [
        { key: '7d', label: '7 Days' },
        { key: '30d', label: '30 Days' },
        { key: '90d', label: '90 Days' },
        { key: 'all', label: 'All Time' }
    ];

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Time Period:
            </Typography>
            <ButtonGroup size="small" variant="outlined">
                {presets.map((preset) => (
                    <Button
                        key={preset.key}
                        onClick={() => onChange(preset.key)}
                        variant={value === preset.key ? 'contained' : 'outlined'}
                        sx={{
                            textTransform: 'none',
                            fontWeight: value === preset.key ? 600 : 400
                        }}
                    >
                        {preset.label}
                    </Button>
                ))}
            </ButtonGroup>
        </Box>
    );
};

// Helper to get date range from preset
export const getDateRangeFromPreset = (preset: DateRangePreset): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date();

    switch (preset) {
        case '7d':
            start.setDate(end.getDate() - 7);
            break;
        case '30d':
            start.setDate(end.getDate() - 30);
            break;
        case '90d':
            start.setDate(end.getDate() - 90);
            break;
        case 'all':
        default:
            start.setFullYear(2020); // Far enough back
            break;
    }

    return { start, end };
};
