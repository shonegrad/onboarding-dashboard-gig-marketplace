import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Divider,
    Stepper,
    Step,
    StepLabel,
    Button,
    Avatar,
    Stack,
    Chip,
    Paper,
    Rating,
    Tooltip,
    Fade,
} from '@mui/material';
import {
    Close as CloseIcon,
    ArrowForward as ArrowForwardIcon,
    ArrowBack as ArrowBackIcon,
    Event as CalendarIcon,
    LocationOn as LocationIcon,
    Email as EmailIcon,
    Work as WorkIcon,
    Star as StarIcon,
    AccessTime as TimeIcon,
    Public as CountryIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Applicant, OnboardingStatus } from '../../types';
import { PIPELINE_STAGES, getNextStage, getPreviousStage, isEndState } from '../../utils/statusUtils';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';

interface ApplicantModalProps {
    applicant: Applicant | null;
    open: boolean;
    onClose: () => void;
    onStatusUpdate: (id: string, stage: OnboardingStatus, data?: any) => void;
    onNavigate?: (direction: 'prev' | 'next') => void;
    hasPrev?: boolean;
    hasNext?: boolean;
}

export function ApplicantModal({
    applicant,
    open,
    onClose,
    onStatusUpdate,
    onNavigate,
    hasPrev = false,
    hasNext = false
}: ApplicantModalProps) {
    const theme = useTheme();
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ status: OnboardingStatus; requireNote: boolean } | null>(null);

    // Keyboard shortcuts
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowRight' && hasNext && onNavigate) {
                onNavigate('next');
            } else if (e.key === 'ArrowLeft' && hasPrev && onNavigate) {
                onNavigate('prev');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, hasNext, hasPrev, onNavigate, onClose]);

    if (!applicant) return null;

    const currentStageIndex = PIPELINE_STAGES.indexOf(applicant.status);
    const nextStage = getNextStage(applicant.status);
    const prevStage = getPreviousStage(applicant.status);
    const isTerminated = isEndState(applicant.status);

    const requestStatusChange = (status: OnboardingStatus, requireNote = false) => {
        setPendingAction({ status, requireNote });
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = (note?: string) => {
        if (pendingAction && applicant) {
            onStatusUpdate(applicant.id, pendingAction.status, { notes: note });
        }
        setConfirmDialogOpen(false);
        setPendingAction(null);
    };

    const getDaysAgo = (dateStr: string) => {
        const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                TransitionComponent={Fade}
                transitionDuration={300}
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: 3,
                        maxHeight: '90vh',
                        overflow: 'hidden'
                    },
                    '& .MuiBackdrop-root': {
                        backdropFilter: 'blur(4px)',
                        bgcolor: 'rgba(0,0,0,0.5)'
                    }
                }}
            >
                {/* Header */}
                <Box sx={{
                    p: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'primary.contrastText',
                    position: 'relative'
                }}>
                    {/* Navigation buttons */}
                    {onNavigate && (
                        <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Previous (←)">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={() => onNavigate('prev')}
                                        disabled={!hasPrev}
                                        sx={{ color: 'inherit', opacity: hasPrev ? 1 : 0.3 }}
                                    >
                                        <ArrowBackIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Next (→)">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={() => onNavigate('next')}
                                        disabled={!hasNext}
                                        sx={{ color: 'inherit', opacity: hasNext ? 1 : 0.3 }}
                                    >
                                        <ArrowForwardIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    )}

                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', top: 16, right: 16, color: 'inherit' }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mt: 1 }}>
                        <Avatar
                            src={applicant.avatar}
                            alt={applicant.name}
                            sx={{
                                width: 80,
                                height: 80,
                                border: '3px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            {applicant.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                {applicant.name}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                                {applicant.jobTitle}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <StatusChip status={applicant.status} />
                                {applicant.rating && (
                                    <Chip
                                        icon={<StarIcon sx={{ color: 'warning.main' }} />}
                                        label={applicant.rating.toFixed(1)}
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'inherit' }}
                                    />
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', minHeight: 400 }}>
                        {/* Left Column - Pipeline */}
                        <Box sx={{
                            width: 280,
                            p: 3,
                            borderRight: 1,
                            borderColor: 'divider',
                            bgcolor: 'action.hover'
                        }}>
                            <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                                Onboarding Pipeline
                            </Typography>

                            {!isTerminated ? (
                                <Stepper activeStep={currentStageIndex} orientation="vertical">
                                    {PIPELINE_STAGES.map((label, index) => (
                                        <Step key={label} completed={index < currentStageIndex}>
                                            <StepLabel
                                                sx={{
                                                    '& .MuiStepLabel-label': {
                                                        fontSize: 13,
                                                        fontWeight: index === currentStageIndex ? 600 : 400
                                                    }
                                                }}
                                            >
                                                {label}
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Chip
                                        label={applicant.status}
                                        color={applicant.status === 'Go Live' ? 'success' : 'error'}
                                        sx={{ fontWeight: 600 }}
                                    />
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                        Pipeline Complete
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Right Column - Details */}
                        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
                            <Stack spacing={3}>
                                {/* Contact & Location */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        Contact & Location
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <EmailIcon color="action" fontSize="small" />
                                                <Typography variant="body2">{applicant.email}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <LocationIcon color="action" fontSize="small" />
                                                <Typography variant="body2">
                                                    {applicant.location.city}, {applicant.location.region}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <CountryIcon color="action" fontSize="small" />
                                                <Typography variant="body2">{applicant.location.country}</Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                </Box>

                                {/* Application Details */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                        Application Details
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Stack spacing={1.5}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <CalendarIcon color="action" fontSize="small" />
                                                <Typography variant="body2">
                                                    Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                        ({getDaysAgo(applicant.appliedDate)})
                                                    </Typography>
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <TimeIcon color="action" fontSize="small" />
                                                <Typography variant="body2">
                                                    Last update: {getDaysAgo(applicant.lastStatusChangeDate)}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <WorkIcon color="action" fontSize="small" />
                                                <Typography variant="body2">{applicant.experience || 'Experience not specified'}</Typography>
                                            </Box>
                                            {applicant.rating && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <StarIcon color="action" fontSize="small" />
                                                    <Rating value={applicant.rating} precision={0.5} size="small" readOnly />
                                                    <Typography variant="body2" color="text.secondary">
                                                        ({applicant.rating.toFixed(1)})
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Paper>
                                </Box>

                                {/* Notes */}
                                {applicant.notes && (
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                            Notes
                                        </Typography>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                bgcolor: 'warning.light',
                                                borderColor: 'warning.main',
                                                borderLeftWidth: 4
                                            }}
                                        >
                                            <Typography variant="body2" color="warning.dark">
                                                {applicant.notes}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Box>
                </DialogContent>

                {/* Footer Actions */}
                <Box sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'background.default'
                }}>
                    <Button
                        color="error"
                        variant="text"
                        onClick={() => requestStatusChange('Declined', true)}
                        disabled={applicant.status === 'Declined'}
                    >
                        Decline
                    </Button>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {prevStage && !isTerminated && (
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={() => requestStatusChange(prevStage)}
                            >
                                Back to {prevStage}
                            </Button>
                        )}
                        {!isTerminated && (
                            <Button
                                variant="outlined"
                                onClick={() => requestStatusChange('Under Review')}
                                disabled={applicant.status === 'Under Review'}
                            >
                                Hold Review
                            </Button>
                        )}
                        {nextStage && (
                            <Button
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => requestStatusChange(nextStage)}
                            >
                                Advance to {nextStage}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Dialog>

            <ConfirmationDialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
                onConfirm={handleConfirmAction}
                title={`Move to ${pendingAction?.status}?`}
                description={
                    pendingAction?.status === 'Declined'
                        ? "Are you sure you want to decline this applicant? This action will generate a notification."
                        : `Confirm moving this applicant to ${pendingAction?.status}.`
                }
                confirmLabel="Confirm"
                confirmColor={pendingAction?.status === 'Declined' ? 'error' : 'primary'}
                requireNote={pendingAction?.requireNote}
            />
        </>
    );
}
