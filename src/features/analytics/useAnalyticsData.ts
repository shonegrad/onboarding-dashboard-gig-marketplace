import { useMemo } from 'react';
import * as d3 from 'd3';
import { Applicant } from '../../types';

export const useAnalyticsData = (applicants: Applicant[]) => {
    // 1. Funnel Data (Sankey)
    const funnelData = useMemo(() => {
        // Define the ideal path
        const nodes = [
            { name: 'Applied' },
            { name: 'Invited to Interview' },
            { name: 'Interview Scheduled' },
            { name: 'Invited to Training' },
            { name: 'In Training' },
            { name: 'Go Live' },
            { name: 'Declined' } // Loss node
        ];

        // Helper to get count by status
        const getCount = (status: string) => applicants.filter(a => a.status === status).length;

        // We can simulate flow based on current snapshot distributions
        // In a real app we'd track historical transitions, but for snapshot we assume linear progression
        // logic: "Applied" is total pool (implied history), but in snapshot we only see current status.
        // To make a sankey look like a funnel, we should probably accumilate?
        // Actually, for a snapshot sankey, it's often better to just show current states if we don't have transition history.
        // BUT, stakeholders usually want to see "How many made it to step X".
        // Let's create a derived flow specific for the visualization that approximates a funnel.

        // Simplification for visualization:
        // Source -> Status Group
        // But Sankey usually links steps.
        // Let's manually construct links based on "Previous Step" logic implied by the process.

        // Status Order
        // Applied -> Invited to Interview -> Interview Scheduled -> Invited to Training -> In Training -> Go Live
        // Everything can go to Declined.

        // This is tricky with snapshot data only. 
        // Let's simplify: Group by current status.

        return {
            nodes,
            links: [
                // This would be empty without transition data. 
                // Let's just return the Counts for a Bar Funnel instead if we can't do Sankey? 
                // Strategy: The plan promised Sankey. I will simulate the "flow" by assuming
                // everyone in "Go Live" passed through previous steps.
                // This is a common pattern for "Implied Funnels"
            ]
        };
    }, [applicants]);

    // Better approach for Implied Funnel from Snapshot:
    // Calculate "Reached Stage X" counts.
    const funnelCounts = useMemo(() => {
        const stages = [
            'Applied',
            'Invited to Interview',
            'Interview Scheduled',
            'Invited to Training',
            'In Training',
            'Go Live'
        ];

        // Calculate how many people *passed through* each stage
        // Rule: If you are in "Go Live", you passed "In Training", etc.
        const getReachedCount = (stageIndex: number) => {
            return applicants.filter(a => {
                const statusIndex = stages.indexOf(a.status);
                // If current status is beyond or equal to stageIndex, they reached it.
                if (statusIndex >= stageIndex) return true;
                return false;
            }).length;
        };

        const data = stages.map((stage, i) => ({
            stage,
            count: getReachedCount(i),
            // We can also calculate dropoff to 'Declined' if we assume they dropped off AT that stage
            // But we don't know WHEN they were declined without history. 
            // We will stick to the "Active Volume" funnel for now.
        }));

        return data;
    }, [applicants]);

    // 2. Map Data (Country/City aggregation)
    const mapData = useMemo(() => {
        // Group by Country
        const countryCounts = d3.rollup(
            applicants,
            v => v.length,
            d => d.location.country
        );

        // Get top cities for markers
        const cityCounts = d3.rollup(
            applicants,
            v => v.length,
            d => d.location.city
        );

        // Convert to arrays
        return {
            countries: Array.from(countryCounts, ([name, value]) => ({ name, value })),
            cities: Array.from(cityCounts, ([name, value]) => ({ name, value }))
        };
    }, [applicants]);

    // 3. Trend Data
    const trendData = useMemo(() => {
        // Group by month or week based on appliedDate
        const trends = d3.rollup(
            applicants,
            v => v.length,
            d => {
                const date = new Date(d.appliedDate);
                // Group by week start
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const monday = new Date(date.setDate(diff));
                return monday.toISOString().split('T')[0];
            }
        );

        const sortedData = Array.from(trends, ([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sortedData;
    }, [applicants]);

    // 4. Job Distribution (Pie/Donut)
    const roleDistribution = useMemo(() => {
        const roles = d3.rollup(applicants, v => v.length, d => d.jobTitle);
        return Array.from(roles, ([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [applicants]);

    return {
        funnelCounts,
        mapData,
        trendData,
        roleDistribution
    };
};
