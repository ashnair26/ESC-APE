import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  badge?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  badge,
  className,
  onClick,
}) => {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800',
        onClick && 'cursor-pointer transition-all hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {title}
            </h3>
            {badge && <div>{badge}</div>}
          </div>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
