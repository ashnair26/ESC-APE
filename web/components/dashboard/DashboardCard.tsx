import React from 'react';
import clsx from 'clsx';

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  className,
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
    secondary: 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-300',
    accent: 'bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300',
    success: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    error: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    warning: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  };

  const iconColorClasses = {
    primary: 'text-primary-500 dark:text-primary-400',
    secondary: 'text-secondary-500 dark:text-secondary-400',
    accent: 'text-accent-500 dark:text-accent-400',
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    info: 'text-blue-500 dark:text-blue-400',
  };

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800',
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div
            className={clsx(
              'flex-shrink-0 rounded-md p-3',
              colorClasses[color]
            )}
          >
            <Icon
              className={clsx('h-6 w-6', iconColorClasses[color])}
              aria-hidden="true"
            />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
