export type OnboardingStatus = 
  | 'Applied'
  | 'Invited to Interview' 
  | 'Interview Scheduled'
  | 'Invited to Training'
  | 'In Training'
  | 'Go Live'
  | 'Declined'
  | 'Under Review';

export interface Applicant {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  status: OnboardingStatus;
  appliedDate: string;
  lastStatusChangeDate: string;
  recentlyChanged?: boolean;
  interviewTime?: string;
  trainingSession?: string;
  notes?: string;
  avatar?: string;
  phone?: string;
  experience?: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
}
