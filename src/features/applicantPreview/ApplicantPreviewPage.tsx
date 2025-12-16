import { Box, Typography, Container, Paper, Stepper, Step, StepLabel } from '@mui/material';
import { PIPELINE_STAGES } from '../../utils/statusUtils';
import { Applicant } from '../../types';

// Simplified for preview
export function ApplicantPreviewPage({ applicant }: { applicant: Applicant }) {
    const activeStep = PIPELINE_STAGES.indexOf(applicant.status);

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                    Application Status: {applicant.status}
                </Typography>
                <Typography color="text.secondary" paragraph>
                    Hello {applicant.name}, here is the current status of your application.
                </Typography>

                <Box sx={{ mt: 6, mb: 6 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {PIPELINE_STAGES.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Typography variant="body1">
                    {activeStep === -1 ? 'Your application has been declined.' : 'We will contact you with next steps.'}
                </Typography>
            </Paper>
        </Container>
    );
}
