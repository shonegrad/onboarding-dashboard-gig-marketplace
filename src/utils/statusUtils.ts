import { OnboardingStatus } from '../types';

// Map statuses to MUI colors/severity
export const STATUS_CONFIG: Record<OnboardingStatus, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; label: string; bgcolor?: string; textColor?: string }> = {
    'Applied': { color: 'warning', label: 'Applied', bgcolor: '#fff7ed', textColor: '#c2410c' },
    'Invited to Interview': { color: 'info', label: 'Interview Invited', bgcolor: '#eff6ff', textColor: '#1d4ed8' },
    'Interview Scheduled': { color: 'info', label: 'Interview Scheduled', bgcolor: '#ecfeff', textColor: '#0e7490' },
    'Invited to Training': { color: 'secondary', label: 'Training Invited', bgcolor: '#f5f3ff', textColor: '#6d28d9' },
    'In Training': { color: 'secondary', label: 'In Training', bgcolor: '#faf5ff', textColor: '#7e22ce' },
    'Go Live': { color: 'success', label: 'Go Live', bgcolor: '#ecfdf5', textColor: '#047857' },
    'Declined': { color: 'error', label: 'Declined', bgcolor: '#fef2f2', textColor: '#b91c1c' },
    'Under Review': { color: 'warning', label: 'Under Review', bgcolor: '#fffbeb', textColor: '#b45309' },
};

export const PIPELINE_STAGES: OnboardingStatus[] = [
    'Applied',
    'Invited to Interview',
    'Interview Scheduled',
    'Invited to Training',
    'In Training',
    'Go Live',
];

export const getNextStage = (current: OnboardingStatus): OnboardingStatus | null => {
    const idx = PIPELINE_STAGES.indexOf(current);
    if (idx >= 0 && idx < PIPELINE_STAGES.length - 1) {
        return PIPELINE_STAGES[idx + 1];
    }
    return null;
};

export const isEndState = (status: OnboardingStatus): boolean => {
    return status === 'Declined' || status === 'Go Live' || status === 'Under Review';
};
