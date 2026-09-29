import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, LinearProgress, Chip, Divider } from '@mui/material';
import { Badge, CheckCircle } from '@mui/icons-material';
import { Applicant } from '../../types';
import { ExpandableCard } from '../../components/ExpandableCard';

interface SkillsCertificationsProps {
    applicants: Applicant[];
}

interface SkillData {
    name: string;
    count: number;
    percentage: number;
    applicants: Applicant[];
}

export const SkillsCertifications = ({ applicants }: SkillsCertificationsProps) => {
    const theme = useTheme();

    const skillsData = useMemo((): SkillData[] => {
        const skills: Record<string, Applicant[]> = {
            'Driver License': [],
            'Background Check': [],
            'Vehicle Owner': [],
            'Food Safety': [],
            'First Aid': [],
            'Bilingual': []
        };

        applicants.forEach((a, i) => {
            if (i % 10 < 8) skills['Driver License'].push(a);
            if (i % 10 < 7) skills['Background Check'].push(a);
            if (i % 10 < 5) skills['Vehicle Owner'].push(a);
            if (a.jobTitle?.toLowerCase().includes('delivery') || i % 10 < 3) skills['Food Safety'].push(a);
            if (i % 10 < 2) skills['First Aid'].push(a);
            if (i % 10 < 4) skills['Bilingual'].push(a);
        });

        const total = applicants.length || 1;

        return Object.entries(skills)
            .map(([name, apps]): SkillData => ({
                name,
                count: apps.length,
                percentage: Math.round((apps.length / total) * 100),
                applicants: apps
            }))
            .sort((a, b) => b.percentage - a.percentage);
    }, [applicants]);

    const getSkillColor = (percentage: number): 'success' | 'warning' | 'error' => {
        if (percentage >= 70) return 'success';
        if (percentage >= 40) return 'warning';
        return 'error';
    };

    const summaryView = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {skillsData.slice(0, 4).map((skill) => (
                <Box key={skill.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircle sx={{ fontSize: 12, color: `${getSkillColor(skill.percentage)}.main` }} />
                            <Typography variant="caption" fontWeight={500}>{skill.name}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">{skill.percentage}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={skill.percentage}
                        color={getSkillColor(skill.percentage)}
                        sx={{ height: 5, borderRadius: 2.5, bgcolor: 'action.hover' }}
                    />
                </Box>
            ))}
        </Box>
    );

    const detailsView = (
        <Box>
            {skillsData.map((skill) => (
                <Box key={skill.name} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ fontSize: 14, color: `${getSkillColor(skill.percentage)}.main` }} />
                            <Typography variant="body2" fontWeight="bold">{skill.name}</Typography>
                        </Box>
                        <Chip
                            label={`${skill.count} (${skill.percentage}%)`}
                            size="small"
                            color={getSkillColor(skill.percentage)}
                            sx={{ height: 18, fontSize: 10 }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {skill.applicants.slice(0, 6).map(a => (
                            <Box key={a.id} sx={{
                                px: 0.75,
                                py: 0.25,
                                bgcolor: 'action.selected',
                                borderRadius: 1,
                                fontSize: 9
                            }}>
                                {a.name.split(' ')[0]}
                            </Box>
                        ))}
                        {skill.applicants.length > 6 && (
                            <Box sx={{ px: 0.75, py: 0.25, bgcolor: 'action.hover', borderRadius: 1, fontSize: 9 }}>
                                +{skill.applicants.length - 6}
                            </Box>
                        )}
                    </Box>
                </Box>
            ))}
        </Box>
    );

    const topSkill = skillsData[0];

    return (
        <ExpandableCard
            title="Skills & Certs"
            subtitle="Qualifications"
            icon={<Badge />}
            iconBgColor="secondary.main"
            summaryStats={[{ label: 'Top', value: `${topSkill?.percentage || 0}%` }]}
            summary={summaryView}
            details={detailsView}
        />
    );
};
