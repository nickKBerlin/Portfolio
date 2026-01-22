/**
 * Cookie Bridge Script
 * Connects main cookie banner with Vimeo consent system
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  function init() {
    // Find the Accept link in the cookie banner
    const acceptLink = document.querySelector('.cookie-banner .consent-link');
    
    if (acceptLink) {
      acceptLink.addEventListener('click', function(e) {
        // Save consent flag for Vimeo videos
        localStorage.setItem('cookiesAccepted', 'true');
        console.log('Cookie Bridge: Consent saved to localStorage');
        
        // Trigger window event for Vimeo script
        window.dispatchEvent(new Event('cookiesAccepted'));
        console.log('Cookie Bridge: Event dispatched');
        
        // If Vimeo consent is loaded, enable videos immediately
        if (window.vimeoConsent) {
          window.vimeoConsent.enableAll();
          console.log('Cookie Bridge: Vimeo videos enabled');
        }
      });
      
      console.log('Cookie Bridge: Successfully attached to Accept button');
    } else {
      console.warn('Cookie Bridge: Accept button not found');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
