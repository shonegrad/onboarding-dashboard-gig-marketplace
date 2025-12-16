import React, { useState, useMemo, Suspense, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent } from './ui/tabs';
import { Switch } from './ui/switch';
import {
  Activity,
  Users,
  MapPin,
  Filter,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Download,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Globe,
  AlertCircle,
  Clock,
  TrendingUp,
  Target,
  AlertTriangle,
  Eye,
  Phone,
  Mail,
  Sparkles,
  Info,
  MessageSquare,
  UserPlus,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';
import { toast } from 'sonner';
import { getStatusColor, getAvatarSrc, TOAST_MESSAGES, splitStatusForBadge } from '../utils/stageUtils';
import { Sidebar } from './Sidebar';
import type { Applicant, OnboardingStatus } from '../types';

// Lazy load heavy chart components
const GeoMapView = React.lazy(() => import('./GeoMapView').then(m => ({ default: m.GeoMapView })));
const SankeyChart = React.lazy(() => import('./SankeyChart').then(m => ({ default: m.SankeyChart })));
const D3BarChart = React.lazy(() => import('./charts/D3BarChart').then(m => ({ default: m.D3BarChart })));
const D3Histogram = React.lazy(() => import('./charts/D3Histogram').then(m => ({ default: m.D3Histogram })));
const D3WorkforceChart = React.lazy(() => import('./charts/D3WorkforceChart').then(m => ({ default: m.D3WorkforceChart })));
const D3PipelineChart = React.lazy(() => import('./charts/D3PipelineChart').then(m => ({ default: m.D3PipelineChart })));
const D3ConversionChart = React.lazy(() => import('./charts/D3ConversionChart').then(m => ({ default: m.D3ConversionChart })));

interface ManagerViewProps {
  applicants: Applicant[];
  selectedApplicant: Applicant;
  onApplicantSelect: (applicant: Applicant) => void;
  onStatusUpdate: (applicantId: string, status: OnboardingStatus, additionalData?: Partial<Applicant>) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

// Feed event types for the activity feed
interface FeedEvent {
  id: string;
  type: 'status_change' | 'new_applicant' | 'went_live' | 'workforce_alert' | 'interview_scheduled' | 'training_completed';
  timestamp: string;
  applicantName?: string;
  applicantId?: string;
  fromStatus?: OnboardingStatus;
  toStatus?: OnboardingStatus;
  message: string;
  icon: React.ReactNode;
  color: string;
}

export function ManagerView({ applicants, selectedApplicant, onApplicantSelect, onStatusUpdate, activeTab, onTabChange, isDarkMode, onThemeToggle }: ManagerViewProps) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'velocity' | 'conversion' | 'sankey'>('bar');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobTitleFilter, setJobTitleFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'status' | 'location'>('date-desc');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [declineReason, setDeclineReason] = useState('');
  const [markAsFraud, setMarkAsFraud] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Toggle card expansion - memoized to prevent re-renders
  const toggleCardExpansion = useCallback((applicantId: string) => {
    setExpandedCards(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(applicantId)) {
        newExpanded.delete(applicantId);
      } else {
        newExpanded.add(applicantId);
      }
      return newExpanded;
    });

    // Set as selected when expanding
    const applicant = applicants.find(app => app.id === applicantId);
    if (applicant) {
      onApplicantSelect(applicant);
      if (!notes[applicantId]) {
        setNotes(prev => ({ ...prev, [applicantId]: applicant.notes || '' }));
      }
    }
  }, [applicants, onApplicantSelect, notes]);

  // Generate feed events
  const generateFeedEvents = (): FeedEvent[] => {
    const events: FeedEvent[] = [];
    let eventId = 1;

    // Add status change events for recent applicants
    applicants.forEach(applicant => {
      const daysSinceChange = Math.floor((new Date().getTime() - new Date(applicant.lastStatusChangeDate).getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceChange <= 7) { // Last 7 days
        events.push({
          id: `status-${eventId++}`,
          type: 'status_change',
          timestamp: applicant.lastStatusChangeDate,
          applicantName: applicant.name,
          applicantId: applicant.id,
          toStatus: applicant.status,
          message: `${applicant.name} moved to "${applicant.status}"`,
          icon: <Activity className="w-4 h-4" />,
          color: getStatusColor(applicant.status)
        });
      }

      // Add application events
      const daysSinceApplied = Math.floor((new Date().getTime() - new Date(applicant.appliedDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceApplied <= 14) { // Last 14 days
        events.push({
          id: `new-${eventId++}`,
          type: 'new_applicant',
          timestamp: applicant.appliedDate,
          applicantName: applicant.name,
          applicantId: applicant.id,
          message: `New application: ${applicant.name} applied for ${applicant.jobTitle}`,
          icon: <UserPlus className="w-4 h-4" />,
          color: getStatusColor('Applied')
        });
      }

      // Add go live events
      if (applicant.status === 'Go Live' && daysSinceChange <= 14) {
        events.push({
          id: `live-${eventId++}`,
          type: 'went_live',
          timestamp: applicant.lastStatusChangeDate,
          applicantName: applicant.name,
          applicantId: applicant.id,
          message: `🎉 ${applicant.name} is now live and working!`,
          icon: <UserCheck className="w-4 h-4" />,
          color: getStatusColor('Go Live')
        });
      }
    });

    // Add workforce alerts
    const workforceEvents = [
      {
        id: `alert-${eventId++}`,
        type: 'workforce_alert' as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString().split('T')[0], // 6 hours ago
        message: 'Workforce target achieved - 1200 workers active',
        icon: <Target className="w-4 h-4" />,
        color: getStatusColor('Go Live')
      },
      {
        id: `alert-${eventId++}`,
        type: 'workforce_alert' as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], // 2 days ago
        message: 'Worker shortage detected - 45 workers below target',
        icon: <AlertCircle className="w-4 h-4" />,
        color: getStatusColor('Declined')
      }
    ];

    events.push(...workforceEvents);

    // Sort by timestamp descending (most recent first)
    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const feedEvents = generateFeedEvents();

  // Analytics data preparation
  const statusCounts = applicants.reduce((acc, applicant) => {
    acc[applicant.status] = (acc[applicant.status] || 0) + 1;
    return acc;
  }, {} as Record<OnboardingStatus, number>);

  // Today's applications
  const today = new Date().toISOString().split('T')[0];
  const todaysApplications = applicants.filter(app => app.appliedDate === today);

  // Calculate stage data for charts with compound bars
  const totalApplied = applicants.length;
  const screened = Math.floor(totalApplied * 0.8);
  const interviewed = (statusCounts['Invited to Interview'] || 0) + (statusCounts['Interview Scheduled'] || 0) +
    (statusCounts['Invited to Training'] || 0) + (statusCounts['In Training'] || 0) + (statusCounts['Go Live'] || 0);
  const inTraining = (statusCounts['Invited to Training'] || 0) + (statusCounts['In Training'] || 0) + (statusCounts['Go Live'] || 0);
  const active = statusCounts['Go Live'] || 0;
  const declined = statusCounts['Declined'] || 0;

  // Compound bar chart data - showing progression splits with consistent colors
  const stageData = [
    {
      stage: 'Applied',
      current: totalApplied - screened,
      progressed: screened,
      total: totalApplied,
      color: getStatusColor('Applied'),
      progressColor: getStatusColor('Applied', 'light'),
      percentage: 100
    },
    {
      stage: 'Screened',
      current: screened - interviewed,
      progressed: interviewed,
      total: screened,
      color: getStatusColor('Under Review'),
      progressColor: getStatusColor('Under Review', 'light'),
      percentage: Math.round((screened / totalApplied) * 100)
    },
    {
      stage: 'Interview',
      current: interviewed - inTraining,
      progressed: inTraining,
      total: interviewed,
      color: getStatusColor('Interview Scheduled'),
      progressColor: getStatusColor('Interview Scheduled', 'light'),
      percentage: Math.round((interviewed / totalApplied) * 100)
    },
    {
      stage: 'Training',
      current: inTraining - active,
      progressed: active,
      total: inTraining,
      color: getStatusColor('In Training'),
      progressColor: getStatusColor('In Training', 'light'),
      percentage: Math.round((inTraining / totalApplied) * 100)
    },
    {
      stage: 'Active',
      current: active,
      progressed: 0,
      total: active,
      color: getStatusColor('Go Live'),
      progressColor: getStatusColor('Go Live', 'light'),
      percentage: Math.round((active / totalApplied) * 100)
    }
  ];

  // ENHANCED daily trend data with 30 days of data and more comprehensive metrics
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const WORKERS_NEEDED = 1200;
  const HISTORICAL_WORKERS_BASE = 1050;

  const trendData = last30Days.map((date, index) => {
    const dayApplicants = applicants.filter(app => app.appliedDate === date);
    const newWorkers = dayApplicants.filter(app => app.status === 'Go Live').length;

    // More realistic workforce progression
    const totalWorkers = HISTORICAL_WORKERS_BASE +
      Math.floor(index * 4.2) + // Steady growth over time
      applicants.filter(app =>
        new Date(app.appliedDate) <= new Date(date) && app.status === 'Go Live'
      ).length;

    // Enhanced seasonal and weekly variations
    const weeklyPattern = Math.sin((index * 2 * Math.PI) / 7) * 25; // Weekly cycle
    const monthlyTrend = Math.sin((index * 2 * Math.PI) / 30) * 40; // Monthly cycle
    const randomVariation = (Math.random() - 0.5) * 15;
    const workersNeeded = WORKERS_NEEDED + weeklyPattern + monthlyTrend + randomVariation;

    const gap = Math.round(workersNeeded) - totalWorkers;

    // Enhanced pipeline data
    const interviews = Math.floor(Math.random() * 8) + 2;
    const screenings = Math.floor(Math.random() * 12) + 5;
    const trainingCompletions = Math.floor(Math.random() * 6) + 1;
    const totalApplications = dayApplicants.length + Math.floor(Math.random() * 8);

    // Performance metrics
    const avgTimeToHire = 8 + Math.floor(Math.random() * 8); // 8-16 days
    const interviewSuccessRate = 65 + Math.floor(Math.random() * 25); // 65-90%
    const trainingSuccessRate = 75 + Math.floor(Math.random() * 20); // 75-95%

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date,
      // Core workforce metrics
      applications: totalApplications,
      totalWorkers: totalWorkers,
      workersNeeded: Math.round(workersNeeded),
      gap: gap,
      newHires: newWorkers,

      // Enhanced pipeline data
      screenings: screenings,
      interviews: interviews,
      trainingCompletions: trainingCompletions,
      declined: Math.floor(Math.random() * 4) + 1,

      // Performance indicators
      avgTimeToHire: avgTimeToHire,
      interviewSuccessRate: interviewSuccessRate,
      trainingSuccessRate: trainingSuccessRate,

      // Weekly and monthly aggregations
      weeklyApplications: totalApplications * 7,
      monthlyHires: newWorkers * 30,

      // Capacity utilization
      capacityUtilization: Math.min(100, Math.round((totalWorkers / workersNeeded) * 100)),

      // Quality metrics
      retentionRate: 85 + Math.floor(Math.random() * 12), // 85-97%
      satisfactionScore: 4.1 + (Math.random() * 0.8), // 4.1-4.9
    };
  });

  // Calculate Hiring Velocity (Days to Hire distribution)
  const velocityData = useMemo(() => {
    const hiredApplicants = applicants.filter(app => app.status === 'Go Live');
    const bins = {
      '0-7 days': 0,
      '8-14 days': 0,
      '15-21 days': 0,
      '22-30 days': 0,
      '30+ days': 0
    };

    hiredApplicants.forEach(app => {
      // Calculate days to hire using appliedDate and lastStatusChangeDate
      // For mock data purposes, we'll approximate this if exact transition dates aren't tracked historically
      const applied = new Date(app.appliedDate);
      const hired = new Date(app.lastStatusChangeDate);
      const diffTime = Math.abs(hired.getTime() - applied.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days <= 7) bins['0-7 days']++;
      else if (days <= 14) bins['8-14 days']++;
      else if (days <= 21) bins['15-21 days']++;
      else if (days <= 30) bins['22-30 days']++;
      else bins['30+ days']++;
    });

    return Object.entries(bins).map(([range, count]) => ({
      range,
      count,
      color: getStatusColor('Go Live')
    }));
  }, [applicants]);

  // Calculate Conversion Trends
  const conversionData = useMemo(() => {
    // Generate weekly conversion data based on mock applied dates
    // Group by week
    const weeks: Record<string, { applied: number, hired: number }> = {};

    applicants.forEach(app => {
      const date = new Date(app.appliedDate);
      // Get start of week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const startOfWeek = new Date(date.setDate(diff)).toISOString().split('T')[0];

      if (!weeks[startOfWeek]) weeks[startOfWeek] = { applied: 0, hired: 0 };
      weeks[startOfWeek].applied++;
      if (app.status === 'Go Live') weeks[startOfWeek].hired++;
    });

    return Object.entries(weeks)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([week, data]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        applied: data.applied,
        hired: data.hired,
        rate: data.applied > 0 ? Math.round((data.hired / data.applied) * 100) : 0
      }))
      .slice(-8); // Last 8 weeks
  }, [applicants]);

  // Custom tooltip for compound bar chart - with sorted data


  // Enhanced workforce tooltip with more comprehensive data


  // Handle bar click to filter applicants
  const handleBarClick = (data: any) => {
    const stageMapping: Record<string, string[]> = {
      'Applied': ['Applied'],
      'Screened': ['Under Review', 'Invited to Interview'],
      'Interview': ['Invited to Interview', 'Interview Scheduled'],
      'Training': ['Invited to Training', 'In Training'],
      'Active': ['Go Live']
    };

    const statuses = stageMapping[data.stage] || [];
    if (statuses.length > 0) {
      setSelectedStage(data.stage);
      onTabChange('applicants'); // Switch to applicants tab
      setStatusFilter(statuses[0]); // Set to first status in the group
    }
  };

  // Current workforce status for display
  const currentWorkforceStatus = trendData[trendData.length - 1];
  const workforceStatusText = currentWorkforceStatus?.gap > 0
    ? `${currentWorkforceStatus.gap} Short`
    : currentWorkforceStatus?.gap < 0
      ? `${Math.abs(currentWorkforceStatus.gap)} Surplus`
      : 'At Target';

  // Get recent status changes for Quick Insights
  const recentStatusChanges = applicants
    .filter(app => {
      const daysSinceChange = Math.floor((new Date().getTime() - new Date(app.lastStatusChangeDate).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceChange <= 3 && app.status !== 'Applied'; // Last 3 days, exclude just applied
    })
    .sort((a, b) => new Date(b.lastStatusChangeDate).getTime() - new Date(a.lastStatusChangeDate).getTime())
    .slice(0, 5);

  // Performance metrics
  const performanceMetrics = [
    {
      title: 'Interview Success Rate',
      value: '76%',
      description: 'Percentage of applicants who pass interviews',
      color: getStatusColor('Interview Scheduled'),
    },
    {
      title: 'Training Completion',
      value: `${inTraining > 0 ? Math.round((active / inTraining) * 100) : 0}%`,
      description: 'Applicants who complete training successfully',
      color: getStatusColor('In Training'),
    },
    {
      title: 'Avg. Time to Hire',
      value: '12 days',
      description: 'Average time from application to going live',
      color: getStatusColor('Go Live'),
    },
    {
      title: 'Decline Rate',
      value: `${Math.round((declined / totalApplied) * 100)}%`,
      description: 'Percentage of applications that are declined',
      color: getStatusColor('Declined'),
    }
  ];

  // Filtered and sorted applicants
  const filteredAndSortedApplicants = useMemo(() => {
    let filtered = applicants.filter(applicant => {
      const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
      const matchesJobTitle = jobTitleFilter === 'all' || applicant.jobTitle === jobTitleFilter;
      const matchesLocation = locationFilter === 'all' || applicant.location.country === locationFilter;

      return matchesSearch && matchesStatus && matchesJobTitle && matchesLocation;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'date-asc':
          return new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
        case 'date-desc':
          return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'location':
          return `${a.location.country}-${a.location.city}`.localeCompare(`${b.location.country}-${b.location.city}`);
        default:
          return 0;
      }
    });

    return filtered;
  }, [applicants, searchTerm, statusFilter, jobTitleFilter, locationFilter, sortBy]);

  // Chart loading skeleton
  const ChartSkeleton = () => (
    <div className="w-full h-[300px] flex items-center justify-center bg-md-surface-container rounded-lg animate-pulse">
      <div className="text-md-on-surface-variant">Loading chart...</div>
    </div>
  );

  // Enhanced render chart function with more comprehensive data
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <div className="w-full h-[300px]">
            <Suspense fallback={<ChartSkeleton />}>
              <D3BarChart data={stageData} onBarClick={handleBarClick} />
            </Suspense>
          </div>
        );
      case 'sankey':
        return (
          <div className="w-full h-[300px] flex items-center justify-center">
            <Suspense fallback={<ChartSkeleton />}>
              <SankeyChart applicants={applicants} width={800} height={300} />
            </Suspense>
          </div>
        );
      case 'line':
        return (
          <div className="w-full h-[300px]">
            <Suspense fallback={<ChartSkeleton />}>
              <D3WorkforceChart data={trendData} />
            </Suspense>
          </div>
        );
      case 'velocity':
        return (
          <div className="w-full h-[300px]">
            <Suspense fallback={<ChartSkeleton />}>
              <D3Histogram data={velocityData} />
            </Suspense>
          </div>
        );
      case 'conversion':
        return (
          <div className="w-full h-[300px]">
            <Suspense fallback={<ChartSkeleton />}>
              <D3ConversionChart
                data={conversionData}
                colors={{
                  applied: getStatusColor('Applied'),
                  rate: getStatusColor('Go Live')
                }}
              />
            </Suspense>
          </div>
        );
      case 'area':
        return (
          <div className="w-full h-[300px]">
            <Suspense fallback={<ChartSkeleton />}>
              <D3PipelineChart
                data={trendData}
                colors={{
                  applications: getStatusColor('Applied'),
                  screenings: getStatusColor('Under Review'),
                  interviews: getStatusColor('Interview Scheduled'),
                  trainingCompletions: getStatusColor('In Training'),
                  newHires: getStatusColor('Go Live')
                }}
              />
            </Suspense>
          </div>
        );
      default:
        return null;
    }
  };

  const uniqueJobTitles = [...new Set(applicants.map(app => app.jobTitle))];
  const uniqueCountries = [...new Set(applicants.map(app => app.location.country))].sort();

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setJobTitleFilter('all');
    setLocationFilter('all');
    setSortBy('date-desc');
    setSelectedStage(null);
    toast.success('Filters cleared');
  };

  const formatLastChange = (lastChangeDate: string) => {
    const days = Math.floor((new Date().getTime() - new Date(lastChangeDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const handleApprove = (applicantId: string, status: OnboardingStatus) => {
    onStatusUpdate(applicantId, status, { notes: notes[applicantId] });
  };

  const handleDecline = (applicantId: string) => {
    onStatusUpdate(applicantId, 'Declined', {
      notes: `${notes[applicantId] || ''}${declineReason ? `\nDecline Reason: ${declineReason}` : ''}${markAsFraud ? '\nMarked as potential fraud' : ''}`
    });
  };

  return (
    <div className="w-full flex">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        chartType={chartType}
        onChartTypeChange={setChartType}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        jobTitleFilter={jobTitleFilter}
        onJobTitleFilterChange={setJobTitleFilter}
        locationFilter={locationFilter}
        onLocationFilterChange={setLocationFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onClearFilters={clearAllFilters}
        uniqueJobTitles={uniqueJobTitles}
        uniqueCountries={uniqueCountries}
        filteredCount={filteredAndSortedApplicants.length}
        totalCount={applicants.length}
      />

      <div className="flex-1 min-w-0 bg-md-surface h-screen overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full h-full flex flex-col">
          {/* Top Bar with Theme Toggle */}
          <div className="flex items-center justify-end px-6 py-4 border-b border-md-outline-variant/30 flex-shrink-0 bg-md-surface/80 backdrop-blur-sm z-10">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2 bg-md-surface-container-high px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-md-outline-variant/50">
              <Sun className="w-4 h-4 text-md-on-surface-variant" />
              <Switch
                checked={isDarkMode}
                onCheckedChange={onThemeToggle}
                className="data-[state=checked]:bg-md-primary"
              />
              <Moon className="w-4 h-4 text-md-on-surface-variant" />
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-6 relative">

            {/* Analytics Tab - NO SLIDE ANIMATION */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Compact Header Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-md-info-container p-3 rounded-lg shadow-md-elevation-1">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-md-on-info-container flex-shrink-0" />
                    <div>
                      <p className="text-2xl font-bold text-md-on-info-container">{totalApplied}</p>
                      <p className="text-sm text-md-on-info-container opacity-80">Applications</p>
                    </div>
                  </div>
                </div>

                <div className="bg-md-success-container p-3 rounded-lg shadow-md-elevation-1">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-md-on-success-container flex-shrink-0" />
                    <div>
                      <p className="text-2xl font-bold text-md-on-success-container">{currentWorkforceStatus?.totalWorkers || active}</p>
                      <p className="text-sm text-md-on-success-container opacity-80">Total Workers</p>
                    </div>
                  </div>
                </div>

                <div className="bg-md-primary-container p-3 rounded-lg shadow-md-elevation-1">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-md-on-primary-container flex-shrink-0" />
                    <div>
                      <p className="text-2xl font-bold text-md-on-primary-container">{WORKERS_NEEDED}</p>
                      <p className="text-sm text-md-on-primary-container opacity-80">Workers Needed</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg shadow-md-elevation-1 ${currentWorkforceStatus?.gap > 0
                  ? 'bg-md-warning-container'
                  : currentWorkforceStatus?.gap < 0
                    ? 'bg-md-success-container'
                    : 'bg-md-info-container'
                  }`}>
                  <div className="flex items-center gap-3">
                    {currentWorkforceStatus?.gap > 0 ? (
                      <AlertTriangle className="w-8 h-8 text-md-on-warning-container flex-shrink-0" />
                    ) : currentWorkforceStatus?.gap < 0 ? (
                      <TrendingUp className="w-8 h-8 text-md-on-success-container flex-shrink-0" />
                    ) : (
                      <Target className="w-8 h-8 text-md-on-info-container flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-2xl font-bold ${currentWorkforceStatus?.gap > 0
                        ? 'text-md-on-warning-container'
                        : currentWorkforceStatus?.gap < 0
                          ? 'text-md-on-success-container'
                          : 'text-md-on-info-container'
                        }`}>
                        {Math.abs(currentWorkforceStatus?.gap || 0)}
                      </p>
                      <p className={`text-sm opacity-80 ${currentWorkforceStatus?.gap > 0
                        ? 'text-md-on-warning-container'
                        : currentWorkforceStatus?.gap < 0
                          ? 'text-md-on-success-container'
                          : 'text-md-on-info-container'
                        }`}>
                        {workforceStatusText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Chart View */}
              <Card className="border-2 border-md-outline-variant rounded-lg shadow-md-elevation-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Workforce Planning & Analytics
                      </CardTitle>
                      <p className="text-sm text-md-on-surface-variant mt-1">
                        Track workforce levels and application pipeline progress (30-day view)
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="w-full">
                    {renderChart()}
                  </div>
                </CardContent>
              </Card>

              {/* Restored Stage Summary Cards - only for bar chart */}
              {chartType === 'bar' && (
                <div className="mt-6">
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mb-4 p-3 bg-md-surface-container-high rounded-lg shadow-md-elevation-1">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-md-primary rounded-lg"></div>
                      <span className="text-sm font-medium text-md-on-surface">Remaining at Stage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-md-primary opacity-60 rounded-lg"></div>
                      <span className="text-sm font-medium text-md-on-surface">Progressed to Next</span>
                    </div>
                  </div>

                  {/* Stage Details */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {stageData.map((stage, index) => (
                      <div
                        key={stage.stage}
                        className="bg-md-surface-container-high rounded-lg p-3 text-center cursor-pointer hover:bg-md-surface-container-highest transition-colors shadow-md-elevation-1"
                        onClick={() => handleBarClick(stage)}
                      >
                        <div className="flex justify-center mb-2">
                          <div
                            className="w-4 h-4 rounded-lg"
                            style={{ backgroundColor: stage.color }}
                          />
                        </div>
                        <p className="text-xs font-medium text-md-on-surface mb-1">{stage.stage}</p>
                        <p className="text-lg font-bold text-md-on-surface">{stage.total}</p>
                        <div className="text-xs text-md-on-surface-variant mt-1">
                          <p>Remaining: {stage.current}</p>
                          <p>Progressed: {stage.progressed}</p>
                        </div>
                        <p className="text-xs text-md-on-surface-variant mt-1">{stage.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {performanceMetrics.map((metric, index) => (
                  <Card
                    key={index}
                    className="rounded-lg shadow-md-elevation-1 cursor-pointer transition-all duration-500 hover:shadow-md-elevation-3 hover:bg-md-surface-container"
                    onClick={() => {
                      setSelectedMetric(metric);
                      setShowMetricModal(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center p-3 rounded-lg shadow-md-elevation-1 bg-md-surface-container-high">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-md-on-surface">{metric.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-lg" style={{ color: metric.color }}>{metric.value}</span>
                            <Info className="w-4 h-4 text-md-on-surface-variant" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-md-on-surface-variant mt-2">{metric.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Insights with Recent Status Changes */}
              <Card className="rounded-lg shadow-md-elevation-1">
                <CardHeader>
                  <CardTitle className="text-base">Quick Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-md-success-container rounded-lg shadow-md-elevation-1">
                      <TrendingUp className="w-5 h-5 text-md-on-success-container" />
                      <div>
                        <p className="text-sm font-medium text-md-on-success-container">Top Performing Stage</p>
                        <p className="text-xs text-md-on-success-container opacity-80">Training → Active: {inTraining > 0 ? Math.round((active / inTraining) * 100) : 0}% success</p>
                      </div>
                    </div>

                    {/* Recent Status Changes */}
                    <div className="bg-md-info-container rounded-lg p-3 shadow-md-elevation-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-5 h-5 text-md-on-info-container" />
                        <p className="text-sm font-medium text-md-on-info-container">Recent Status Changes</p>
                      </div>
                      <div className="space-y-2">
                        {recentStatusChanges.length > 0 ? (
                          recentStatusChanges.map((applicant, index) => (
                            <div key={applicant.id} className="flex items-center justify-between text-xs">
                              <span className="text-md-on-info-container">{applicant.name}</span>
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-2 py-1 rounded text-xs"
                                  style={{
                                    backgroundColor: getStatusColor(applicant.status, 'bg'),
                                    color: getStatusColor(applicant.status, 'text')
                                  }}
                                >
                                  {applicant.status}
                                </span>
                                <span className="text-gray-500">{formatLastChange(applicant.lastStatusChangeDate)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">No recent status changes</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg shadow-md-elevation-1">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Today's Activity</p>
                        <p className="text-xs text-gray-600">{todaysApplications.length} new applications received</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Map Tab */}
            <TabsContent value="map" className="space-y-6">
              <GeoMapView applicants={applicants} />
            </TabsContent>

            {/* Applicants Tab - NO SLIDE ANIMATION */}
            <TabsContent value="applicants" className="space-y-6">
              <div style={{ minHeight: '600px', maxHeight: 'calc(100vh - 280px)' }}>
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Applicants ({filteredAndSortedApplicants.length})
                  </h3>
                </div>

                {/* SCROLLABLE Applicant Cards Container */}
                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-md-primary scrollbar-track-transparent" style={{ maxHeight: 'calc(100vh - 350px)', minHeight: '400px' }}>
                  <div className={`${viewMode === 'list'
                    ? 'space-y-4'
                    : 'grid grid-cols-2 gap-4'
                    } pl-2 pr-2`}>
                    {filteredAndSortedApplicants.map((applicant) => {
                      const statusLines = splitStatusForBadge(applicant.status);
                      const isExpanded = expandedCards.has(applicant.id);

                      return (
                        <Card
                          key={applicant.id}
                          className={`cursor-pointer transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out hover:shadow-lg rounded-lg ${viewMode === 'list' ? 'w-full' : ''
                            } ${isExpanded
                              ? 'bg-md-primary-container shadow-md-elevation-4 border-2 border-md-primary'
                              : 'border border-md-outline-variant shadow-md-elevation-1 hover:bg-md-surface-container-high hover:-translate-y-1'
                            }`}
                          onClick={() => toggleCardExpansion(applicant.id)}
                        >
                          <CardContent className="p-4 relative">
                            {/* Circular Status Badge - Top Right with 2 lines */}
                            <div className="absolute top-4 right-4 z-10">
                              <div
                                className="w-16 h-16 flex flex-col items-center justify-center text-center rounded-full shadow-md-elevation-1 leading-tight"
                                style={{
                                  backgroundColor: getStatusColor(applicant.status, 'bg'),
                                  color: getStatusColor(applicant.status, 'text'),
                                  border: `1px solid ${getStatusColor(applicant.status, 'light')}`
                                }}
                              >
                                <div className="text-xs font-medium">{statusLines.line1}</div>
                                {statusLines.line2 && <div className="text-xs font-medium">{statusLines.line2}</div>}
                              </div>
                            </div>

                            {/* Card Layout */}
                            <div className={`${viewMode === 'list'
                              ? 'flex items-center gap-4'
                              : 'flex flex-col items-center space-y-3'
                              }`}>

                              {/* Circular Avatar - Larger when expanded with slower transition */}
                              <Avatar className={`${isExpanded
                                ? (viewMode === 'list' ? 'h-32 w-32' : 'h-48 w-48')
                                : (viewMode === 'list' ? 'h-16 w-16' : 'h-24 w-24')
                                } flex-shrink-0 shadow-md-elevation-1 z-0 transition-all duration-700`}>
                                <AvatarImage src={getAvatarSrc(applicant)} alt={applicant.name} />
                                <AvatarFallback className={`${isExpanded
                                  ? 'text-4xl'
                                  : 'text-lg'
                                  } transition-all duration-700`}>
                                  {applicant.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>

                              {/* Main Content */}
                              <div className={`${viewMode === 'list' ? 'flex-1 pr-20' : 'text-center w-full pr-0 pt-6'}`}>
                                <div className={`${viewMode === 'list' ? 'flex items-start justify-between' : 'space-y-2'}`}>
                                  <div className={`${viewMode === 'list' ? 'flex-1' : 'w-full'}`}>
                                    <div className={`flex items-center ${viewMode === 'list' ? 'gap-2 mb-1' : 'justify-center gap-2 mb-2'}`}>
                                      {/* Name - Larger when expanded with slower transition */}
                                      <h3 className={`font-medium text-md-on-surface truncate transition-all duration-700 ${isExpanded
                                        ? 'text-2xl'
                                        : 'text-sm'
                                        }`}>
                                        {applicant.name}
                                      </h3>
                                      {applicant.recentlyChanged && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-md-success-container text-md-on-success-container rounded-lg shadow-md-elevation-1">
                                          <Sparkles className="w-2.5 h-2.5" />
                                          <span className="text-xs font-medium">New</span>
                                        </div>
                                      )}
                                      {isExpanded && <ChevronUp className="w-4 h-4 text-md-primary" />}
                                      {!isExpanded && <ChevronDown className="w-4 h-4 text-md-on-surface-variant" />}
                                    </div>
                                    <p className="text-xs text-md-on-surface-variant truncate mb-1">{applicant.email}</p>
                                    <p className="text-xs text-md-on-surface truncate mb-2">{applicant.jobTitle}</p>

                                    {/* Location Info */}
                                    <div className={`flex items-center text-xs text-md-on-surface-variant mb-3 ${viewMode === 'list' ? 'justify-start' : 'justify-center'}`}>
                                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                      <span>{applicant.location.city}, {applicant.location.country}</span>
                                    </div>
                                  </div>

                                  {/* Time Information */}
                                  {viewMode === 'list' && !isExpanded && (
                                    <div className="text-right flex-shrink-0 ml-4">
                                      <div className="flex items-center text-xs text-md-on-surface-variant mb-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>Applied {new Date(applicant.appliedDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric'
                                        })}</span>
                                      </div>
                                      <div className="flex items-center text-xs text-md-on-surface">
                                        <Activity className="w-3 h-3 mr-1" />
                                        <span>Updated {formatLastChange(applicant.lastStatusChangeDate)}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details - Normal expand without animation */}
                            {isExpanded && (
                              <div className="mt-6 pt-6 border-t border-md-outline-variant space-y-4">
                                {/* Contact Info */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-md-on-surface-variant" />
                                    <span className="text-sm text-md-on-surface">{applicant.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-md-on-surface-variant" />
                                    <span className="text-sm text-md-on-surface">{applicant.phone}</span>
                                  </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-md-on-surface-variant">Experience</p>
                                    <p className="font-medium text-sm text-md-on-surface">{applicant.experience}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-md-on-surface-variant">Applied Date</p>
                                    <p className="font-medium text-sm text-md-on-surface">{new Date(applicant.appliedDate).toLocaleDateString()}</p>
                                  </div>
                                </div>

                                {/* Status-specific info */}
                                {applicant.interviewTime && (
                                  <div className="p-3 rounded-lg shadow-md-elevation-1" style={{ backgroundColor: getStatusColor('Interview Scheduled', 'bg') }}>
                                    <p className="font-medium text-sm" style={{ color: getStatusColor('Interview Scheduled', 'dark') }}>Scheduled Interview</p>
                                    <p className="text-sm" style={{ color: getStatusColor('Interview Scheduled', 'text') }}>{applicant.interviewTime}</p>
                                  </div>
                                )}

                                {applicant.trainingSession && (
                                  <div className="p-3 rounded-lg shadow-md-elevation-1" style={{ backgroundColor: getStatusColor('In Training', 'bg') }}>
                                    <p className="font-medium text-sm" style={{ color: getStatusColor('In Training', 'dark') }}>Training Session</p>
                                    <p className="text-sm" style={{ color: getStatusColor('In Training', 'text') }}>{applicant.trainingSession}</p>
                                  </div>
                                )}

                                {/* Notes */}
                                <div>
                                  <label className="text-sm font-medium text-md-on-surface mb-2 block">
                                    Manager Notes
                                  </label>
                                  <Textarea
                                    placeholder="Add notes about the applicant..."
                                    value={notes[applicant.id] || ''}
                                    onChange={(e) => setNotes(prev => ({ ...prev, [applicant.id]: e.target.value }))}
                                    className="min-h-[80px] rounded-lg shadow-md-elevation-1"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-md-outline-variant">
                                  {applicant.status === 'Applied' && (
                                    <>
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApprove(applicant.id, 'Invited to Interview');
                                        }}
                                        className="rounded-lg shadow-md-elevation-2 transition-all duration-500"
                                        style={{ backgroundColor: getStatusColor('Go Live'), color: 'white' }}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                      </Button>

                                      <Button
                                        variant="destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDecline(applicant.id);
                                        }}
                                        className="rounded-lg shadow-md-elevation-2 transition-all duration-500"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Decline
                                      </Button>
                                    </>
                                  )}

                                  {applicant.status === 'Interview Scheduled' && (
                                    <>
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApprove(applicant.id, 'Invited to Training');
                                        }}
                                        className="rounded-lg shadow-md-elevation-2 transition-all duration-500"
                                        style={{ backgroundColor: getStatusColor('Go Live'), color: 'white' }}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Pass Interview
                                      </Button>

                                      <Button
                                        variant="destructive"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDecline(applicant.id);
                                        }}
                                        className="rounded-lg shadow-md-elevation-2 transition-all duration-500"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Fail Interview
                                      </Button>
                                    </>
                                  )}

                                  {applicant.status === 'In Training' && (
                                    <>
                                      <Button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApprove(applicant.id, 'Go Live');
                                        }}
                                        className="rounded-lg shadow-md-elevation-2 transition-all duration-500"
                                        style={{ backgroundColor: getStatusColor('Go Live'), color: 'white' }}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Complete Training
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Feed Tab - NO SLIDE ANIMATION */}
            <TabsContent value="feed" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <Card className="rounded-lg shadow-md-elevation-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Activity Feed
                    </CardTitle>
                    <p className="text-sm text-md-on-surface-variant">
                      Real-time updates on all platform activities and status changes
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-md-primary scrollbar-track-transparent">
                      {feedEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-4 rounded-lg bg-md-surface-container-high shadow-sm hover:bg-md-surface-container-highest transition-colors duration-500">
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                          >
                            {event.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-md-on-surface">{event.message}</p>
                            <p className="text-xs text-md-on-surface-variant mt-1">
                              {new Date(event.timestamp).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {event.applicantId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const applicant = applicants.find(app => app.id === event.applicantId);
                                if (applicant) {
                                  onApplicantSelect(applicant);
                                  onTabChange('applicants'); // Switch to applicants tab
                                  toggleCardExpansion(event.applicantId);
                                }
                              }}
                              className="flex-shrink-0 transition-all duration-500"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>


            {/* Performance Metric Detail Modal */}
            <Dialog open={showMetricModal} onOpenChange={setShowMetricModal}>
              <DialogContent className="max-w-md rounded-lg shadow-md-elevation-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedMetric?.color }}
                    ></div>
                    {selectedMetric?.title}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedMetric?.description}
                  </DialogDescription>
                </DialogHeader>

                {selectedMetric && (
                  <div className="space-y-4">
                    <div className="text-center p-4 rounded-lg bg-md-surface-container-high">
                      <div className="text-3xl font-bold mb-2" style={{ color: selectedMetric.color }}>
                        {selectedMetric.value}
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-md-outline-variant/30 flex items-center justify-between text-xs text-md-on-surface-variant bg-md-surface/80 backdrop-blur-sm flex-shrink-0 z-10">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-md-primary">Gig Marketplace</span>
              <span className="w-1 h-1 rounded-full bg-md-outline-variant"></span>
              <span>Manager Dashboard</span>
            </div>
            <div className="opacity-70 font-mono">v1.2.0</div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}