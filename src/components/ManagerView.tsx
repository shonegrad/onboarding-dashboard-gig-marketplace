import React, { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { User, Calendar, BookOpen, CheckCircle, XCircle, AlertTriangle, Eye, Users, BarChart3, TrendingUp, Clock, Search, Filter, SortAsc, Phone, Mail, TrendingDown, Target, Award, Grid3X3, List, Activity, AreaChart as AreaChartIcon, LineChart as LineChartIcon, Sparkles, MapPin, Settings, X, Info, ChevronDown, ChevronUp, MessageSquare, UserPlus, UserCheck, AlertCircle, Zap, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line, Cell } from 'recharts';
import { toast } from 'sonner';
import { getStatusColor, getAvatarSrc, TOAST_MESSAGES, splitStatusForBadge } from '../utils/stageUtils';
import type { Applicant, OnboardingStatus } from '../types';

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
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobTitleFilter, setJobTitleFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [declineReason, setDeclineReason] = useState('');
  const [markAsFraud, setMarkAsFraud] = useState(false);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<any>(null);

  // Toggle card expansion
  const toggleCardExpansion = (applicantId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(applicantId)) {
      newExpanded.delete(applicantId);
    } else {
      newExpanded.add(applicantId);
    }
    setExpandedCards(newExpanded);

    // Set as selected when expanding
    const applicant = applicants.find(app => app.id === applicantId);
    if (applicant) {
      onApplicantSelect(applicant);
      if (!notes[applicantId]) {
        setNotes(prev => ({ ...prev, [applicantId]: applicant.notes || '' }));
      }
    }
  };

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

  // Custom tooltip for compound bar chart - with sorted data
  const CompoundTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const currentCount = data.current;
      const progressedCount = data.progressed;
      const total = data.total;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md-elevation-3">
          <p className="font-semibold text-gray-900 mb-2">{label} Stage</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-lg" style={{ backgroundColor: data.color }}></div>
              <span className="text-sm">Remaining: {currentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-lg" style={{ backgroundColor: data.progressColor }}></div>
              <span className="text-sm">Progressed: {progressedCount}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-sm font-medium">Total: {total}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to filter applicants</p>
        </div>
      );
    }
    return null;
  };

  // Enhanced workforce tooltip with more comprehensive data
  const WorkforceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      // Sort payload by value from highest to lowest
      const sortedPayload = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-md-elevation-3 min-w-64">
          <p className="font-semibold text-gray-900 mb-3">{label}</p>

          {/* Primary metrics */}
          <div className="space-y-2 mb-3">
            {sortedPayload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-lg"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm">{entry.name}</span>
                </div>
                <span className="text-sm font-medium">{entry.value}</span>
              </div>
            ))}
          </div>

          {/* Enhanced metrics for workforce view */}
          {chartType === 'line' && data && (
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Capacity:</span>
                  <span className="font-medium ml-1">{data.capacityUtilization}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Retention:</span>
                  <span className="font-medium ml-1">{data.retentionRate}%</span>
                </div>
              </div>
              <div className="text-xs">
                <span className="text-gray-500">Satisfaction Score:</span>
                <span className="font-medium ml-1">{data.satisfactionScore?.toFixed(1)}/5.0</span>
              </div>
            </div>
          )}

          {/* Enhanced metrics for pipeline view */}
          {chartType === 'area' && data && (
            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Interviews:</span>
                  <span className="font-medium ml-1">{data.interviews}</span>
                </div>
                <div>
                  <span className="text-gray-500">Screenings:</span>
                  <span className="font-medium ml-1">{data.screenings}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Training:</span>
                  <span className="font-medium ml-1">{data.trainingCompletions}</span>
                </div>
                <div>
                  <span className="text-gray-500">Success Rate:</span>
                  <span className="font-medium ml-1">{data.interviewSuccessRate}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Status indicators */}
          {data?.gap !== undefined && (
            <div className="mt-3 pt-2 border-t border-gray-200">
              {data.gap > 0 ? (
                <p className="text-xs text-red-600">
                  ⚠️ Short by {data.gap} workers
                </p>
              ) : data.gap < 0 ? (
                <p className="text-xs text-green-600">
                  ✅ Surplus of {Math.abs(data.gap)} workers
                </p>
              ) : (
                <p className="text-xs text-blue-600">
                  🎯 Perfect staffing balance
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

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

  // Enhanced render chart function with more comprehensive data
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="stage"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis fontSize={12} />
              <Tooltip content={<CompoundTooltip />} />
              <Bar
                dataKey="current"
                stackId="a"
                cursor="pointer"
                onClick={handleBarClick}
                radius={[0, 0, 4, 4]}
              >
                {stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Bar
                dataKey="progressed"
                stackId="a"
                cursor="pointer"
                onClick={handleBarClick}
                radius={[4, 4, 0, 0]}
              >
                {stageData.map((entry, index) => (
                  <Cell key={`cell-progress-${index}`} fill={entry.progressColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip content={<WorkforceTooltip />} />
              <Area
                type="monotone"
                dataKey="totalWorkers"
                stroke={getStatusColor('Go Live')}
                fill={getStatusColor('Go Live')}
                fillOpacity={0.7}
                strokeWidth={2}
                name="Total Workers"
              />
              <Area
                type="monotone"
                dataKey="workersNeeded"
                stroke={getStatusColor('Under Review')}
                fill="transparent"
                strokeWidth={3}
                strokeDasharray="8 4"
                name="Workers Needed"
              />
              <Area
                type="monotone"
                dataKey="capacityUtilization"
                stroke={getStatusColor('Interview Scheduled')}
                fill={getStatusColor('Interview Scheduled')}
                fillOpacity={0.3}
                strokeWidth={1}
                name="Capacity %"
                yAxisId="percent"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip content={<WorkforceTooltip />} />
              <Area
                type="monotone"
                dataKey="applications"
                stackId="1"
                stroke={getStatusColor('Applied')}
                fill={getStatusColor('Applied')}
                fillOpacity={0.6}
                name="Applications"
              />
              <Area
                type="monotone"
                dataKey="screenings"
                stackId="1"
                stroke={getStatusColor('Under Review')}
                fill={getStatusColor('Under Review')}
                fillOpacity={0.6}
                name="Screenings"
              />
              <Area
                type="monotone"
                dataKey="interviews"
                stackId="1"
                stroke={getStatusColor('Interview Scheduled')}
                fill={getStatusColor('Interview Scheduled')}
                fillOpacity={0.6}
                name="Interviews"
              />
              <Area
                type="monotone"
                dataKey="trainingCompletions"
                stackId="1"
                stroke={getStatusColor('In Training')}
                fill={getStatusColor('In Training')}
                fillOpacity={0.6}
                name="Training"
              />
              <Area
                type="monotone"
                dataKey="newHires"
                stackId="1"
                stroke={getStatusColor('Go Live')}
                fill={getStatusColor('Go Live')}
                fillOpacity={0.6}
                name="New Hires"
              />
            </AreaChart>
          </ResponsiveContainer>
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
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="flex items-center justify-between gap-4 mb-6">
          <TabsList className="grid grid-cols-3 flex-1">
            <TabsTrigger value="analytics" className="flex items-center gap-2 transition-all duration-300">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="applicants" className="flex items-center gap-2 transition-all duration-300">
              <Users className="w-4 h-4" />
              Applicants
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex items-center gap-2 transition-all duration-300">
              <Activity className="w-4 h-4" />
              Feed
            </TabsTrigger>
          </TabsList>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2 bg-md-surface-container-high px-3 py-2 rounded-lg">
            <Sun className="w-4 h-4 text-md-on-surface-variant" />
            <Switch
              checked={isDarkMode}
              onCheckedChange={onThemeToggle}
            />
            <Moon className="w-4 h-4 text-md-on-surface-variant" />
          </div>
        </div>

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

              {/* Centered Chart Type Selector */}
              <div className="flex justify-center mt-4">
                <div className="inline-flex rounded-lg border border-md-outline-variant bg-md-surface-container-high p-1 shadow-md-elevation-1">
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType('bar')}
                    className="h-8 px-4 rounded-md"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Stages
                  </Button>
                  <Button
                    variant={chartType === 'line' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType('line')}
                    className="h-8 px-4 rounded-md"
                  >
                    <AreaChartIcon className="w-4 h-4 mr-1" />
                    Workforce
                  </Button>
                  <Button
                    variant={chartType === 'area' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChartType('area')}
                    className="h-8 px-4 rounded-md"
                  >
                    <LineChartIcon className="w-4 h-4 mr-1" />
                    Pipeline
                  </Button>
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

        {/* Applicants Tab - NO SLIDE ANIMATION */}
        <TabsContent value="applicants" className="space-y-6">
          <div className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Sidebar for Controls and Filters - Fixed Height, No Scroll */}
            <div className="w-80 flex-shrink-0">
              <Card className="sticky top-0 rounded-lg shadow-md-elevation-2 h-fit">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Settings className="w-5 h-5" />
                      Filters & Controls
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-3 rounded-lg shadow-md-elevation-1 text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sort Options - Now First */}
                  <div>
                    <label className="text-sm font-medium text-md-on-surface mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full rounded-lg shadow-md-elevation-1">
                        <SortAsc className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="name-asc">Name A-Z</SelectItem>
                        <SelectItem value="name-desc">Name Z-A</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium text-md-on-surface mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-md-on-surface-variant" />
                      <Input
                        placeholder="Search applicants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-lg shadow-md-elevation-1"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-md-on-surface mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full rounded-lg shadow-md-elevation-1">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Invited to Interview">Invited to Interview</SelectItem>
                        <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                        <SelectItem value="Invited to Training">Invited to Training</SelectItem>
                        <SelectItem value="In Training">In Training</SelectItem>
                        <SelectItem value="Go Live">Go Live</SelectItem>
                        <SelectItem value="Declined">Declined</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Title Filter */}
                  <div>
                    <label className="text-sm font-medium text-md-on-surface mb-2 block">Position</label>
                    <Select value={jobTitleFilter} onValueChange={setJobTitleFilter}>
                      <SelectTrigger className="w-full rounded-lg shadow-md-elevation-1">
                        <SelectValue placeholder="Filter by position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        {uniqueJobTitles.map(title => (
                          <SelectItem key={title} value={title}>{title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="text-sm font-medium text-md-on-surface mb-2 block">Location</label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-full rounded-lg shadow-md-elevation-1">
                        <MapPin className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {uniqueCountries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Results Summary */}
                  <div className="pt-4 border-t border-md-outline-variant">
                    <p className="text-sm text-md-on-surface-variant">
                      Showing <span className="font-medium text-md-on-surface">{filteredAndSortedApplicants.length}</span> of{' '}
                      <span className="font-medium text-md-on-surface">{applicants.length}</span> applicants
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area - SCROLLABLE ONLY HERE */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Fixed Header */}
              <div className="mb-4 flex-shrink-0 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Applicants ({filteredAndSortedApplicants.length})
                </h3>
                {/* View Mode Toggle - No Label */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-lg shadow-md-elevation-1"
                  >
                    <List className="w-4 h-4 mr-1" />
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-lg shadow-md-elevation-1"
                  >
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    Grid
                  </Button>
                </div>
              </div>

              {/* SCROLLABLE Applicant Cards Container - This is the ONLY scrolling area */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-md-primary scrollbar-track-transparent">
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
      </Tabs>

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
  );
}