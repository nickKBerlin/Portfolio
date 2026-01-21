# Testing Guide: Font Migration Verification

**Date:** January 21, 2026  
**Purpose:** Verify Google Fonts CDN is working correctly across all portfolio pages  
**Test Files:** `FONT_LOADING_TEST.html` + all 12 portfolio HTML files

---

## Quick Start

### 1. Access the Test Page

Open this URL in your browser:
```
https://nickkberlin.github.io/Portfolio/FONT_LOADING_TEST.html
```

You should see:
- Clean, professional layout
- Text in "Urbanist" font (modern, slightly geometric)
- Multiple weight demonstrations (400 regular, 700 bold)
- Status indicators showing all systems operational

### 2. Check Browser Console

Press `F12` to open DevTools, then:

1. Click **Console** tab
2. Look for message: `✓ Font Loading Test Complete`
3. Check output:
   ```
   ✓ Font Loading Test Complete
   Body font-family: 'Urbanist', sans-serif
   Expected: 'Urbanist', sans-serif
   Match: ✓ PASS
   ```

### 3. Check Network Performance

1. Open DevTools (F12)
2. Click **Network** tab
3. Reload page (Ctrl+R or Cmd+R)
4. Filter results:
   - Search for: `googleapis` or `fonts`
   - You should see 2 requests:
     - `fonts.googleapis.com` (CSS link, ~2KB)
     - `fonts.gstatic.com` (actual font file, ~40-60KB)

5. **Verify Status:**
   - Both should show `Status: 200`
   - Both should complete in **<500ms** (ideally <200ms)
   - Font file should be cached after first load

---

## Detailed Testing Procedure

### Test 1: Visual Verification

**Goal:** Ensure fonts render correctly and look professional

#### Steps:
1. Open any portfolio page (e.g., `index.html` or `1.html`)
2. Check page loads without errors
3. Visually inspect text:
   - Headings should be **bold and clear**
   - Body text should be **regular and readable**
   - Font should look modern and consistent

#### Expected Results:
- ✓ Fonts display in Urbanist (not a generic sans-serif)
- ✓ Text is readable at all sizes
- ✓ Bold headings are noticeably heavier than body text
- ✓ No "flash" of different font during page load

#### If it fails:
- Check DevTools Console for errors
- Verify HTML includes Google Fonts links
- Check that Typekit script was removed
- Try hard refresh: `Ctrl+Shift+R` (Cmd+Shift+R on Mac)

---

### Test 2: Font Weight Verification

**Goal:** Confirm both font weights (regular 400, bold 700) work correctly

#### Steps:
1. Open `FONT_LOADING_TEST.html`
2. Look at "Font Weight Demonstration" section
3. Compare the two lines:
   - Regular line should be thin
   - Bold line should be thicker/darker
4. On any portfolio page:
   - Check headings look bold
   - Check body text looks regular

#### Expected Results:
- ✓ Clear visual difference between 400 and 700
- ✓ All headings (h1-h6) appear bold
- ✓ All body text appears regular weight

#### If it fails:
- CSS font-weight rules may not be applied
- Check DevTools Styles tab on element
- Verify `!important` flag in CSS

---

### Test 3: Cross-Browser Testing

**Goal:** Ensure fonts load in all major browsers

#### Browsers to Test:
- ✓ Chrome/Chromium (desktop)
- ✓ Firefox (desktop)
- ✓ Safari (desktop + iOS)
- ✓ Edge (Windows)
- ✓ Chrome Mobile (Android)
- ✓ Safari Mobile (iOS)

#### Test Procedure for Each:
1. Open `index.html` in browser
2. Check fonts display correctly
3. Open DevTools → Network tab
4. Reload and verify font requests succeed
5. Check Console for any errors

#### Expected Results:
- ✓ Fonts load in ALL browsers
- ✓ No CORS errors in Console
- ✓ Text renders identically across devices
- ✓ No console warnings or errors

