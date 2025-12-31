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
   * Note: diagrams ARE included in uniform scaling now (they scale with all content)
   */
  function isDiagramContainer(element) {
    return element.classList.contains('diagram-container') ||
           element.classList.contains('chart-container');
  }

  // ==========================================================================
  // CORRECTED ASPECT-RATIO-BASED LAYOUT ALGORITHM
  //
  // Key concepts:
  // - RIGID elements (images, diagrams): Must preserve aspect ratio
  // - FLEXIBLE elements (text, callouts): Can reflow when width changes
  //
  // Algorithm:
  // 1. Classify elements as rigid or flexible
  // 2. Expand flexible element widths to fill available horizontal space
  // 3. Measure content after width expansion (text has reflowed)
  // 4. Calculate uniform scale constrained by rigid element aspect ratios
  // ==========================================================================

  /**
   * Check if an element is "rigid" (must preserve aspect ratio)
   * Images, diagrams, charts, and SVGs cannot be stretched
   *
   * IMPORTANT: Flex containers are NOT rigid even if they contain images.
   * Their children should be classified separately.
   */
  function isRigidElement(el) {
    // Flex containers are NOT rigid - they contain mixed content
    if (isFlexContainer(el)) return false;

    // Direct images are rigid
    if (el.tagName === 'IMG') return true;

    // Diagram and chart containers are rigid
    if (el.classList.contains('diagram-container')) return true;
    if (el.classList.contains('chart-container')) return true;

    // Paragraphs containing only an image are rigid (image wrappers)
    if (el.tagName === 'P') {
      const img = el.querySelector('img');
      // Check if the paragraph is essentially just an image wrapper
      if (img && el.childNodes.length === 1) return true;
    }

    // Divs that are NOT flex containers and contain only an image are rigid
    if (el.tagName === 'DIV' && !isFlexContainer(el)) {
      const children = el.children;
      if (children.length === 1 && children[0].tagName === 'IMG') return true;
      // Check for direct SVG (diagram)
      if (children.length === 1 && children[0].tagName === 'SVG') return true;
    }

    return false;
  }

  /**
   * Check if an element inside a flex container is rigid
   * Used for classifying flex children
   */
  function isRigidFlexChild(el) {
    // Direct images
    if (el.tagName === 'IMG') return true;

    // Divs containing only an image
    if (el.tagName === 'DIV' || el.tagName === 'P') {
      const img = el.querySelector(':scope > img');
      const p = el.querySelector(':scope > p > img');
      if (img || p) {
        // Check if it's primarily an image container
        const textContent = el.textContent.trim();
        if (textContent === '' || textContent === el.querySelector('img')?.alt) {
          return true;
        }
      }
    }

    // Diagram containers
    if (el.classList.contains('diagram-container')) return true;
    if (el.classList.contains('chart-container')) return true;

    return false;
  }

  /**
   * Classify slide elements into rigid (aspect-ratio preserved) and
   * flexible (can reflow) categories
   *
   * For flex containers, we look at their children separately since
   * a flex container can have both rigid (image) and flexible (text) children.
   */
  function classifySlideElements(slide, h1) {
    const rigid = [];    // Images, diagrams - preserve aspect ratio
    const flexible = []; // Text, callouts - can reflow

    slide.querySelectorAll(':scope > *').forEach(function(el) {
      // Skip title - handled separately
      if (el === h1) return;
      // Skip invisible elements
      if (el.offsetHeight === 0) return;
      // Skip absolute/fixed positioned elements
      const style = getComputedStyle(el);
      if (style.position === 'absolute' || style.position === 'fixed') return;

      // For flex containers, classify their children
      if (isFlexContainer(el)) {
        // The flex container itself is flexible
        flexible.push({ element: el });

        // Also track any rigid children (images) for aspect ratio constraints
        Array.from(el.children).forEach(function(child) {
          if (child.offsetHeight === 0) return;

          if (isRigidFlexChild(child)) {
            // Find the actual image to get its dimensions
            const img = child.tagName === 'IMG' ? child : child.querySelector('img');
            if (img) {
              rigid.push({
                element: img,
                naturalWidth: img.offsetWidth,
                naturalHeight: img.offsetHeight,
                aspectRatio: img.offsetWidth / img.offsetHeight
              });
            }
          }
        });
      } else if (isRigidElement(el)) {
        rigid.push({
          element: el,
          naturalWidth: el.offsetWidth,
          naturalHeight: el.offsetHeight,
          aspectRatio: el.offsetWidth / el.offsetHeight
        });
      } else {
        flexible.push({
          element: el
        });
      }
    });

    return { rigid: rigid, flexible: flexible };
  }

  /**
   * Expand flexible element widths to fill available horizontal space
   * This causes text to reflow, reducing height
   */
  function expandFlexibleWidths(flexibleElements, availableWidth) {
    flexibleElements.forEach(function(item) {
      var el = item.element;

      // For flex containers (two-column layouts), let them use full width
      if (isFlexContainer(el)) {
        el.style.width = '100%';
      }

      // For callout boxes, allow full width
      if (isCalloutBox(el)) {
        el.style.width = '100%';
      }

      // For other block elements (paragraphs, lists, etc.),
      // they naturally take available width in block layout
    });
  }

  /**
   * Measure the bounding box of all non-title content
   * Called AFTER width expansion so text has reflowed
   */
  function measureContentBounds(slide, h1) {
    const children = slide.querySelectorAll(':scope > *');
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    let hasContent = false;

    children.forEach(function(child) {
      // Skip title - not included in content bounds
      if (child === h1) return;
      // Skip absolute/fixed positioned elements
      const style = getComputedStyle(child);
      if (style.position === 'absolute' || style.position === 'fixed') return;
      if (child.offsetHeight === 0) return;

      hasContent = true;
      const rect = child.getBoundingClientRect();

      // Include margins in bounding box
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const marginLeft = parseFloat(style.marginLeft) || 0;
      const marginRight = parseFloat(style.marginRight) || 0;

      minX = Math.min(minX, rect.left - marginLeft);
      minY = Math.min(minY, rect.top - marginTop);
      maxX = Math.max(maxX, rect.right + marginRight);
      maxY = Math.max(maxY, rect.bottom + marginBottom);
    });

    if (!hasContent) {
      return { width: 0, height: 0, left: 0, top: 0 };
    }

    return {
      width: maxX - minX,
      height: maxY - minY,
      left: minX,
      top: minY
    };
  }

  /**
   * Calculate uniform scale factor constrained by rigid elements
   * Rigid elements (images, diagrams) must preserve their aspect ratio
   */
  function calculateConstrainedScale(rigidElements, contentBounds, availableWidth, availableHeight) {
    // Start with scale = 1.0 (no scaling)
    var scale = 1.0;

    // First, check if content bounds exceed available space
    if (contentBounds.width > availableWidth) {
      scale = Math.min(scale, availableWidth / contentBounds.width);
    }
    if (contentBounds.height > availableHeight) {
      scale = Math.min(scale, availableHeight / contentBounds.height);
    }

    // Rigid elements add additional constraints
    // They must scale uniformly (same factor for width AND height)
    rigidElements.forEach(function(item) {
      // At the current scale, what would the element's dimensions be?
      var scaledWidth = item.naturalWidth * scale;
      var scaledHeight = item.naturalHeight * scale;

      // If either dimension exceeds available space, reduce scale
      // Both dimensions must scale together to preserve aspect ratio
      if (scaledWidth > availableWidth) {
        scale = Math.min(scale, availableWidth / item.naturalWidth);
      }
      if (scaledHeight > availableHeight) {
        scale = Math.min(scale, availableHeight / item.naturalHeight);
      }
    });

    // Apply minimum scale threshold
    return Math.max(scale, LAYOUT.minScale);
  }

  /**
   * Apply uniform scale via CSS custom property
   * ALL elements reference --slide-scale via calc() in CSS
   */
  function applyUniformScaleViaCSS(slide, scale, h1) {
    // Set CSS custom property that CSS rules will use
    slide.style.setProperty('--slide-scale', scale);

    // Scale title proportionally using calc
    if (h1) {
      h1.style.fontSize = 'calc(1.72em * ' + scale + ')';
      h1.style.marginBottom = 'calc(15px * ' + scale + ')';
    }
  }

  /**
   * CORRECTED: Aspect-ratio-based layout algorithm
   *
   * Algorithm:
   * 1. Classify elements as rigid (images/diagrams) or flexible (text/callouts)
   * 2. Expand flexible element widths to fill available space (text reflows)
   * 3. Measure content bounds after reflow
   * 4. Calculate uniform scale constrained by rigid element aspect ratios
   * 5. Apply single --slide-scale CSS variable to entire slide
   */
  function layoutSlideWithAspectRatio(slide) {
    const h1 = slide.querySelector('h1');

    // Skip if has compile-time scaling
    if (hasCompileTimeScaling(slide)) return;

    // STEP 0: Reset all scaling first
    resetSlideScaling(slide, h1);
    slide.style.removeProperty('--slide-scale');
    void slide.offsetHeight; // Force reflow

    // Get slide dimensions
    const slideRect = slide.getBoundingClientRect();
    const slideStyle = getComputedStyle(slide);
    const padding = parseFloat(slideStyle.padding) || 40;
    const h1Height = h1 ? h1.getBoundingClientRect().height : 0;
    const h1MarginBottom = h1 ? parseFloat(getComputedStyle(h1).marginBottom) || 0 : 0;

    const availableWidth = slideRect.width - (padding * 2);
    const availableHeight = slideRect.height - h1Height - h1MarginBottom - LAYOUT.bottomMargin - padding;

    // STEP 1: Classify elements
    const elements = classifySlideElements(slide, h1);

    // STEP 2: Expand flexible element widths to fill available space
    // This causes text to reflow, reducing height
    expandFlexibleWidths(elements.flexible, availableWidth);
    void slide.offsetHeight; // Force reflow after width changes

    // STEP 3: Measure content bounds after expansion
    const contentBounds = measureContentBounds(slide, h1);

    if (contentBounds.width === 0 || contentBounds.height === 0) {
      return; // No content to scale
    }

    // STEP 4: Calculate uniform scale constrained by rigid elements
    const scale = calculateConstrainedScale(
      elements.rigid,
      contentBounds,
      availableWidth,
      availableHeight
    );

    // STEP 5: Apply scale if needed
    if (scale < 1.0) {
      applyUniformScaleViaCSS(slide, scale, h1);
    }
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
   * Measure total height of SCALABLE content on the slide
   * Sums individual element heights + margins, excluding diagram containers
   *
   * This is different from measuring bounding box span - when a diagram sits
   * between elements, we only want the height of elements we can scale, not
   * the space the diagram occupies (which inflates bounding box measurements)
   */
  function measureActualContentHeight(slide) {
    const children = Array.from(slide.querySelectorAll(':scope > *')).filter(function(el) {
      if (el.offsetHeight === 0) return false;
      const style = window.getComputedStyle(el);
      if (style.position === 'absolute' || style.position === 'fixed') return false;
      // Skip diagram containers - they have fixed size and shouldn't affect scaling calculations
      if (isDiagramContainer(el)) return false;
      return true;
    });

    if (children.length === 0) return 0;

    // Sum up individual element heights + their margins
    // This measures how much space SCALABLE content needs, regardless of
    // where diagrams are positioned in the layout
    let totalHeight = 0;
    let prevMarginBottom = 0;

    children.forEach(function(child) {
      const rect = child.getBoundingClientRect();
      const style = window.getComputedStyle(child);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;

      // Account for margin collapsing (take max of adjacent margins)
      const effectiveMarginTop = Math.max(marginTop, prevMarginBottom);
      totalHeight += effectiveMarginTop + rect.height;
      prevMarginBottom = marginBottom;
    });

    // Add final element's bottom margin
    totalHeight += prevMarginBottom;

    return totalHeight;
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
   * Measure total height consumed by diagram containers on a slide
   * Diagrams have fixed size and should NOT be scaled - we subtract their
   * height from available space when calculating if other content needs scaling
   */
  function measureDiagramContainerHeight(slide) {
    const diagrams = slide.querySelectorAll('.diagram-container, .chart-container');
    let totalHeight = 0;

    diagrams.forEach(function(diagram) {
      const rect = diagram.getBoundingClientRect();
      const style = window.getComputedStyle(diagram);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      totalHeight += rect.height + marginTop + marginBottom;
    });

    return totalHeight;
  }

  /**
   * Layout slide content using cascade: gaps first, then scale
   *
   * Algorithm:
   * 1. Reset to default sizes and measure ACTUAL rendered height
   * 2. Subtract diagram container heights (they have fixed size, don't scale)
   * 3. If scalable content doesn't fit, shrink gaps down to minimum
   * 4. If still doesn't fit, shrink scale (all fonts proportionally)
   * 5. Apply scaling and re-measure actual height
   * 6. Repeat until content fits or minimum scale reached
   *
   * Font ratios between element types are ALWAYS preserved
   */
  function layoutSlideContent(slide, h1, slideHeight) {
    // Get slide padding
    const slideStyle = window.getComputedStyle(slide);
    const paddingBottom = parseFloat(slideStyle.paddingBottom) || 100;

    // CRITICAL: Reset any existing scaling BEFORE measuring
    resetSlideScaling(slide, h1);

    // Force layout recalculation after reset
    void slide.offsetHeight;

    // Calculate available height for SCALABLE content
    // Diagram containers have fixed size and are NOT scaled, so subtract their height
    const diagramHeight = measureDiagramContainerHeight(slide);
    const availableHeight = slideHeight - paddingBottom - LAYOUT.bottomMargin - diagramHeight;

    // Collect all elements for later scaling (excludes diagram containers)
    const elements = collectSlideElements(slide);
    if (elements.length === 0) return;

    // Filter out title for content elements
    const contentElements = elements.filter(function (item) {
      return item.type !== 'title';
    });

    // If only title, nothing to scale
    if (contentElements.length === 0) return;

    // Measure ACTUAL rendered height of SCALABLE content (excludes diagrams)
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

      // NEW: Use aspect-ratio-based uniform scaling for ALL slides
      // This ensures all content (text, images, diagrams, tables, callouts)
      // scales by exactly the same factor
      layoutSlideWithAspectRatio(slide);

      // Detect and mark wrapped table columns for left-alignment
      // (This is independent of scaling and should still happen)
      const tables = slide.querySelectorAll('table');
      tables.forEach(function (table) {
        detectWrappedColumns(table);
      });
    });
  }

  // ==========================================================================
  // INITIALIZATION TIMING FIX
  //
  // Problem: On first load, scaleSlides() runs before all resources are ready,
  // causing getBoundingClientRect() to return 0 for non-visible slides.
  // On refresh, resources are cached so dimensions are immediately available.
  //
  // Solution:
  // 1. Wait for ALL resources (fonts, images) before initial scaling
  // 2. Use on-demand scaling when slides become visible
  // 3. Re-scale after fonts load (fonts affect text layout)
  // ==========================================================================

  /**
   * Wait for all images on the page to load
   * Returns a Promise that resolves when all images are loaded
   */
  function waitForImages() {
    var images = document.querySelectorAll('img');
    var promises = [];

    images.forEach(function(img) {
      if (!img.complete) {
        promises.push(new Promise(function(resolve) {
          img.onload = resolve;
          img.onerror = resolve; // Don't block on failed images
        }));
      }
    });

    return Promise.all(promises);
  }

  /**
   * Initialize scaling after all resources are ready
   * This is the main entry point for scaling
   */
  function initializeScaling() {
    // Wait for fonts AND images before initial scaling
    var fontsReady = document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();

    Promise.all([fontsReady, waitForImages()]).then(function() {
      // Use triple RAF to ensure Marp's bespoke viewer has fully initialized
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            scaleSlides();
            // Also trigger navigation handler for the current slide
            onSlideNavigation(true); // force=true to bypass cache
          });
        });
      });
    });
  }

  // Run initialization
  initializeScaling();

  // Also run on window load (backup for any missed resources)
  window.addEventListener('load', function() {
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        scaleSlides();
        onSlideNavigation(true);
      });
    });
  });

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

    // Use the new uniform scaling algorithm
    layoutSlideWithAspectRatio(slide);

    // Detect and mark wrapped table columns for left-alignment
    var tables = slide.querySelectorAll('table');
    tables.forEach(function(table) {
      detectWrappedColumns(table);
    });
  }

  // Track the last scaled slide to avoid redundant scaling
  var lastScaledSlideId = null;

  /**
   * Handle slide navigation - rescale the current slide
   * This fixes the timing bug where getBoundingClientRect returns
   * incorrect values for non-visible slides
   *
   * @param {boolean} force - If true, rescale even if same slide
   */
  function onSlideNavigation(force) {
    var hash = window.location.hash;
    var slideId = (hash && hash.length > 1) ? hash.substring(1) : '1';

    // Avoid rescaling the same slide repeatedly (unless forced)
    if (!force && slideId === lastScaledSlideId) return;
    lastScaledSlideId = slideId;

    // Use double RAF to ensure layout is complete after Marp transition
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        scaleSlideById(slideId);
      });
    });
  }

  // Listen for navigation events to rescale slides
  window.addEventListener('hashchange', function() {
    onSlideNavigation(false);
  });

  // ==========================================================================
  // INTERSECTION OBSERVER FOR SLIDE VISIBILITY
  //
  // Marp's bespoke viewer may hide non-active slides, causing
  // getBoundingClientRect() to return 0. This observer triggers rescaling
  // when a slide actually becomes visible in the viewport.
  // ==========================================================================

  /**
   * Set up IntersectionObserver to scale slides when they become visible
   * This ensures scaling happens even if the initial scaleSlides() failed
   * due to the slide not being rendered yet.
   */
  function setupScalingIntersectionObserver() {
    if (!('IntersectionObserver' in window)) return;

    // Track which slides have been successfully scaled
    var scaledSlides = new Set();

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
          var section = entry.target;
          var slideId = section.getAttribute('id');

          // Skip if already scaled successfully (has visible content)
          if (slideId && !scaledSlides.has(slideId)) {
            // Check if slide has content with non-zero dimensions
            var children = section.querySelectorAll(':scope > *');
            var hasVisibleContent = false;
            children.forEach(function(child) {
              if (child.offsetHeight > 0) hasVisibleContent = true;
            });

            if (hasVisibleContent) {
              // Use double RAF for layout completion
              requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                  scaleSlideById(slideId);
                  scaledSlides.add(slideId);
                });
              });
            }
          }
        }
      });
    }, {
      threshold: [0.1, 0.5, 1.0] // Multiple thresholds for robust detection
    });

    // Observe all slide sections
    var slides = document.querySelectorAll('section[id]');
    slides.forEach(function(slide) {
      observer.observe(slide);
    });
  }

  // Initialize the scaling intersection observer
  setupScalingIntersectionObserver();

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
