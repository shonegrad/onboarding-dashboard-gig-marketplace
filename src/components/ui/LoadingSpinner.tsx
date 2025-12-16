import { cn } from './utils';

interface LoadingSpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div className={cn('flex items-center justify-center p-8', className)}>
            <div
                className={cn(
                    'animate-spin rounded-full border-solid border-md-primary border-t-transparent',
                    sizeClasses[size]
                )}
                role="status"
                aria-label="Loading"
            />
        </div>
    );
}

export function ViewSkeleton() {
    return (
        <div className="space-y-4 p-6 animate-pulse">
            <div className="h-8 bg-md-surface-container-high rounded-lg w-48" />
            <div className="h-4 bg-md-surface-container-high rounded w-64" />
            <div className="grid gap-4 mt-6">
                <div className="h-32 bg-md-surface-container-high rounded-xl" />
                <div className="h-32 bg-md-surface-container-high rounded-xl" />
            </div>
        </div>
    );
}
