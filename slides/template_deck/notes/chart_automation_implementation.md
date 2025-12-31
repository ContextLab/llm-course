# Chart Automation Implementation Notes

**Date**: 2025-12-30
**Status**: Complete
**Branch**: feature/issue-22-theme-refinement

## Summary

Implemented an automated chart styling system for Marp presentations using Chart.js. Users no longer need to manually specify colors, fonts, or sizes - sensible defaults are applied automatically based on the Dartmouth/CDL theme.

## Files Created/Modified

### New Files
- `/Users/jmanning/llm-course/slides/template_deck/chart-defaults.js` - Main automation script

### Modified Files
- `/Users/jmanning/llm-course/slides/template_deck/themes/cdl-theme.css` - Added CSS custom properties for charts
- `/Users/jmanning/llm-course/slides/template_deck/theme_showcase.md` - Updated chart examples to use simplified syntax
- `/Users/jmanning/llm-course/slides/template_deck/STYLE_GUIDE.md` - Added comprehensive chart documentation

## Key Features

### 1. Automatic Color Assignment
- Each dataset automatically gets a distinct color from the Dartmouth palette
- Colors are read from CSS custom properties (--chart-color-1 through --chart-color-12)
- Pie/doughnut charts auto-assign colors to each slice

### 2. Automatic Font Configuration
- Uses theme font (Avenir LT Std) for all chart text
- Responsive font sizes for different chart elements
- Consistent with the rest of the theme

### 3. Automatic Sizing and Responsiveness
- Charts are responsive by default
- Grid styling uses theme colors
- Sensible defaults for all chart types

### 4. CDLChart Helper Functions
Convenience functions for common chart patterns:
- `CDLChart.bar(canvasId, labels, data)` - Simple bar chart
- `CDLChart.line(canvasId, labels, datasets)` - Line chart
- `CDLChart.pie(canvasId, labels, data)` - Pie chart
- `CDLChart.scatter(canvasId, datasets)` - Scatter plot
- `CDLChart.doughnut(canvasId, labels, data)` - Doughnut chart
- `CDLChart.radar(canvasId, labels, datasets)` - Radar chart

### 5. Color Access API
- `CDLChart.colors` - Array of all theme colors
- `CDLChart.getColor(index)` - Get specific color
- `CDLChart.getColors(count)` - Get N colors
- `CDLChart.getColorWithAlpha(color, alpha)` - Add transparency

## CSS Custom Properties Added

```css
:root {
    /* Chart colors */
    --chart-color-1: #00693e;      /* Dartmouth Green */
    --chart-color-2: #267aba;      /* River Blue */
    --chart-color-3: #ffa00f;      /* Bonfire Orange */
    --chart-color-4: #9d162e;      /* Bonfire Red */
    --chart-color-5: #8a6996;      /* Violet */
    --chart-color-6: #a5d75f;      /* Rich Spring Green */
    /* ... plus 6 more extended colors */

    /* Grid styling */
    --chart-grid-light: rgba(0, 105, 62, 0.1);
    --chart-grid-medium: rgba(0, 105, 62, 0.15);
    --chart-grid-dark: rgba(0, 105, 62, 0.2);
    --chart-axis-color: #0a2518;

    /* Font */
    --chart-font-family: 'Avenir LT Std', ...;
}
```

## Usage

### Before (Verbose)
```javascript
new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      data: [10, 20, 30],
      backgroundColor: ['#00693e', '#267aba', '#ffa00f'],
      borderColor: ['#00693e', '#267aba', '#ffa00f'],
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: { family: 'Avenir LT Std', size: 16 },
          color: '#0a2518'
        }
      }
    },
    scales: {
      x: {
        ticks: { font: { family: 'Avenir LT Std', size: 18 }, color: '#0a2518' },
        grid: { display: false }
      },
      y: {
        ticks: { font: { family: 'Avenir LT Std', size: 16 }, color: '#0a2518' },
        grid: { color: 'rgba(0, 105, 62, 0.15)' }
      }
    }
  }
});
```

### After (Simplified)
```javascript
new Chart(document.getElementById('barChart'), {
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{ data: [10, 20, 30] }]
  },
  options: {
    plugins: { legend: { display: false } }
  }
});
```

### Even Simpler with Helper
```javascript
CDLChart.bar('barChart', ['A', 'B', 'C'], [10, 20, 30]);
```

## Architecture

The system uses a constructor wrapper pattern:
1. Saves reference to original `Chart` constructor
2. Creates wrapper that intercepts chart creation
3. Auto-assigns colors based on chart type and dataset index
4. Applies chart-type specific defaults
5. Calls original constructor with enhanced config

Colors are read lazily from CSS custom properties when first needed, ensuring the DOM is ready and CSS is loaded.

## Testing Notes

To test the implementation:
1. Compile `theme_showcase.md` with `./compile.sh theme_showcase.md`
2. Open the HTML output in a browser
3. Navigate to the chart slides
4. Verify that charts display with theme colors without manual specification

## Future Improvements

1. Could add automatic axis label detection from data
2. Could add animation presets
3. Could integrate with compile.sh for automatic script injection
