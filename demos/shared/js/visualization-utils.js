/**
 * Visualization Utilities for LLM Demos
 * Common JavaScript functions for visualizations, animations, and UI interactions
 */

// ============================================
// Theme Management
// ============================================

const ThemeManager = {
    /**
     * Initialize theme from localStorage or system preference
     */
    init() {
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;

        this.setTheme(theme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    /**
     * Set theme and save preference
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    },

    /**
     * Toggle between light and dark theme
     * @returns {string} The new theme
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        return newTheme;
    },

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    get() {
        return document.documentElement.getAttribute('data-theme');
    }
};

// ============================================
// Canvas Utilities
// ============================================

const CanvasUtils = {
    /**
     * Create a canvas element with proper scaling for retina displays
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {Object} Canvas element and context
     */
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.scale(dpr, dpr);

        return { canvas, ctx };
    },

    /**
     * Clear canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    clear(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
    },

    /**
     * Draw rounded rectangle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {number} radius - Corner radius
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    },

    /**
     * Draw arrow
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} fromX - Start X
     * @param {number} fromY - Start Y
     * @param {number} toX - End X
     * @param {number} toY - End Y
     * @param {number} headLength - Arrow head length
     */
    drawArrow(ctx, fromX, fromY, toX, toY, headLength = 10) {
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.lineTo(toX, toY);
        ctx.fill();
    }
};

// ============================================
// Color Utilities
// ============================================

const ColorUtils = {
    /**
     * Interpolate between two colors
     * @param {string} color1 - Start color (hex)
     * @param {string} color2 - End color (hex)
     * @param {number} factor - Interpolation factor (0-1)
     * @returns {string} Interpolated color (hex)
     */
    interpolate(color1, color2, factor) {
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);

        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);

        return this.rgbToHex(r, g, b);
    },

    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color
     * @returns {Object} RGB values
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /**
     * Convert RGB to hex
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} Hex color
     */
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    /**
     * Generate color palette
     * @param {number} count - Number of colors
     * @param {string} baseColor - Base color (hex)
     * @returns {Array<string>} Array of hex colors
     */
    generatePalette(count, baseColor = '#6366f1') {
        const colors = [];
        const hsl = this.hexToHsl(baseColor);

        for (let i = 0; i < count; i++) {
            const hue = (hsl.h + (360 / count) * i) % 360;
            colors.push(this.hslToHex(hue, hsl.s, hsl.l));
        }

        return colors;
    },

    /**
     * Convert hex to HSL
     * @param {string} hex - Hex color
     * @returns {Object} HSL values
     */
    hexToHsl(hex) {
        const rgb = this.hexToRgb(hex);
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    },

    /**
     * Convert HSL to hex
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {string} Hex color
     */
    hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return this.rgbToHex(
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        );
    }
};

// ============================================
// Animation Utilities
// ============================================

const AnimationUtils = {
    /**
     * Easing functions
     */
    easing: {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    },

    /**
     * Animate a value over time
     * @param {Object} options - Animation options
     * @returns {Promise} Resolves when animation completes
     */
    animate({ from, to, duration, easing = 'easeInOutQuad', onUpdate }) {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const easingFunc = this.easing[easing] || this.easing.linear;

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easingFunc(progress);
                const value = from + (to - from) * easedProgress;

                onUpdate(value, progress);

                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(step);
        });
    },

    /**
     * Create a spring animation
     * @param {Object} options - Spring options
     * @returns {Promise} Resolves when animation completes
     */
    spring({ from, to, stiffness = 100, damping = 10, mass = 1, onUpdate }) {
        return new Promise((resolve) => {
            let position = from;
            let velocity = 0;
            const dt = 1 / 60; // 60 FPS

            const step = () => {
                const force = -stiffness * (position - to);
                const dampingForce = -damping * velocity;
                const acceleration = (force + dampingForce) / mass;

                velocity += acceleration * dt;
                position += velocity * dt;

                onUpdate(position);

                if (Math.abs(velocity) > 0.01 || Math.abs(position - to) > 0.01) {
                    requestAnimationFrame(step);
                } else {
                    onUpdate(to);
                    resolve();
                }
            };

            requestAnimationFrame(step);
        });
    }
};

