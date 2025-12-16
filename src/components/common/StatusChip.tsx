import { Chip } from '@mui/material';
import { OnboardingStatus } from '../../types';
import { STATUS_CONFIG } from '../../utils/statusUtils';

interface StatusChipProps {
    status: OnboardingStatus;
    size?: 'small' | 'medium';
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG['Applied'];

    return (
        <Chip
            label={config.label}
            size={size}
            sx={{
                backgroundColor: config.bgcolor,
                color: config.textColor,
                fontWeight: 600,
                border: '1px solid',
                borderColor: `${config.textColor}33`, // 20% opacity
            }}
        />
    );
}
