/**
 * Vimeo Consent Manager
 * Handles lazy-loading of Vimeo videos based on user cookie consent
 * GDPR compliant - videos only load after explicit user consent
 */

class VimeoConsentManager {
  constructor() {
    this.CONSENT_KEY = 'vimeo_consent';
    this.CONSENT_GIVEN = 'accepted';
    this.CONSENT_DECLINED = 'declined';
    this.init();
  }

  /**
   * Initialize the consent manager
   */
  init() {
    // Check if we have stored consent from previous session
    const storedConsent = this.getStoredConsent();
    
    // Process all Vimeo embeds on page
    this.processVimeoEmbeds();
    
    // Listen for cookie banner interactions
    this.setupCookieBannerListeners();
  }

  /**
   * Get stored consent from localStorage
   */
  getStoredConsent() {
    return localStorage.getItem(this.CONSENT_KEY);
  }

  /**
   * Set consent in localStorage
   */
  setConsent(consent) {
    localStorage.setItem(this.CONSENT_KEY, consent);
  }

  /**
   * Check if user has given consent for tracking cookies
   */
  hasConsent() {
    return this.getStoredConsent() === this.CONSENT_GIVEN;
  }

  /**
   * Check if user has explicitly declined
   */
  hasDeclined() {
    return this.getStoredConsent() === this.CONSENT_DECLINED;
  }

  /**
   * Process all Vimeo embeds on the page
   */
  processVimeoEmbeds() {
    const iframes = document.querySelectorAll('iframe[src*="vimeo.com"]');
    
    iframes.forEach((iframe) => {
      // Store original src
      const originalSrc = iframe.getAttribute('src');
      const vimeoId = this.extractVimeoId(originalSrc);
      
      if (vimeoId) {
        // Remove src to prevent loading
        iframe.removeAttribute('src');
        iframe.dataset.vimeoSrc = originalSrc;
        iframe.dataset.vimeoId = vimeoId;
        
        // Create wrapper for lazy loading
        const wrapper = this.createVideoWrapper(iframe, vimeoId);
        
        // Insert wrapper before iframe
        iframe.parentNode.insertBefore(wrapper, iframe);
        
        // Hide iframe initially
        iframe.style.display = 'none';
        
        // Check consent status and act accordingly
        if (this.hasConsent()) {
          // Load video immediately if consent given
          this.loadVideo(iframe, wrapper);
        } else if (this.hasDeclined()) {
          // Show declined message
          this.showDeclinedMessage(wrapper);
        } else {
          // Show consent required message
          this.showConsentRequired(wrapper);
        }
      }
    });
  }

  /**
   * Extract Vimeo ID from URL
   */
  extractVimeoId(url) {
    const match = url.match(/player\.vimeo\.com\/video\/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Create a wrapper div for the video placeholder
   */
  createVideoWrapper(iframe, vimeoId) {
    const wrapper = document.createElement('div');
    wrapper.className = 'vimeo-consent-wrapper';
    wrapper.dataset.vimeoId = vimeoId;
    
    // Copy dimensions from iframe if available
    if (iframe.parentNode && iframe.parentNode.classList.contains('embed-dimensions')) {
      wrapper.className = 'vimeo-consent-wrapper embed-dimensions';
      if (iframe.parentNode.style.maxWidth) {
        wrapper.style.maxWidth = iframe.parentNode.style.maxWidth;
      }
      if (iframe.parentNode.style.margin) {
        wrapper.style.margin = iframe.parentNode.style.margin;
      }
    }
    
    return wrapper;
  }

  /**
   * Load the actual Vimeo video
   */
  loadVideo(iframe, wrapper) {
    const src = iframe.dataset.vimeoSrc;
    iframe.setAttribute('src', src);
    iframe.style.display = 'block';
    wrapper.style.display = 'none';
  }

  /**
   * Show message when consent is declined
   */
  showDeclinedMessage(wrapper) {
    wrapper.innerHTML = `
      <div class="vimeo-consent-message declined">
        <div class="vimeo-consent-icon">🔒</div>
        <h3>Video Blocked</h3>
        <p>This video requires cookie consent to load.</p>
        <p class="consent-explanation">
          Vimeo uses tracking cookies to provide video analytics and recommendations.
        </p>
        <div class="vimeo-consent-actions">
          <button class="vimeo-consent-btn enable-consent" data-vimeo-id="${wrapper.dataset.vimeoId}">
            Enable Cookies & Watch
          </button>
          <a href="#" class="vimeo-consent-link" onclick="document.querySelector('.cookie-banner').scrollIntoView({behavior: 'smooth'}); return false;">
            Cookie Settings
          </a>
        </div>
      </div>
    `;
    
    // Add click handler for enable button
    const btn = wrapper.querySelector('.enable-consent');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setConsent(this.CONSENT_GIVEN);
        const iframe = document.querySelector(`iframe[data-vimeo-id="${wrapper.dataset.vimeoId}"]`);
        if (iframe) {
          this.loadVideo(iframe, wrapper);
        }
      });
    }
  }

  /**
   * Show message when consent is required
   */
  showConsentRequired(wrapper) {
    wrapper.innerHTML = `
      <div class="vimeo-consent-message required">
        <div class="vimeo-consent-icon">▶</div>
        <h3>Video Content</h3>
        <p>This video will load once you accept cookies.</p>
        <p class="consent-explanation">
          Please review and accept our cookie policy to watch videos from Vimeo.
        </p>
        <div class="vimeo-consent-actions">
          <p class="small-text">Check the cookie banner at the top of the page.</p>
        </div>
      </div>
    `;
  }

  /**
   * Setup listeners for cookie banner interactions
   */
  setupCookieBannerListeners() {
    // Find accept button
    const acceptBtn = document.querySelector('.consent-link');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleConsentAccepted();
      });
    }
    
    // Find decline button
    const declineBtn = document.querySelector('.decline-link');
    if (declineBtn) {
      declineBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleConsentDeclined();
      });
    }
  }

  /**
   * Handle when user accepts cookies
   */
  handleConsentAccepted() {
    this.setConsent(this.CONSENT_GIVEN);
    this.loadAllVideos();
  }

  /**
   * Handle when user declines cookies
   */
  handleConsentDeclined() {
    this.setConsent(this.CONSENT_DECLINED);
    this.blockAllVideos();
  }

  /**
   * Load all videos on page (when consent given)
   */
  loadAllVideos() {
    const iframes = document.querySelectorAll('iframe[data-vimeo-src]');
    
    iframes.forEach((iframe) => {
      const wrapper = iframe.previousElementSibling;
      if (wrapper && wrapper.classList.contains('vimeo-consent-wrapper')) {
        this.loadVideo(iframe, wrapper);
      }
    });
  }

  /**
   * Block all videos (when consent declined)
   */
  blockAllVideos() {
    const wrappers = document.querySelectorAll('.vimeo-consent-wrapper');
    
    wrappers.forEach((wrapper) => {
      const vimeoId = wrapper.dataset.vimeoId;
      const iframe = document.querySelector(`iframe[data-vimeo-id="${vimeoId}"]`);
      
      if (iframe) {
        iframe.style.display = 'none';
        wrapper.style.display = 'block';
        this.showDeclinedMessage(wrapper);
      }
    });
  }

  /**
   * Clear stored consent (for testing or user request)
   */
  clearConsent() {
    localStorage.removeItem(this.CONSENT_KEY);
    location.reload();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new VimeoConsentManager();
  });
} else {
  new VimeoConsentManager();
}