#### Known Issues:
- **Old IE (IE11):** Will fall back to sans-serif (acceptable)
- **Very slow connections:** May show fallback font briefly, then swap to Urbanist (expected behavior)

---

### Test 4: Performance Analysis

**Goal:** Measure font loading performance improvement

#### Steps:
1. Open DevTools (F12) → Network tab
2. Set throttling to "Slow 3G" (testing slow connections)
3. Reload page (Ctrl+R)
4. Monitor timing:

#### Key Metrics to Track:

| Metric | Expected | Action if Failed |
|--------|----------|------------------|
| CSS link time | <50ms | Check internet connection |
| Font file time | <200ms | Normal (cached after first load) |
| First Paint (FP) | <1s | Check DevTools Performance tab |
| Largest Contentful Paint (LCP) | <2.5s | Consider font optimization |
| Cumulative Layout Shift (CLS) | <0.1 | Should be minimal |

#### How to Check in DevTools:
1. **Network tab:** See individual request times
2. **Lighthouse tab:** Run audit → view Performance metrics
3. **Performance tab:** Record page load → analyze flame chart

---

### Test 5: GDPR Compliance Verification

**Goal:** Ensure no tracking cookies or scripts loading

#### Steps:
1. Open DevTools → Application/Storage tab
2. Check Cookies → Should be empty or only site cookies
3. Check Local Storage → Should not contain Adobe/Typekit data
4. Check Console → No typekit.load() errors
5. Install Privacy Badger extension (optional) → verify no tracking

#### Expected Results:
- ✓ No Adobe/Typekit cookies
- ✓ No tracking pixels or beacons
- ✓ Google Fonts fonts only (no tracking scripts)
- ✓ Privacy Badger shows green (no trackers)

#### If it fails:
- Check HTML for remaining Typekit script tags
- Search for "typekit" or "use.typekit.net" in HTML
- Remove any found Typekit references

---

### Test 6: Fallback Font Testing

**Goal:** Verify site remains readable if CDN fails

#### Steps:
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Reload page
4. Check website is still readable
5. Text should display in system sans-serif fallback

#### Expected Results:
- ✓ Page loads without errors
- ✓ Text displays in fallback font (sans-serif)
- ✓ Layout doesn't break
- ✓ No console errors about missing fonts

#### If it fails:
- Check CSS fallback font specification
- Verify `font-family: 'Urbanist', sans-serif` includes fallback
- Check no !important rules force non-existent fonts

---

## Automated Testing Checklist

Use this checklist for each HTML file:

### File: `index.html`
- [ ] Fonts load visually correct
- [ ] DevTools shows Status 200 for both CDN requests
- [ ] Console shows no errors
- [ ] No Typekit scripts present
- [ ] Heading text is bold
- [ ] Body text is regular
- [ ] Works offline (fallback font)

### File: `1.html`
- [ ] (repeat above)

### File: `contact.html`
- [ ] (repeat above)

### File: `12km.html`
- [ ] (repeat above)

### File: `diesel-dance.html`
- [ ] (repeat above)

### File: `everlearn.html`
- [ ] (repeat above)

### File: `expedition-44.html`
- [ ] (repeat above)

### File: `illustration.html`
- [ ] (repeat above)

### File: `premium-beat.html`
- [ ] (repeat above)

### File: `tv-work-1.html`
- [ ] (repeat above)

### File: `web-video.html`
- [ ] (repeat above)

### File: `contact.html` (if separate)
- [ ] (repeat above)

---

## Troubleshooting Guide

### Problem: "Fonts still look generic/wrong"

**Diagnosis:**
1. Check DevTools → Elements → Search for font-family
2. Look for `font-family: 'Urbanist', sans-serif`

