import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    BarChart3,
    TrendingUp,
    Clock,
    GitMerge,
    List,
    Grid3X3,
    MapPin,
    Settings,
    X,
    AreaChart,
    LineChart,
    Users,
    Activity,
} from 'lucide-react';
import type { OnboardingStatus } from '../types';

// Chart types for Analytics tab
type ChartType = 'bar' | 'line' | 'area' | 'velocity' | 'conversion' | 'sankey';
type ViewMode = 'list' | 'grid';
type SortBy = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc' | 'status' | 'location';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;

    // Chart controls (Analytics & Map tabs)
    chartType: ChartType;
    onChartTypeChange: (type: ChartType) => void;

    // Filters (Applicants tab)
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    jobTitleFilter: string;
    onJobTitleFilterChange: (value: string) => void;
    locationFilter: string;
    onLocationFilterChange: (value: string) => void;
    sortBy: SortBy;
    onSortByChange: (value: SortBy) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onClearFilters: () => void;

    // Data for dropdowns
    uniqueJobTitles: string[];
    uniqueCountries: string[];

    // Counts
    filteredCount: number;
    totalCount: number;
}

export function Sidebar({
    activeTab,
    onTabChange,
    isCollapsed,
    onToggleCollapse,
    chartType,
    onChartTypeChange,
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    jobTitleFilter,
    onJobTitleFilterChange,
    locationFilter,
    onLocationFilterChange,
    sortBy,
    onSortByChange,
    viewMode,
    onViewModeChange,
    onClearFilters,
    uniqueJobTitles,
    uniqueCountries,
    filteredCount,
    totalCount,
}: SidebarProps) {

    const statuses: OnboardingStatus[] = [
        'Applied',
        'Under Review',
        'Invited to Interview',
        'Interview Scheduled',
        'Invited to Training',
        'In Training',
        'Go Live',
        'Declined'
    ];

    // Chart type config
    const chartOptions = [
        { value: 'bar' as ChartType, label: 'Stages', icon: BarChart3 },
        { value: 'line' as ChartType, label: 'Workforce', icon: LineChart },
        { value: 'area' as ChartType, label: 'Pipeline', icon: AreaChart },
        { value: 'velocity' as ChartType, label: 'Velocity', icon: Clock },
        { value: 'conversion' as ChartType, label: 'Conversion', icon: TrendingUp },
        { value: 'sankey' as ChartType, label: 'Flow', icon: GitMerge },
    ];

    // Navigation items configuration
    const navItems = [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'map', label: 'Map Overview', icon: MapPin },
        { id: 'applicants', label: 'Applicants', icon: Users },
        { id: 'feed', label: 'Activity Feed', icon: Activity },
    ];

    if (isCollapsed) {
        return (
            <div className="w-16 flex-shrink-0 bg-md-surface-container-low border-r border-md-outline-variant shadow-md-elevation-1 flex flex-col items-center py-4 transition-all duration-300 z-20">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleCollapse}
                    className="mb-8 p-0 w-10 h-10 rounded-full hover:bg-md-state-hover"
                >
                    <ChevronRight className="w-6 h-6 text-md-on-surface-variant" />
                </Button>

                {/* Main Navigation - Collapsed */}
                <div className="space-y-4 w-full flex flex-col items-center mb-6">
                    {navItems.map(item => (
                        <Button
                            key={item.id}
                            variant={activeTab === item.id ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={() => onTabChange(item.id)}
                            className={`w-12 h-12 rounded-2xl relative group ${activeTab === item.id
                                ? 'bg-md-secondary-container text-md-on-secondary-container'
                                : 'text-md-on-surface-variant hover:bg-md-surface-container-highest'
                                }`}
                            title={item.label}
                        >
                            <item.icon className="w-6 h-6" />
                            {activeTab === item.id && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-md-primary rounded-r-full" />
                            )}
                        </Button>
                    ))}
                </div>

                <div className="w-8 h-[1px] bg-md-outline-variant/50 my-2" />

                {/* Contextual Controls - Collapsed (Icon Only) */}
                <div className="mt-4 space-y-2 w-full flex flex-col items-center">
                    {(activeTab === 'analytics') && (
                        chartOptions.map(opt => (
                            <Button
                                key={opt.value}
                                variant={chartType === opt.value ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => onChartTypeChange(opt.value)}
                                className="w-10 h-10 rounded-full"
                                title={opt.label}
                            >
                                <opt.icon className="w-4 h-4" />
                            </Button>
                        ))
                    )}

                    {(activeTab === 'applicants') && (
                        <>
                            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full" title="Filters">
                                <Filter className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => onViewModeChange('list')}
                                className="w-10 h-10 rounded-full"
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="icon"
                                onClick={() => onViewModeChange('grid')}
                                className="w-10 h-10 rounded-full"
                                title="Grid View"
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 flex-shrink-0 bg-md-surface-container-low border-r border-md-outline-variant shadow-md-elevation-1 flex flex-col transition-all duration-300 z-20">
            {/* Header / Collapse Toggle */}
            <div className="p-4 flex items-center justify-between border-b border-md-outline-variant/30">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-md-primary text-md-on-primary flex items-center justify-center font-bold">OM</div>
                    <span className="font-bold text-lg text-md-on-surface">Dashboard</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="w-8 h-8 rounded-full hover:bg-md-state-hover"
                >
                    <ChevronLeft className="w-5 h-5 text-md-on-surface-variant" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                {/* Main Navigation */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-md-on-surface-variant/80 uppercase tracking-wider px-4 mb-2">Menu</h3>
                    {navItems.map(item => (
                        <Button
                            key={item.id}
                            variant="ghost"
                            onClick={() => onTabChange(item.id)}
                            className={`w-full justify-start gap-3 h-12 rounded-full px-4 text-base font-medium transition-all duration-200 ${activeTab === item.id
                                ? 'bg-md-secondary-container text-md-on-secondary-container hover:bg-md-secondary-container/90'
                                : 'text-md-on-surface-variant hover:bg-md-surface-container-highest hover:text-md-on-surface'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-md-on-secondary-container' : 'text-md-on-surface-variant'}`} />
                            <span className="truncate">{item.label}</span>
                        </Button>
                    ))}
                </div>

                <div className="h-[1px] bg-md-outline-variant/50 mx-2" />

                {/* Contextual Controls Section */}
                <div>
                    <div className="flex items-center gap-2 px-4 mb-4">
                        <Settings className="w-4 h-4 text-md-primary" />
                        <span className="text-xs font-semibold text-md-on-surface-variant/80 uppercase tracking-wider">Controls</span>
                    </div>

                    {/* Controls Content */}
                    <div className="px-2">
                        {/* Analytics Tab Controls */}
                        {(activeTab === 'analytics') && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-md-on-surface-variant flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    Chart Type
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {chartOptions.map(opt => (
                                        <Button
                                            key={opt.value}
                                            variant={chartType === opt.value ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onChartTypeChange(opt.value)}
                                            className="flex items-center justify-start gap-2 h-9"
                                        >
                                            <opt.icon className="w-4 h-4" />
                                            <span className="text-xs truncate">{opt.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Map Tab Controls */}
                        {(activeTab === 'map') && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-md-on-surface-variant flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Map Filters
                                </h4>
                                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {statuses.map(status => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Applicants Tab Controls */}
                        {(activeTab === 'applicants') && (
                            <>
                                {/* View Mode */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-md-on-surface-variant flex items-center gap-2">
                                        <List className="w-4 h-4" />
                                        View Mode
                                    </h4>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onViewModeChange('list')}
                                            className="flex-1"
                                        >
                                            <List className="w-4 h-4 mr-1" />
                                            List
                                        </Button>
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onViewModeChange('grid')}
                                            className="flex-1"
                                        >
                                            <Grid3X3 className="w-4 h-4 mr-1" />
                                            Grid
                                        </Button>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-md-on-surface-variant flex items-center gap-2">
                                        <Search className="w-4 h-4" />
                                        Search
                                    </h4>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-md-on-surface-variant" />
                                        <Input
                                            placeholder="Name or email..."
                                            value={searchTerm}
                                            onChange={(e) => onSearchChange(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-md-on-surface-variant flex items-center gap-2">
                                            <Filter className="w-4 h-4" />
                                            Filters
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={onClearFilters}
                                            className="h-6 px-2 text-xs"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Clear
                                        </Button>
                                    </div>

                                    {/* Status Filter */}
                                    <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            {statuses.map(status => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Job Title Filter */}
                                    <Select value={jobTitleFilter} onValueChange={onJobTitleFilterChange}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Job Title" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Job Titles</SelectItem>
                                            {uniqueJobTitles.map(title => (
                                                <SelectItem key={title} value={title}>{title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Location Filter */}
                                    <Select value={locationFilter} onValueChange={onLocationFilterChange}>
                                        <SelectTrigger className="h-9">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Countries</SelectItem>
                                            {uniqueCountries.map(country => (
                                                <SelectItem key={country} value={country}>{country}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {/* Sort By */}
                                    <Select value={sortBy} onValueChange={(v) => onSortByChange(v as SortBy)}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="date-desc">Newest First</SelectItem>
                                            <SelectItem value="date-asc">Oldest First</SelectItem>
                                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                            <SelectItem value="status">Status</SelectItem>
                                            <SelectItem value="location">Location</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Results Summary */}
                                <div className="pt-4 border-t border-md-outline-variant">
                                    <p className="text-sm text-md-on-surface-variant">
                                        Showing <span className="font-medium text-md-on-surface">{filteredCount}</span> of{' '}
                                        <span className="font-medium text-md-on-surface">{totalCount}</span> applicants
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Feed Tab - No controls needed */}
                        {(activeTab === 'feed') && (
                            <div className="text-sm text-md-on-surface-variant text-center py-8">
                                <p>Activity Feed shows real-time updates.</p>
                                <p className="mt-2">No filters required.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
