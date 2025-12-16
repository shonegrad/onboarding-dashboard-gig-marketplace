import React from 'react';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function ApplicantViewSkeleton() {
  return (
    <div className="w-full max-w-xs mx-auto bg-purple-800 rounded-[2.5rem] p-2 shadow-2xl">
      {/* Phone Frame - Fixed Height */}
      <div className="bg-white rounded-[2.25rem] p-4 h-[640px] relative overflow-hidden">
        {/* Dynamic Island/Notch */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>
        
        {/* Status Bar */}
        <div className="flex justify-between items-center text-gray-900 text-sm mb-6 pt-4">
          <div className="flex items-center gap-1">
            <span className="font-medium">9:41</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
            <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
            <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
            <span className="text-xs">100%</span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="h-[calc(100%-100px)] overflow-hidden">
          {/* Header Skeleton */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Skeleton className="w-20 h-20 rounded-full" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-300 rounded-full border-2 border-white"></div>
              </div>
            </div>
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>

          {/* Status Badge Skeleton */}
          <div className="mb-6">
            <Skeleton className="w-full h-16 rounded-lg" />
          </div>

          {/* Content Cards Skeleton */}
          <div className="space-y-4 pb-4">
            <Card className="rounded-lg">
              <CardContent className="p-5">
                <div className="text-center">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-48 mx-auto mb-1" />
                  <Skeleton className="h-4 w-40 mx-auto" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overlay message */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="md-typescale-title-medium text-gray-700 mb-2">Select an Applicant</h3>
              <p className="md-typescale-body-small text-gray-500">
                Click on an applicant card to view their mobile experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}