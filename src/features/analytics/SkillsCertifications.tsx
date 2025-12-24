import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Paper, LinearProgress, Chip } from '@mui/material';
import { Badge, CheckCircle } from '@mui/icons-material';
import { Applicant } from '../../types';

interface SkillsCertificationsProps {
    applicants: Applicant[];
}

interface SkillData {
    name: string;
    count: number;
    percentage: number;
}

export const SkillsCertifications = ({ applicants }: SkillsCertificationsProps) => {
    const theme = useTheme();

    const skillsData = useMemo(() => {
        // Common gig economy skills
        const skills: Record<string, number> = {
            'Driver License': 0,
            'Background Check': 0,
            'Vehicle Owner': 0,
            'Food Safety': 0,
            'First Aid': 0,
            'Bilingual': 0
        };

        // Simulate skill distribution based on applicant data
        applicants.forEach((a, i) => {
            // Most have driver license
            if (i % 10 < 8) skills['Driver License']++;
            // Many have background check
            if (i % 10 < 7) skills['Background Check']++;
            // Some have vehicle
            if (i % 10 < 5) skills['Vehicle Owner']++;
            // Food delivery related
            if (a.jobTitle?.toLowerCase().includes('delivery') || i % 10 < 3) skills['Food Safety']++;
            // First aid
            if (i % 10 < 2) skills['First Aid']++;
            // Bilingual
            if (i % 10 < 4) skills['Bilingual']++;
        });

        const total = applicants.length || 1;

        return Object.entries(skills)
            .map(([name, count]): SkillData => ({
                name,
                count,
                percentage: Math.round((count / total) * 100)
            }))
            .sort((a, b) => b.percentage - a.percentage);
    }, [applicants]);

    const getSkillColor = (percentage: number) => {
        if (percentage >= 70) return 'success';
        if (percentage >= 40) return 'warning';
        return 'error';
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                height: '100%',
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: 4 }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'secondary.contrastText'
                }}>
                    <Badge fontSize="small" />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                        Skills & Certifications
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Applicant qualifications
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {skillsData.map((skill) => (
                    <Box key={skill.name}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CheckCircle sx={{ fontSize: 14, color: `${getSkillColor(skill.percentage)}.main` }} />
                                <Typography variant="body2" fontWeight={500}>
                                    {skill.name}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {skill.count} ({skill.percentage}%)
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={skill.percentage}
                            color={getSkillColor(skill.percentage)}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'action.hover'
                            }}
                        />
                    </Box>
                ))}
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    Most Valuable Skills
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {skillsData.slice(0, 3).map((skill) => (
                        <Chip
                            key={skill.name}
                            label={skill.name}
                            size="small"
                            color={getSkillColor(skill.percentage)}
                            variant="outlined"
                            sx={{ fontSize: 10 }}
                        />
                    ))}
                </Box>
            </Box>
        </Paper>
    );
};
