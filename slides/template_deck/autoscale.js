// Auto-scale slide CONTENT to fit within bounds
// Uses CSS custom property to scale all content uniformly
document.addEventListener("DOMContentLoaded", function() {
  const MIN_PADDING_TOP = 20;
  const MIN_PADDING_BOTTOM = 20;

  function scaleSlides() {
    const slides = document.querySelectorAll("section:not(.lead):not([id='1'])");

    slides.forEach(function(slide) {
      // Remove any previous scale
      slide.style.setProperty('--content-scale', '1');

      // Get slide inner dimensions
      const slideHeight = slide.clientHeight;
      const slideWidth = slide.clientWidth;

      // Get computed styles
      const cs = window.getComputedStyle(slide);
      const paddingTop = parseFloat(cs.paddingTop) || 0;
      const paddingBottom = parseFloat(cs.paddingBottom) || 0;

      // Available height for content
      const availableHeight = slideHeight - MIN_PADDING_TOP - MIN_PADDING_BOTTOM;

      // Measure content by finding bounds of all children
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

      // Check if content exceeds available space
      const needsTopSpace = contentTop < MIN_PADDING_TOP;
      const needsBottomSpace = contentBottom > (slideHeight - MIN_PADDING_BOTTOM);

      if (needsTopSpace || needsBottomSpace) {
        // Calculate scale factor
        const scale = Math.min(availableHeight / contentHeight, 1);

        if (scale < 0.95) {
          // Apply scale via CSS custom property
          slide.style.setProperty('--content-scale', scale.toString());

          // Apply transform to all direct children
          children.forEach(function(child) {
            if (child.offsetHeight === 0) return;
            const style = window.getComputedStyle(child);
            if (style.position === 'absolute' || style.position === 'fixed') return;

            child.style.transform = 'scale(var(--content-scale, 1))';
            child.style.transformOrigin = 'center top';
          });
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
