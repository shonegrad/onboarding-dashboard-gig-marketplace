import type { OnboardingStatus } from '../types';

// Consistent stage colors throughout the application
export const STAGE_COLORS = {
  'Applied': {
    primary: '#f97316', // orange-500
    light: '#fed7aa', // orange-200
    bg: '#fff7ed', // orange-50
    text: '#ea580c', // orange-600
    dark: '#c2410c' // orange-700
  },
  'Invited to Interview': {
    primary: '#3b82f6', // blue-500
    light: '#93c5fd', // blue-300
    bg: '#eff6ff', // blue-50
    text: '#2563eb', // blue-600
    dark: '#1d4ed8' // blue-700
  },
  'Interview Scheduled': {
    primary: '#06b6d4', // cyan-500
    light: '#67e8f9', // cyan-300
    bg: '#ecfeff', // cyan-50
    text: '#0891b2', // cyan-600
    dark: '#0e7490' // cyan-700
  },
  'Invited to Training': {
    primary: '#8b5cf6', // violet-500
    light: '#c4b5fd', // violet-300
    bg: '#f5f3ff', // violet-50
    text: '#7c3aed', // violet-600
    dark: '#6d28d9' // violet-700
  },
  'In Training': {
    primary: '#a855f7', // purple-500
    light: '#d8b4fe', // purple-300
    bg: '#faf5ff', // purple-50
    text: '#9333ea', // purple-600
    dark: '#7e22ce' // purple-700
  },
  'Go Live': {
    primary: '#10b981', // emerald-500
    light: '#6ee7b7', // emerald-300
    bg: '#ecfdf5', // emerald-50
    text: '#059669', // emerald-600
    dark: '#047857' // emerald-700
  },
  'Declined': {
    primary: '#ef4444', // red-500
    light: '#fca5a5', // red-300
    bg: '#fef2f2', // red-50
    text: '#dc2626', // red-600
    dark: '#b91c1c' // red-700
  },
  'Under Review': {
    primary: '#f59e0b', // amber-500
    light: '#fcd34d', // amber-300
    bg: '#fffbeb', // amber-50
    text: '#d97706', // amber-600
    dark: '#b45309' // amber-700
  }
} as const;

export const getStatusColor = (status: OnboardingStatus, variant: 'primary' | 'light' | 'bg' | 'text' | 'dark' = 'primary') => {
  return STAGE_COLORS[status]?.[variant] || STAGE_COLORS['Applied'][variant];
};

export const getStatusBadgeClass = (status: OnboardingStatus) => {
  const colors = STAGE_COLORS[status] || STAGE_COLORS['Applied'];
  return `bg-[${colors.bg}] text-[${colors.text}] border-[${colors.light}]`;
};

// Split status names into two lines for badges
export const splitStatusForBadge = (status: OnboardingStatus): { line1: string; line2: string } => {
  switch (status) {
    case 'Applied':
      return { line1: 'Applied', line2: '' };
    case 'Invited to Interview':
      return { line1: 'Interview', line2: 'Invited' };
    case 'Interview Scheduled':
      return { line1: 'Interview', line2: 'Scheduled' };
    case 'Invited to Training':
      return { line1: 'Training', line2: 'Invited' };
    case 'In Training':
      return { line1: 'In', line2: 'Training' };
    case 'Go Live':
      return { line1: 'Go', line2: 'Live' };
    case 'Declined':
      return { line1: 'Declined', line2: '' };
    case 'Under Review':
      return { line1: 'Under', line2: 'Review' };
    default:
      return { line1: status, line2: '' };
  }
};

// Avatar fallback component - removed pixel art generation
export const getAvatarSrc = (applicant: { avatar?: string; name: string }) => {
  // Only return real photos, no pixel art fallback
  if (applicant.avatar && !applicant.avatar.includes('placeholder')) {
    return applicant.avatar;
  }
  return undefined; // Let Avatar component handle initials fallback
};

// Toast messages for different actions
export const TOAST_MESSAGES = {
  statusUpdate: (name: string, status: OnboardingStatus) => ({
    title: 'Status Updated',
    description: `${name} has been moved to "${status}"`
  }),
  approved: (name: string) => ({
    title: 'Application Approved! 🎉',
    description: `${name} has been approved and notified`
  }),
  declined: (name: string) => ({
    title: 'Application Declined',
    description: `${name}'s application has been declined`
  }),
  interviewScheduled: (name: string) => ({
    title: 'Interview Scheduled! 📅',
    description: `Interview time selected for ${name}`
  }),
  trainingSelected: (name: string) => ({
    title: 'Training Session Booked! 📚',
    description: `${name} has selected their training session`
  }),
  filtersCleared: () => ({
    title: 'Filters Cleared',
    description: 'All filters have been reset'
  })
};