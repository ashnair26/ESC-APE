import React from 'react';

type FrostedButtonVariant = 'default' | 'outline' | 'ghost';
type FrostedButtonSize = 'default' | 'sm' | 'lg';

export interface FrostedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FrostedButtonVariant;
  size?: FrostedButtonSize;
  className?: string;
}

/**
 * FrostedButton Component
 *
 * A button with a frosted glass effect, featuring a semi-transparent background
 * with blur and a border. Designed for the ESCAPE admin dashboard.
 *
 * @param {string} variant - 'default', 'outline', or 'ghost'
 * @param {string} size - 'default', 'sm', or 'lg'
 * @param {function} onClick - Click handler function
 * @param {ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 */
const FrostedButton = React.forwardRef<HTMLButtonElement, FrostedButtonProps>(
  ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
    // Base classes
    const baseClasses = 'relative inline-flex items-center justify-center rounded-lg font-normal transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-["League Spartan"]';

    // Variant classes
    const variantClasses = {
      default: 'bg-[#C20023] bg-opacity-50 backdrop-blur-sm text-white border-[0.5px] border-[#C20023] hover:bg-opacity-70',
      outline: 'bg-transparent backdrop-blur-sm border-2 border-[#C20023] text-[#C20023] hover:bg-[#C20023] hover:bg-opacity-10',
      ghost: 'bg-transparent hover:bg-[#C20023] hover:bg-opacity-10 text-[#C20023]',
    };

    // Size classes
    const sizeClasses = {
      default: 'h-10 px-6 py-2',
      sm: 'h-8 px-4 py-1 text-sm',
      lg: 'h-12 px-8 py-3 text-lg',
    };

    // Combine classes
    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        className={buttonClasses}
        ref={ref}
        {...props}
      />
    );
  }
);

FrostedButton.displayName = 'FrostedButton';

export { FrostedButton };
