import { useState, ReactNode } from 'react';
import { Paper, Box, Typography, IconButton, Collapse, Divider } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface ExpandableCardProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    iconBgColor?: string;
    summary: ReactNode;
    details: ReactNode;
    defaultExpanded?: boolean;
    summaryStats?: { label: string; value: string | number }[];
}

export const ExpandableCard = ({
    title,
    subtitle,
    icon,
    iconBgColor = 'primary.main',
    summary,
    details,
    defaultExpanded = false,
    summaryStats
}: ExpandableCardProps) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const theme = useTheme();

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 6 },
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                    borderBottom: expanded ? 1 : 0,
                    borderColor: 'divider'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {icon && (
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: iconBgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: `0 4px 12px ${theme.palette.primary.main}30`
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {summaryStats && summaryStats.map((stat, i) => (
                        <Box key={i} sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary.main">
                                {stat.value}
                            </Typography>
                        </Box>
                    ))}
                    <IconButton
                        onClick={() => setExpanded(!expanded)}
                        size="small"
                        aria-label={expanded ? 'Collapse details' : 'Expand details'}
                        sx={{
                            bgcolor: 'action.hover',
                            transition: 'transform 0.3s ease',
                            '&:hover': { bgcolor: 'action.selected' }
                        }}
                    >
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                </Box>
            </Box>

            {/* Summary (always visible) */}
            <Box sx={{ p: 2, flex: 1 }}>
                {summary}
            </Box>

            {/* Expandable Details */}
            <Collapse in={expanded} timeout={300} unmountOnExit>
                <Divider />
                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'action.hover',
                        maxHeight: 300,
                        overflow: 'auto'
                    }}
                >
                    {details}
                </Box>
            </Collapse>
        </Paper>
    );
};
