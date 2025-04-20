import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  title?: string | ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  badge,
  icon,
  className,
  onClick,
}) => {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-custom bg-white shadow dark:bg-[#181818] border border-gray-200 dark:border-gray-700 border-[0.5px]',
        onClick && 'cursor-pointer transition-all hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {icon && <div className="mr-2 text-gray-500 dark:text-gray-400">{icon}</div>}
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            {badge && <div>{badge}</div>}
          </div>
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && (
        <div className="px-4 py-4 sm:px-6">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
