# Autoscale.js Timing Bug Fix - December 31, 2025

## Problem

Scaling was only being applied after a page refresh on lecture 1 slide 22 (and potentially other slides). The `layoutSlideWithAspectRatio()` function wasn't applying scaling correctly on initial page load.

## Root Cause Analysis

1. **Initial `scaleSlides()` runs too early**: On first load, `scaleSlides()` was being called via `requestAnimationFrame` during `DOMContentLoaded`, before all resources (fonts, images) were fully loaded and before Marp's bespoke viewer had fully initialized.

2. **`getBoundingClientRect()` returns 0 for non-visible slides**: Marp's bespoke viewer may apply CSS that hides non-active slides, causing dimension measurements to return 0.

3. **Early exit in `measureContentBounds()`**: When `contentBounds.width === 0 || contentBounds.height === 0`, the function returns early without applying any scaling.

4. **Why refresh worked**: On refresh, all resources are cached and immediately available, so dimensions are correct from the start.

## Solution Implemented

### 1. Wait for All Resources (`waitForImages()`)
Added a new function that waits for all images to load before running initial scaling:

```javascript
function waitForImages() {
  var images = document.querySelectorAll('img');
  var promises = [];
  images.forEach(function(img) {
    if (!img.complete) {
      promises.push(new Promise(function(resolve) {
        img.onload = resolve;
        img.onerror = resolve;
      }));
    }
  });
  return Promise.all(promises);
}
```

### 2. Comprehensive Initialization (`initializeScaling()`)
Combined font and image loading into a single initialization function:

```javascript
function initializeScaling() {
  var fontsReady = document.fonts && document.fonts.ready
    ? document.fonts.ready
    : Promise.resolve();

  Promise.all([fontsReady, waitForImages()]).then(function() {
    // Triple RAF for Marp initialization
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          scaleSlides();
          onSlideNavigation(true);
        });
      });
    });
  });
}
```

### 3. Window Load Backup
Added `window.load` event listener as a backup for any missed resources.

### 4. IntersectionObserver for Slide Visibility (`setupScalingIntersectionObserver()`)
Added a new IntersectionObserver that triggers scaling when slides become actually visible:

```javascript
function setupScalingIntersectionObserver() {
  var scaledSlides = new Set();
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
        var section = entry.target;
        var slideId = section.getAttribute('id');
        if (slideId && !scaledSlides.has(slideId)) {
          // Check for visible content and scale
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              scaleSlideById(slideId);
              scaledSlides.add(slideId);
            });
          });
        }
      }
    });
  }, { threshold: [0.1, 0.5, 1.0] });
  // Observe all slides
}
```

### 5. Force Parameter for `onSlideNavigation()`
Added a `force` parameter to allow rescaling even if the slide ID matches the cached value.

## Files Modified

- `/Users/jmanning/llm-course/slides/template_deck/autoscale.js`

## Testing

Recompiled lecture1.md with `../template_deck/compile.sh lecture1.md`. The new code is present in lecture1.html.

## Key Changes Summary

| Before | After |
|--------|-------|
| Used `DOMContentLoaded` + double RAF | Wait for fonts AND images, then triple RAF |
| No window.load handler | Added window.load as backup |
| No IntersectionObserver for scaling | Added IntersectionObserver to scale slides when visible |
| `onSlideNavigation()` no force option | Added `force` parameter |
| 100ms setTimeout for initial slide | Removed; using proper resource waiting |

## Status

- [x] Root cause identified
- [x] Fix implemented
- [x] Lecture recompiled
- [ ] Manual testing needed (open lecture1.html in browser, navigate to slide 22)
