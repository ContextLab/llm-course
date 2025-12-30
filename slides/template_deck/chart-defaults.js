/**
 * chart-defaults.js - Automated Chart.js configuration for CDL Theme
 *
 * This script automatically applies Dartmouth/CDL theme styling to all Chart.js charts.
 * Users don't need to specify colors, fonts, or sizes manually - sensible defaults
 * are applied automatically based on the theme.
 *
 * Features:
 * - Auto-applies Dartmouth color palette to datasets (reads from CSS custom properties)
 * - Uses theme fonts (Avenir LT Std)
 * - Responsive sizing that works with Marp slides
 * - Sensible defaults for all chart types
 * - Users can still override any setting when needed
 *
 * Usage in Marp markdown:
 * 1. Include Chart.js CDN: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
 * 2. Include this script: <script src="chart-defaults.js"></script>
 * 3. Create charts with minimal configuration - colors are auto-applied!
 */

(function() {
  'use strict';

  // ==========================================================================
  // READ COLORS FROM CSS CUSTOM PROPERTIES
  // This ensures chart colors stay in sync with the theme
  // ==========================================================================

  /**
   * Get a CSS custom property value from :root
   */
  function getCSSVar(name, fallback = '') {
    if (typeof getComputedStyle === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  /**
   * Build palette from CSS custom properties (with fallbacks)
   */
  function buildPaletteFromCSS() {
    return {
      // Primary brand colors
      dartmouthGreen: getCSSVar('--dartmouth-green', '#00693e'),
      textPrimary: getCSSVar('--text-primary', '#0a2518'),
      textSecondary: getCSSVar('--text-secondary', '#0a3d23'),

      // Chart colors (from CSS --chart-color-N variables)
      chartColors: [
        getCSSVar('--chart-color-1', '#00693e'),
        getCSSVar('--chart-color-2', '#267aba'),
        getCSSVar('--chart-color-3', '#ffa00f'),
        getCSSVar('--chart-color-4', '#9d162e'),
        getCSSVar('--chart-color-5', '#8a6996'),
        getCSSVar('--chart-color-6', '#a5d75f'),
        getCSSVar('--chart-color-7', '#003c73'),
        getCSSVar('--chart-color-8', '#d94415'),
        getCSSVar('--chart-color-9', '#643c20'),
        getCSSVar('--chart-color-10', '#c4dd88'),
        getCSSVar('--chart-color-11', '#f5dc69'),
        getCSSVar('--chart-color-12', '#424141'),
      ],

      // Background colors (semi-transparent versions)
      chartBgColors: [
        getCSSVar('--chart-bg-1', 'rgba(0, 105, 62, 0.5)'),
        getCSSVar('--chart-bg-2', 'rgba(38, 122, 186, 0.5)'),
        getCSSVar('--chart-bg-3', 'rgba(255, 160, 15, 0.5)'),
        getCSSVar('--chart-bg-4', 'rgba(157, 22, 46, 0.5)'),
        getCSSVar('--chart-bg-5', 'rgba(138, 105, 150, 0.5)'),
        getCSSVar('--chart-bg-6', 'rgba(165, 215, 95, 0.5)'),
      ],

      // Semantic colors
      positive: getCSSVar('--chart-positive', '#00693e'),
      negative: getCSSVar('--chart-negative', '#9d162e'),
      neutral: getCSSVar('--chart-neutral', '#424141'),
      highlight: getCSSVar('--chart-highlight', '#ffa00f'),

      // Grid and axis colors
      gridLight: getCSSVar('--chart-grid-light', 'rgba(0, 105, 62, 0.1)'),
      gridMedium: getCSSVar('--chart-grid-medium', 'rgba(0, 105, 62, 0.15)'),
      gridDark: getCSSVar('--chart-grid-dark', 'rgba(0, 105, 62, 0.2)'),
      axisColor: getCSSVar('--chart-axis-color', '#0a2518'),

      // Font
      fontFamily: getCSSVar('--chart-font-family', "'Avenir LT Std', 'Avenir', 'Avenir Next', -apple-system, BlinkMacSystemFont, sans-serif"),
    };
  }

  // Initialize palette (will be populated when DOM is ready)
  let CDL_PALETTE = null;

  // For convenience, expose primary chart colors array
  let CHART_COLORS = null;

  // ==========================================================================
  // FONT CONFIGURATION
  // Responsive font sizes based on typical Marp slide dimensions (1280x720)
  // ==========================================================================
  const FONT_CONFIG = {
    sizes: {
      title: 22,        // Chart title
      subtitle: 18,     // Subtitle
      legend: 16,       // Legend labels
      axisTitle: 18,    // Axis titles
      axisTicks: 16,    // Axis tick labels
      tooltip: 14,      // Tooltip text
      dataLabels: 14,   // Data labels on charts
    },
    weight: {
      normal: 400,
      medium: 500,
      bold: 600,
    },
  };

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Ensure palette is initialized
   */
  function ensurePalette() {
    if (!CDL_PALETTE) {
      CDL_PALETTE = buildPaletteFromCSS();
      CHART_COLORS = CDL_PALETTE.chartColors;
    }
    return CDL_PALETTE;
  }

  /**
   * Get color for a dataset at given index
   * Cycles through palette if more datasets than colors
   */
  function getColor(index) {
    ensurePalette();
    return CHART_COLORS[index % CHART_COLORS.length];
  }

  /**
   * Get color with alpha transparency
   */
  function getColorWithAlpha(color, alpha) {
    // Handle hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    // Handle rgba colors
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/, `${alpha})`);
    }
    return color;
  }

  /**
   * Generate colors for all datasets in chart data
   * Automatically assigns colors if not specified
   */
  function autoAssignColors(data, chartType) {
    if (!data || !data.datasets) return data;

    data.datasets.forEach((dataset, index) => {
      const baseColor = getColor(index);

      // Only assign colors if not already specified
      switch (chartType) {
        case 'bar':
        case 'horizontalBar':
          if (!dataset.backgroundColor) {
            dataset.backgroundColor = baseColor;
          }
          if (!dataset.borderColor) {
            dataset.borderColor = baseColor;
          }
          if (dataset.borderWidth === undefined) {
            dataset.borderWidth = 2;
          }
          break;

        case 'line':
          if (!dataset.borderColor) {
            dataset.borderColor = baseColor;
          }
          if (!dataset.backgroundColor) {
            dataset.backgroundColor = getColorWithAlpha(baseColor, 0.1);
          }
          if (dataset.borderWidth === undefined) {
            dataset.borderWidth = 3;
          }
          if (dataset.pointRadius === undefined) {
            dataset.pointRadius = 6;
          }
          if (!dataset.pointBackgroundColor) {
            dataset.pointBackgroundColor = baseColor;
          }
          if (dataset.tension === undefined) {
            dataset.tension = 0.3;
          }
          break;

        case 'scatter':
        case 'bubble':
          if (!dataset.backgroundColor) {
            dataset.backgroundColor = baseColor;
          }
          if (!dataset.borderColor) {
            dataset.borderColor = baseColor;
          }
          if (dataset.pointRadius === undefined) {
            dataset.pointRadius = 15;
          }
          if (dataset.pointHoverRadius === undefined) {
            dataset.pointHoverRadius = 18;
          }
          break;

        case 'pie':
        case 'doughnut':
        case 'polarArea':
          // For pie charts, we need multiple colors for one dataset
          if (!dataset.backgroundColor) {
            const numItems = dataset.data ? dataset.data.length : 6;
            dataset.backgroundColor = [];
            for (let i = 0; i < numItems; i++) {
              dataset.backgroundColor.push(getColor(i));
            }
          }
          if (!dataset.borderColor) {
            dataset.borderColor = '#d8d8d8';  // Slide background
          }
          if (dataset.borderWidth === undefined) {
            dataset.borderWidth = 2;
          }
          break;

        case 'radar':
          if (!dataset.borderColor) {
            dataset.borderColor = baseColor;
          }
          if (!dataset.backgroundColor) {
            dataset.backgroundColor = getColorWithAlpha(baseColor, 0.2);
          }
          if (dataset.borderWidth === undefined) {
            dataset.borderWidth = 2;
          }
          if (dataset.pointRadius === undefined) {
            dataset.pointRadius = 4;
          }
          if (!dataset.pointBackgroundColor) {
            dataset.pointBackgroundColor = baseColor;
          }
          break;

        default:
          // Generic color assignment
          if (!dataset.backgroundColor) {
            dataset.backgroundColor = baseColor;
          }
          if (!dataset.borderColor) {
            dataset.borderColor = baseColor;
          }
      }
    });

    return data;
  }

  // ==========================================================================
  // CHART.JS GLOBAL DEFAULTS
  // ==========================================================================

  function applyGlobalDefaults() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded. chart-defaults.js requires Chart.js to be loaded first.');
      return false;
    }

    // Ensure palette is loaded from CSS
    const palette = ensurePalette();

    // Font defaults
    Chart.defaults.font.family = palette.fontFamily;
    Chart.defaults.font.size = FONT_CONFIG.sizes.axisTicks;
    Chart.defaults.color = palette.textPrimary;

    // Responsive defaults
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;

    // Animation (subtle)
    Chart.defaults.animation.duration = 400;

    // Plugin defaults
    // Legend
    Chart.defaults.plugins.legend.labels.font = {
      family: palette.fontFamily,
      size: FONT_CONFIG.sizes.legend,
      weight: FONT_CONFIG.weight.normal,
    };
    Chart.defaults.plugins.legend.labels.color = palette.textPrimary;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 20;

    // Title
    Chart.defaults.plugins.title.font = {
      family: palette.fontFamily,
      size: FONT_CONFIG.sizes.title,
      weight: FONT_CONFIG.weight.medium,
    };
    Chart.defaults.plugins.title.color = palette.textPrimary;

    // Tooltip
    Chart.defaults.plugins.tooltip.backgroundColor = palette.textPrimary;
    Chart.defaults.plugins.tooltip.titleFont = {
      family: palette.fontFamily,
      size: FONT_CONFIG.sizes.tooltip,
      weight: FONT_CONFIG.weight.medium,
    };
    Chart.defaults.plugins.tooltip.bodyFont = {
      family: palette.fontFamily,
      size: FONT_CONFIG.sizes.tooltip,
    };
    Chart.defaults.plugins.tooltip.cornerRadius = 4;
    Chart.defaults.plugins.tooltip.padding = 10;

    // Scale defaults (for cartesian charts)
    // These need to be applied per-scale type
    const scaleDefaults = {
      grid: {
        color: palette.gridLight,
        lineWidth: 1,
      },
      border: {
        color: palette.gridDark,
        width: 1,
      },
      ticks: {
        font: {
          family: palette.fontFamily,
          size: FONT_CONFIG.sizes.axisTicks,
        },
        color: palette.textPrimary,
      },
      title: {
        font: {
          family: palette.fontFamily,
          size: FONT_CONFIG.sizes.axisTitle,
          weight: FONT_CONFIG.weight.normal,
        },
        color: palette.textPrimary,
      },
    };

    // Apply scale defaults to linear scale
    if (Chart.defaults.scales && Chart.defaults.scales.linear) {
      if (Chart.defaults.scales.linear.grid) Object.assign(Chart.defaults.scales.linear.grid, scaleDefaults.grid);
      if (Chart.defaults.scales.linear.border) Object.assign(Chart.defaults.scales.linear.border, scaleDefaults.border);
      if (Chart.defaults.scales.linear.ticks) Object.assign(Chart.defaults.scales.linear.ticks, scaleDefaults.ticks);
      if (Chart.defaults.scales.linear.title) Object.assign(Chart.defaults.scales.linear.title, scaleDefaults.title);
    }

    // Apply scale defaults to category scale
    if (Chart.defaults.scales && Chart.defaults.scales.category) {
      if (Chart.defaults.scales.category.grid) Object.assign(Chart.defaults.scales.category.grid, scaleDefaults.grid);
      if (Chart.defaults.scales.category.border) Object.assign(Chart.defaults.scales.category.border, scaleDefaults.border);
      if (Chart.defaults.scales.category.ticks) Object.assign(Chart.defaults.scales.category.ticks, scaleDefaults.ticks);
      if (Chart.defaults.scales.category.title) Object.assign(Chart.defaults.scales.category.title, scaleDefaults.title);
    }

    // Apply scale defaults to logarithmic scale
    if (Chart.defaults.scales && Chart.defaults.scales.logarithmic) {
      if (Chart.defaults.scales.logarithmic.grid) Object.assign(Chart.defaults.scales.logarithmic.grid, scaleDefaults.grid);
      if (Chart.defaults.scales.logarithmic.border) Object.assign(Chart.defaults.scales.logarithmic.border, scaleDefaults.border);
      if (Chart.defaults.scales.logarithmic.ticks) Object.assign(Chart.defaults.scales.logarithmic.ticks, scaleDefaults.ticks);
      if (Chart.defaults.scales.logarithmic.title) Object.assign(Chart.defaults.scales.logarithmic.title, scaleDefaults.title);
    }

    // Apply scale defaults to radial scale (for radar charts)
    if (Chart.defaults.scales && Chart.defaults.scales.radialLinear) {
      if (Chart.defaults.scales.radialLinear.grid) Chart.defaults.scales.radialLinear.grid.color = palette.gridLight;
      if (Chart.defaults.scales.radialLinear.angleLines) Chart.defaults.scales.radialLinear.angleLines.color = palette.gridMedium;
      if (Chart.defaults.scales.radialLinear.pointLabels) {
        Chart.defaults.scales.radialLinear.pointLabels.font = {
          family: palette.fontFamily,
          size: FONT_CONFIG.sizes.axisTicks,
        };
        Chart.defaults.scales.radialLinear.pointLabels.color = palette.textPrimary;
      }
    }

    return true;
  }

  // ==========================================================================
  // CHART WRAPPER FOR AUTO-STYLING
  // ==========================================================================

  /**
   * Wrap the Chart constructor to automatically apply CDL styling
   */
  function wrapChartConstructor() {
    if (typeof Chart === 'undefined') return;

    const OriginalChart = Chart;

    // Create a wrapper that auto-applies colors
    window.Chart = function(ctx, config) {
      // Auto-assign colors if not specified
      if (config && config.data) {
        config.data = autoAssignColors(config.data, config.type);
      }

      // Merge default options for specific chart types
      if (config && config.options) {
        config.options = applyChartTypeDefaults(config.type, config.options);
      }

      // Call original constructor
      return new OriginalChart(ctx, config);
    };

    // Copy static properties and methods
    Object.setPrototypeOf(window.Chart, OriginalChart);
    Object.assign(window.Chart, OriginalChart);

    // Preserve the prototype chain
    window.Chart.prototype = OriginalChart.prototype;
  }

  /**
   * Apply chart-type specific defaults
   */
  function applyChartTypeDefaults(chartType, userOptions) {
    const options = { ...userOptions };

    switch (chartType) {
      case 'bar':
      case 'horizontalBar':
        // Bar chart defaults
        if (!options.scales) options.scales = {};
        if (!options.scales.x) options.scales.x = {};
        if (!options.scales.y) options.scales.y = {};

        // Hide x-axis grid for cleaner look
        if (options.scales.x.grid === undefined) {
          options.scales.x.grid = { display: false };
        }
        break;

      case 'line':
        // Line chart defaults
        if (!options.interaction) {
          options.interaction = { intersect: false, mode: 'index' };
        }
        break;

      case 'pie':
      case 'doughnut':
        // Pie/doughnut defaults
        if (!options.plugins) options.plugins = {};
        if (options.plugins.legend === undefined) {
          const palette = ensurePalette();
          options.plugins.legend = {
            position: 'right',
            labels: {
              font: {
                family: palette.fontFamily,
                size: FONT_CONFIG.sizes.legend,
              },
              color: palette.textPrimary,
              padding: 15,
            },
          };
        }
        break;

      case 'radar':
        // Radar chart defaults - keep as-is, scale defaults applied globally
        break;

      case 'scatter':
      case 'bubble':
        // Scatter/bubble defaults
        if (!options.scales) options.scales = {};
        if (!options.scales.x) options.scales.x = {};
        if (!options.scales.y) options.scales.y = {};
        break;
    }

    return options;
  }

  // ==========================================================================
  // CONVENIENCE FUNCTIONS FOR USERS
  // Exposed on window.CDLChart for easy access
  // ==========================================================================

  window.CDLChart = {
    // Color palette access (getters to ensure lazy initialization)
    get colors() {
      return ensurePalette().chartColors;
    },
    get palette() {
      return ensurePalette();
    },

    // Get specific color by index
    getColor: getColor,

    // Get color with transparency
    getColorWithAlpha: getColorWithAlpha,

    // Get array of colors for a specific count
    getColors: function(count) {
      ensurePalette();
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(getColor(i));
      }
      return result;
    },

    // Font configuration
    fonts: FONT_CONFIG,

    // Quick chart creation helpers
    // These create minimal config that auto-applies all styling

    /**
     * Create a simple bar chart
     * @param {string} canvasId - Canvas element ID
     * @param {string[]} labels - X-axis labels
     * @param {number[]} data - Data values
     * @param {object} options - Optional overrides
     */
    bar: function(canvasId, labels, data, options = {}) {
      return new Chart(document.getElementById(canvasId), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{ data: data }],
        },
        options: {
          plugins: { legend: { display: false } },
          ...options,
        },
      });
    },

    /**
     * Create a simple line chart
     * @param {string} canvasId - Canvas element ID
     * @param {string[]} labels - X-axis labels
     * @param {Array} datasets - Array of {label, data} objects
     * @param {object} options - Optional overrides
     */
    line: function(canvasId, labels, datasets, options = {}) {
      return new Chart(document.getElementById(canvasId), {
        type: 'line',
        data: {
          labels: labels,
          datasets: datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
            fill: ds.fill !== undefined ? ds.fill : true,
          })),
        },
        options: options,
      });
    },

    /**
     * Create a simple pie chart
     * @param {string} canvasId - Canvas element ID
     * @param {string[]} labels - Slice labels
     * @param {number[]} data - Data values
     * @param {object} options - Optional overrides
     */
    pie: function(canvasId, labels, data, options = {}) {
      return new Chart(document.getElementById(canvasId), {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{ data: data }],
        },
        options: options,
      });
    },

    /**
     * Create a simple scatter chart
     * @param {string} canvasId - Canvas element ID
     * @param {Array} datasets - Array of {label, data: [{x, y}]} objects
     * @param {object} options - Optional overrides
     */
    scatter: function(canvasId, datasets, options = {}) {
      return new Chart(document.getElementById(canvasId), {
        type: 'scatter',
        data: {
          datasets: datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
          })),
        },
        options: options,
      });
    },

    /**
     * Create a doughnut chart
     * @param {string} canvasId - Canvas element ID
     * @param {string[]} labels - Slice labels
     * @param {number[]} data - Data values
     * @param {object} options - Optional overrides
     */
    doughnut: function(canvasId, labels, data, options = {}) {
      return new Chart(document.getElementById(canvasId), {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{ data: data }],
        },
        options: options,
      });
    },

    /**
     * Create a radar chart
     * @param {string} canvasId - Canvas element ID
     * @param {string[]} labels - Axis labels
     * @param {Array} datasets - Array of {label, data} objects
     * @param {object} options - Optional overrides
     */
    radar: function(canvasId, labels, datasets, options = {}) {
      return new Chart(document.getElementById(canvasId), {
        type: 'radar',
        data: {
          labels: labels,
          datasets: datasets.map(ds => ({
            label: ds.label,
            data: ds.data,
          })),
        },
        options: options,
      });
    },
  };

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function initialize() {
    // Wait for Chart.js to be available
    if (typeof Chart !== 'undefined') {
      applyGlobalDefaults();
      wrapChartConstructor();
      console.log('CDL Chart defaults applied successfully.');
      return true;
    } else {
      // Chart.js not yet loaded - wait and retry
      let retries = 0;
      const maxRetries = 50; // 5 seconds max wait

      const checkInterval = setInterval(function() {
        retries++;
        if (typeof Chart !== 'undefined') {
          clearInterval(checkInterval);
          applyGlobalDefaults();
          wrapChartConstructor();
          console.log('CDL Chart defaults applied successfully (after waiting for Chart.js).');
        } else if (retries >= maxRetries) {
          clearInterval(checkInterval);
          console.warn('Chart.js not found after waiting. CDL Chart defaults not applied.');
        }
      }, 100);
      return false;
    }
  }

  // Initialize IMMEDIATELY - this must run BEFORE any chart creation scripts
  // Chart.js CDN should be loaded before this script
  initialize();

})();