// ============================================
// Matrix Operations
// ============================================

const MatrixUtils = {
    /**
     * Create a matrix filled with zeros
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @returns {Array<Array<number>>} Matrix
     */
    zeros(rows, cols) {
        return Array(rows).fill(0).map(() => Array(cols).fill(0));
    },

    /**
     * Create a matrix filled with random values
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {Array<Array<number>>} Matrix
     */
    random(rows, cols, min = 0, max = 1) {
        return Array(rows).fill(0).map(() =>
            Array(cols).fill(0).map(() => Math.random() * (max - min) + min)
        );
    },

    /**
     * Matrix multiplication
     * @param {Array<Array<number>>} a - First matrix
     * @param {Array<Array<number>>} b - Second matrix
     * @returns {Array<Array<number>>} Result matrix
     */
    multiply(a, b) {
        const result = this.zeros(a.length, b[0].length);

        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
                for (let k = 0; k < b.length; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }

        return result;
    },

    /**
     * Transpose matrix
     * @param {Array<Array<number>>} matrix - Input matrix
     * @returns {Array<Array<number>>} Transposed matrix
     */
    transpose(matrix) {
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    },

    /**
     * Apply softmax to array
     * @param {Array<number>} arr - Input array
     * @returns {Array<number>} Softmax output
     */
    softmax(arr) {
        const max = Math.max(...arr);
        const exps = arr.map(x => Math.exp(x - max));
        const sum = exps.reduce((a, b) => a + b, 0);
        return exps.map(x => x / sum);
    },

    /**
     * Normalize array to range [0, 1]
     * @param {Array<number>} arr - Input array
     * @returns {Array<number>} Normalized array
     */
    normalize(arr) {
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const range = max - min;
        return arr.map(x => (x - min) / range);
    }
};

// ============================================
// Text Processing Utilities
// ============================================

const TextUtils = {
    /**
     * Simple word tokenization
     * @param {string} text - Input text
     * @returns {Array<string>} Array of tokens
     */
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 0);
    },

    /**
     * Count word frequencies
     * @param {Array<string>} tokens - Array of tokens
     * @returns {Object} Word frequency map
     */
    wordFrequency(tokens) {
        const freq = {};
        tokens.forEach(token => {
            freq[token] = (freq[token] || 0) + 1;
        });
        return freq;
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Input text
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    /**
     * Highlight matches in text
     * @param {string} text - Input text
     * @param {string} query - Search query
     * @returns {string} HTML with highlighted matches
     */
    highlight(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
};

// ============================================
// DOM Utilities
// ============================================

const DOMUtils = {
    /**
     * Create element with attributes and children
     * @param {string} tag - HTML tag
     * @param {Object} attrs - Attributes
     * @param {Array} children - Child elements or text
     * @returns {HTMLElement} Created element
     */
    createElement(tag, attrs = {}, children = []) {
        const element = document.createElement(tag);

        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key.startsWith('on')) {
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });

        return element;
    },

    /**
     * Wait for DOM to be ready
     * @returns {Promise} Resolves when DOM is ready
     */
    ready() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    },

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in ms
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ============================================
// Export utilities
// ============================================

// Make utilities available globally
if (typeof window !== 'undefined') {
    window.ThemeManager = ThemeManager;
    window.CanvasUtils = CanvasUtils;
    window.ColorUtils = ColorUtils;
    window.AnimationUtils = AnimationUtils;
    window.MatrixUtils = MatrixUtils;
    window.TextUtils = TextUtils;
    window.DOMUtils = DOMUtils;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        CanvasUtils,
        ColorUtils,
        AnimationUtils,
        MatrixUtils,
        TextUtils,
        DOMUtils
    };
}
