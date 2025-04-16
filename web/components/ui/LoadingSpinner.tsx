import React from 'react';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-t-transparent',
        sizeClasses[size],
        size === 'sm' ? 'border-2' : 'border-4',
        'border-primary-600 dark:border-primary-400',
        className
      )}
    />
  );
};

export default LoadingSpinner;
