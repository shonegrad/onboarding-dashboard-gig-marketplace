import { useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import { AppShell } from './components/layout/AppShell';
import { ApplicantsPage } from './features/applicants/ApplicantsPage';
import { AnalyticsPlaceholderPage } from './features/analytics/AnalyticsPlaceholderPage';
import { generateMockApplicants } from './data/mockData';
import { Applicant, OnboardingStatus } from './types';
import { Toaster, toast } from 'sonner';
// Using sonner for toasts as it's lightweight and easy, if installed. 
// If dependency check fails, I will revert to generic MUI Snackbar or install sonner if it was in package.json (it was!)

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('applicants');
  const [applicants, setApplicants] = useState<Applicant[]>(generateMockApplicants());
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const currentTheme = useMemo(() => theme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);

  const handleStatusUpdate = (applicantId: string, newStatus: OnboardingStatus, additionalData?: Partial<Applicant>) => {
    setApplicants(prev => prev.map(app =>
      app.id === applicantId
        ? { ...app, status: newStatus, lastStatusChangeDate: new Date().toISOString(), ...additionalData }
        : app
    ));

    const appName = applicants.find(a => a.id === applicantId)?.name || 'Applicant';

    // Simple toast logic using Sonner (which was in package.json)
    if (newStatus === 'Declined') {
      toast.error(`Application for ${appName} declined.`);
    } else {
      toast.success(`${appName} moved to ${newStatus}`);
    }

    // Refresh selected applicant if it's the one being updated
    if (selectedApplicant?.id === applicantId) {
      setSelectedApplicant(prev => prev ? { ...prev, status: newStatus, ...additionalData } : null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'applicants':
        return (
          <ApplicantsPage
            applicants={applicants}
            selectedApplicant={selectedApplicant}
            onApplicantSelect={(app) => setSelectedApplicant(app)}
            // Fix: ApplicantsPage handles null via hack currently, but better to update ApplicantsPage types. 
            // Actually I will pass a wrapper to onApplicantSelect in ApplicantsPage
            onStatusUpdate={handleStatusUpdate}
          />
        );
      case 'analytics':
        return <AnalyticsPlaceholderPage />;
      default:
        return (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            Feature {activeTab} coming soon.
          </Box>
        );
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AppShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      >
        {renderContent()}
      </AppShell>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} />
    </ThemeProvider>
  );
}