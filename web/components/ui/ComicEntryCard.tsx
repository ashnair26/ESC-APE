'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import BrutalistButton from './BrutalistButton';

interface ComicEntryCardProps {
  chapterNumber: number;
  chapterTitle: string;
  description?: string;
  coverImage: string;
  isNew?: boolean;
  isLocked?: boolean;
  buttonText?: string;
  onClick?: () => void;
  className?: string;
}

const ComicEntryCard: React.FC<ComicEntryCardProps> = ({
  chapterNumber,
  chapterTitle,
  description,
  coverImage,
  isNew = false,
  isLocked = false,
  buttonText = 'Read Now',
  onClick,
  className,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!isLocked) {
      // Default behavior: navigate to comic reader with the chapter
      router.push(`/reader/chapter/${chapterNumber}`);
    }
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-custom border border-gray-200 dark:border-gray-700 dark:bg-[#181818] shadow-md',
        'w-[358px] h-[514px] flex flex-col',
        className
      )}
      style={{ borderWidth: '0.5px' }}
    >
      {/* Cover Image (fills entire card) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={coverImage}
          alt={`Chapter ${chapterNumber}: ${chapterTitle}`}
          fill
          sizes="358px"
          className={clsx(
            'object-cover transition-opacity duration-300',
            isLocked && 'opacity-50 filter blur-sm'
          )}
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* New badge */}
      {isNew && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center rounded-full bg-primary-600 px-3 py-1 text-sm font-medium text-white">
            NEW
          </span>
        </div>
      )}

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="rounded-full bg-black/70 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Content overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 text-white">
        <div className="space-y-2 mb-4">
          <div className="text-sm font-medium text-primary-400 font-escape-heading">Chapter {chapterNumber}</div>
          <h3 className="text-xl font-bold tracking-tight font-escape-heading">{chapterTitle}</h3>
          {description && (
            <p className="text-sm text-gray-300 line-clamp-2 font-escape-body">{description}</p>
          )}
        </div>

        <BrutalistButton
          color="red"
          className="w-full"
          onClick={handleClick}
          disabled={isLocked}
          style={!isLocked ? { backgroundColor: '#c20023', borderColor: '#000000' } : undefined}
        >
          {isLocked ? 'LOCKED' : buttonText.toUpperCase()}
        </BrutalistButton>
      </div>
    </div>
  );
};

export default ComicEntryCard;
