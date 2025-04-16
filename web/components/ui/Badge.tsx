import React, { ReactNode } from 'react';
import clsx from 'clsx';

type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

type BadgeSize = 'sm' | 'md' | 'lg';

type BadgeVariant = 'solid' | 'outline' | 'subtle';

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  size?: BadgeSize;
  variant?: BadgeVariant;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = 'primary',
  size = 'md',
  variant = 'subtle',
  className,
}) => {
  const colorClasses = {
    solid: {
      primary: 'bg-primary-600 text-white',
      secondary: 'bg-secondary-600 text-white',
      accent: 'bg-accent-600 text-white',
      success: 'bg-green-600 text-white',
      error: 'bg-red-600 text-white',
      warning: 'bg-yellow-600 text-white',
      info: 'bg-blue-600 text-white',
    },
    outline: {
      primary: 'bg-transparent text-primary-600 border border-primary-600',
      secondary: 'bg-transparent text-secondary-600 border border-secondary-600',
      accent: 'bg-transparent text-accent-600 border border-accent-600',
      success: 'bg-transparent text-green-600 border border-green-600',
      error: 'bg-transparent text-red-600 border border-red-600',
      warning: 'bg-transparent text-yellow-600 border border-yellow-600',
      info: 'bg-transparent text-blue-600 border border-blue-600',
    },
    subtle: {
      primary: 'bg-primary-50 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300',
      secondary: 'bg-secondary-50 text-secondary-800 dark:bg-secondary-900/20 dark:text-secondary-300',
      accent: 'bg-accent-50 text-accent-800 dark:bg-accent-900/20 dark:text-accent-300',
      success: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      error: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        colorClasses[variant][color],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
