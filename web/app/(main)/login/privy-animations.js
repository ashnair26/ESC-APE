'use client';

/**
 * This script enhances the Privy modal animations by directly manipulating the DOM
 * to create more sophisticated animation effects that override Privy's default behavior.
 */

// Function to set up the Privy modal animations
export function setupPrivyAnimations() {
  if (typeof window === 'undefined') return; // Skip during SSR

  // Create a style element for our custom animations
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Modal entry animation */
    @keyframes scaleOutCustom {
      from { transform: scale(1.1); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Modal exit animation */
    @keyframes scaleInCustom {
      from { transform: scale(1); opacity: 1; }
      to { transform: scale(0.9); opacity: 0; }
    }

    /* Button waterfall animation */
    @keyframes fadeInUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Apply these animations dynamically via JS */
    .privy-dialog-custom-entry {
      animation: scaleOutCustom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    }

    .privy-dialog-custom-exit {
      animation: scaleInCustom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    }

    .privy-button-waterfall {
      opacity: 0;
      animation: fadeInUp 0.5s ease forwards;
    }
  `;
  document.head.appendChild(styleElement);

  // Set up a mutation observer to watch for the Privy modal being added to the DOM
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            // Check for Privy dialog
            if (node.hasAttribute && node.hasAttribute('data-privy-dialog')) {
              handlePrivyModalAdded(node);
            }

            // Also check children in case the dialog is nested
            const dialog = node.querySelector ? node.querySelector('[data-privy-dialog]') : null;
            if (dialog) {
              handlePrivyModalAdded(dialog);
            }
          }
        }
      }
    }
  });

  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
}

// Handle when a Privy modal is added to the DOM
function handlePrivyModalAdded(modalElement) {
  console.log('Privy modal detected, applying custom animations');

  // Find the dialog content element
  const dialogContent = modalElement.querySelector('[role="dialog"]');
  if (dialogContent) {
    // Apply entry animation
    dialogContent.classList.add('privy-dialog-custom-entry');

    // Set up exit animation for when the modal is closed
    setupExitAnimation(modalElement, dialogContent);

    // Set up waterfall animation for buttons
    setupWaterfallAnimation(dialogContent);
  }
}

// Set up exit animation
function setupExitAnimation(modalElement, dialogContent) {
  // Find close button
  const closeButton = modalElement.querySelector('[data-privy-close]');
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Apply exit animation
      dialogContent.classList.remove('privy-dialog-custom-entry');
      dialogContent.classList.add('privy-dialog-custom-exit');

      // Let the animation play before Privy removes the modal
      setTimeout(() => {
        // Privy will handle the actual closing
      }, 300);
    });
  }

  // Handle clicking outside the modal
  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement) {
      // Apply exit animation
      dialogContent.classList.remove('privy-dialog-custom-entry');
      dialogContent.classList.add('privy-dialog-custom-exit');

      // Let the animation play before Privy removes the modal
      setTimeout(() => {
        // Privy will handle the actual closing
      }, 300);
    }
  });
}

// Set up waterfall animation for buttons
function setupWaterfallAnimation(dialogContent) {
  // Find all login method buttons
  setTimeout(() => {
    const loginMethods = dialogContent.querySelectorAll('[data-privy-login-method]');
    loginMethods.forEach((method, index) => {
      const button = method.querySelector('button');
      if (button) {
        button.classList.add('privy-button-waterfall');
        button.style.animationDelay = `${0.1 + (index * 0.1)}s`;

        // Add a subtle scale effect on hover
        button.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        button.addEventListener('mouseenter', () => {
          button.style.transform = 'translateY(-2px) scale(1.02)';
          button.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        });
        button.addEventListener('mouseleave', () => {
          button.style.transform = '';
          button.style.boxShadow = '';
        });
      }
    });
  }, 100); // Small delay to ensure the buttons are rendered
}
