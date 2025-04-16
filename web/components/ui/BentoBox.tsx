import React, { ReactNode } from 'react';
import clsx from 'clsx';

type BentoBoxSize = '1x1' | '1x2' | '2x1' | '2x2' | '2x3' | '3x2' | '3x3';

interface BentoBoxProps {
  children: ReactNode;
  size?: BentoBoxSize;
  className?: string;
  onClick?: () => void;
}

const BentoBox: React.FC<BentoBoxProps> = ({
  children,
  size = '1x1',
  className,
  onClick,
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

  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg',
        sizeClasses[size],
        onClick && 'cursor-pointer transition-all hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BentoBox;
