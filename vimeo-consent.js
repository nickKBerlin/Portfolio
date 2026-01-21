/**
 * Vimeo Consent Handler
 * Manages GDPR consent for embedded Vimeo videos
 */

(function() {
  'use strict';

  const CONSENT_KEY = 'vimeo-consent';
  const CONSENT_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  // Check if consent has been given
  function hasConsent() {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) return false;
    
    const consentData = JSON.parse(consent);
    const now = new Date().getTime();
    
    // Check if consent has expired
    if (consentData.expiry && now > consentData.expiry) {
      localStorage.removeItem(CONSENT_KEY);
      return false;
    }
    
    return consentData.accepted === true;
  }

  // Save consent
  function setConsent(accepted) {
    const consentData = {
      accepted: accepted,
      timestamp: new Date().getTime(),
      expiry: new Date().getTime() + CONSENT_EXPIRY
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
  }

  // Create consent overlay
  function createConsentOverlay(iframe) {
    const overlay = document.createElement('div');
    overlay.className = 'vimeo-consent-overlay';
    overlay.innerHTML = `
      <div class="vimeo-consent-content">
        <h3>Video Content</h3>
        <p>This video is hosted by Vimeo and requires consent to load.</p>
        <div class="vimeo-consent-buttons">
          <button class="vimeo-consent-btn accept">Accept & Play</button>
          <button class="vimeo-consent-btn decline">Decline</button>
        </div>
      </div>
    `;

    // Get the parent container (embed-aspect-ratio div)
    const container = iframe.parentElement;
    container.style.position = 'relative';
    container.appendChild(overlay);

    const acceptBtn = overlay.querySelector('.accept');
    const declineBtn = overlay.querySelector('.decline');

    acceptBtn.addEventListener('click', function() {
      setConsent(true);
      enableVideo(iframe, overlay);
    });

    declineBtn.addEventListener('click', function() {
      overlay.classList.add('hidden');
      setConsent(false);
    });
  }

  // Enable the video iframe
  function enableVideo(iframe, overlay) {
    // Remove the sandbox restrictions to allow the video to play
    iframe.removeAttribute('sandbox');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox');
    
    // Hide the consent overlay
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  // Initialize consent handling for all Vimeo iframes
  function initVimeoConsent() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', processVimeoFrames);
    } else {
      processVimeoFrames();
    }
  }

  function processVimeoFrames() {
    const iframes = document.querySelectorAll('iframe[src*="vimeo"]');
    
    iframes.forEach(iframe => {
      const container = iframe.parentElement;
      
      // Check if consent has already been given
      if (hasConsent()) {
        // Enable the video immediately
        enableVideo(iframe, null);
      } else {
        // Add consent overlay
        createConsentOverlay(iframe);
      }
    });
  }

  // Also hook into the main cookie banner Accept button
  function hookIntoCookieBanner() {
    // Find the main cookie banner's accept link
    const consentLink = document.querySelector('.cookie-banner .consent-link');
    
    if (consentLink) {
      consentLink.addEventListener('click', function(e) {
        // Give consent for Vimeo
        setConsent(true);
        
        // Enable all Vimeo videos
        const iframes = document.querySelectorAll('iframe[src*="vimeo"]');
        iframes.forEach(iframe => {
          const overlay = iframe.parentElement.querySelector('.vimeo-consent-overlay');
          enableVideo(iframe, overlay);
        });
      });
    }
  }

  // Initialize when script loads
  initVimeoConsent();
  
  // Also hook into the main cookie banner after a short delay
  setTimeout(hookIntoCookieBanner, 500);

  // Expose functions globally if needed
  window.vimeoConsent = {
    hasConsent: hasConsent,
    setConsent: setConsent,
    processFrames: processVimeoFrames
  };

})();
