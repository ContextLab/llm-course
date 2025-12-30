// Auto-scale slide CONTENT to fit within bounds
// Handles tables specially by adjusting font-size
// Detects wrapped text cells and applies left-alignment
// Triggers Chart.js animations on slide transitions
document.addEventListener("DOMContentLoaded", function () {
  const MIN_PADDING_TOP = 30;
  const MIN_PADDING_BOTTOM = 20;
  const TITLE_HEIGHT = 90; // Reserved space for title
  const MIN_TITLE_FONT_SIZE = 1.4; // Minimum title size in em

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

  function scaleSlides() {
    const slides = document.querySelectorAll("section:not(.lead):not([id='1']):not(.manual-layout)");

    slides.forEach(function (slide) {
      const slideHeight = slide.clientHeight;
      const slideWidth = slide.clientWidth;

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
        // For non-table content, use general scaling logic
        let contentTop = Infinity;
        let contentBottom = 0;

        const children = slide.querySelectorAll(':scope > *');
        children.forEach(function (child) {
          if (child.offsetHeight === 0) return;
          const style = window.getComputedStyle(child);
          if (style.position === 'absolute' || style.position === 'fixed') return;

          const rect = child.getBoundingClientRect();
          const slideRect = slide.getBoundingClientRect();
          const relTop = rect.top - slideRect.top;
          const relBottom = rect.bottom - slideRect.top;

          contentTop = Math.min(contentTop, relTop);
          contentBottom = Math.max(contentBottom, relBottom);
        });

        if (contentTop === Infinity) return;

        const contentHeight = contentBottom - contentTop;
        const availableHeight = slideHeight - MIN_PADDING_TOP - MIN_PADDING_BOTTOM;

        const needsTopSpace = contentTop < MIN_PADDING_TOP;
        const needsBottomSpace = contentBottom > (slideHeight - MIN_PADDING_BOTTOM);

        if (needsTopSpace || needsBottomSpace) {
          const scale = Math.min(availableHeight / contentHeight, 1);

          if (scale < 0.95) {
            children.forEach(function (child) {
              if (child.offsetHeight === 0) return;
              const style = window.getComputedStyle(child);
              if (style.position === 'absolute' || style.position === 'fixed') return;

              if (child.tagName === 'H1') {
                const scaledSize = 1.8 * scale;
                const finalSize = Math.max(scaledSize, MIN_TITLE_FONT_SIZE);
                child.style.fontSize = finalSize + 'em';
              } else {
                child.style.transform = 'scale(' + scale + ')';
                child.style.transformOrigin = 'center top';
              }
            });
          }
        }
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
