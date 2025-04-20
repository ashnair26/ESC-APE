import React, { ReactNode } from 'react';
import clsx from 'clsx';

type BentoBoxSize = '1x1' | '1x2' | '2x1' | '2x2' | '2x3' | '3x2' | '3x3';

interface BentoBoxProps {
  children: ReactNode;
  size?: BentoBoxSize;
  className?: string;
  onClick?: () => void;
  noBorder?: boolean;
  title?: string | ReactNode;
  colorCategory?: string;
}

const BentoBox: React.FC<BentoBoxProps> = ({
  children,
  size = '1x1',
  className,
  onClick,
  noBorder = false,
  title,
  colorCategory,
}) => {
  const sizeClasses = {
    '1x1': 'col-span-4 md:col-span-4 lg:col-span-3 row-span-1',
    '1x2': 'col-span-4 md:col-span-4 lg:col-span-3 row-span-2',
    '2x1': 'col-span-4 md:col-span-8 lg:col-span-6 row-span-1',
    '2x2': 'col-span-4 md:col-span-8 lg:col-span-6 row-span-2',
    '2x3': 'col-span-4 md:col-span-8 lg:col-span-6 row-span-3',
    '3x2': 'col-span-4 md:col-span-8 lg:col-span-9 row-span-2',
    '3x3': 'col-span-4 md:col-span-8 lg:col-span-9 row-span-3',
  };

  // Check if the child is a component that already has a border
  // For the dashboard example, we don't want to add a border to the BentoBox
  // when it contains a Stat or ProgressCard component
  const shouldHaveBorder = !noBorder;

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-custom',
        shouldHaveBorder && 'border border-gray-200 dark:border-gray-700 dark:bg-[#181818] border-[0.5px]',
        sizeClasses[size],
        onClick && 'cursor-pointer transition-all hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <div className="px-4 py-3">
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      )}
      <div className={title ? 'p-4' : ''}>
        {children}
      </div>
    </div>
  );
};

export default BentoBox;
