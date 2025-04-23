document.addEventListener('DOMContentLoaded', function() {
  // Simulate user data
  const userAddress = '0x1234...5678';
  document.getElementById('user-address').textContent = userAddress;

  // Handle create community option
  const createOption = document.getElementById('create-option');
  const createButton = createOption.querySelector('.btn');

  createOption.addEventListener('click', function() {
    window.parent.postMessage('createCommunity', '*');
  });

  createButton.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent the card click event from firing
    window.parent.postMessage('createCommunity', '*');
  });

  // Add animation effects
  const options = document.querySelectorAll('.option-card');
  options.forEach(option => {
    if (!option.classList.contains('disabled')) {
      option.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 8px 30px rgba(194, 0, 35, 0.2)';
      });

      option.addEventListener('mouseleave', function() {
        this.style.boxShadow = 'none';
      });
    }
  });

  // Attempt to connect to Figma MCP server to get design details
  async function getFigmaDesign() {
    try {
      const response = await fetch('http://localhost:3333/health');
      if (response.ok) {
        console.log('Connected to Figma MCP server');
        // Here we would normally fetch design details
      } else {
        console.log('Figma MCP server is not responding');
      }
    } catch (error) {
      console.error('Error connecting to Figma MCP server:', error);
    }
  }

  getFigmaDesign();
});
