import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

/**
 * Button Component
 *
 * A clean, minimal button component with loading state support.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center rounded-full',
        'px-6 py-2',
        'bg-brand text-white dark:bg-brand-dark',
        'border border-transparent',
        'font-normal',
        'transition-colors duration-200',
        'hover:bg-brand-dark hover:dark:bg-brand-light',
        'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 dark:focus:ring-offset-slate-900',
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size="sm"
          className={clsx('text-current', children && 'mr-2')}
        />
      )}
      {!loading && icon && <span className={clsx('', children && 'mr-2')}>{icon}</span>}
      {children}
      {!loading && iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
