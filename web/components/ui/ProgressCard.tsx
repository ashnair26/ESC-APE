import React from 'react';
import clsx from 'clsx';
import Card from './Card';
import Badge from './Badge';

interface ProgressCardProps {
  title: string;
  progress: number;
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'At Risk';
  startDate?: string;
  endDate?: string;
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  progress,
  status = 'In Progress',
  startDate,
  endDate,
  className,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'Not Started':
        return <Badge color="info" variant="subtle">Not Started</Badge>;
      case 'In Progress':
        return <Badge color="primary" variant="subtle">In Progress</Badge>;
      case 'Completed':
        return <Badge color="success" variant="subtle">Completed</Badge>;
      case 'On Hold':
        return <Badge color="warning" variant="subtle">On Hold</Badge>;
      case 'At Risk':
        return <Badge color="error" variant="subtle">At Risk</Badge>;
      default:
        return null;
    }
  };

  const getProgressColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (status === 'At Risk') return 'bg-red-500';
    if (status === 'On Hold') return 'bg-yellow-500';
    return 'bg-primary-500';
  };

  return (
    <Card
      title={title}
      badge={getStatusBadge()}
      className={className}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {progress}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500',
              getProgressColor()
            )}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        
        {(startDate || endDate) && (
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            {startDate && <span>Start: {startDate}</span>}
            {endDate && <span>End: {endDate}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProgressCard;
