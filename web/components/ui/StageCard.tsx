'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import Button from './Button';

interface StageCardProps {
  stageNumber: number;
  stageTitle: string;
  loreText: string;
  backgroundImage: string;
  isLocked?: boolean;
  correctPassword?: string;
  onUnlock?: () => void;
  className?: string;
}

const StageCard: React.FC<StageCardProps> = ({
  stageNumber,
  stageTitle,
  loreText,
  backgroundImage,
  isLocked = true,
  correctPassword = '',
  onUnlock,
  className,
}) => {
  const [password, setPassword] = useState('');
  const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(!isLocked);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (isPasswordIncorrect) {
      setIsPasswordIncorrect(false);
    }
  };

  const handleUnlock = () => {
    if (password === correctPassword) {
      setIsUnlocked(true);
      if (onUnlock) {
        onUnlock();
      }
    } else {
      setIsPasswordIncorrect(true);
      // Shake animation for incorrect password
      const input = document.getElementById(`stage-password-${stageNumber}`);
      if (input) {
        input.classList.add('animate-shake');
        setTimeout(() => {
          input.classList.remove('animate-shake');
        }, 500);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-custom border border-gray-200 dark:border-gray-700 dark:bg-[#181818] shadow-md',
        'w-full h-[574px] md:max-w-[1174px]',
        className
      )}
      style={{ borderWidth: '0.5px' }}
    >
      {/* Background Image (full-bleed) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={backgroundImage}
          alt={`Stage ${stageNumber}: ${stageTitle}`}
          fill
          sizes="(max-width: 768px) 100vw, 1174px"
          className={clsx(
            'object-cover transition-opacity duration-300',
            isLocked && !isUnlocked && 'opacity-70 filter blur-sm'
          )}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Stage number badge removed as requested */}

      {/* Content overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-escape-heading">{stageTitle}</h2>
            <p className="text-lg text-gray-200 line-clamp-3 md:line-clamp-none font-escape-body">
              {isUnlocked ? loreText : loreText.replace(/[a-zA-Z]/g, '*')}
            </p>
          </div>

          {isLocked && !isUnlocked && (
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative">
                <input
                  id={`stage-password-${stageNumber}`}
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter password"
                  className={clsx(
                    'px-4 py-3 bg-black/70 border-2 text-white placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-white/50',
                    'w-full md:w-64 font-escape-body',
                    isPasswordIncorrect ? 'border-red-500' : 'border-white/30'
                  )}
                />
                {isPasswordIncorrect && (
                  <p className="absolute -bottom-6 left-0 text-red-400 text-sm font-escape-body">
                    Incorrect password
                  </p>
                )}
              </div>
              <Button
                className="font-normal"
                onClick={handleUnlock}
              >
                Unlock
              </Button>
            </div>
          )}

          {(!isLocked || isUnlocked) && (
            <Button
              className="font-normal"
            >
              Enter Stage
            </Button>
          )}
        </div>
      </div>

      {/* Locked overlay */}
      {isLocked && !isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
          <div className="rounded-full bg-black/50 p-8 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageCard;
