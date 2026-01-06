// Chart animation replay and table column alignment for Marp presentations
// Handles Chart.js animations on slide transitions and detects wrapped table columns
document.addEventListener("DOMContentLoaded", function () {

  // ==========================================================================
  // TABLE COLUMN WRAP DETECTION
  // Detects columns with wrapped text and applies left-alignment
  // ==========================================================================

  function detectWrappedColumns(table) {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return;

    const firstRow = rows[0];
    const numCols = firstRow.querySelectorAll('th, td').length;
    const columnHasWrap = new Array(numCols).fill(false);

    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r].querySelectorAll('td');
      cells.forEach(function (cell, colIndex) {
        if (columnHasWrap[colIndex]) return;

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

    rows.forEach(function (row, rowIndex) {
      const cells = row.querySelectorAll('th, td');
      cells.forEach(function (cell, colIndex) {
        cell.classList.remove('wrapped-text');
        if (columnHasWrap[colIndex] && rowIndex > 0) {
          cell.classList.add('wrapped-text');
        }
      });
    });
  }

  function processAllTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(function (table) {
      detectWrappedColumns(table);
    });
  }

  // ==========================================================================
  // CHART.JS ANIMATION REPLAY ON SLIDE TRANSITIONS
  // ==========================================================================

  var chartRegistry = {};
  var lastSlideId = null;

  function getCurrentSlideId() {
    var hash = window.location.hash;
    if (hash && hash.length > 1) {
      return hash.substring(1);
    }
    return '1';
  }

  function getSlideById(slideId) {
    return document.querySelector('section[id="' + slideId + '"]');
  }

  function getChartsOnSlide(slideElement) {
    if (!slideElement) return [];
    return slideElement.querySelectorAll('canvas');
  }

  function getChartInstance(canvas) {
    if (typeof Chart === 'undefined') return null;

    if (Chart.getChart) {
      return Chart.getChart(canvas);
    }

    if (canvas.id && chartRegistry[canvas.id]) {
      return chartRegistry[canvas.id];
    }

    return null;
  }

  function replayChartAnimation(chart) {
    if (!chart) return;

    try {
      chart.reset();
      chart.update('active');
    } catch (e) {
      console.warn('Failed to replay chart animation:', e);
    }
  }

  function onSlideChange(newSlideId) {
    if (newSlideId === lastSlideId) return;

    lastSlideId = newSlideId;

    var slideElement = getSlideById(newSlideId);
    if (!slideElement) return;

    var canvases = getChartsOnSlide(slideElement);
    if (canvases.length === 0) return;

    setTimeout(function () {
      canvases.forEach(function (canvas) {
        var chart = getChartInstance(canvas);
        if (chart) {
          replayChartAnimation(chart);
        }
      });
    }, 50);
  }

  function registerChart(canvasId, chartInstance) {
    chartRegistry[canvasId] = chartInstance;
  }

  window.registerChartForSlideAnimation = registerChart;

  function interceptChartConstructor() {
    if (typeof Chart === 'undefined') return;

    var OriginalChart = window.Chart;

    window.Chart = function (ctx, config) {
      var instance = new OriginalChart(ctx, config);

      var canvas = (typeof ctx === 'string') ? document.getElementById(ctx) : ctx;
      if (canvas && canvas.id) {
        registerChart(canvas.id, instance);
      }

      return instance;
    };

    Object.setPrototypeOf(window.Chart, OriginalChart);
    Object.keys(OriginalChart).forEach(function (key) {
      window.Chart[key] = OriginalChart[key];
    });

    window.Chart.prototype = OriginalChart.prototype;
  }

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
      threshold: [0.5]
    });

    var slides = document.querySelectorAll('section[id]');
    slides.forEach(function (slide) {
      observer.observe(slide);
    });
  }

  function initChartAnimationReplay() {
    if (typeof Chart === 'undefined') {
      var retries = 0;
      var maxRetries = 50;

      var checkInterval = setInterval(function () {
        retries++;
        if (typeof Chart !== 'undefined') {
          clearInterval(checkInterval);
          interceptChartConstructor();
          setupListeners();
        } else if (retries >= maxRetries) {
          clearInterval(checkInterval);
          setupListeners();
        }
      }, 100);
    } else {
      interceptChartConstructor();
      setupListeners();
    }
  }

  function setupListeners() {
    window.addEventListener('hashchange', function () {
      var slideId = getCurrentSlideId();
      onSlideChange(slideId);
    });

    setupIntersectionObserver();

    var initialSlideId = getCurrentSlideId();
    lastSlideId = initialSlideId;
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function initialize() {
    var fontsReady = document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();

    fontsReady.then(function() {
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          processAllTables();
        });
      });
    });
  }

  initialize();
  setTimeout(initChartAnimationReplay, 50);

  window.addEventListener('load', function() {
    requestAnimationFrame(function() {
      processAllTables();
    });
  });

  window.addEventListener('hashchange', function() {
    requestAnimationFrame(function() {
      var hash = window.location.hash;
      var slideId = (hash && hash.length > 1) ? hash.substring(1) : '1';
      var slide = document.querySelector('section[id="' + slideId + '"]');
      if (slide) {
        var tables = slide.querySelectorAll('table');
        tables.forEach(function(table) {
          detectWrappedColumns(table);
        });
      }
    });
  });
});
