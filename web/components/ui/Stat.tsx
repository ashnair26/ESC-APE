import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatProps {
  title: string;
  value: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: ReactNode;
  className?: string;
}

const Stat: React.FC<StatProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className,
}) => {
  const renderChange = () => {
    if (change === undefined || change === null) return null;
    
    const changeValue = Math.abs(change);
    const formattedChange = Number.isInteger(changeValue)
      ? changeValue.toString()
      : changeValue.toFixed(1);
    
    return (
      <div
        className={clsx(
          'inline-flex items-center text-sm font-medium',
          {
            'text-green-600 dark:text-green-400': changeType === 'increase',
            'text-red-600 dark:text-red-400': changeType === 'decrease',
            'text-gray-500 dark:text-gray-400': changeType === 'neutral',
          }
        )}
      >
        {changeType === 'increase' && (
          <ArrowUpIcon className="mr-1 h-4 w-4 flex-shrink-0" />
        )}
        {changeType === 'decrease' && (
          <ArrowDownIcon className="mr-1 h-4 w-4 flex-shrink-0" />
        )}
        {formattedChange}%
      </div>
    );
  };

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-gray-800',
        className
      )}
    >
      <div className="flex items-center">
        {icon && (
          <div className="flex-shrink-0 rounded-md bg-primary-50 p-3 dark:bg-primary-900/20">
            <div className="h-6 w-6 text-primary-500 dark:text-primary-400">
              {icon}
            </div>
          </div>
        )}
        <div className={clsx(icon && 'ml-5')}>
          <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </dt>
          <dd className="mt-1 flex items-baseline justify-between">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </div>
            {renderChange() && (
              <div className="ml-2">{renderChange()}</div>
            )}
          </dd>
        </div>
      </div>
    </div>
  );
};

export default Stat;
