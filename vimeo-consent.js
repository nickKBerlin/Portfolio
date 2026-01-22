/**
 * Vimeo Consent Handler
 * Works with main cookie banner via localStorage and window events
 */

(function() {
  'use strict';

  const CONSENT_KEY = 'cookiesAccepted';
  let videosReady = false;

  // Check if user has already accepted cookies
  function hasConsent() {
    // Check localStorage for ANY cookie acceptance
    const accepted = localStorage.getItem(CONSENT_KEY);
    if (accepted === 'true' || accepted === '1' || accepted === 'yes') {
      return true;
    }
    
    // Also check common cookie banner flags
    const commonKeys = ['cookie-consent', 'cookies-accepted', 'cookieBannerAccepted', 'acceptCookies'];
    for (let key of commonKeys) {
      const val = localStorage.getItem(key);
      if (val === 'true' || val === '1' || val === 'yes' || val === 'accepted') {
        return true;
      }
    }
    
    return false;
  }

  // Save consent
  function setConsent() {
    localStorage.setItem(CONSENT_KEY, 'true');
    console.log('Vimeo: Consent saved');
  }

  // Create consent overlay
  function createConsentOverlay(iframe) {
    // Check if overlay already exists
    const existingOverlay = iframe.parentElement.querySelector('.vimeo-consent-overlay');
    if (existingOverlay) return;

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
      setConsent();
      enableAllVideos();
    });

    declineBtn.addEventListener('click', function() {
      overlay.classList.add('hidden');
    });
  }

  // Enable a single video iframe
  function enableVideo(iframe, overlay) {
    if (!iframe) return;
    
    // Remove restrictive sandbox
    iframe.removeAttribute('sandbox');
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox');
    
    // Force reload iframe to activate
    const src = iframe.src;
    iframe.src = '';
    setTimeout(function() {
      iframe.src = src;
    }, 10);
    
    // Hide overlay
    if (overlay) {
      overlay.classList.add('hidden');
    }
    
    console.log('Vimeo: Video enabled');
  }

  // Enable all Vimeo videos on the page
  function enableAllVideos() {
    if (videosReady) return; // Prevent multiple calls
    videosReady = true;
    
    const iframes = document.querySelectorAll('iframe[src*="vimeo"]');
    console.log('Vimeo: Enabling ' + iframes.length + ' videos');
    
    iframes.forEach(function(iframe) {
      const overlay = iframe.parentElement.querySelector('.vimeo-consent-overlay');
      enableVideo(iframe, overlay);
    });
  }

  // Process Vimeo iframes
  function processVimeoFrames() {
    const iframes = document.querySelectorAll('iframe[src*="vimeo"]');
    console.log('Vimeo: Found ' + iframes.length + ' videos');
    
    if (hasConsent()) {
      console.log('Vimeo: Consent already given, enabling videos');
      enableAllVideos();
    } else {
      console.log('Vimeo: No consent yet, showing overlays');
      iframes.forEach(function(iframe) {
        createConsentOverlay(iframe);
      });
    }
  }

  // Listen for cookie acceptance from main banner
  function setupListeners() {
    // Listen for custom event from main cookie banner
    window.addEventListener('cookiesAccepted', function() {
      console.log('Vimeo: Received cookiesAccepted event');
      setConsent();
      enableAllVideos();
    });
    
    // Also monitor clicks on the consent link
    document.addEventListener('click', function(e) {
      if (e.target && e.target.classList && e.target.classList.contains('consent-link')) {
        console.log('Vimeo: Consent link clicked');
        setTimeout(function() {
          setConsent();
          enableAllVideos();
        }, 100);
      }
    });
    
    // Monitor storage changes (when another tab accepts cookies)
    window.addEventListener('storage', function(e) {
      if (e.key === CONSENT_KEY || e.key === 'cookie-consent') {
        if (e.newValue === 'true') {
          console.log('Vimeo: Consent detected from storage event');
          enableAllVideos();
        }
      }
    });
  }

  // Initialize
  function init() {
    console.log('Vimeo: Initializing consent handler');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        processVimeoFrames();
        setupListeners();
      });
    } else {
      processVimeoFrames();
      setupListeners();
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

  console.log('Vimeo: Script loaded');

})();
