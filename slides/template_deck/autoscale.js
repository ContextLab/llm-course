// Auto-scale slide CONTENT to fit within bounds
// Handles tables specially by adjusting font-size
// Detects wrapped text cells and applies left-alignment
document.addEventListener("DOMContentLoaded", function() {
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
      cells.forEach(function(cell, colIndex) {
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
    rows.forEach(function(row, rowIndex) {
      const cells = row.querySelectorAll('th, td');
      cells.forEach(function(cell, colIndex) {
        cell.classList.remove('wrapped-text');
        if (columnHasWrap[colIndex] && rowIndex > 0) {
          // Only apply to data cells, not headers
          cell.classList.add('wrapped-text');
        }
      });
    });
  }

  function scaleSlides() {
    const slides = document.querySelectorAll("section:not(.lead):not([id='1'])");

    slides.forEach(function(slide) {
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
        tables.forEach(function(table) {
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
        children.forEach(function(child) {
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
            children.forEach(function(child) {
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
  requestAnimationFrame(function() {
    requestAnimationFrame(scaleSlides);
  });

  // Run after fonts load
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function() {
      requestAnimationFrame(scaleSlides);
    });
  }
});
