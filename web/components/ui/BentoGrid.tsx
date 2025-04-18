import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
  gap?: 'none' | 'sm' | 'md' | 'lg';
  columns?: number;
  colorRule?: string;
}

const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  className,
  gap = 'md',
  columns,
  colorRule,
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  // Generate column classes based on the columns prop
  const getColumnClasses = () => {
    if (columns) {
      return `grid-cols-${columns}`;
    }
    return 'grid-cols-4 md:grid-cols-8 lg:grid-cols-12';
  };

  return (
    <div
      className={clsx(
        'grid',
        getColumnClasses(),
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
