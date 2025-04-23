import React from 'react';
import clsx from 'clsx';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number; // Keep totalSteps for flexibility, though hardcoding to 4 lines for now
  animateToStep?: number; // Optional step to animate to
}

// Define the active color
const activeColor = '#C20023'; // Use the requested color

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 4, // Default/assume 4 steps for the 4 lines
  animateToStep,
}) => {
  return (
    // Container for the progress lines with responsive positioning and dimensions
    <div className="w-full max-w-[387px] mx-auto mt-4 mb-8">
      <div className="flex items-center justify-center" style={{ gap: '6px' }}>
        {/* Create a line for each step */}
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep; // Line is active if it's the current step or a previous one

          // Determine if this step should be animated
          const shouldAnimate = animateToStep && stepNumber === animateToStep && stepNumber > currentStep;

          return (
            <div
              key={stepNumber}
              className={clsx(
                'h-[5px] w-[91.25px] rounded-full', // Exact height and width (387px - 18px gaps) / 4 steps
                shouldAnimate ? 'progress-fill-container' : '',
                isActive ? 'bg-[#C20023]' : 'bg-gray-300 dark:bg-gray-700' // Conditional background color
              )}
              style={isActive && !shouldAnimate ? { backgroundColor: activeColor } : {}} // Apply active color via style for hex
            ></div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
