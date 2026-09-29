import { useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { theme } from './theme/theme';
import { AppShell } from './components/layout/AppShell';
import { ApplicantsPage } from './features/applicants/ApplicantsPage';
import { AnalyticsDashboard } from './features/analytics/AnalyticsDashboard';
import { MapOverviewPage } from './features/map/MapOverviewPage';
import { ActivityFeedPlaceholderPage } from './features/feed/ActivityFeedPlaceholderPage';
import { generateMockApplicants } from './data/mockData';
import { Applicant, OnboardingStatus } from './types';
import { Toaster, toast } from 'sonner';
import { DateRangePreset } from './features/analytics/DateRangeFilter';

export interface FilterState {
  dateRange: DateRangePreset;
  selectedCountry: string | null;
  selectedStage: string | null;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [applicants, setApplicants] = useState<Applicant[]>(generateMockApplicants());
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Global filter state for analytics
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30d',
    selectedCountry: null,
    selectedStage: null
  });

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const currentTheme = useMemo(() => theme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusUpdate = (applicantId: string, newStatus: OnboardingStatus, additionalData?: Partial<Applicant>) => {
    setApplicants(prev => prev.map(app =>
      app.id === applicantId
        ? { ...app, status: newStatus, lastStatusChangeDate: new Date().toISOString(), ...additionalData }
        : app
    ));

    const appName = applicants.find(a => a.id === applicantId)?.name || 'Applicant';

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

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters(prev => ({ ...prev, selectedCountry: null, selectedStage: null }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'applicants':
        return (
          <ApplicantsPage
            applicants={applicants}
            loading={isLoading}
            selectedApplicant={selectedApplicant}
            onApplicantSelect={(app) => setSelectedApplicant(app)}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard
            applicants={applicants}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        );
      case 'map':
        return <MapOverviewPage applicants={applicants} />;
      case 'feed':
        return <ActivityFeedPlaceholderPage />;
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
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        showFilters={activeTab === 'analytics'}
      >
        {renderContent()}
      </AppShell>

      {/* Toast notifications */}
      <Toaster richColors position="bottom-right" theme={isDarkMode ? 'dark' : 'light'} />
    </ThemeProvider>
  );
}