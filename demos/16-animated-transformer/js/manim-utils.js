// Manim-inspired Animation Utilities for Transformer Demo
// Built on p5.js, inspired by JazonJiao/Manim.js

// ============================================
// Font Configuration - Match Course Theme
// ============================================
export const FONTS = {
  primary: 'Avenir, "Avenir Next", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"Fira Code", "SF Mono", Consolas, monospace'
};

// ============================================
// Dartmouth Color Palette
// ============================================
export const COLORS = {
  // Primary
  dartmouthGreen: '#00693e',
  dartmouthDark: '#005a34',
  dartmouthLight: '#1a8a5a',
  
  // Secondary
  riverBlue: '#267aba',
  riverNavy: '#003c73',
  
  // Accent
  springGreen: '#c4dd88',
  richSpring: '#a5d75f',
  summerYellow: '#f5dc69',
  bonfireOrange: '#ffa00f',
  bonfireRed: '#9d162e',
  tuckOrange: '#d94415',
  violet: '#8a6996',
  
  // Backgrounds (dark theme)
  bgDark: '#0f172a',
  bgSecondary: '#1e293b',
  surface: '#334155',
  
  // Text
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6'
};

// ============================================
// Easing Functions
// ============================================
export const Easing = {
  linear: t => t,
  
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => {
    if (t === 0 || t === 1) return t;
    if (t < 0.5) return Math.pow(2, 10 * (2 * t - 1)) / 2;
    return (2 - Math.pow(2, -10 * (2 * t - 1))) / 2;
  },
  
  easeOutBack: t => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  
  easeOutElastic: t => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  }
};

// ============================================
// Timer Class - Manages animation timing
// ============================================
export class Timer {
  constructor(startFrame, duration, easing = Easing.easeInOutCubic) {
    this.startFrame = startFrame;
    this.duration = duration;
    this.easing = easing;
  }
  
  // Get progress (0-1) at current frame
  getProgress(currentFrame) {
    if (currentFrame < this.startFrame) return 0;
    if (currentFrame >= this.startFrame + this.duration) return 1;
    const raw = (currentFrame - this.startFrame) / this.duration;
    return this.easing(raw);
  }
  
  isComplete(currentFrame) {
    return currentFrame >= this.startFrame + this.duration;
  }
  
  isActive(currentFrame) {
    return currentFrame >= this.startFrame && currentFrame < this.startFrame + this.duration;
  }
}

// ============================================
// Utility: Convert seconds to frames (30 FPS default)
// ============================================
export function frames(seconds, fps = 30) {
  return Math.round(seconds * fps);
}

// ============================================
// Color Utilities
// ============================================
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function lerpColor(color1, color2, t) {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;
  
  return rgbToHex(
    c1.r + (c2.r - c1.r) * t,
    c1.g + (c2.g - c1.g) * t,
    c1.b + (c2.b - c1.b) * t
  );
}

export function colorWithAlpha(hex, alpha) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

// ============================================
// Drawing Utilities (p5.js compatible)
// ============================================
export class DrawUtils {
  constructor(p5Instance) {
    this.p = p5Instance;
  }
  
  // Draw rounded rectangle
  roundRect(x, y, w, h, r) {
    this.p.rect(x, y, w, h, r);
  }
  
  // Draw text with Avenir font
  text(str, x, y, size = 16, color = COLORS.textPrimary, align = this.p.CENTER) {
    this.p.push();
    this.p.textFont(FONTS.primary);
    this.p.textSize(size);
    this.p.textAlign(align, this.p.CENTER);
    this.p.fill(color);
    this.p.noStroke();
    this.p.text(str, x, y);
    this.p.pop();
  }
  
  // Draw monospace text (for code/formulas)
  monoText(str, x, y, size = 14, color = COLORS.textSecondary) {
    this.p.push();
    this.p.textFont(FONTS.mono);
    this.p.textSize(size);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(color);
    this.p.noStroke();
    this.p.text(str, x, y);
    this.p.pop();
  }
  
  // Draw arrow
  arrow(x1, y1, x2, y2, color = COLORS.dartmouthGreen, weight = 2) {
    this.p.push();
    this.p.stroke(color);
    this.p.strokeWeight(weight);
    this.p.fill(color);
    
    // Line
    this.p.line(x1, y1, x2, y2);
    
    // Arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 10;
    this.p.push();
    this.p.translate(x2, y2);
    this.p.rotate(angle);
    this.p.triangle(0, 0, -headLen, headLen / 2, -headLen, -headLen / 2);
    this.p.pop();
    
    this.p.pop();
  }
  
