'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { FrostedButton } from '@/components/ui/FrostedButton';
import './hover-styles.css';

export default function WelcomeOnboardingPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  // Animation states
  const [step, setStep] = useState(1);
  const [showFirstScreen, setShowFirstScreen] = useState(true);
  const [showSecondScreen, setShowSecondScreen] = useState(false);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'create' | 'connect' | null>(null); // Track selected option
  const [communityName, setCommunityName] = useState('');
  const [isNameChecked, setIsNameChecked] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState(false);
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);
  const [townDescription, setTownDescription] = useState(''); // State for description
  const [showThirdScreen, setShowThirdScreen] = useState(false); // State for step 3 visibility
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');

  // Refs for animation elements
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  // Refs for Step 2 elements to animate out
  const step2HeadingRef = useRef<HTMLDivElement>(null);
  const step2FormContainerRef = useRef<HTMLDivElement>(null);
  // Refs for Step 3 elements to animate in
  const step3HeadingRef = useRef<HTMLDivElement>(null);
  const step3CardRef = useRef<HTMLDivElement>(null);

  // Reset form state when component unmounts
  useEffect(() => {
    return () => {
      setCommunityName('');
      setIsNameChecked(false);
      setIsNameAvailable(false);
      setIsButtonAnimating(false);
      setSelectedOption(null); // Reset selection on unmount
      setTownDescription(''); // Reset description on unmount
      setPrimaryColor('');
      setSecondaryColor('');
      setAccentColor('');
    };
  }, []);

  // Basic loading state
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!authenticated) {
    router.replace('/login');
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <LoadingSpinner size="lg" />
        <span className="ml-3">Redirecting to login...</span>
      </div>
    );
  }

  // Handle going back to previous step
  const handleBack = () => {
    if (step > 1) {
      // Force reset the input field directly in the DOM
      const inputField = document.querySelector('input[type="text"]');
      if (inputField) {
        // @ts-ignore - we know this is an HTMLInputElement
        inputField.value = '';
      }

      // REMOVED incorrect global reset block here

      if (step === 3) {
        // Going back from Step 3 to Step 2
        // Add slide-out-right animations to Step 3 elements
        if (step3HeadingRef.current) step3HeadingRef.current.classList.add('slide-out-right');
        if (step3CardRef.current) step3CardRef.current.classList.add('slide-out-right-delay-1');

        // Removed applying slide-in-left here, will do it after state update

        // Increased timeout to match forward transitions
        setTimeout(() => {
          // First update the state
          setShowThirdScreen(false);
          setShowSecondScreen(true); // Show Step 2
          setStep(2);
          setAnimateProgress(false); // Stop progress animation

          // Reset Step 3 state ONLY
          setPrimaryColor('');
          setSecondaryColor('');
          setAccentColor('');
          // DO NOT reset Step 2 state here

          // Use a very short timeout to ensure DOM is updated before adding animation classes
          setTimeout(() => {
            // Apply slide-in-left animations AFTER Step 2 is shown and DOM is updated
            if (step2HeadingRef.current) {
              step2HeadingRef.current.classList.remove('slide-out-right', 'slide-out-left', 'slide-in-right'); // Clean up all classes
              step2HeadingRef.current.classList.add('slide-in-left');
            }
            if (step2FormContainerRef.current) {
              step2FormContainerRef.current.classList.remove('slide-out-right-delay-1', 'slide-out-left-delay-1', 'slide-in-right-delay-1'); // Clean up all classes
              step2FormContainerRef.current.classList.add('slide-in-left-delay-1');
            }
          }, 20); // Very short delay to ensure DOM is updated
        }, 400); // Increased to match forward transitions

      } else if (step === 2) { // Going back from Step 2 to Step 1
        // Going back from Step 2 to Step 1
        // Add slide-out-right animations to Step 2 elements
        if (step2HeadingRef.current) {
          step2HeadingRef.current.classList.remove('slide-in-right', 'slide-in-left'); // Clean up entry classes
          step2HeadingRef.current.classList.add('slide-out-right');
        }
        if (step2FormContainerRef.current) {
          step2FormContainerRef.current.classList.remove('slide-in-right-delay-1', 'slide-in-left-delay-1');
          step2FormContainerRef.current.classList.add('slide-out-right-delay-1');
        }

        // Removed applying slide-in-left here, will do it after state update

        // Increased timeout to match forward transitions
        setTimeout(() => {
          // First update the state
          setShowSecondScreen(false);
          setShowFirstScreen(true); // Show Step 1
          setStep(1);
          setAnimateProgress(false);

          // Reset Step 2 state ONLY when going back to Step 1
          setCommunityName('');
          setIsNameChecked(false);
          setIsNameAvailable(false);
          setTownDescription('');

          // Use a very short timeout to ensure DOM is updated before adding animation classes
          setTimeout(() => {
            // Apply slide-in-left animations AFTER Step 1 is shown and DOM is updated
            if (welcomeTextRef.current) {
              welcomeTextRef.current.classList.remove('slide-out-left', 'slide-out-right'); // Clean up exit classes
              welcomeTextRef.current.classList.add('slide-in-left'); // Apply entry
            }
            if (buttonsContainerRef.current) {
              // Assuming buttons container uses delayed animation
              buttonsContainerRef.current.classList.remove('slide-out-left-delay-1', 'slide-out-right-delay-1'); // Clean up exit classes
              buttonsContainerRef.current.classList.add('slide-in-left-delay-1'); // Apply entry
            }
            // Clean up individual button refs if they also had exit animations applied directly
            if (createButtonRef.current) createButtonRef.current.classList.remove('slide-out-left-delay-1', 'slide-out-right-delay-1');
            if (connectButtonRef.current) connectButtonRef.current.classList.remove('slide-out-left-delay-2', 'slide-out-right-delay-2');
          }, 20); // Very short delay to ensure DOM is updated
        }, 400); // Increased to match forward transitions
      }
    } else { // step === 1
      // If on first screen, reset selection or log out
      if (selectedOption) {
        setSelectedOption(null); // Deselect if going back from selection
      } else {
        logout(); // Log out if nothing selected yet
        router.replace('/login');
      }
    }
  };

  // Function to handle the animation sequence (now called from handleNext)
  const triggerStepTransition = () => {
    console.log('Triggering step transition animation');

    // Reset form state for step 2/3 when going forward from step 1
    setCommunityName('');
    setIsNameChecked(false);
    setIsNameAvailable(false);
    setIsButtonAnimating(false);
    setTownDescription('');
    setPrimaryColor('');
    setSecondaryColor('');
    setAccentColor('');

    // Start the animation sequence
    setAnimateProgress(true);

    // Add animation classes to current content using refs
    if (welcomeTextRef.current) {
      welcomeTextRef.current.classList.add('slide-out-left');
    }
    if (createButtonRef.current) {
      createButtonRef.current.classList.add('slide-out-left-delay-1');
    }
    if (connectButtonRef.current) {
      connectButtonRef.current.classList.add('slide-out-left-delay-2');
    }

    // Show second screen after animation delay
    setTimeout(() => {
      // Reset step 2/3 state again to be sure
      setCommunityName('');
      setIsNameChecked(false);
      setIsNameAvailable(false);
      setTownDescription('');
      setPrimaryColor('');
      setSecondaryColor('');
      setAccentColor('');

      setShowFirstScreen(false);
      setShowSecondScreen(true);
      setStep(2);
      // Keep selectedOption as 'create'

        // Programmatically add slide-in-right for Step 2 entry
        requestAnimationFrame(() => {
          if (step2HeadingRef.current) {
            step2HeadingRef.current.classList.remove('slide-out-right', 'slide-out-left', 'slide-in-left');
            step2HeadingRef.current.offsetHeight; // Force reflow
            step2HeadingRef.current.classList.add('slide-in-right');
          }
          if (step2FormContainerRef.current) {
            step2FormContainerRef.current.classList.remove('slide-out-right-delay-1', 'slide-out-left-delay-1', 'slide-in-left-delay-1');
            step2FormContainerRef.current.offsetHeight; // Force reflow
            step2FormContainerRef.current.classList.add('slide-in-right-delay-1');
          }
        });
        setAnimateProgress(false); // Reset animation trigger after timeout
      }, 400); // Adjust timing if needed
    };

  // Handle checking if town name is available
  const checkTownName = () => {
    // Triple check to ensure we don't proceed if the button should be disabled
    if (isButtonAnimating || communityName.trim().length === 0 || (isNameChecked && isNameAvailable)) {
      console.log('Check button clicked but disabled condition met');
      return;
    }

    // Start button animation
    setIsButtonAnimating(true);

    // Simulate API call to check if name is available
    setTimeout(() => {
      setIsNameChecked(true);
      // For demo purposes, let's say names with more than 3 characters are available
      const available = communityName.trim().length > 3;
      setIsNameAvailable(available);
      setIsButtonAnimating(false);

      if (available) {
        console.log('Town name validated successfully - button now disabled');
        // After successful validation, the button will be disabled
        // due to the disabled condition and pointerEvents: none in the button element
      }
    }, 800);
  };

  // Handle next button click based on current step and selection
  const handleNext = () => {
    if (step === 1) {
      if (selectedOption === 'create') {
        triggerStepTransition(); // Start animation for creating
      } else if (selectedOption === 'connect') {
        // Handle connect logic (e.g., navigate to a different page or show a modal)
        console.log('Connect Your Town selected - proceeding...');
        alert('Connect Your Town functionality not yet implemented.');
        // Example: router.push('/onboarding/connect');
      } else {
        // No option selected
        alert('Please select an option first.');
      }
    } else if (step === 2) {
      if (isNameChecked && isNameAvailable) {
        // Save the community name and proceed to next step
        console.log('Community name saved:', communityName);
        // Here we would normally save the data and navigate
        // Removed placeholder alert: alert('Community name saved: ' + communityName + '. Proceeding to next step (not implemented).');
        // Example: router.push('/onboarding/next-step');

        // --- Transition to Step 3 ---
        console.log('Transitioning from Step 2 to Step 3');
        setAnimateProgress(true); // Set BEFORE timeout, matching Step 1->2

        // Add slide-out-left animations to Step 2 elements
        if (step2HeadingRef.current) step2HeadingRef.current.classList.add('slide-out-left');
        if (step2FormContainerRef.current) step2FormContainerRef.current.classList.add('slide-out-left-delay-1');

        // Show Step 3 after animation delay
        setTimeout(() => {
          // Removed nested timeout
          setShowSecondScreen(false);
          setShowThirdScreen(true);
          setStep(3);
          // Reset Step 3 state just in case
          setPrimaryColor('');
          setSecondaryColor('');
          setAccentColor('');

        // Programmatically add slide-in-right for Step 3 entry AFTER state update
        requestAnimationFrame(() => {
          if (step3HeadingRef.current) {
            step3HeadingRef.current.classList.remove('slide-out-right', 'slide-out-left'); // Clean up exit classes
            step3HeadingRef.current.offsetHeight; // Force reflow
            step3HeadingRef.current.classList.add('slide-in-right');
          }
          if (step3CardRef.current) {
            step3CardRef.current.classList.remove('slide-out-right-delay-1', 'slide-out-left-delay-1'); // Clean up exit classes
            step3CardRef.current.offsetHeight; // Force reflow
            step3CardRef.current.classList.add('slide-in-right-delay-1');
          }
        });
        setAnimateProgress(false); // Reset animation trigger after timeout
      }, 400); // Match duration with Step 1->2

      } else {
        alert('Please enter and validate an available town name.');
      }
    } else if (step === 3) {
      // Handle submission from Step 3 (Brand Colors)
      console.log('Brand colors:', { primaryColor, secondaryColor, accentColor });
      alert('Brand colors submitted (not implemented). Proceeding to next step.');
      // Example: router.push('/onboarding/final-step');
    }
  };

  // Helper function for hex color validation (basic)
  const isValidHex = (color: string): boolean => /^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color);

  // Handle color input change
  const handleColorChange = (colorSetter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    // Ensure '#' prefix and limit length
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    value = value.slice(0, 7);
    colorSetter(value);
  };

  // Determine if Next button should be disabled
  const isNextDisabled = () => {
    if (step === 1 && !selectedOption) return true;
    if (step === 2 && (!isNameChecked || !isNameAvailable)) return true;
    // Add validation for step 3 if needed (e.g., require primary color)
    // if (step === 3 && !isValidHex(primaryColor)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      {/* Card container */}
      <div className="w-full max-w-[814px] min-h-[500px] md:h-[738px] bg-[#111111] p-6 sm:p-8 md:p-10 flex flex-col relative border-[0.5px] border-white border-opacity-50 overflow-hidden card-entry-animation" style={{ fontFamily: 'var(--font-league-spartan)', display: 'flex', flexDirection: 'column', borderRadius: '30px' }}>
        {/* Header row with back button, logo and next button */}
        <div className="flex justify-between items-center w-full px-0 mb-8" style={{ marginTop: '-20px' }}>

          {/* Back Button */}
          <div className="flex-1 flex justify-start">
            <button
              style={{ marginLeft: '-10px' }}
              onClick={handleBack}
              className="w-10 h-10 rounded-full border-[0.5px] border-white border-opacity-50 flex items-center justify-center hover:border-[#C20023] hover:border-opacity-100 transition-all duration-200"
              aria-label="Back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/images/ESCAPE3.svg"
              alt="ESCAPE Logo"
              width={180}
              height={70}
              className="w-auto h-auto max-w-[120px] sm:max-w-[180px]"
              priority
            />
          </div>
          {/* Next Button - Conditionally disabled */}
          <div className="flex-1 flex justify-end">
            <FrostedButton
              onClick={handleNext}
              disabled={isNextDisabled()}
              className={clsx(
                "text-sm",
                isNextDisabled() && "opacity-50 cursor-not-allowed" // Style when disabled
              )}
              style={{ marginRight: '-10px', borderRadius: '9999px', paddingLeft: '24px', paddingRight: '24px', minWidth: '100px' }}
            >
              Next
            </FrostedButton>
          </div>
        </div>

        {/* Progress indicator - Make animateToStep dynamic */}
        <div className="content-animation-1">
          <OnboardingProgress
            currentStep={step}
            totalSteps={4}
            animateToStep={animateProgress ? step + 1 : undefined} // Animate towards the NEXT step
          />
        </div>

        {/* First Screen - Welcome */}
        {showFirstScreen && (
          <>
            {/* Welcome text - positioned below progress bars */}
            <div ref={welcomeTextRef} className="content-animation-2 welcome-text" style={{ position: 'relative', marginTop: '40px', textAlign: 'center', padding: '0 20px', opacity: 0 }}>
              <h1 className="font-normal" style={{ fontFamily: 'League Spartan, sans-serif', fontSize: 'clamp(24px, 5vw, 40px)' }}>Hello! What would you like to do?</h1>
            </div>

            {/* Selection buttons */}
            <div ref={buttonsContainerRef} className="content-animation-3 buttons-container" style={{
              opacity: 0, // Start invisible
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              position: 'relative',
              maxWidth: '392px',
              margin: '60px auto 0',
              width: '100%',
              padding: '0 20px'
            }}>
              {/* Create Community Option */}
              {/* Create Community Option */}
              <button
                ref={createButtonRef}
                onClick={() => setSelectedOption('create')}
                className={clsx(
                  'onboarding-option-btn', // Shared class for styling
                  selectedOption === 'create' && 'active-selection' // Active class
                )}
                style={{
                  width: '100%',
                  height: '110px',
                  borderRadius: '13px',
                  border: '0.5px solid white',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  fontFamily: 'League Spartan, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  textAlign: 'left',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer', // Ensure cursor is pointer
                }}
              >
                Create a New Town
              </button>

              {/* Connect Community Option (Now Enabled) */}
              <button
                ref={connectButtonRef}
                onClick={() => setSelectedOption('connect')}
                className={clsx(
                  'onboarding-option-btn', // Shared class for styling
                  selectedOption === 'connect' && 'active-selection' // Active class
                )}
                style={{
                  width: '100%',
                  height: '110px',
                  borderRadius: '13px',
                  border: '0.5px solid white',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '24px',
                  fontFamily: 'League Spartan, sans-serif',
                  fontWeight: 400,
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  textAlign: 'left',
                  color: 'white', // Use white color
                  cursor: 'pointer', // Ensure cursor is pointer
                  transition: 'all 0.3s ease'
                }}
                // Removed disabled attribute
              >
                Connect your Town
              </button>
            </div>
          </>
        )}

        {/* --- Second Screen - Community Name --- */}
        {showSecondScreen && (
          <>
            {/* Heading - Added ref, removed hardcoded animation class */}
            <div ref={step2HeadingRef} className="second-screen-heading" style={{ position: 'relative', marginTop: '40px', textAlign: 'center', padding: '0 20px', opacity: 0 }}>
              <h1 className="font-normal" style={{ fontFamily: 'League Spartan, sans-serif', fontSize: 'clamp(24px, 5vw, 40px)' }}>Tell us more about your Town?</h1>
            </div>

            {/* Form Container - Added ref, removed hardcoded animation class */}
            <div ref={step2FormContainerRef} className="second-screen-form-container" style={{
              opacity: 0, // Start invisible
              display: 'flex',
              flexDirection: 'column',
              gap: '3.25px',
              position: 'relative',
              maxWidth: '392px',
              margin: '60px auto 0',
              width: '100%',
              padding: '0 20px'
            }}>
              {/* Label and character count */}
              <div style={{ marginBottom: '0.325px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="text-white text-lg" style={{ fontFamily: 'League Spartan, sans-serif' }}>Let's name your Town</label>
                <span className="text-white text-sm opacity-70" style={{ paddingLeft: '8px' }}>{communityName.length}/30</span>
              </div>
              {/* Input field and check button container - Add transition: none */}
              <div style={{ position: 'relative', marginTop: '-1px', transition: 'none' }}>
                <input
                  key={`town-name-input-${showSecondScreen}`} // Keep key for reset
                  type="text"
                  value={communityName}
                  onChange={(e) => {
                    setCommunityName(e.target.value.slice(0, 30));
                    // Reset check status when input changes
                    if (isNameChecked) {
                      setIsNameChecked(false);
                      setIsNameAvailable(false);
                    }
                  }}
                  placeholder="Enter town name"
                  style={{
                    width: '100%',
                    height: '60px',
                    borderRadius: '13px',
                    border: '0.5px solid rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'transparent',
                    paddingLeft: '24px',
                    paddingRight: '60px', // Make room for the button
                    fontFamily: 'League Spartan, sans-serif',
                    fontSize: '18px',
                    color: 'white',
                    outline: 'none',
                    transition: 'none' // Add transition: none here too
                  }}
                  autoFocus
                />
                {/* Square check button */}
                <button
                  onClick={() => {
                    // Don't allow clicks when the button should be disabled
                    if (isButtonAnimating || communityName.trim().length === 0 || (isNameChecked && isNameAvailable)) {
                      return;
                    }
                    checkTownName();
                  }}
                  disabled={isButtonAnimating || communityName.trim().length === 0 || (isNameChecked && isNameAvailable)}
                  // Removed check-button-success class from here
                  className={`${isButtonAnimating ? 'check-button-spin' : ''}`}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: isNameChecked && isNameAvailable ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                    border: '0.5px solid rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (isButtonAnimating || communityName.trim().length === 0 || (isNameChecked && isNameAvailable)) ? 'not-allowed' : 'pointer',
                    pointerEvents: (isNameChecked && isNameAvailable) ? 'none' : 'auto', // Explicitly prevent clicks when validated
                    transition: 'none !important' // Force no transition
                  }}
                >
                  {isButtonAnimating ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeDasharray="40" strokeDashoffset="0">
                      </circle>
                    </svg>
                  ) : isNameChecked && isNameAvailable ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              {/* Availability message */}
              {isNameChecked && (
                <div
                  className="text-fade-in"
                  style={{
                    marginTop: '3.25px',
                    fontSize: '14px',
                    color: isNameAvailable ? '#10b981' : '#ef4444',
                    fontFamily: 'League Spartan, sans-serif'
                  }}
                >
                  {isNameAvailable ? 'Town name available' : 'Town name not available'}
                </div>
              )}

              {/* Description Input - Conditionally rendered */}
              {isNameChecked && isNameAvailable && (
                 // Removed className="text-fade-in" from this container
                <div style={{ marginTop: '20px' }}>
                  {/* Label and character count for description */}
                  <div style={{ marginBottom: '0.325px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="text-white text-lg" style={{ fontFamily: 'League Spartan, sans-serif' }}>Describe your Town</label> {/* Changed capitalization */}
                    <span className="text-white text-sm opacity-70" style={{ paddingLeft: '8px' }}>{townDescription.length}/150</span>
                  </div>
                  {/* Textarea */}
                  <textarea
                    value={townDescription}
                    onChange={(e) => setTownDescription(e.target.value.slice(0, 150))}
                    placeholder="Enter town description (optional)"
                    style={{
                      width: '100%',
                      height: '125px', // Adjusted height for ~4 lines
                      borderRadius: '13px',
                      border: '0.5px solid rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'transparent',
                      paddingLeft: '24px',
                      paddingRight: '24px', // Adjust padding as needed
                      paddingTop: '12px', // Add padding top
                      paddingBottom: '12px', // Add padding bottom
                      fontFamily: 'League Spartan, sans-serif',
                      fontSize: '18px',
                      color: 'white',
                      outline: 'none',
                      resize: 'none' // Prevent resizing
                    }}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* --- Third Screen - Brand Colors --- */}
        {showThirdScreen && (
          <>
            {/* Heading - Added ref, removed hardcoded animation class */}
            <div ref={step3HeadingRef} className="" style={{ position: 'relative', marginTop: '40px', textAlign: 'center', padding: '0 20px', opacity: 0 }}>
              <h1 className="font-normal" style={{ fontFamily: 'League Spartan, sans-serif', fontSize: 'clamp(24px, 5vw, 40px)' }}>Let's set up your brand colors next!</h1>
            </div>

            {/* Color Palette Card - Added ref, removed hardcoded animation class, adjusted width */}
            <div ref={step3CardRef} className="" style={{
              opacity: 0, // Start invisible
              marginTop: '40px', // Keep top margin
              width: '387px', // Set exact width as requested
              maxWidth: '100%', // Ensure it doesn't overflow on small screens
              margin: '40px auto 0', // Center horizontally with auto margins
              padding: '20px',
              border: '0.5px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '13px',
              backgroundColor: 'transparent', // Match main card background
            }}>
              <p className="text-center text-lg mb-6" style={{ fontFamily: 'League Spartan, sans-serif' }}>Choose your color palette</p>

              <div className="space-y-[10px]"> {/* Set exact 10px spacing between bars */}
                {/* Primary Color */}
                <div className="flex items-center w-full">
                  <div className="w-full rounded-md border border-white/30 flex items-center" style={{
                    backgroundColor: isValidHex(primaryColor) ? primaryColor : 'transparent',
                    height: '76px' // Increased height to 76px
                  }}>
                    {/* Color Picker Button - Now at the start */}
                    <button className="w-8 h-8 rounded border border-white/50 flex items-center justify-center text-white/70" style={{ margin: '0 12px' }}>
                      {/* Teardrop Icon Placeholder */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v11.25a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5V5.25a1.5 1.5 0 0 1 1.5-1.5h1.5Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75a4.5 4.5 0 0 0-4.5-4.5m4.5 4.5a4.5 4.5 0 0 1-4.5 4.5M15 12.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={handleColorChange(setPrimaryColor)}
                      maxLength={7}
                      placeholder="# Primary"
                      className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-white/50 px-2 py-2"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="flex items-center w-full">
                  {/* Middle length bar */}
                  <div className="w-3/4 rounded-md border border-white/30 flex items-center" style={{
                    backgroundColor: isValidHex(secondaryColor) ? secondaryColor : 'transparent',
                    height: '76px' // Increased height to 76px
                  }}>
                    {/* Color Picker Button - Now at the start */}
                    <button className="w-8 h-8 rounded border border-white/50 flex items-center justify-center text-white/70" style={{ margin: '0 12px' }}>
                      {/* Teardrop Icon Placeholder */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v11.25a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5V5.25a1.5 1.5 0 0 1 1.5-1.5h1.5Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75a4.5 4.5 0 0 0-4.5-4.5m4.5 4.5a4.5 4.5 0 0 1-4.5 4.5M15 12.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={handleColorChange(setSecondaryColor)}
                      maxLength={7}
                      placeholder="# Secondary"
                      className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-white/50 px-2 py-2"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="flex items-center w-full">
                  {/* Shortest bar */}
                  <div className="w-1/2 rounded-md border border-white/30 flex items-center" style={{
                    backgroundColor: isValidHex(accentColor) ? accentColor : 'transparent',
                    height: '76px' // Increased height to 76px
                  }}>
                    {/* Color Picker Button - Now at the start */}
                    <button className="w-8 h-8 rounded border border-white/50 flex items-center justify-center text-white/70" style={{ margin: '0 12px' }}>
                      {/* Teardrop Icon Placeholder */}
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75a1.5 1.5 0 0 1 1.5 1.5v11.25a1.5 1.5 0 0 1-1.5 1.5h-1.5a1.5 1.5 0 0 1-1.5-1.5V5.25a1.5 1.5 0 0 1 1.5-1.5h1.5Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75a4.5 4.5 0 0 0-4.5-4.5m4.5 4.5a4.5 4.5 0 0 1-4.5 4.5M15 12.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={accentColor}
                      onChange={handleColorChange(setAccentColor)}
                      maxLength={7}
                      placeholder="# Accent"
                      className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-white/50 px-2 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- Spacer and User Info --- */}
        <div className="flex-grow"></div>
        <div className="text-center text-xs text-gray-500 mt-4 mb-4">
          Logged in as: {user?.wallet?.address || (user?.email?.address ? user.email.address : '...')}
        </div>
      </div>
    </div>
  );
}
