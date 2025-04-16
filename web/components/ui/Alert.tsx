import React, { ReactNode } from 'react';
import clsx from 'clsx';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  title?: string;
  children: ReactNode;
  type?: AlertType;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  type = 'info',
  icon,
  actions,
  className,
  onClose,
}) => {
  const typeClasses = {
    success: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    error: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  };

  const iconClasses = {
    success: 'text-green-500 dark:text-green-400',
    error: 'text-red-500 dark:text-red-400',
    warning: 'text-yellow-500 dark:text-yellow-400',
    info: 'text-blue-500 dark:text-blue-400',
  };

  return (
    <div
      className={clsx(
        'rounded-md p-4',
        typeClasses[type],
        className
      )}
    >
      <div className="flex">
        {icon && (
          <div className={clsx('flex-shrink-0', iconClasses[type])}>
            {icon}
          </div>
        )}
        <div className={clsx('flex-1', icon && 'ml-3')}>
          {title && (
            <h3 className="text-sm font-medium">{title}</h3>
          )}
          <div className={clsx('text-sm', title && 'mt-2')}>
            {children}
          </div>
          {actions && (
            <div className="mt-4">{actions}</div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  {
                    'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40': type === 'success',
                    'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40': type === 'error',
                    'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40': type === 'warning',
                    'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40': type === 'info',
                  }
                )}
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