  // Draw a token box (for tokenization visualization)
  tokenBox(x, y, w, h, label, bgColor = COLORS.dartmouthGreen, textColor = COLORS.textPrimary, progress = 1) {
    this.p.push();
    
    // Animated scale
    const scale = 0.5 + 0.5 * progress;
    const alpha = progress;
    
    this.p.translate(x + w/2, y + h/2);
    this.p.scale(scale);
    this.p.translate(-w/2, -h/2);
    
    // Box
    this.p.fill(colorWithAlpha(bgColor, alpha * 0.9));
    this.p.stroke(colorWithAlpha(COLORS.textPrimary, alpha * 0.3));
    this.p.strokeWeight(1);
    this.roundRect(0, 0, w, h, 6);
    
    // Label
    this.p.textFont(FONTS.primary);
    this.p.textSize(14);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(colorWithAlpha(textColor, alpha));
    this.p.noStroke();
    this.p.text(label, w/2, h/2);
    
    this.p.pop();
  }
  
  // Draw a vector (vertical bar chart representation)
  vectorBar(x, y, width, height, values, color = COLORS.riverBlue, progress = 1) {
    this.p.push();
    
    const barWidth = width / values.length;
    const maxVal = Math.max(...values.map(Math.abs));
    
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      const barHeight = (val / maxVal) * height * 0.8 * progress;
      const barX = x + i * barWidth;
      const barY = y + height / 2 - (barHeight > 0 ? barHeight : 0);
      
      // Gradient effect based on value
      const intensity = Math.abs(val) / maxVal;
      const barColor = lerpColor(COLORS.bgSecondary, color, intensity * progress);
      
      this.p.fill(barColor);
      this.p.noStroke();
      this.p.rect(barX + 1, barY, barWidth - 2, Math.abs(barHeight));
    }
    
    this.p.pop();
  }
  
  // Draw a matrix (heatmap style)
  matrix(x, y, cellSize, data, colorScale = [COLORS.riverNavy, COLORS.summerYellow], progress = 1) {
    this.p.push();
    
    const rows = data.length;
    const cols = data[0].length;
    const maxVal = Math.max(...data.flat().map(Math.abs));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const val = data[i][j];
        const normalized = (val / maxVal + 1) / 2; // Map to 0-1
        const cellColor = lerpColor(colorScale[0], colorScale[1], normalized * progress);
        
        const cellX = x + j * cellSize;
        const cellY = y + i * cellSize;
        
        this.p.fill(colorWithAlpha(cellColor, progress));
        this.p.stroke(colorWithAlpha(COLORS.surface, progress * 0.5));
        this.p.strokeWeight(1);
        this.p.rect(cellX, cellY, cellSize - 1, cellSize - 1, 2);
      }
    }
    
    this.p.pop();
  }
  
  // Draw attention lines between tokens
  attentionLines(fromPositions, toPositions, weights, color = COLORS.dartmouthGreen, progress = 1) {
    this.p.push();
    
    for (let i = 0; i < fromPositions.length; i++) {
      for (let j = 0; j < toPositions.length; j++) {
        const weight = weights[i][j];
        const alpha = weight * progress;
        
        if (alpha > 0.05) { // Only draw visible lines
          this.p.stroke(colorWithAlpha(color, alpha));
          this.p.strokeWeight(1 + weight * 3);
          this.p.line(
            fromPositions[i].x, fromPositions[i].y,
            toPositions[j].x, toPositions[j].y
          );
        }
      }
    }
    
    this.p.pop();
  }
  
  // Draw a neural network layer
  layerNodes(x, y, count, nodeRadius, color = COLORS.dartmouthGreen, progress = 1) {
    this.p.push();
    
    const spacing = nodeRadius * 2.5;
    const totalHeight = (count - 1) * spacing;
    const startY = y - totalHeight / 2;
    
    for (let i = 0; i < count; i++) {
      const nodeY = startY + i * spacing;
      const scale = Easing.easeOutBack(Math.min(1, progress * count - i * 0.5));
      
      if (scale > 0) {
        this.p.fill(colorWithAlpha(color, scale));
        this.p.noStroke();
        this.p.ellipse(x, nodeY, nodeRadius * 2 * scale, nodeRadius * 2 * scale);
      }
    }
    
    this.p.pop();
    
    // Return node positions for connection drawing
    return Array.from({ length: count }, (_, i) => ({
      x,
      y: startY + i * spacing
    }));
  }
  
  // Draw connections between layer nodes
  layerConnections(fromNodes, toNodes, weights = null, color = COLORS.textMuted, progress = 1) {
    this.p.push();
    
    for (let i = 0; i < fromNodes.length; i++) {
      for (let j = 0; j < toNodes.length; j++) {
        const weight = weights ? Math.abs(weights[i][j]) : 0.3;
        const alpha = weight * progress * 0.6;
        
        this.p.stroke(colorWithAlpha(color, alpha));
        this.p.strokeWeight(0.5 + weight);
        this.p.line(fromNodes[i].x, fromNodes[i].y, toNodes[j].x, toNodes[j].y);
      }
    }
    
    this.p.pop();
  }
}

