'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner';

type BrutalistButtonColor =
  | 'red'
  | 'blue'
  | 'yellow'
  | 'green'
  | 'black'
  | 'white';

type BrutalistButtonSize = 'sm' | 'md' | 'lg';

interface BrutalistButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  color?: BrutalistButtonColor;
  size?: BrutalistButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  skew?: boolean;
  noisy?: boolean;
  className?: string;
}

const BrutalistButton: React.FC<BrutalistButtonProps> = ({
  children,
  color = 'black',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  skew = false,
  noisy = false,
  className,
  disabled,
  ...props
}) => {
  // Brutalist color schemes with high contrast
  const colorClasses = {
    red: 'bg-[#FF0000] text-white hover:bg-[#FF0000]/90 border-black',
    blue: 'bg-[#0000FF] text-white hover:bg-[#0000FF]/90 border-black',
    yellow: 'bg-[#FFFF00] text-black hover:bg-[#FFFF00]/90 border-black',
    green: 'bg-[#00FF00] text-black hover:bg-[#00FF00]/90 border-black',
    black: 'bg-black text-white hover:bg-black/90 border-white',
    white: 'bg-white text-black hover:bg-gray-100 border-black',
  };

  // Brutalist sizes with chunky proportions
  const sizeClasses = {
    sm: 'px-3 py-1 text-[10px] tracking-wider',
    md: 'px-5 py-2 text-xs tracking-wider', // Changed from text-sm to text-xs (12px)
    lg: 'px-7 py-3 text-sm tracking-wider',  // Changed from text-base to text-sm
  };

  // Noise texture for brutalist aesthetic
  const noiseStyle = noisy ? {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    backgroundBlendMode: 'multiply',
    backgroundSize: '200px 200px',
  } : {};

  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center font-lemonmilk font-bold uppercase tracking-wider',
        'border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]', // Changed from border-4 to border-2 and shadow from 4px to 2px
        'active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]', // Adjusted active state
        'transition-shadow duration-100 ease-in-out',
        colorClasses[color],
        sizeClasses[size],
        skew && 'transform -skew-x-6',
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      style={{
        ...noiseStyle,
      }}
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
      <span className={skew ? 'transform skew-x-6' : ''}>{children}</span>
      {!loading && iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
};

export default BrutalistButton;
