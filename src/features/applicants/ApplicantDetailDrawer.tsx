import { useState } from 'react';
import {
    Drawer,
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
    List,
    ListItem,
    ListItemText,
    Chip,
    Paper,
} from '@mui/material';
import {
    Close as CloseIcon,
    Check as CheckIcon,
    Block as BlockIcon,
    ArrowForward as ArrowForwardIcon,
    Event as CalendarIcon,
    LocationOn as LocationIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
import { Applicant, OnboardingStatus } from '../../types';
import { PIPELINE_STAGES, STATUS_CONFIG, getNextStage, isEndState } from '../../utils/statusUtils';
import { StatusChip } from '../../components/common/StatusChip';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';

const drawerWidth = 600;

interface ApplicantDetailDrawerProps {
    applicant: Applicant | null;
    open: boolean;
    onClose: () => void;
    onStatusUpdate: (id: string, stage: OnboardingStatus, data?: any) => void;
}

export function ApplicantDetailDrawer({ applicant, open, onClose, onStatusUpdate }: ApplicantDetailDrawerProps) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ status: OnboardingStatus; requireNote: boolean } | null>(null);

    if (!applicant) return null;

    const currentStageIndex = PIPELINE_STAGES.indexOf(applicant.status);
    const nextStage = getNextStage(applicant.status);
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

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                sx={{
                    '& .MuiDrawer-paper': { width: { xs: '100%', sm: drawerWidth }, p: 0 },
                }}
            >
                {/* Header */}
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar
                            src={applicant.avatar}
                            alt={applicant.name}
                            sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}
                        >
                            {applicant.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" fontWeight="bold">
                                {applicant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {applicant.jobTitle}
                            </Typography>
                            <StatusChip status={applicant.status} />
                        </Box>
                    </Box>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ overflowY: 'auto', flexGrow: 1, pb: 10 }}>
                    {/* Pipeline Stepper */}
                    {!isTerminated && (
                        <Box sx={{ p: 4, bgcolor: 'background.paper' }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
                                Onboarding Pipeline
                            </Typography>
                            <Stepper activeStep={currentStageIndex} orientation="vertical" sx={{}}>
                                {PIPELINE_STAGES.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    )}

                    <Divider />

                    {/* Details Section */}
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <Box>
                            <Typography variant="h6" gutterBottom fontWeight="600">
                                Contact & Location
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailIcon color="action" fontSize="small" />
                                        <Typography variant="body2">{applicant.email}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationIcon color="action" fontSize="small" />
                                        <Typography variant="body2">{applicant.location.city}, {applicant.location.region}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarIcon color="action" fontSize="small" />
                                        <Typography variant="body2">Applied on {new Date(applicant.appliedDate).toLocaleDateString()}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Box>

                        {applicant.notes && (
                            <Box>
                                <Typography variant="h6" gutterBottom fontWeight="600">
                                    Latest Note
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.light', borderColor: 'warning.main', color: 'warning.dark' }}>
                                    <Typography variant="body2">{applicant.notes}</Typography>
                                </Paper>
                            </Box>
                        )}

                    </Box>
                </Box>

                {/* Footer Actions */}
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 10
                    }}
                >
                    <Button color="error" variant="text" onClick={() => requestStatusChange('Declined', true)}>
                        Decline Application
                    </Button>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {!isTerminated && (
                            <Button variant="outlined" onClick={() => requestStatusChange('Under Review')}>
                                Hold Review
                            </Button>
                        )}
                        {nextStage ? (
                            <Button
                                variant="contained"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() => requestStatusChange(nextStage)}
                            >
                                Move to {nextStage}
                            </Button>
                        ) : (
                            !isTerminated && (
                                <Button variant="contained" disabled>
                                    Processing Complete
                                </Button>
                            )
                        )}
                    </Box>
                </Paper>
            </Drawer>

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
                confirmLabel="Confirm Move"
                confirmColor={pendingAction?.status === 'Declined' ? 'error' : 'primary'}
                requireNote={pendingAction?.requireNote}
            />
        </>
    );
}
