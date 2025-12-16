import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, Clock, BookOpen, Rocket, Wifi, Battery, Signal, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusColor, getAvatarSrc, TOAST_MESSAGES } from '../utils/stageUtils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { Applicant, OnboardingStatus } from '../types';

interface ApplicantViewProps {
  applicant: Applicant;
  onStatusUpdate: (status: OnboardingStatus, additionalData?: Partial<Applicant>) => void;
  showNotification: boolean;
  notificationMessage: string;
}

export function ApplicantView({ applicant, onStatusUpdate, showNotification, notificationMessage }: ApplicantViewProps) {
  const [selectedInterviewTime, setSelectedInterviewTime] = useState<string>('');
  const [selectedTrainingSession, setSelectedTrainingSession] = useState<string>('');
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  const interviewTimes = [
    'Monday, Aug 19 at 10:00 AM',
    'Tuesday, Aug 20 at 2:00 PM',
    'Wednesday, Aug 21 at 11:00 AM',
    'Thursday, Aug 22 at 1:00 PM',
    'Friday, Aug 23 at 9:00 AM'
  ];

  const trainingSessions = [
    'Customer Service Fundamentals: Aug 26-27',
    'Technical Support Basics: Aug 28-29',
    'CX Excellence Program: Sep 2-3',
    'Data Entry & CRM Training: Sep 5-6'
  ];

  const handleInterviewTimeSelection = (time: string) => {
    setSelectedInterviewTime(time);
    onStatusUpdate('Interview Scheduled', { interviewTime: time });
    toast.success(TOAST_MESSAGES.interviewScheduled(applicant.name.split(' ')[0]).title, {
      description: TOAST_MESSAGES.interviewScheduled(applicant.name.split(' ')[0]).description
    });
  };

  const handleTrainingSelection = (session: string) => {
    setSelectedTrainingSession(session);
    onStatusUpdate('In Training', { trainingSession: session });
    toast.success(TOAST_MESSAGES.trainingSelected(applicant.name.split(' ')[0]).title, {
      description: TOAST_MESSAGES.trainingSelected(applicant.name.split(' ')[0]).description
    });
  };

  const getStatusIcon = (status: OnboardingStatus) => {
    switch (status) {
      case 'Applied':
        return <Clock className="w-4 h-4" style={{ color: getStatusColor(status) }} />;
      case 'Invited to Interview':
      case 'Interview Scheduled':
        return <CheckCircle className="w-4 h-4" style={{ color: getStatusColor(status) }} />;
      case 'Invited to Training':
      case 'In Training':
        return <BookOpen className="w-4 h-4" style={{ color: getStatusColor(status) }} />;
      case 'Go Live':
        return <Rocket className="w-4 h-4" style={{ color: getStatusColor(status) }} />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadgeStyle = (status: OnboardingStatus) => {
    const colors = {
      bg: getStatusColor(status, 'bg'),
      text: getStatusColor(status, 'text')
    };
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${getStatusColor(status, 'light')}`
    };
  };

  return (
    <div className="w-full max-w-xs mx-auto bg-purple-800 rounded-[2.5rem] p-2 shadow-2xl">
      {/* Phone Frame - Fixed Height with Scrollbar */}
      <div className="bg-white rounded-[2.25rem] p-4 h-[640px] relative overflow-hidden">
        {/* Dynamic Island/Notch */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>

        {/* Status Bar */}
        <div className="flex justify-between items-center text-gray-900 text-sm mb-6 pt-4">
          <div className="flex items-center gap-1">
            <span className="font-medium">9:41</span>
          </div>
          <div className="flex items-center gap-1">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
            <span className="text-xs">100%</span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(100%-100px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Notification Toast */}
          {showNotification && (
            <Alert className="mb-4 border-blue-200 bg-blue-50 rounded-lg animate-in fade-in-0 slide-in-from-top-4 duration-300 ease-out">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="text-sm text-blue-800">
                {notificationMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Header with Material Design */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="w-20 h-20 shadow-md-elevation-1">
                  <AvatarImage src={getAvatarSrc(applicant)} alt={applicant.name} />
                  <AvatarFallback className="text-lg bg-md-primary-container text-md-on-primary-container">
                    {applicant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <h2 className="md-typescale-headline-small text-md-on-surface mb-1">
              Hi {applicant.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-md-on-surface-variant md-typescale-body-medium">{applicant.jobTitle} Application</p>
          </div>

          {/* Status Badge - Simplified */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowStatusDetails(!showStatusDetails)}
              className="w-full flex items-center justify-between p-4 h-auto rounded-lg shadow-md-elevation-1 transition-[background-color,border-color,box-shadow] duration-200 ease-in-out"
              style={getBadgeStyle(applicant.status)}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(applicant.status)}
                <span className="md-typescale-title-medium">{applicant.status}</span>
              </div>
              {showStatusDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {/* Expandable Status Details */}
            {showStatusDetails && (
              <Card className="mt-3 rounded-lg shadow-md-elevation-1 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <CardContent className="p-4">
                  <p className="text-md-on-surface-variant md-typescale-body-small mb-2">
                    Applied on {new Date(applicant.appliedDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                  <p className="text-md-on-surface-variant md-typescale-body-small">
                    Last updated {new Date(applicant.lastStatusChangeDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Section with Material Cards */}
          <div className="space-y-4 pb-4">
            {applicant.status === 'Applied' && (
              <Card className="rounded-lg shadow-md-elevation-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-300" style={{ backgroundColor: getStatusColor('Applied', 'bg') }}>
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: getStatusColor('Applied') }}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="md-typescale-title-medium mb-2" style={{ color: getStatusColor('Applied', 'dark') }}>Under Review</h3>
                  <p className="md-typescale-body-small leading-relaxed" style={{ color: getStatusColor('Applied', 'text') }}>
                    Your application is being carefully reviewed by our hiring team. We'll update you soon with next steps!
                  </p>
                </CardContent>
              </Card>
            )}

            {applicant.status === 'Invited to Interview' && (
              <Card className="rounded-lg shadow-md-elevation-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                <CardHeader>
                  <CardTitle className="md-typescale-title-medium">Choose Interview Time</CardTitle>
                  <p className="md-typescale-body-small text-md-on-surface-variant">Select your preferred slot for {applicant.jobTitle}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {interviewTimes.map((time, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleInterviewTimeSelection(time)}
                      className="w-full text-left justify-start h-auto py-3 rounded-lg shadow-md-elevation-1 hover:shadow-md-elevation-2 transition-[box-shadow,border-color,background-color] duration-200 ease-in-out"
                    >
                      <div className="text-left">
                        <div className="md-typescale-label-large">{time.split(' at ')[0]}</div>
                        <div className="md-typescale-body-small text-md-on-surface-variant">{time.split(' at ')[1]}</div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}

            {applicant.status === 'Interview Scheduled' && (
              <Card className="rounded-lg shadow-md-elevation-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-300" style={{ backgroundColor: getStatusColor('Interview Scheduled', 'bg') }}>
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: getStatusColor('Interview Scheduled') }}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="md-typescale-title-medium mb-2" style={{ color: getStatusColor('Interview Scheduled', 'dark') }}>Interview Confirmed</h3>
                  <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: getStatusColor('Interview Scheduled', 'light') + '40' }}>
                    <p className="md-typescale-label-large" style={{ color: getStatusColor('Interview Scheduled', 'dark') }}>
                      {applicant.interviewTime}
                    </p>
                  </div>
                  <div className="bg-md-surface-container rounded-lg p-3">
                    <p className="md-typescale-body-small text-md-on-surface">
                      📹 You'll receive a video call link 30 minutes before your interview. Prepare for customer service scenarios and role-specific questions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {applicant.status === 'Invited to Training' && (
              <div>
                <div className="mb-4">
                  <h3 className="md-typescale-title-medium text-md-on-surface mb-1">Select Training Program</h3>
                  <p className="md-typescale-body-small text-md-on-surface-variant">Choose your preferred training session</p>
                </div>
                <div className="space-y-3">
                  {trainingSessions.map((session, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleTrainingSelection(session)}
                      className="w-full text-left justify-start h-auto py-3 rounded-lg shadow-md-elevation-1 hover:shadow-md-elevation-2 transition-[box-shadow,border-color,background-color] duration-200 ease-in-out"
                    >
                      <div className="text-left">
                        <div className="md-typescale-label-large">{session.split(':')[0]}</div>
                        <div className="md-typescale-body-small text-md-on-surface-variant">{session.split(':')[1]}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {applicant.status === 'In Training' && (
              <Card className="rounded-lg shadow-md-elevation-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-300" style={{ backgroundColor: getStatusColor('In Training', 'bg') }}>
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: getStatusColor('In Training') }}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="md-typescale-title-medium mb-2" style={{ color: getStatusColor('In Training', 'dark') }}>Training Active</h3>
                  <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: getStatusColor('In Training', 'light') + '40' }}>
                    <p className="md-typescale-label-large" style={{ color: getStatusColor('In Training', 'dark') }}>
                      {applicant.trainingSession}
                    </p>
                  </div>
                  <div className="bg-md-surface-container rounded-lg p-3">
                    <p className="md-typescale-body-small text-md-on-surface">
                      📚 Complete all modules covering customer service best practices, communication skills, and system training. Pass the final assessment to proceed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {applicant.status === 'Go Live' && (
              <Card className="rounded-lg shadow-md-elevation-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-300" style={{ backgroundColor: getStatusColor('Go Live', 'bg') }}>
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: getStatusColor('Go Live') }}>
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="md-typescale-title-medium mb-2" style={{ color: getStatusColor('Go Live', 'dark') }}>Welcome Aboard! 🎉</h3>
                  <p className="md-typescale-body-small mb-4" style={{ color: getStatusColor('Go Live', 'text') }}>
                    You're now approved to start working as a {applicant.jobTitle.toLowerCase()} on our platform.
                  </p>
                  <Button
                    className="w-full rounded-lg shadow-md-elevation-2 transition-[box-shadow,transform] duration-200 ease-in-out hover:scale-[1.02]"
                    style={{ backgroundColor: getStatusColor('Go Live'), color: 'white' }}
                  >
                    Start Working
                  </Button>
                </CardContent>
              </Card>
            )}

            {applicant.status === 'Declined' && (
              <Card className="rounded-lg shadow-md-elevation-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-300" style={{ backgroundColor: getStatusColor('Declined', 'bg') }}>
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: getStatusColor('Declined') }}>
                    <span className="text-white text-lg">✕</span>
                  </div>
                  <h3 className="md-typescale-title-medium mb-2" style={{ color: getStatusColor('Declined', 'dark') }}>Application Status</h3>
                  <p className="md-typescale-body-small" style={{ color: getStatusColor('Declined', 'text') }}>
                    Thank you for your interest in the {applicant.jobTitle.toLowerCase()} position. Unfortunately, we cannot move forward with your application at this time.
                  </p>
                </CardContent>
              </Card>
            )}

            {applicant.status === 'Under Review' && (
              <Card className="rounded-lg shadow-md-elevation-1 animate-in fade-in-0 slide-in-from-bottom-4 duration-300" style={{ backgroundColor: getStatusColor('Under Review', 'bg') }}>
                <CardContent className="p-5 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: getStatusColor('Under Review') }}>
                    <span className="text-white text-lg">⏳</span>
                  </div>
                  <h3 className="md-typescale-title-medium mb-2" style={{ color: getStatusColor('Under Review', 'dark') }}>Additional Review</h3>
                  <p className="md-typescale-body-small" style={{ color: getStatusColor('Under Review', 'text') }}>
                    Your application requires additional review by our hiring team. We'll update you as soon as possible.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}