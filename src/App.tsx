import React, { useState, useEffect } from 'react';
import { ApplicantView } from './components/ApplicantView';
import { ApplicantViewSkeleton } from './components/ApplicantViewSkeleton';
import { ManagerView } from './components/ManagerView';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { TOAST_MESSAGES } from './utils/stageUtils';

import { generateMockApplicants } from './data/mockData';
import type { Applicant, OnboardingStatus } from './types';

export default function App() {
  const [applicants, setApplicants] = useState<Applicant[]>(generateMockApplicants());
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showApplicantView, setShowApplicantView] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [activeTab, setActiveTab] = useState('analytics');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleApplicantSelect = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowApplicantView(true);
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  const updateApplicantStatus = (applicantId: string, newStatus: OnboardingStatus, additionalData?: Partial<Applicant>) => {
    const today = new Date().toISOString().split('T')[0];

    setApplicants(prev => prev.map(app =>
      app.id === applicantId
        ? {
          ...app,
          status: newStatus,
          lastStatusChangeDate: today,
          recentlyChanged: true,
          ...additionalData
        }
        : app
    ));

    const applicant = applicants.find(app => app.id === applicantId);
    if (applicant) {
      // Show appropriate toast message
      if (newStatus === 'Invited to Interview') {
        toast.success(TOAST_MESSAGES.approved(applicant.name).title, {
          description: TOAST_MESSAGES.approved(applicant.name).description
        });
      } else if (newStatus === 'Interview Scheduled') {
        toast.success(TOAST_MESSAGES.interviewScheduled(applicant.name).title, {
          description: TOAST_MESSAGES.interviewScheduled(applicant.name).description
        });
      } else if (newStatus === 'In Training') {
        toast.success(TOAST_MESSAGES.trainingSelected(applicant.name).title, {
          description: TOAST_MESSAGES.trainingSelected(applicant.name).description
        });
      } else if (newStatus === 'Declined') {
        toast.error(TOAST_MESSAGES.declined(applicant.name).title, {
          description: TOAST_MESSAGES.declined(applicant.name).description
        });
      } else {
        toast.info(TOAST_MESSAGES.statusUpdate(applicant.name, newStatus).title, {
          description: TOAST_MESSAGES.statusUpdate(applicant.name, newStatus).description
        });
      }
    }

    // Update selected applicant if it's the one being updated
    if (selectedApplicant?.id === applicantId) {
      const updatedApplicant = {
        ...selectedApplicant,
        status: newStatus,
        lastStatusChangeDate: today,
        recentlyChanged: true,
        ...additionalData
      };
      setSelectedApplicant(updatedApplicant);

      // Ensure applicant view stays visible during status updates
      setShowApplicantView(true);
    }

    // Clear recently changed flag after 5 seconds
    setTimeout(() => {
      setApplicants(prev => prev.map(app =>
        app.id === applicantId
          ? { ...app, recentlyChanged: false }
          : app
      ));

      if (selectedApplicant?.id === applicantId) {
        setSelectedApplicant(prev => prev ? { ...prev, recentlyChanged: false } : null);
      }
    }, 5000);

    // Show notification to applicant for certain status changes
    if (applicantId === selectedApplicant?.id && (newStatus === 'Invited to Interview' || newStatus === 'Invited to Training' || newStatus === 'Go Live')) {
      setNotificationMessage(getNotificationMessage(newStatus));
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }
  };

  const getNotificationMessage = (status: OnboardingStatus): string => {
    switch (status) {
      case 'Invited to Interview':
        return '🎉 Great news! You\'ve been invited to interview. Please select your preferred time slot.';
      case 'Invited to Training':
        return '🎊 Congratulations! You passed the interview. Please choose your training session.';
      case 'Go Live':
        return '🚀 Welcome aboard! You\'re now approved to start working on the platform.';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-md-surface p-4">
      <div className="max-w-[1440px] mx-auto">
        {/* Material 3 Dashboard Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Manager Dashboard - Dynamic width based on activeTab */}
          <div className={activeTab === 'applicants' ? 'xl:col-span-8' : 'xl:col-span-12'}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="md-typescale-headline-small text-md-on-surface mb-2">
                    Manager Dashboard
                  </h2>
                  <p className="md-typescale-body-medium text-md-on-surface-variant">
                    Comprehensive analytics and applicant management
                  </p>
                </div>
                <div className="bg-md-tertiary-container text-md-on-tertiary-container px-4 py-2 rounded-lg">
                  <span className="md-typescale-label-medium">💻 Desktop</span>
                </div>
              </div>
              <ManagerView
                applicants={applicants}
                selectedApplicant={selectedApplicant || applicants[0]}
                onApplicantSelect={handleApplicantSelect}
                onStatusUpdate={updateApplicantStatus}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isDarkMode={isDarkMode}
                onThemeToggle={() => setIsDarkMode(!isDarkMode)}
              />
            </div>
          </div>

          {/* Applicant Mobile View - Only visible when Applicants tab is selected */}
          {activeTab === 'applicants' && (
            <div className="xl:col-span-4">
              <div className="sticky top-4 md-filled-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="md-typescale-headline-small text-md-on-surface mb-2">
                      Applicant View
                    </h2>
                    <p className="md-typescale-body-medium text-md-on-surface-variant">
                      Mobile experience preview
                    </p>
                  </div>
                  <div className="bg-md-info-container text-md-on-info-container px-4 py-2 rounded-lg">
                    <span className="md-typescale-label-medium">📱 Mobile</span>
                  </div>
                </div>
                <div className="max-w-xs mx-auto">
                  {showApplicantView && selectedApplicant ? (
                    <ApplicantView
                      applicant={selectedApplicant}
                      onStatusUpdate={(status, data) => updateApplicantStatus(selectedApplicant.id, status, data)}
                      showNotification={showNotification}
                      notificationMessage={notificationMessage}
                    />
                  ) : (
                    <ApplicantViewSkeleton />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Material 3 Status Timeline Card - Only show when applicant is selected AND on applicants tab */}
        {activeTab === 'applicants' && showApplicantView && selectedApplicant && (
          <div className="mt-8">
            <div className="md-filled-card p-6">
              <h3 className="md-typescale-headline-small text-md-on-surface mb-4">
                Onboarding Timeline for {selectedApplicant.name}
              </h3>
              <p className="md-typescale-body-medium text-md-on-surface-variant mb-6">
                Track progress through each stage of the customer service onboarding process
              </p>
              <div className="flex flex-wrap gap-3">
                {['Applied', 'Invited to Interview', 'Interview Scheduled', 'Invited to Training', 'In Training', 'Go Live'].map((status, index) => (
                  <div
                    key={status}
                    className={`flex items-center px-4 py-3 rounded-lg transition-[background-color,color,box-shadow] duration-200 ease-in-out ${selectedApplicant.status === status
                      ? 'bg-md-primary-container text-md-on-primary-container shadow-md-elevation-1'
                      : 'bg-md-surface-container-high text-md-on-surface-variant hover:bg-md-secondary-container hover:text-md-on-secondary-container'
                      }`}
                  >
                    <span className={`mr-3 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${selectedApplicant.status === status
                      ? 'bg-md-primary text-md-on-primary'
                      : 'bg-md-outline-variant text-md-on-surface-variant'
                      }`}>
                      {index + 1}
                    </span>
                    <span className={selectedApplicant.status === status ? 'md-typescale-label-large' : 'md-typescale-label-medium'}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" richColors />
    </div>
  );
}