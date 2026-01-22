/**
 * Vimeo Consent Handler
 * Manages GDPR consent for embedded Vimeo videos
 * Now integrated with site-wide cookie banner
 */

(function() {
  'use strict';

  // Use the SAME cookie name as the main cookie banner
  const CONSENT_KEY = 'cookie-consent';
  const CONSENT_EXPIRY = 365 * 24 * 60 * 60 * 1000; // 365 days in milliseconds

  // Check if consent has been given (from main cookie banner)
  function hasConsent() {
    // First check localStorage
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent) {
      try {
        const consentData = JSON.parse(consent);
        const now = new Date().getTime();
        
        // Check if consent has expired
        if (consentData.expiry && now > consentData.expiry) {
          localStorage.removeItem(CONSENT_KEY);
          return false;
        }
        
        return consentData.accepted === true;
      } catch(e) {
        // If parsing fails, assume simple true/false value
        return consent === 'true';
      }
    }
    
    // Also check if main cookie banner cookie exists
    const cookies = document.cookie.split(';');
    for(let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === CONSENT_KEY && value === 'true') {
        return true;
      }
    }
    
    return false;
  }

  // Save consent (sync with main cookie banner)
  function setConsent(accepted) {
    const consentData = {
      accepted: accepted,
      timestamp: new Date().getTime(),
      expiry: new Date().getTime() + CONSENT_EXPIRY
    };
    
    // Save to localStorage
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
    
    // Also save as cookie for compatibility
    const expiryDate = new Date(consentData.expiry);
    document.cookie = `${CONSENT_KEY}=${accepted}; expires=${expiryDate.toUTCString()}; path=/`;
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
      enableAllVideos();
    });

    declineBtn.addEventListener('click', function() {
      overlay.classList.add('hidden');
      setConsent(false);
    });
  }

  // Enable a single video iframe
  function enableVideo(iframe, overlay) {
    // Remove the sandbox restrictions to allow the video to play
    iframe.removeAttribute('sandbox');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox');
    
    // Hide the consent overlay
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  // Enable all Vimeo videos on the page
  function enableAllVideos() {
    const iframes = document.querySelectorAll('iframe[src*="vimeo"]');
    iframes.forEach(iframe => {
      const overlay = iframe.parentElement.querySelector('.vimeo-consent-overlay');
      enableVideo(iframe, overlay);
    });
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
      // Check if consent has already been given (site-wide)
      if (hasConsent()) {
        // Enable the video immediately - no overlay needed
        enableVideo(iframe, null);
      } else {
        // Add consent overlay only if no site-wide consent exists
        createConsentOverlay(iframe);
      }
    });
  }

  // Hook into the main cookie banner Accept button
  function hookIntoCookieBanner() {
    // Find the main cookie banner's accept link
    const consentLink = document.querySelector('.cookie-banner .consent-link');
    
    if (consentLink) {
      consentLink.addEventListener('click', function(e) {
        // Give consent site-wide
        setConsent(true);
        
        // Enable all Vimeo videos immediately
        enableAllVideos();
      });
    }
  }

  // Initialize when script loads
  initVimeoConsent();
  
  // Hook into the main cookie banner
  setTimeout(hookIntoCookieBanner, 500);

  // Expose functions globally if needed
  window.vimeoConsent = {
    hasConsent: hasConsent,
    setConsent: setConsent,
    processFrames: processVimeoFrames,
    enableAll: enableAllVideos
  };

})();