**Solutions:**
- [ ] Verify Google Fonts link tags are in HTML `<head>`
- [ ] Check CSS rules use correct font name: `'Urbanist'` (with quotes)
- [ ] Verify CSS uses `!important` flag
- [ ] Hard refresh browser cache: `Ctrl+Shift+R`
- [ ] Clear browser cache completely
- [ ] Try in Incognito/Private mode
- [ ] Verify no conflicting CSS rules from other stylesheets

### Problem: "Fonts take too long to load (FOUT)"

**Diagnosis:**
1. Check Network tab → Font file timing
2. Should load in <200ms, ideally <100ms

**Solutions:**
- [ ] Verify `display=swap` in Google Fonts URL
- [ ] Enable preconnect hints (should be in HTML)
- [ ] Check internet connection speed
- [ ] Test from different location/network
- [ ] Verify font file is actually loading (Status 200)

### Problem: "Console shows CORS errors"

**Diagnosis:**
```
Access to font at 'https://fonts.gstatic.com/...' from origin 'https://nickkberlin.github.io'
has been blocked by CORS policy
```

**Solutions:**
- [ ] Verify preconnect tag includes `crossorigin` attribute:
  ```html
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ```
- [ ] Check spelling of domain names
- [ ] Verify HTTPS is used (not HTTP)

### Problem: "Typekit errors still showing in console"

**Diagnosis:**
```
window.Typekit is undefined
Failed to load resource: https://use.typekit.net/...
```

**Solutions:**
- [ ] Search HTML for `use.typekit.net`
- [ ] Delete entire `<script>` tag for Typekit
- [ ] Search for `window.Typekit.load()`
- [ ] Remove any Typekit onload handlers
- [ ] Commit changes and push to GitHub

### Problem: "Different fonts on different devices"

**Diagnosis:**
Fonts look correct on desktop but wrong on mobile

**Solutions:**
- [ ] Check CSS media queries aren't overriding font-family
- [ ] Verify `!important` flag prevents overrides
- [ ] Test on actual device, not just DevTools mobile emulation
- [ ] Check for vendor-specific font rules

---

## Performance Baseline

### Before Migration (Typekit)
- Font load time: ~300-500ms
- Rendering: FOIT (Flash of Invisible Text)
- GDPR: ⚠️ Requires consent (tracking)
- Dependencies: async script blocking
- Requests: 2-3 (Typekit JS + fonts)

### After Migration (Google Fonts)
- Font load time: ~50-150ms ✓
- Rendering: FOUT (Flash of Unstyled Text) → SWAP ✓
- GDPR: ✓ Safe (no tracking)
- Dependencies: Synchronous links (simple) ✓
- Requests: 2 (CSS + font file) ✓

### Improvement
- **~200-350ms faster** font loading
- **Better user experience** (text visible immediately)
- **GDPR compliant** (no consent needed)
- **Simpler implementation** (no JavaScript)

---

## Final Verification Checklist

Before considering migration complete:

- [ ] All 12 HTML files tested
- [ ] Fonts display correctly on all pages
- [ ] DevTools shows proper font loading
- [ ] Console has no errors on any page
- [ ] Typekit script removed from all files
- [ ] Google Fonts links present on all files
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile tested (iOS Safari, Chrome Android)
- [ ] Performance measured and improved
- [ ] GDPR compliance verified
- [ ] Fallback fonts working (offline test)
- [ ] Changes committed and pushed to GitHub
- [ ] Lighthouse audit score maintained or improved
- [ ] Live site updated with new files

---

## Support Resources

- **Google Fonts Documentation:** https://fonts.google.com/
- **Font Display Property:** https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display
- **Web Font Performance:** https://web.dev/web-fonts/
- **DevTools Guide:** https://developer.chrome.com/docs/devtools/
- **GDPR & Fonts:** https://website-audit-tool.org/gdpr-compliant-fonts/

---

**Last Updated:** January 21, 2026  
**Next Review:** After completing all file updates  
**Contact:** nickKBerlin (Portfolio Owner)
