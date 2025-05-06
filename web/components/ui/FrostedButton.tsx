import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import Button from './Button';

/**
 * FrostedButton Component
 *
 * A button with a frosted glass effect, featuring a semi-transparent background
 * with blur and a border.
 */
export interface FrostedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  className?: string;
}

const FrostedButton = React.forwardRef<HTMLButtonElement, FrostedButtonProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={clsx(
          'bg-brand bg-opacity-50 backdrop-blur-sm dark:bg-brand-dark dark:bg-opacity-50',
          'border-[0.5px] border-brand dark:border-brand-dark',
          'hover:bg-opacity-70 dark:hover:bg-opacity-70',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

FrostedButton.displayName = 'FrostedButton';

export { FrostedButton };
