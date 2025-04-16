import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  gap?: 'none' | 'sm' | 'md' | 'lg';
}

const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  className,
  gap = 'md',
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div
      className={clsx(
        'grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12',
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