// ============================================
// Animated Object Base Class
// ============================================
export class AnimatedObject {
  constructor(p5Instance) {
    this.p = p5Instance;
    this.x = 0;
    this.y = 0;
    this.opacity = 1;
    this.scale = 1;
    this.animations = [];
  }
  
  // Add an animation
  animate(property, targetValue, startFrame, duration, easing = Easing.easeInOutCubic) {
    this.animations.push({
      property,
      startValue: this[property],
      targetValue,
      timer: new Timer(startFrame, duration, easing)
    });
    return this;
  }
  
  // Update all animations
  update(currentFrame) {
    for (const anim of this.animations) {
      const progress = anim.timer.getProgress(currentFrame);
      this[anim.property] = anim.startValue + (anim.targetValue - anim.startValue) * progress;
    }
    // Clean up completed animations
    this.animations = this.animations.filter(a => !a.timer.isComplete(currentFrame));
  }
  
  // Override in subclasses
  draw() {}
}

// ============================================
// Token Object
// ============================================
export class Token extends AnimatedObject {
  constructor(p5Instance, text, x, y) {
    super(p5Instance);
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = 60;
    this.height = 36;
    this.bgColor = COLORS.dartmouthGreen;
    this.draw = new DrawUtils(p5Instance);
  }
  
  render() {
    this.draw.tokenBox(
      this.x - this.width/2, 
      this.y - this.height/2,
      this.width * this.scale,
      this.height * this.scale,
      this.text,
      this.bgColor,
      COLORS.textPrimary,
      this.opacity
    );
  }
}

// ============================================
// Vector Object
// ============================================
export class Vector extends AnimatedObject {
  constructor(p5Instance, values, x, y, width = 100, height = 60) {
    super(p5Instance);
    this.values = values;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = COLORS.riverBlue;
    this.drawUtils = new DrawUtils(p5Instance);
  }
  
  render() {
    this.drawUtils.vectorBar(
      this.x - this.width/2,
      this.y - this.height/2,
      this.width * this.scale,
      this.height * this.scale,
      this.values,
      this.color,
      this.opacity
    );
  }
}

// ============================================
// Matrix Object
// ============================================
export class Matrix extends AnimatedObject {
  constructor(p5Instance, data, x, y, cellSize = 20) {
    super(p5Instance);
    this.data = data;
    this.x = x;
    this.y = y;
    this.cellSize = cellSize;
    this.drawUtils = new DrawUtils(p5Instance);
  }
  
  render() {
    const rows = this.data.length;
    const cols = this.data[0].length;
    const width = cols * this.cellSize;
    const height = rows * this.cellSize;
    
    this.drawUtils.matrix(
      this.x - width/2,
      this.y - height/2,
      this.cellSize * this.scale,
      this.data,
      [COLORS.riverNavy, COLORS.summerYellow],
      this.opacity
    );
  }
}

// Export everything for use in transformer-animation.js
export default {
  FONTS,
  COLORS,
  Easing,
  Timer,
  frames,
  hexToRgb,
  rgbToHex,
  lerpColor,
  colorWithAlpha,
  DrawUtils,
  AnimatedObject,
  Token,
  Vector,
  Matrix
};
