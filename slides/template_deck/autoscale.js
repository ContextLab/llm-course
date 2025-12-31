// Auto-scale slide CONTENT to fit within bounds
// Uses cascade: preferred gaps → shrink gaps → shrink fonts (proportionally)
// Preserves relative font size ratios between element types
// Handles tables specially by adjusting font-size
// Detects wrapped text cells and applies left-alignment
// Triggers Chart.js animations on slide transitions
document.addEventListener("DOMContentLoaded", function () {
  // ==========================================================================
  // LAYOUT CONFIGURATION
  // Font ratios are relative to body text (1.0) and MUST be preserved
  // ==========================================================================
  const LAYOUT = {
    // Font ratios relative to body text (MUST be preserved during scaling)
    fontRatios: {
      title: 1.72,      // H1 titles
      body: 1.0,        // paragraphs, lists, divs
      code: 0.63,       // pre/code blocks (22pt / 35px base)
      table: 0.7,       // table cells
      callout: 0.65,    // callout boxes
    },
    // Gap configuration (space between elements)
    gaps: {
      preferred: 30,    // px - start here
      minimum: 20,      // px - never go below this
      step: 2,          // px - shrink by this amount each iteration
    },
    // Scaling bounds
    minScale: 0.5,      // Never scale below 50%
    baseFontSize: 35,   // px - base font size from CSS
    // Padding
    bottomMargin: 30,   // px - reserved space at bottom of slide
  };

  // Legacy constants for backward compatibility
  const MIN_PADDING_TOP = 30;
  const MIN_PADDING_BOTTOM = 20;
  const TITLE_HEIGHT = 90;
  const MIN_TITLE_FONT_SIZE = 1.4;

  function detectWrappedColumns(table) {
    // Detect columns where ANY cell has wrapped text
    // If any cell in a column wraps, left-align the entire column
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return;

    // Get number of columns from first row
    const firstRow = rows[0];
    const numCols = firstRow.querySelectorAll('th, td').length;

    // Track which columns have wrapped text
    const columnHasWrap = new Array(numCols).fill(false);

    // Check all data cells (skip header row)
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r].querySelectorAll('td');
      cells.forEach(function (cell, colIndex) {
        if (columnHasWrap[colIndex]) return; // Already marked

        const text = cell.textContent.trim();
        const computedStyle = window.getComputedStyle(cell);

        const testSpan = document.createElement('span');
        testSpan.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' +
          computedStyle.font;
        testSpan.textContent = text;
        document.body.appendChild(testSpan);

        const textWidth = testSpan.offsetWidth;
        document.body.removeChild(testSpan);

        const paddingLeft = parseFloat(computedStyle.paddingLeft);
        const paddingRight = parseFloat(computedStyle.paddingRight);
        const availableWidth = cell.clientWidth - paddingLeft - paddingRight;

        if (textWidth > availableWidth * 1.05) {
          columnHasWrap[colIndex] = true;
        }
      });
    }

    // Apply left-alignment to entire columns that have wrapped text
    rows.forEach(function (row, rowIndex) {
      const cells = row.querySelectorAll('th, td');
      cells.forEach(function (cell, colIndex) {
        cell.classList.remove('wrapped-text');
        if (columnHasWrap[colIndex] && rowIndex > 0) {
          // Only apply to data cells, not headers
          cell.classList.add('wrapped-text');
        }
      });
    });
  }

  /**
   * Check if an element is a flex container (two-column layout)
   */
  function isFlexContainer(element) {
    const style = window.getComputedStyle(element);
    return style.display === 'flex' || element.style.display === 'flex' ||
           (element.hasAttribute('style') && element.getAttribute('style').includes('flex'));
  }

  /**
   * Check if an element is a callout box
   */
  function isCalloutBox(element) {
    return element.classList.contains('note-box') || element.classList.contains('warning-box') ||
           element.classList.contains('tip-box') || element.classList.contains('example-box') ||
           element.classList.contains('definition-box') || element.classList.contains('important-box') ||
           element.classList.contains('callout');
  }

  /**
   * Determine the element type for font ratio lookup
   */
  function getElementType(el) {
    if (el.tagName === 'H1') return 'title';
    if (el.tagName === 'PRE') return 'code';
    if (el.tagName === 'TABLE') return 'table';
    if (isCalloutBox(el)) return 'callout';
    return 'body';
  }

  /**
   * Check if an element is a diagram container (flow diagrams, charts, etc.)
   * These should NEVER be scaled by autoscale.js - their appearance must match PDF exactly
   */
  function isDiagramContainer(element) {
    return element.classList.contains('diagram-container') ||
           element.classList.contains('chart-container');
  }

  /**
   * Reset any existing scaling on a slide so we can measure at default sizes
   * This is CRITICAL for accurate measurement before applying new scaling
   */
  function resetSlideScaling(slide, h1) {
    // Reset title
    if (h1) {
      h1.style.fontSize = '';
      h1.style.marginTop = '';
      h1.style.marginBottom = '';
    }

    // Reset all direct children (except diagram containers)
    const children = slide.querySelectorAll(':scope > *');
    children.forEach(function(child) {
      // Skip diagram containers - their appearance must NEVER be modified
      if (isDiagramContainer(child)) return;

      // Reset font-size
      child.style.fontSize = '';
      // Reset margins
      child.style.marginTop = '';
      child.style.marginBottom = '';
      // Reset padding
      child.style.paddingTop = '';
      child.style.paddingBottom = '';
      child.style.paddingLeft = '';
      child.style.paddingRight = '';

      // For flex containers, reset --content-scale and gap
      if (isFlexContainer(child)) {
        child.style.removeProperty('--content-scale');
        child.style.gap = '';
      }
    });
  }

  /**
   * Collect all scalable elements from a slide with their metrics
   * Returns array of {element, type, metrics} objects
   */
  function collectSlideElements(slide) {
    const elements = [];
    const children = slide.querySelectorAll(':scope > *');

    children.forEach(function (child) {
      if (child.offsetHeight === 0) return;
      const style = window.getComputedStyle(child);
      if (style.position === 'absolute' || style.position === 'fixed') return;
      // Skip diagram containers - their appearance must not be modified
      if (isDiagramContainer(child)) return;

      const type = getElementType(child);
      const rect = child.getBoundingClientRect();

      elements.push({
        element: child,
        type: type,
        metrics: {
          height: rect.height,
          marginTop: parseFloat(style.marginTop) || 0,
          marginBottom: parseFloat(style.marginBottom) || 0,
          gap: parseFloat(style.gap) || 0,
          fontSize: parseFloat(style.fontSize),
          paddingTop: parseFloat(style.paddingTop) || 0,
          paddingBottom: parseFloat(style.paddingBottom) || 0,
          paddingLeft: parseFloat(style.paddingLeft) || 0,
          paddingRight: parseFloat(style.paddingRight) || 0,
        }
      });
    });

    return elements;
  }

  /**
   * Measure ACTUAL content bounding box height on the slide
   * Uses getBoundingClientRect to get true rendered positions
   * This accounts for margin collapsing and actual layout
   */
  function measureActualContentHeight(slide) {
    const children = Array.from(slide.querySelectorAll(':scope > *')).filter(function(el) {
      if (el.offsetHeight === 0) return false;
      const style = window.getComputedStyle(el);
      return style.position !== 'absolute' && style.position !== 'fixed';
    });

    if (children.length === 0) return 0;

    const slideRect = slide.getBoundingClientRect();
    const slideStyle = window.getComputedStyle(slide);
    const paddingTop = parseFloat(slideStyle.paddingTop) || 0;

    // Find the actual top and bottom of all content
    let minTop = Infinity;
    let maxBottom = -Infinity;

    children.forEach(function(child) {
      const rect = child.getBoundingClientRect();
      const relativeTop = rect.top - slideRect.top;
      const relativeBottom = rect.bottom - slideRect.top;

      if (relativeTop < minTop) minTop = relativeTop;
      if (relativeBottom > maxBottom) maxBottom = relativeBottom;
    });

    // Content height is from first element top to last element bottom
    // Subtract paddingTop because content starts after padding
    return maxBottom - paddingTop;
  }

  /**
   * Apply the final layout with proportional font sizes
   * All element types maintain their relative font ratios
   */
  function applyProportionalLayout(elements, scale, gap, h1) {
    // Apply to title with minimum size enforcement
    if (h1) {
      const titleRatio = LAYOUT.fontRatios.title;
      const scaledTitleSize = titleRatio * scale;
      const finalTitleSize = Math.max(scaledTitleSize, MIN_TITLE_FONT_SIZE / LAYOUT.baseFontSize * LAYOUT.fontRatios.title);
      h1.style.fontSize = finalTitleSize + 'em';

      // Scale title margins
      const h1Style = window.getComputedStyle(h1);
      const h1MarginTop = parseFloat(h1Style.marginTop) || 0;
      const h1MarginBottom = parseFloat(h1Style.marginBottom) || 0;
      h1.style.marginTop = (h1MarginTop * scale) + 'px';
      h1.style.marginBottom = (h1MarginBottom * scale) + 'px';
    }

    // Apply to all other elements
    elements.forEach(function (item) {
      if (item.type === 'title') return; // Already handled

      const el = item.element;
      const metrics = item.metrics;
      const ratio = LAYOUT.fontRatios[item.type] || LAYOUT.fontRatios.body;

      // Calculate font size preserving the ratio
      const newFontSize = LAYOUT.baseFontSize * ratio * scale;

      // For flex containers, use CSS custom property for cascading
      if (isFlexContainer(el)) {
        el.style.setProperty('--content-scale', scale);
        // Apply gap (use the calculated gap, scaled)
        el.style.gap = (gap * scale) + 'px';
      } else {
        // Set font-size directly
        el.style.fontSize = newFontSize + 'px';
      }

      // Scale margins proportionally (affects gaps between elements)
      el.style.marginTop = (metrics.marginTop * scale) + 'px';
      el.style.marginBottom = (metrics.marginBottom * scale) + 'px';

      // For callout boxes, also scale padding
      if (isCalloutBox(el)) {
        el.style.padding = (metrics.paddingTop * scale) + 'px ' +
                          (metrics.paddingRight * scale) + 'px ' +
                          (metrics.paddingBottom * scale) + 'px ' +
                          (metrics.paddingLeft * scale) + 'px';
      }
    });
  }

  /**
   * Layout slide content using cascade: gaps first, then scale
   *
   * Algorithm:
   * 1. Reset to default sizes and measure ACTUAL rendered height
   * 2. If content doesn't fit, shrink gaps down to minimum
   * 3. If still doesn't fit, shrink scale (all fonts proportionally)
   * 4. Apply scaling and re-measure actual height
   * 5. Repeat until content fits or minimum scale reached
   *
   * Font ratios between element types are ALWAYS preserved
   */
  function layoutSlideContent(slide, h1, slideHeight) {
    // Get slide padding
    const slideStyle = window.getComputedStyle(slide);
    const paddingBottom = parseFloat(slideStyle.paddingBottom) || 100;

    // Calculate available height (from top of slide to bottom padding)
    const availableHeight = slideHeight - paddingBottom - LAYOUT.bottomMargin;

    // CRITICAL: Reset any existing scaling BEFORE measuring
    resetSlideScaling(slide, h1);

    // Force layout recalculation after reset
    void slide.offsetHeight;

    // Collect all elements for later scaling
    const elements = collectSlideElements(slide);
    if (elements.length === 0) return;

    // Filter out title for content elements
    const contentElements = elements.filter(function (item) {
      return item.type !== 'title';
    });

    // If only title, nothing to scale
    if (contentElements.length === 0) return;

    // Measure ACTUAL rendered content height at default scale
    let actualHeight = measureActualContentHeight(slide);

    // Check if content already fits at default sizes
    if (actualHeight <= availableHeight) return;

    // Initialize layout parameters
    let currentGap = LAYOUT.gaps.preferred;
    let scale = 1.0;

    // LAYOUT CASCADE: Try gaps first, then scale
    let iterations = 0;
    const maxIterations = 50; // Safety limit

    while (actualHeight > availableHeight && iterations < maxIterations) {
      iterations++;

      // Step 1: Try shrinking gaps first (affects flex containers)
      if (currentGap > LAYOUT.gaps.minimum) {
        currentGap = Math.max(currentGap - LAYOUT.gaps.step, LAYOUT.gaps.minimum);
        // Apply gap change and re-measure
        applyProportionalLayout(elements, scale, currentGap, h1);
        void slide.offsetHeight;
        actualHeight = measureActualContentHeight(slide);
        continue;
      }

      // Step 2: Gaps at minimum, shrink scale
      scale -= 0.02;
      if (scale < LAYOUT.minScale) {
        scale = LAYOUT.minScale;
        // Apply final minimum scale
        applyProportionalLayout(elements, scale, currentGap, h1);
        break;
      }

      // Apply new scale and re-measure ACTUAL rendered height
      applyProportionalLayout(elements, scale, currentGap, h1);
      void slide.offsetHeight;
      actualHeight = measureActualContentHeight(slide);
    }

    // If we exited without applying (content fit at default), no scaling needed
    // Otherwise, final layout has already been applied in the loop
  }

  /**
   * Check if a slide has compile-time scaling applied via CSS classes.
   * These slides should be skipped by autoscale.js to ensure PDF/HTML parity.
   */
  function hasCompileTimeScaling(slide) {
    return slide.classList.contains('scale-90') ||
           slide.classList.contains('scale-80') ||
           slide.classList.contains('scale-78') ||
           slide.classList.contains('scale-70') ||
           slide.classList.contains('scale-60') ||
           slide.classList.contains('scale-50');
  }

  function scaleSlides() {
    const slides = document.querySelectorAll("section:not(.lead):not([id='1']):not(.manual-layout)");

    slides.forEach(function (slide) {
      // Skip slides with compile-time scaling classes (CSS handles these)
      if (hasCompileTimeScaling(slide)) {
        return;
      }

      const slideHeight = slide.clientHeight;

      // Find h1 title
      const h1 = slide.querySelector('h1');

      // Reset h1 if previously scaled
      if (h1) {
        h1.style.fontSize = '';
      }

      // Find tables on this slide
      const tables = slide.querySelectorAll('table');

      if (tables.length > 0) {
        tables.forEach(function (table) {
          // Skip autoscaling for split tables - they should maintain consistent sizing
          // across all slides in the split sequence
          if (table.classList.contains('split-table')) {
            // Only detect wrapped columns for left-alignment, don't resize
            detectWrappedColumns(table);
            return;
          }

          // Reset any previous scaling
          table.style.fontSize = '';
          table.style.transform = '';

          // Ensure title has minimum top spacing
          if (h1) {
            h1.style.marginTop = MIN_PADDING_TOP + 'px';
          }

          // Available height for table (space after title)
          const availableHeight = slideHeight - TITLE_HEIGHT - MIN_PADDING_TOP - MIN_PADDING_BOTTOM;

          // Measure table height
          let tableHeight = table.getBoundingClientRect().height;

          // If table is too tall, reduce font size iteratively
          let fontSize = 0.7; // Start at 0.7em (matches CSS)
          const minFontSize = 0.35;

          while (tableHeight > availableHeight && fontSize > minFontSize) {
            fontSize -= 0.02;
            table.style.fontSize = fontSize + 'em';
            tableHeight = table.getBoundingClientRect().height;
          }

          // If still too tall after font reduction, apply transform scale
          if (tableHeight > availableHeight) {
            const scale = availableHeight / tableHeight;
            table.style.transform = 'scale(' + scale + ')';
            table.style.transformOrigin = 'center top';
          }

          // Scale title proportionally but with minimum size
          if (h1 && fontSize < 0.7) {
            const titleScale = fontSize / 0.7;
            const scaledTitleSize = 1.8 * titleScale;
            const finalTitleSize = Math.max(scaledTitleSize, MIN_TITLE_FONT_SIZE);
            h1.style.fontSize = finalTitleSize + 'em';
          }

          // Detect and mark wrapped cells for left-alignment
          detectWrappedColumns(table);
        });
      } else {
        // For non-table content, use the holistic layout algorithm
        // This preserves relative font ratios while scaling everything proportionally
        layoutSlideContent(slide, h1, slideHeight);
      }
    });
  }

  // Run after layout is complete
  requestAnimationFrame(function () {
    requestAnimationFrame(scaleSlides);
  });

  // Run after fonts load
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      requestAnimationFrame(scaleSlides);
    });
  }

  // ==========================================================================
  // ON-DEMAND SLIDE SCALING (fixes timing bug where non-visible slides
  // get incorrect dimensions from getBoundingClientRect)
  // ==========================================================================

  /**
   * Scale a single slide by ID - called when navigating to ensure
   * the currently visible slide is correctly scaled
   */
  function scaleSlideById(slideId) {
    var slide = document.querySelector('section[id="' + slideId + '"]');
    if (!slide) return;

    // Skip excluded slides
    if (slide.classList.contains('lead') ||
        slide.id === '1' ||
        slide.classList.contains('manual-layout') ||
        hasCompileTimeScaling(slide)) {
      return;
    }

    var slideHeight = slide.clientHeight;
    var h1 = slide.querySelector('h1');
    var tables = slide.querySelectorAll('table');

    if (tables.length > 0) {
      // Handle tables - use existing table scaling logic
      tables.forEach(function(table) {
        // Skip split tables (already sized by compile-time processing)
        if (table.classList.contains('split-table')) return;
        // Apply table scaling (simplified - main scaling already ran)
        scaleTableIfNeeded(table, slideHeight, h1);
      });
    } else {
      // For non-table content, use the holistic layout algorithm
      layoutSlideContent(slide, h1, slideHeight);
    }
  }

  /**
   * Helper function for table scaling on navigation
   */
  function scaleTableIfNeeded(table, slideHeight, h1) {
    // Get available height
    var h1Height = h1 ? h1.offsetHeight : 0;
    var h1Style = h1 ? window.getComputedStyle(h1) : null;
    var h1Margin = h1Style ? (parseFloat(h1Style.marginTop) || 0) + (parseFloat(h1Style.marginBottom) || 0) : 0;
    var availableHeight = slideHeight - h1Height - h1Margin - 100; // 100px buffer

    var tableHeight = table.offsetHeight;
    if (tableHeight > availableHeight && tableHeight > 0) {
      var scale = availableHeight / tableHeight;
      scale = Math.max(scale, 0.5); // Minimum 50% scale
      table.style.fontSize = (scale * 100) + '%';
    }
  }

  // Track the last scaled slide to avoid redundant scaling
  var lastScaledSlideId = null;

  /**
   * Handle slide navigation - rescale the current slide
   * This fixes the timing bug where getBoundingClientRect returns
   * incorrect values for non-visible slides
   */
  function onSlideNavigation() {
    var hash = window.location.hash;
    var slideId = (hash && hash.length > 1) ? hash.substring(1) : '1';

    // Avoid rescaling the same slide repeatedly
    if (slideId === lastScaledSlideId) return;
    lastScaledSlideId = slideId;

    // Use double RAF to ensure layout is complete
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        scaleSlideById(slideId);
      });
    });
  }

  // Listen for navigation events to rescale slides
  window.addEventListener('hashchange', onSlideNavigation);

  // Also scale the initial slide after a short delay
  // (gives time for fonts and CSS to fully load)
  setTimeout(function() {
    onSlideNavigation();
  }, 100);

  // ==========================================================================
  // CHART.JS ANIMATION REPLAY ON SLIDE TRANSITIONS
  // ==========================================================================

  // Store chart instances by canvas ID for re-animation
  var chartRegistry = {};
  var lastSlideId = null;

  /**
   * Get the current slide ID from the URL hash
   * Marp uses hashes like #1, #2, etc.
   */
  function getCurrentSlideId() {
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      return hash.substring(1); // Remove the '#'
    }
    return '1'; // Default to first slide
  }

  /**
   * Find the slide section element by ID
   */
  function getSlideById(slideId) {
    return document.querySelector('section[id="' + slideId + '"]');
  }

  /**
   * Find all Chart.js canvas elements on a given slide
   */
  function getChartsOnSlide(slideElement) {
    if (!slideElement) return [];
    return slideElement.querySelectorAll('canvas');
  }

  /**
   * Get the Chart.js instance for a canvas element
   * Chart.js stores the instance on the canvas element
   */
  function getChartInstance(canvas) {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') return null;

    // Chart.js 3.x+ stores instances in Chart.instances
    // and also on the canvas element
    if (Chart.getChart) {
      return Chart.getChart(canvas);
    }

    // Fallback: check our registry
    if (canvas.id && chartRegistry[canvas.id]) {
      return chartRegistry[canvas.id];
    }

    return null;
  }

  /**
   * Replay animation for a single chart
   */
  function replayChartAnimation(chart) {
    if (!chart) return;

    try {
      // Reset the chart to initial state (all values at 0 or hidden)
      chart.reset();

      // Trigger the animation to play
      // 'active' mode ensures the animation plays
      chart.update('active');
    } catch (e) {
      console.warn('Failed to replay chart animation:', e);
    }
  }

  /**
   * Handle slide transition - replay animations for charts on the new slide
   */
  function onSlideChange(newSlideId) {
    // Don't replay if we're still on the same slide
    if (newSlideId === lastSlideId) return;

    lastSlideId = newSlideId;

    var slideElement = getSlideById(newSlideId);
    if (!slideElement) return;

    var canvases = getChartsOnSlide(slideElement);
    if (canvases.length === 0) return;

    // Small delay to ensure the slide is fully visible
    // and any CSS transitions have started
    setTimeout(function () {
      canvases.forEach(function (canvas) {
        var chart = getChartInstance(canvas);
        if (chart) {
          replayChartAnimation(chart);
        }
      });
    }, 50);
  }

  /**
   * Register a chart instance for tracking
   * Called by chart creation code or by intercepting Chart constructor
   */
  function registerChart(canvasId, chartInstance) {
    chartRegistry[canvasId] = chartInstance;
  }

  // Expose registerChart globally for manual registration if needed
  window.registerChartForSlideAnimation = registerChart;

  /**
   * Intercept Chart.js constructor to automatically register charts
   */
  function interceptChartConstructor() {
    if (typeof Chart === 'undefined') return;

    // Store reference to the current Chart constructor
    // (may be wrapped by chart-defaults.js already)
    var OriginalChart = window.Chart;

    // Create our wrapper
    window.Chart = function (ctx, config) {
      // Call the original constructor
      var instance = new OriginalChart(ctx, config);

      // Register the chart
      var canvas = (typeof ctx === 'string') ? document.getElementById(ctx) : ctx;
      if (canvas && canvas.id) {
        registerChart(canvas.id, instance);
      }

      return instance;
    };

    // Copy static properties
    Object.setPrototypeOf(window.Chart, OriginalChart);
    Object.keys(OriginalChart).forEach(function (key) {
      window.Chart[key] = OriginalChart[key];
    });

    // Preserve prototype chain
    window.Chart.prototype = OriginalChart.prototype;
  }

  /**
   * Set up IntersectionObserver to detect when slides become visible
   * This is a backup/complement to hashchange for smooth detection
   */
  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          var section = entry.target;
          var slideId = section.getAttribute('id');
          if (slideId) {
            onSlideChange(slideId);
          }
        }
      });
    }, {
      threshold: [0.5] // Trigger when 50% visible
    });

    // Observe all slide sections
    var slides = document.querySelectorAll('section[id]');
    slides.forEach(function (slide) {
      observer.observe(slide);
    });
  }

  /**
   * Initialize chart animation replay system
   */
  function initChartAnimationReplay() {
    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
      // Chart.js not yet loaded - wait and retry
      var retries = 0;
      var maxRetries = 50; // 5 seconds max wait

      var checkInterval = setInterval(function () {
        retries++;
        if (typeof Chart !== 'undefined') {
          clearInterval(checkInterval);
          interceptChartConstructor();
          setupListeners();
        } else if (retries >= maxRetries) {
          clearInterval(checkInterval);
          // Chart.js never loaded, but still set up hash listener
          // in case charts are added later
          setupListeners();
        }
      }, 100);
    } else {
      interceptChartConstructor();
      setupListeners();
    }
  }

  /**
   * Set up event listeners for slide transitions
   */
  function setupListeners() {
    // Listen for hash changes (primary Marp navigation method)
    window.addEventListener('hashchange', function () {
      var slideId = getCurrentSlideId();
      onSlideChange(slideId);
    });

    // Also set up IntersectionObserver for visibility-based detection
    setupIntersectionObserver();

    // Initialize with current slide (in case page loads on a specific slide)
    var initialSlideId = getCurrentSlideId();
    lastSlideId = initialSlideId;

    // Don't auto-play on initial load - let the normal Chart.js animation play
    // The hashchange/intersection will handle subsequent navigations
  }

  // Initialize the chart animation replay system
  // Use a small delay to ensure chart-defaults.js has already wrapped Chart
  setTimeout(initChartAnimationReplay, 50);
});
