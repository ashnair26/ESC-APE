'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
// No longer need to import from react-color directly
import clsx from 'clsx';
import { usePrivy } from '@privy-io/react-auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { FrostedButton } from '@/components/ui/FrostedButton';
import ColorPickerPopover from '@/components/ui/ColorPickerPopover';
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
  const [showFourthScreen, setShowFourthScreen] = useState(false); // State for step 4 visibility
  const [recycleConfetti, setRecycleConfetti] = useState(true); // State for confetti
  const [activePicker, setActivePicker] = useState<string | null>(null); // State for active picker

  // Refs for animation elements
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  // Refs for Step 2 elements
  const step2HeadingRef = useRef<HTMLDivElement>(null);
  const step2FormContainerRef = useRef<HTMLDivElement>(null);
  // Refs for Step 3 elements
  const step3HeadingRef = useRef<HTMLDivElement>(null);
  const step3CardRef = useRef<HTMLDivElement>(null);
  // Refs for Step 4 elements
  const step4HeadingRef = useRef<HTMLDivElement>(null);


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
      setRecycleConfetti(true); // Reset confetti state
      setActivePicker(null); // Close picker on unmount
    };
  }, []);

  // Create refs for color picker buttons
  const primaryColorButtonRef = useRef<HTMLButtonElement>(null);
  const secondaryColorButtonRef = useRef<HTMLButtonElement>(null);
  const accentColorButtonRef = useRef<HTMLButtonElement>(null);

  // Effect to trigger initial Step 1 animations on mount
  useEffect(() => {
    if (step === 1 && showFirstScreen) {
      requestAnimationFrame(() => {
        if (welcomeTextRef.current) {
          welcomeTextRef.current.classList.add('content-animation-2');
          welcomeTextRef.current.style.opacity = '1'; // Ensure opacity is set if animation doesn't handle it
        }
        if (buttonsContainerRef.current) {
          buttonsContainerRef.current.classList.add('content-animation-3');
          buttonsContainerRef.current.style.opacity = '1'; // Ensure opacity is set
        }
      });
    }
  }, []); // Empty dependency array ensures this runs only once on mount


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
      // Force reset the input field directly in the DOM (if applicable)
      const nameInput = document.querySelector('input[type="text"][placeholder="Enter town name"]');
      if (nameInput) {
        // @ts-ignore
        nameInput.value = '';
      }
      const descInput = document.querySelector('textarea');
       if (descInput) {
         // @ts-ignore
         descInput.value = '';
       }

      if (step === 4) {
         // Going back from Step 4 to Step 3
         if (step4HeadingRef.current) step4HeadingRef.current.classList.add('slide-out-right');

         setTimeout(() => {
           setShowFourthScreen(false);
           setShowThirdScreen(true);
           setStep(3);
           setAnimateProgress(false);

           // Apply slide-in-left animations AFTER Step 3 is shown
           requestAnimationFrame(() => {
             if (step3HeadingRef.current) {
               step3HeadingRef.current.classList.remove('slide-out-right', 'slide-out-left', 'slide-in-right');
               step3HeadingRef.current.classList.add('slide-in-left');
             }
             if (step3CardRef.current) {
               step3CardRef.current.classList.remove('slide-out-right-delay-1', 'slide-out-left-delay-1', 'slide-in-right-delay-1');
               step3CardRef.current.classList.add('slide-in-left-delay-1');
             }
           });
           // Reset only Step 4 related state if needed (none currently)
         }, 400); // Match animation duration

      } else if (step === 3) {
        // Going back from Step 3 to Step 2
        if (step3HeadingRef.current) step3HeadingRef.current.classList.add('slide-out-right');
        if (step3CardRef.current) step3CardRef.current.classList.add('slide-out-right-delay-1');

        setTimeout(() => {
          setShowThirdScreen(false);
          setShowSecondScreen(true);
          setStep(2);
          setAnimateProgress(false);

          // Reset Step 3 state ONLY
          setPrimaryColor('');
          setSecondaryColor('');
          setAccentColor('');
          setActivePicker(null); // Close picker when going back

          requestAnimationFrame(() => {
            if (step2HeadingRef.current) {
              step2HeadingRef.current.classList.remove('slide-out-right', 'slide-out-left', 'slide-in-right');
              step2HeadingRef.current.classList.add('slide-in-left');
            }
            if (step2FormContainerRef.current) {
              step2FormContainerRef.current.classList.remove('slide-out-right-delay-1', 'slide-out-left-delay-1', 'slide-in-right-delay-1');
              step2FormContainerRef.current.classList.add('slide-in-left-delay-1');
            }
          });
        }, 400);

      } else if (step === 2) { // Going back from Step 2 to Step 1
        if (step2HeadingRef.current) {
          step2HeadingRef.current.classList.remove('slide-in-right', 'slide-in-left');
          step2HeadingRef.current.classList.add('slide-out-right');
        }
        if (step2FormContainerRef.current) {
          step2FormContainerRef.current.classList.remove('slide-in-right-delay-1', 'slide-in-left-delay-1');
          step2FormContainerRef.current.classList.add('slide-out-right-delay-1');
        }

        setTimeout(() => {
          setShowSecondScreen(false);
          setShowFirstScreen(true);
          setStep(1);
          setAnimateProgress(false);

          setCommunityName('');
          setIsNameChecked(false);
          setIsNameAvailable(false);
          setTownDescription('');

          requestAnimationFrame(() => {
            if (welcomeTextRef.current) {
              welcomeTextRef.current.classList.remove('slide-out-left', 'slide-out-right');
              welcomeTextRef.current.classList.add('slide-in-left');
            }
            if (buttonsContainerRef.current) {
              buttonsContainerRef.current.classList.remove('slide-out-left-delay-1', 'slide-out-right-delay-1');
              buttonsContainerRef.current.classList.add('slide-in-left-delay-1');
            }
            if (createButtonRef.current) createButtonRef.current.classList.remove('slide-out-left-delay-1', 'slide-out-right-delay-1');
            if (connectButtonRef.current) connectButtonRef.current.classList.remove('slide-out-left-delay-2', 'slide-out-right-delay-2');
          });
        }, 400);
      }
    } else { // step === 1
      if (selectedOption) {
        setSelectedOption(null);
      } else {
        logout();
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

  // Function to handle transition to Step 4
  const transitionToStep4 = () => {
    console.log('Transitioning to Step 4');
    setActivePicker(null); // Close picker if open
    setAnimateProgress(true); // Animate progress bar to step 4

    // Add slide-out-left animations to Step 3 elements
    if (step3HeadingRef.current) step3HeadingRef.current.classList.add('slide-out-left');
    if (step3CardRef.current) step3CardRef.current.classList.add('slide-out-left-delay-1');

    // Show Step 4 after animation delay
    setTimeout(() => {
      setShowThirdScreen(false);
      setShowFourthScreen(true);
      setStep(4);
      setRecycleConfetti(true); // Start confetti
      // Reset Step 4 state if needed (none currently)

      // Programmatically add slide-in-right for Step 4 entry AFTER state update
      requestAnimationFrame(() => {
        if (step4HeadingRef.current) {
          step4HeadingRef.current.classList.remove('slide-out-right', 'slide-out-left'); // Clean up exit classes
          step4HeadingRef.current.offsetHeight; // Force reflow
          step4HeadingRef.current.classList.add('slide-in-right');
        }
      });
      setAnimateProgress(false); // Reset animation trigger after timeout

      // Stop confetti after a delay
      setTimeout(() => setRecycleConfetti(false), 5000); // Stop after 5 seconds

    }, 400); // Match animation duration
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

        // Removed requestAnimationFrame block for Step 3 entry
        setAnimateProgress(false); // Reset animation trigger after timeout
      }, 400); // Match duration with Step 1->2

    } else {
        alert('Please enter and validate an available town name.');
      }
    } else if (step === 3) {
      // Handle submission from Step 3 (Brand Colors)
      console.log('Brand colors:', { primaryColor, secondaryColor, accentColor });
      // Proceed to Step 4
      transitionToStep4();
    } else if (step === 4) {
      // Handle final submission or navigation from Step 4
      console.log('Onboarding complete! Navigating to creator hub...');

      // Set a flag in localStorage to indicate onboarding is complete
      localStorage.setItem('onboardingComplete', 'true');

      // Make an auth check request with the onboarding complete header
      fetch('/api/auth-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Onboarding-Complete': 'true'
        },
        body: JSON.stringify({ token: localStorage.getItem('privy-token') })
      }).catch(error => {
        console.error('Error updating auth status:', error);
      });

      // Navigate to the CreatorHub
      router.push('/creatorhub');
    }
  };

  // Helper function for hex color validation (basic)
  const isValidHex = (color: string): boolean => /^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color);

  // Handle color input change (for text input)
  const handleColorTextChange = (colorSetter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    // Ensure '#' prefix and limit length
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    value = value.slice(0, 7);
    colorSetter(value);
  };

  // Color picker is now handled by the ColorPickerPopover component


  // Determine if Next button should be disabled
  const isNextDisabled = () => {
    if (step === 1 && !selectedOption) return true; // Step 1: Must select an option
    if (step === 2 && (!isNameChecked || !isNameAvailable)) return true; // Step 2: Must validate name
    // Step 3: Must enter at least one valid color to enable Next (Skip bypasses this)
    if (step === 3 && !isValidHex(primaryColor) && !isValidHex(secondaryColor) && !isValidHex(accentColor)) {
      return true;
    }
    // Step 4: Always enabled (becomes "Finish")
    return false;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative"> {/* Added relative positioning for confetti */}
      {/* Conditionally render Confetti */}
      {step === 4 && <Confetti recycle={recycleConfetti} numberOfPieces={200} />}
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
              {step === 4 ? 'Finish' : 'Next'} {/* Change button text on last step */}
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
            {/* Welcome text - Removed opacity: 0 from inline style */}
            <div ref={welcomeTextRef} className="welcome-text" style={{ position: 'relative', marginTop: '40px', textAlign: 'center', padding: '0 20px' }}>
              <h1 className="font-normal" style={{ fontFamily: 'League Spartan, sans-serif', fontSize: 'clamp(24px, 5vw, 40px)' }}>Hello! What would you like to do?</h1>
            </div>

            {/* Selection buttons - Removed opacity: 0 from inline style */}
            <div ref={buttonsContainerRef} className="buttons-container" style={{
              /* opacity: 0, */ // Removed start invisible style
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
                  border: '0.5px solid rgba(255, 255, 255, 0.5)', // Match card border opacity
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
                  border: '0.5px solid rgba(255, 255, 255, 0.5)', // Match card border opacity
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
            {/* Heading - Added ref, RE-ADDED hardcoded animation class */}
            <div ref={step3HeadingRef} className="slide-in-right" style={{ position: 'relative', marginTop: '40px', textAlign: 'center', padding: '0 20px' }}>
              <h1 className="font-normal" style={{ fontFamily: 'League Spartan, sans-serif', fontSize: 'clamp(24px, 5vw, 40px)' }}>Let's set up your brand colors next!</h1>
            </div>

            {/* Color Palette Card - Restored original structure */}
            <div
              ref={step3CardRef}
              className="slide-in-right-delay-1" // Keep slide-in animation
              style={{
                marginTop: '40px', // Keep top margin
                width: '387px', // Set exact width as requested
                maxWidth: '100%', // Ensure it doesn't overflow on small screens
                margin: '40px auto 0', // Center horizontally with auto margins
                padding: '20px',
                border: '0.5px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '13px',
                backgroundColor: 'transparent', // Match main card background
                position: 'relative' // Needed for absolute positioning of picker
              }}
            >
              {/* Removed <p>Choose your color palette</p> */}
              <div className="space-y-[10px]"> {/* Set exact 10px spacing between bars */}
                {/* Primary Color */}
                <div className="flex items-center w-full h-[76px] rounded-md border border-white/30 relative overflow-hidden"> {/* Outer container sets height/border */}
                  {/* Background Color Element - Should be w-full */}
                  <div className="absolute inset-0 w-full rounded-md" style={{ backgroundColor: isValidHex(primaryColor) ? primaryColor : 'transparent' }}></div>
                  {/* Content (Button + Input) - Positioned above background */}
                  <div className="relative z-10 flex items-center w-full h-full">
                    <button
                      ref={primaryColorButtonRef}
                      type="button"
                      data-picker-trigger
                      onClick={() => setActivePicker(activePicker === 'primary' ? null : 'primary')}
                      className="w-8 h-8 rounded border border-white/50 flex items-center justify-center text-white/70 flex-shrink-0" style={{ margin: '0 12px' }}
                    >
                      <Image src="/images/DROP.svg" alt="Color picker" width={16} height={16} />
                    </button>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={handleColorTextChange(setPrimaryColor)}
                      maxLength={7}
                      placeholder="# Primary"
                      className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-white/50 px-2 py-2 h-full" // Ensure input takes height
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="flex items-center w-full h-[76px] rounded-md border border-white/30 relative overflow-hidden"> {/* Outer container */}
                   {/* Background Color Element - Reverted to w-3/4 */}
                   <div className="absolute inset-0 w-3/4 rounded-md" style={{ backgroundColor: isValidHex(secondaryColor) ? secondaryColor : 'transparent' }}></div>
                   {/* Content (Button + Input) */}
                   <div className="relative z-10 flex items-center w-full h-full">
                    <button
                      ref={secondaryColorButtonRef}
                      type="button"
                      data-picker-trigger
                      onClick={() => setActivePicker(activePicker === 'secondary' ? null : 'secondary')}
                      className="w-8 h-8 rounded border border-white/50 flex items-center justify-center text-white/70 flex-shrink-0" style={{ margin: '0 12px' }}
                    >
                       <Image src="/images/DROP.svg" alt="Color picker" width={16} height={16} />
                    </button>
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={handleColorTextChange(setSecondaryColor)}
                      maxLength={7}
                      placeholder="# Secondary"
                      className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-white/50 px-2 py-2 h-full" // Ensure input takes height
                    />
                   </div>
                </div>

                {/* Accent Color */}
                <div className="flex items-center w-full h-[76px] rounded-md border border-white/30 relative overflow-hidden"> {/* Outer container */}
                   {/* Background Color Element - Reverted to w-1/2 */}
                   <div className="absolute inset-0 w-1/2 rounded-md" style={{ backgroundColor: isValidHex(accentColor) ? accentColor : 'transparent' }}></div>
                   {/* Content (Button + Input) */}
                   <div className="relative z-10 flex items-center w-full h-full">
                    <button
                      ref={accentColorButtonRef}
                      type="button"
                      data-picker-trigger
                      onClick={() => setActivePicker(activePicker === 'accent' ? null : 'accent')}
                      className="w-8 h-8 rounded border border-white/50 flex items-center justify-center text-white/70 flex-shrink-0" style={{ margin: '0 12px' }}
                    >
                       <Image src="/images/DROP.svg" alt="Color picker" width={16} height={16} />
                    </button>
                    <input
                      type="text"
                      value={accentColor}
                      onChange={handleColorTextChange(setAccentColor)}
                      maxLength={7}
                      placeholder="# Accent"
                      className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-white/50 px-2 py-2 h-full" // Ensure input takes height
                    />
                   </div>
                </div>
              </div>
              {/* Shuffle and Skip Buttons */}
              {/* Shuffle and Skip Buttons */}
              <div className="flex justify-between items-center mt-6">
                {/* Shuffle Button with Icon - Icon changed and moved to the right */}
                <button className="flex items-center justify-center w-24 space-x-2 px-3 py-1 rounded border border-white/30 text-sm text-white/70 hover:text-white hover:border-white/50 transition-colors">
                  <span>Shuffle</span>
                  {/* Shuffle Icon SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
                {/* Skip Button - Added fixed width and centering */}
                <button
                  type="button"
                  onClick={transitionToStep4} // Call transition function on skip
                  className="flex items-center justify-center w-24 px-3 py-1 rounded border border-white/30 text-sm text-white/70 hover:text-white hover:border-white/50 transition-colors"
                >
                  <span>Skip</span>
                </button>
              </div>
              {/* Color Picker Popovers */}
              {activePicker === 'primary' && (
                <ColorPickerPopover
                  color={primaryColor || '#ffffff'}
                  onChange={(color) => setPrimaryColor(color)}
                  colorName="Primary Color"
                  isOpen={activePicker === 'primary'}
                  onClose={() => setActivePicker(null)}
                  triggerRef={primaryColorButtonRef}
                />
              )}

              {activePicker === 'secondary' && (
                <ColorPickerPopover
                  color={secondaryColor || '#ffffff'}
                  onChange={(color) => setSecondaryColor(color)}
                  colorName="Secondary Color"
                  isOpen={activePicker === 'secondary'}
                  onClose={() => setActivePicker(null)}
                  triggerRef={secondaryColorButtonRef}
                />
              )}

              {activePicker === 'accent' && (
                <ColorPickerPopover
                  color={accentColor || '#ffffff'}
                  onChange={(color) => setAccentColor(color)}
                  colorName="Accent Color"
                  isOpen={activePicker === 'accent'}
                  onClose={() => setActivePicker(null)}
                  triggerRef={accentColorButtonRef}
                />
              )}
            </div>
          </>
        )}

        {/* --- Fourth Screen - Congratulations --- */}
        {showFourthScreen && (
          <>
            {/* Heading - Added ref */}
            <div ref={step4HeadingRef} className="" style={{ position: 'relative', marginTop: '40px', textAlign: 'center', padding: '0 20px', opacity: 0 }}>
              <h1 className="font-normal" style={{ fontFamily: 'League Spartan, sans-serif', fontSize: 'clamp(24px, 5vw, 40px)' }}>Congratulations! You're all set.</h1>
              {/* Add any other Step 4 content here */}
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
