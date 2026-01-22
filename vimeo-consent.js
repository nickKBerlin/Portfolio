/**
 * Vimeo Consent Handler
 * Integrates with the main site cookie banner
 * Videos load automatically after accepting main cookie banner
 */

(function() {
  'use strict';

  const CONSENT_KEY = 'vimeo-cookies-accepted';

  // Check if user has already accepted cookies
  function hasConsent() {
    // Check localStorage
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'true') return true;
    
    // Check if cookie banner is hidden (means user already accepted)
    const banner = document.querySelector('.cookie-banner');
    if (banner && banner.style.display === 'none') {
      return true;
    }
    
    // Check sessionStorage (in case main banner uses it)
    const sessionStored = sessionStorage.getItem('cookieBannerClosed');
    if (sessionStored === 'true') return true;
    
    return false;
  }

  // Save consent
  function setConsent(accepted) {
    if (accepted) {
      localStorage.setItem(CONSENT_KEY, 'true');
      sessionStorage.setItem('cookieBannerClosed', 'true');
    }
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
    });
  }

  // Enable a single video iframe
  function enableVideo(iframe, overlay) {
    iframe.removeAttribute('sandbox');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox');
    
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

  // Process Vimeo iframes
  function processVimeoFrames() {
    const iframes = document.querySelectorAll('iframe[src*="vimeo"]');
    
    if (hasConsent()) {
      // User already accepted - enable all videos immediately
      iframes.forEach(iframe => {
        enableVideo(iframe, null);
      });
    } else {
      // Show consent overlay for each video
      iframes.forEach(iframe => {
        createConsentOverlay(iframe);
      });
    }
  }

  // Monitor main cookie banner for acceptance
  function monitorCookieBanner() {
    // Find the main cookie banner accept link
    const consentLink = document.querySelector('.cookie-banner .consent-link');
    const cookieBanner = document.querySelector('.cookie-banner');
    const closeBtn = cookieBanner ? cookieBanner.querySelector('.close-btn') : null;
    
    if (consentLink) {
      consentLink.addEventListener('click', function(e) {
        // User clicked Accept
        setConsent(true);
        enableAllVideos();
      });
    }
    
    // Also monitor if banner is closed (X button or elsewhere)
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        // Check if they accepted before closing
        setTimeout(function() {
          if (hasConsent()) {
            enableAllVideos();
          }
        }, 100);
      });
    }
    
    // Monitor if banner disappears (main.js might hide it)
    if (cookieBanner) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (cookieBanner.style.display === 'none' || !cookieBanner.offsetParent) {
              // Banner was hidden - check if accepted
              if (hasConsent()) {
                enableAllVideos();
              }
            }
          }
        });
      });
      
      observer.observe(cookieBanner, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
  }

  // Initialize
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        processVimeoFrames();
        monitorCookieBanner();
      });
    } else {
      processVimeoFrames();
      monitorCookieBanner();
    }
  }

  // Start
  init();

  // Expose functions globally
  window.vimeoConsent = {
    hasConsent: hasConsent,
    setConsent: setConsent,
    enableAll: enableAllVideos
  };

})();
