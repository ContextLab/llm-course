import { FONTS, COLORS, Easing, Timer, frames, lerpColor, colorWithAlpha, DrawUtils } from './manim-utils.js';
import { TRANSFORMER_STEPS, getStep, getTotalSteps } from './step-content.js';

class TransformerAnimator {
  constructor(containerId) {
    this.containerId = containerId;
    this.currentStep = 1;
    this.totalSteps = getTotalSteps();
    this.isPlaying = false;
    this.playInterval = null;
    this.frameCount = 0;
    this.animationDuration = frames(0.8);
    this.tokens = [];
    this.inputText = "The cat sat";
    this.p5Instance = null;
    this.drawUtils = null;
    this.stepAnimationProgress = 0;
    
    this.initP5();
    this.initControls();
    this.initProgressDots();
    this.updateUI();
  }
  
  initP5() {
    const sketch = (p) => {
      this.p5Instance = p;
      
      p.setup = () => {
        const container = document.getElementById(this.containerId);
        const canvas = p.createCanvas(container.offsetWidth, 400);
        canvas.parent(this.containerId);
        p.frameRate(30);
        this.drawUtils = new DrawUtils(p);
        this.tokenize();
      };
      
      p.draw = () => {
        this.frameCount++;
        this.stepAnimationProgress = Math.min(1, this.stepAnimationProgress + 0.05);
        
        const bgColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--bg-color').trim() || COLORS.bgDark;
        p.background(bgColor);
        
        this.renderCurrentStep();
      };
      
      p.windowResized = () => {
        const container = document.getElementById(this.containerId);
        p.resizeCanvas(container.offsetWidth, 400);
      };
    };
    
    new p5(sketch);
  }
  
  tokenize() {
    this.tokens = this.inputText.split(/\s+/).filter(t => t.length > 0);
  }
  
  initControls() {
    document.getElementById('prev-btn').addEventListener('click', () => this.prevStep());
    document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
    document.getElementById('play-btn').addEventListener('click', () => this.togglePlay());
    document.getElementById('reset-btn').addEventListener('click', () => this.reset());
    document.getElementById('update-btn').addEventListener('click', () => this.updateInput());
    
    document.getElementById('input-text').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.updateInput();
    });
  }
  
  initProgressDots() {
    const container = document.getElementById('progress-dots');
    container.innerHTML = '';
    
    for (let i = 1; i <= this.totalSteps; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';
      dot.dataset.step = i;
      dot.addEventListener('click', () => this.goToStep(i));
      container.appendChild(dot);
    }
  }
  
  updateUI() {
    const step = getStep(this.currentStep);
    
    document.getElementById('current-step').textContent = this.currentStep;
    document.getElementById('total-steps').textContent = this.totalSteps;
    document.getElementById('step-title').textContent = `Step ${this.currentStep}: ${step.title}`;
    document.getElementById('step-description').innerHTML = `<p>${step.description}</p>`;
    
    const formulaEl = document.getElementById('step-formula');
    if (step.formula) {
      formulaEl.textContent = step.formula;
      formulaEl.classList.add('visible');
    } else {
      formulaEl.classList.remove('visible');
    }
    
    const insightEl = document.getElementById('step-insight');
    insightEl.textContent = step.keyInsight;
    insightEl.classList.add('visible');
    
    const progress = (this.currentStep / this.totalSteps) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    document.querySelectorAll('.progress-dot').forEach((dot, i) => {
      const stepNum = i + 1;
      dot.classList.toggle('active', stepNum === this.currentStep);
      dot.classList.toggle('completed', stepNum < this.currentStep);
    });
    
    document.getElementById('prev-btn').disabled = this.currentStep === 1;
    document.getElementById('next-btn').disabled = this.currentStep === this.totalSteps;
    document.getElementById('play-btn').textContent = this.isPlaying ? '⏸ Pause' : '▶ Play';
  }
  
  goToStep(step) {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.stepAnimationProgress = 0;
      this.updateUI();
    }
  }
  
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }
  
  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }
  
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    
    if (this.isPlaying) {
      this.playInterval = setInterval(() => {
        if (this.currentStep < this.totalSteps) {
          this.nextStep();
        } else {
          this.togglePlay();
        }
      }, 3000);
    } else {
      clearInterval(this.playInterval);
    }
    
    this.updateUI();
  }
  
  reset() {
    if (this.isPlaying) this.togglePlay();
    this.goToStep(1);
  }
  
  updateInput() {
    const input = document.getElementById('input-text').value.trim();
    if (input) {
      this.inputText = input;
      this.tokenize();
      this.stepAnimationProgress = 0;
    }
  }
  
  renderCurrentStep() {
    const p = this.p5Instance;
    const w = p.width;
    const h = p.height;
    const step = getStep(this.currentStep);
    const progress = Easing.easeOutCubic(this.stepAnimationProgress);
    
    switch (step.visualConfig.type) {
      case 'tokenization':
        this.renderTokenization(w, h, progress);
        break;
      case 'token-ids':
        this.renderTokenIds(w, h, progress);
        break;
      case 'embeddings':
        this.renderEmbeddings(w, h, progress);
        break;
      case 'positional':
        this.renderPositional(w, h, progress);
        break;
      case 'combined':
        this.renderCombined(w, h, progress);
        break;
      case 'qkv':
        this.renderQKV(w, h, progress);
        break;
      case 'attention-scores':
        this.renderAttentionScores(w, h, progress);
        break;
      case 'softmax':
        this.renderSoftmax(w, h, progress);
        break;
      case 'attention-output':
        this.renderAttentionOutput(w, h, progress);
        break;
      case 'multihead':
        this.renderMultihead(w, h, progress);
        break;
      case 'ffn':
        this.renderFFN(w, h, progress);
        break;
      case 'stacking':
        this.renderStacking(w, h, progress);
        break;
    }
  }
  
  renderTokenization(w, h, progress) {
    const p = this.p5Instance;
    const tokenWidth = 80;
    const tokenHeight = 40;
    const spacing = 20;
    const totalWidth = this.tokens.length * tokenWidth + (this.tokens.length - 1) * spacing;
    const startX = (w - totalWidth) / 2;
    const textY = h * 0.25;
    const tokenY = h * 0.55;
    
    this.drawUtils.text(
      `"${this.inputText}"`,
      w / 2, textY,
      24, COLORS.textPrimary
    );
    
    this.drawUtils.text("Input Text", w / 2, textY - 40, 14, COLORS.textSecondary);
    
    const arrowProgress = Math.max(0, (progress - 0.2) / 0.3);
    if (arrowProgress > 0) {
      p.push();
      p.stroke(colorWithAlpha(COLORS.dartmouthGreen, arrowProgress));
      p.strokeWeight(2);
      const arrowLen = 40 * arrowProgress;
      p.line(w/2, textY + 20, w/2, textY + 20 + arrowLen);
      if (arrowProgress > 0.8) {
        p.fill(COLORS.dartmouthGreen);
        p.noStroke();
        p.triangle(w/2, textY + 65, w/2 - 6, textY + 55, w/2 + 6, textY + 55);
      }
      p.pop();
    }
    
    const tokenProgress = Math.max(0, (progress - 0.4) / 0.6);
    this.tokens.forEach((token, i) => {
      const delay = i * 0.15;
      const tp = Math.max(0, Math.min(1, (tokenProgress - delay) / 0.4));
      const x = startX + i * (tokenWidth + spacing) + tokenWidth / 2;
      
      this.drawUtils.tokenBox(
        x - tokenWidth/2, tokenY - tokenHeight/2,
        tokenWidth, tokenHeight,
        token,
        COLORS.dartmouthGreen,
        COLORS.textPrimary,
        tp
      );
    });
    
    if (tokenProgress > 0.5) {
      this.drawUtils.text("Tokens", w / 2, tokenY + 50, 14, COLORS.textSecondary);
    }
  }
  
  renderTokenIds(w, h, progress) {
    const p = this.p5Instance;
    const tokenWidth = 80;
    const spacing = 20;
    const totalWidth = this.tokens.length * tokenWidth + (this.tokens.length - 1) * spacing;
    const startX = (w - totalWidth) / 2;
    const tokenY = h * 0.25;
    const idY = h * 0.65;
    
    this.tokens.forEach((token, i) => {
      const x = startX + i * (tokenWidth + spacing) + tokenWidth / 2;
      this.drawUtils.tokenBox(
        x - tokenWidth/2, tokenY - 20,
        tokenWidth, 40, token,
        COLORS.dartmouthGreen, COLORS.textPrimary, 1
      );
    });
    
    const arrowProgress = Math.max(0, (progress - 0.1) / 0.3);
    this.tokens.forEach((token, i) => {
      const x = startX + i * (tokenWidth + spacing) + tokenWidth / 2;
      const ap = Math.max(0, Math.min(1, arrowProgress - i * 0.1));
      
      if (ap > 0) {
        p.push();
        p.stroke(colorWithAlpha(COLORS.riverBlue, ap));
        p.strokeWeight(2);
        p.line(x, tokenY + 25, x, tokenY + 25 + 60 * ap);
        if (ap > 0.9) {
          p.fill(COLORS.riverBlue);
          p.noStroke();
          p.triangle(x, idY - 30, x - 5, idY - 40, x + 5, idY - 40);
        }
        p.pop();
      }
    });
    
    const idProgress = Math.max(0, (progress - 0.4) / 0.6);
    const fakeIds = [1996, 4937, 3520];
    
    this.tokens.forEach((token, i) => {
      const x = startX + i * (tokenWidth + spacing) + tokenWidth / 2;
      const delay = i * 0.15;
      const ip = Math.max(0, Math.min(1, (idProgress - delay) / 0.4));
      
      if (ip > 0) {
        const id = fakeIds[i % fakeIds.length];
        
        p.push();
        p.fill(colorWithAlpha(COLORS.riverNavy, ip * 0.8));
        p.noStroke();
        p.rect(x - 35, idY - 20, 70, 40, 6);
        
        this.drawUtils.monoText(
          id.toString(),
          x, idY,
          18, colorWithAlpha(COLORS.summerYellow, ip)
        );
        p.pop();
      }
    });
    
    this.drawUtils.text("Tokens", w / 2, tokenY - 50, 14, COLORS.textSecondary);
    if (idProgress > 0.5) {
      this.drawUtils.text("Token IDs (from vocabulary)", w / 2, idY + 40, 14, COLORS.textSecondary);
    }
  }
  
  renderEmbeddings(w, h, progress) {
    const p = this.p5Instance;
    const tokenWidth = 60;
    const spacing = 30;
    const totalWidth = this.tokens.length * tokenWidth + (this.tokens.length - 1) * spacing;
    const startX = (w - totalWidth) / 2;
    const tokenY = h * 0.15;
    const embedY = h * 0.55;
    const embedHeight = 120;
    const embedWidth = 50;
    
    this.tokens.forEach((token, i) => {
      const x = startX + i * (tokenWidth + spacing) + tokenWidth / 2;
      this.drawUtils.tokenBox(
        x - tokenWidth/2, tokenY - 15,
        tokenWidth, 30, token,
        COLORS.dartmouthGreen, COLORS.textPrimary, 1
      );
    });
    
    const embedProgress = Math.max(0, (progress - 0.2) / 0.8);
    
    this.tokens.forEach((token, i) => {
      const x = startX + i * (tokenWidth + spacing) + tokenWidth / 2;
      const delay = i * 0.2;
      const ep = Math.max(0, Math.min(1, (embedProgress - delay) / 0.5));
      
      if (ep > 0) {
        p.push();
        p.stroke(colorWithAlpha(COLORS.riverBlue, ep * 0.5));
        p.strokeWeight(1);
        p.line(x, tokenY + 20, x, embedY - embedHeight/2 - 10);
        p.pop();
        
        const values = Array.from({ length: 12 }, (_, j) => 
          Math.sin((i + 1) * (j + 1) * 0.5) * 0.8
        );
        
        this.drawUtils.vectorBar(
          x - embedWidth/2, embedY - embedHeight/2,
          embedWidth, embedHeight,
          values, COLORS.riverBlue, ep
        );
        
        p.push();
        p.stroke(colorWithAlpha(COLORS.surface, ep));
        p.strokeWeight(1);
        p.noFill();
        p.rect(x - embedWidth/2, embedY - embedHeight/2, embedWidth, embedHeight, 4);
        p.pop();
      }
    });
    
    this.drawUtils.text("Token Embeddings (d=768)", w / 2, embedY + embedHeight/2 + 25, 14, COLORS.textSecondary);
  }
  
  renderPositional(w, h, progress) {
    const p = this.p5Instance;
    const numPositions = this.tokens.length;
    const waveWidth = w * 0.7;
    const startX = (w - waveWidth) / 2;
    const waveY = h * 0.5;
    const waveHeight = 80;
    
    this.drawUtils.text("Positional Encoding", w / 2, h * 0.12, 18, COLORS.textPrimary);
    this.drawUtils.monoText(
      "PE(pos, i) = sin(pos / 10000^(2i/d))",
      w / 2, h * 0.22, 12, COLORS.textSecondary
    );
    
    const waveProgress = progress;
    
    p.push();
    p.noFill();
    
    const colors = [COLORS.dartmouthGreen, COLORS.riverBlue, COLORS.bonfireOrange];
    const frequencies = [1, 2, 4];
    
    colors.forEach((color, idx) => {
      p.stroke(colorWithAlpha(color, waveProgress * 0.8));
      p.strokeWeight(2);
      p.beginShape();
      
      const freq = frequencies[idx];
      const points = Math.floor(100 * waveProgress);
      
      for (let i = 0; i <= points; i++) {
        const x = startX + (i / 100) * waveWidth;
        const y = waveY + Math.sin((i / 100) * Math.PI * 2 * freq + idx) * waveHeight / (idx + 1);
        p.vertex(x, y);
      }
      p.endShape();
    });
    
    const markerProgress = Math.max(0, (progress - 0.5) / 0.5);
    if (markerProgress > 0) {
      for (let i = 0; i < numPositions; i++) {
        const x = startX + (i / (numPositions - 1 || 1)) * waveWidth * 0.9 + waveWidth * 0.05;
        
        p.stroke(colorWithAlpha(COLORS.textPrimary, markerProgress));
        p.strokeWeight(1);
        p.line(x, waveY - waveHeight - 10, x, waveY + waveHeight + 10);
        
        this.drawUtils.text(
          `pos=${i}`,
          x, waveY + waveHeight + 30,
          12, colorWithAlpha(COLORS.textSecondary, markerProgress)
        );
      }
    }
    
    p.pop();
    
    this.drawUtils.text(
      "Each position gets a unique encoding based on sinusoidal functions",
      w / 2, h * 0.88, 12, COLORS.textMuted
    );
  }
  
  renderCombined(w, h, progress) {
    const p = this.p5Instance;
    const boxWidth = 120;
    const boxHeight = 60;
    const spacing = 40;
    
    const tokenEmbedX = w * 0.25;
    const posEncodeX = w * 0.75;
    const topY = h * 0.2;
    const resultY = h * 0.7;
    const plusY = h * 0.45;
    
    p.push();
    p.fill(colorWithAlpha(COLORS.riverBlue, 0.2));
    p.stroke(colorWithAlpha(COLORS.riverBlue, progress));
    p.strokeWeight(2);
    p.rect(tokenEmbedX - boxWidth/2, topY - boxHeight/2, boxWidth, boxHeight, 8);
    this.drawUtils.text("Token\nEmbedding", tokenEmbedX, topY, 14, COLORS.textPrimary);
    
    p.fill(colorWithAlpha(COLORS.dartmouthGreen, 0.2));
    p.stroke(colorWithAlpha(COLORS.dartmouthGreen, progress));
    p.rect(posEncodeX - boxWidth/2, topY - boxHeight/2, boxWidth, boxHeight, 8);
    this.drawUtils.text("Positional\nEncoding", posEncodeX, topY, 14, COLORS.textPrimary);
    p.pop();
    
    const lineProgress = Math.max(0, (progress - 0.2) / 0.3);
    if (lineProgress > 0) {
      p.push();
      p.stroke(colorWithAlpha(COLORS.textSecondary, lineProgress));
      p.strokeWeight(2);
      p.line(tokenEmbedX, topY + boxHeight/2, tokenEmbedX, plusY - 20);
      p.line(posEncodeX, topY + boxHeight/2, posEncodeX, plusY - 20);
      p.line(tokenEmbedX, plusY - 20, w/2, plusY);
      p.line(posEncodeX, plusY - 20, w/2, plusY);
      p.pop();
    }
    
    const plusProgress = Math.max(0, (progress - 0.4) / 0.2);
    if (plusProgress > 0) {
      p.push();
      p.fill(colorWithAlpha(COLORS.bonfireOrange, plusProgress));
      p.noStroke();
      p.ellipse(w/2, plusY, 40, 40);
      this.drawUtils.text("+", w/2, plusY, 28, COLORS.bgDark);
      p.pop();
    }
    
    const resultProgress = Math.max(0, (progress - 0.6) / 0.4);
    if (resultProgress > 0) {
      p.push();
      p.stroke(colorWithAlpha(COLORS.bonfireOrange, resultProgress));
      p.strokeWeight(2);
      p.line(w/2, plusY + 20, w/2, resultY - boxHeight/2 - 10);
      
      p.fill(COLORS.bonfireOrange);
      p.noStroke();
      p.triangle(w/2, resultY - boxHeight/2, w/2 - 6, resultY - boxHeight/2 - 12, w/2 + 6, resultY - boxHeight/2 - 12);
      
      p.fill(colorWithAlpha(COLORS.bonfireOrange, 0.2 * resultProgress));
      p.stroke(colorWithAlpha(COLORS.bonfireOrange, resultProgress));
      p.strokeWeight(2);
      p.rect(w/2 - boxWidth/2, resultY - boxHeight/2, boxWidth, boxHeight, 8);
      this.drawUtils.text("Input to\nTransformer", w/2, resultY, 14, colorWithAlpha(COLORS.textPrimary, resultProgress));
      p.pop();
    }
  }
  
  renderQKV(w, h, progress) {
    const p = this.p5Instance;
    const boxSize = 60;
    const inputX = w * 0.15;
    const qX = w * 0.45;
    const kX = w * 0.65;
    const vX = w * 0.85;
    const topY = h * 0.3;
    const bottomY = h * 0.7;
    
    p.push();
    p.fill(colorWithAlpha(COLORS.surface, 0.5));
    p.stroke(colorWithAlpha(COLORS.textSecondary, progress));
    p.strokeWeight(2);
    p.rect(inputX - boxSize/2, topY - boxSize/2, boxSize, boxSize, 8);
    this.drawUtils.text("X", inputX, topY, 20, COLORS.textPrimary);
    this.drawUtils.text("Input", inputX, topY - boxSize/2 - 15, 12, COLORS.textSecondary);
    p.pop();
    
    const arrowProgress = Math.max(0, (progress - 0.2) / 0.3);
    const qkvColors = [COLORS.riverBlue, COLORS.dartmouthGreen, COLORS.bonfireOrange];
    const qkvLabels = ['Q', 'K', 'V'];
    const qkvNames = ['Query', 'Key', 'Value'];
    const qkvX = [qX, kX, vX];
    
    qkvX.forEach((x, i) => {
      const delay = i * 0.1;
      const ap = Math.max(0, Math.min(1, (arrowProgress - delay) / 0.3));
      
      if (ap > 0) {
        p.push();
        p.stroke(colorWithAlpha(qkvColors[i], ap));
        p.strokeWeight(2);
        
        const midX = inputX + (x - inputX) * ap;
        p.line(inputX + boxSize/2, topY, midX, topY);
        p.line(midX, topY, midX, bottomY - boxSize/2 - 10);
        
        if (ap > 0.9) {
          p.fill(qkvColors[i]);
          p.noStroke();
          p.triangle(midX, bottomY - boxSize/2, midX - 5, bottomY - boxSize/2 - 10, midX + 5, bottomY - boxSize/2 - 10);
        }
        p.pop();
      }
    });
    
    const boxProgress = Math.max(0, (progress - 0.5) / 0.5);
    qkvX.forEach((x, i) => {
      const delay = i * 0.1;
      const bp = Math.max(0, Math.min(1, (boxProgress - delay) / 0.4));
      
      if (bp > 0) {
        p.push();
        p.fill(colorWithAlpha(qkvColors[i], 0.2 * bp));
        p.stroke(colorWithAlpha(qkvColors[i], bp));
        p.strokeWeight(2);
        p.rect(x - boxSize/2, bottomY - boxSize/2, boxSize, boxSize, 8);
        this.drawUtils.text(qkvLabels[i], x, bottomY, 24, colorWithAlpha(COLORS.textPrimary, bp));
        this.drawUtils.text(qkvNames[i], x, bottomY + boxSize/2 + 15, 12, colorWithAlpha(COLORS.textSecondary, bp));
        
        this.drawUtils.monoText(`W_${qkvLabels[i]}`, x, topY + 30, 11, colorWithAlpha(COLORS.textMuted, bp));
        p.pop();
      }
    });
  }
  
  renderAttentionScores(w, h, progress) {
    const p = this.p5Instance;
    const matrixSize = Math.min(150, w * 0.25);
    const cellSize = matrixSize / this.tokens.length;
    const matrixX = w * 0.5 - matrixSize / 2;
    const matrixY = h * 0.4;
    
    this.drawUtils.text("Attention Scores", w / 2, h * 0.12, 18, COLORS.textPrimary);
    this.drawUtils.monoText("Scores = Q · K^T / sqrt(d_k)", w / 2, h * 0.22, 14, COLORS.textSecondary);
    
    const scores = this.tokens.map((_, i) =>
      this.tokens.map((_, j) => {
        const raw = Math.cos((i - j) * 0.5) + Math.random() * 0.3;
        return raw;
      })
    );
    
    const matrixProgress = Math.max(0, (progress - 0.2) / 0.8);
    
    scores.forEach((row, i) => {
      const label = this.tokens[i].substring(0, 4);
      this.drawUtils.text(
        label, matrixX - 25, matrixY + i * cellSize + cellSize / 2,
        11, colorWithAlpha(COLORS.textSecondary, matrixProgress)
      );
      this.drawUtils.text(
        label, matrixX + i * cellSize + cellSize / 2, matrixY - 15,
        11, colorWithAlpha(COLORS.textSecondary, matrixProgress)
      );
    });
    
    this.drawUtils.matrix(
      matrixX, matrixY - matrixSize/2 + matrixSize/2,
      cellSize, scores,
      [COLORS.riverNavy, COLORS.summerYellow],
      matrixProgress
    );
    
    if (matrixProgress > 0.5) {
      this.drawUtils.text(
        "Higher scores = stronger attention",
        w / 2, h * 0.85, 12, COLORS.textMuted
      );
    }
  }
  
  renderSoftmax(w, h, progress) {
    const p = this.p5Instance;
    
    this.drawUtils.text("Softmax Normalization", w / 2, h * 0.1, 18, COLORS.textPrimary);
    
    const rawScores = [2.1, 0.5, -0.3];
    const expScores = rawScores.map(s => Math.exp(s));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const softmaxScores = expScores.map(e => e / sumExp);
    
    const barWidth = 60;
    const barMaxHeight = 100;
    const spacing = 40;
    const totalWidth = 3 * barWidth + 2 * spacing;
    const startX = (w - totalWidth) / 2;
    const rawY = h * 0.35;
    const softY = h * 0.7;
    
    this.drawUtils.text("Raw Scores", w / 2, rawY - 70, 14, COLORS.textSecondary);
    
    rawScores.forEach((score, i) => {
      const x = startX + i * (barWidth + spacing) + barWidth / 2;
      const normalizedHeight = (score / 3) * barMaxHeight;
      const barProgress = Math.max(0, Math.min(1, (progress - i * 0.1) / 0.3));
      
      p.push();
      p.fill(colorWithAlpha(COLORS.riverBlue, barProgress * 0.8));
      p.noStroke();
      const displayHeight = normalizedHeight * barProgress;
      if (displayHeight > 0) {
        p.rect(x - barWidth/2, rawY - displayHeight, barWidth, displayHeight, 4);
      } else {
        p.rect(x - barWidth/2, rawY, barWidth, -displayHeight, 4);
      }
      p.pop();
      
      this.drawUtils.monoText(
        score.toFixed(1), x, rawY + 20,
        12, colorWithAlpha(COLORS.textSecondary, barProgress)
      );
    });
    
    const arrowProgress = Math.max(0, (progress - 0.4) / 0.2);
    if (arrowProgress > 0) {
      p.push();
      p.stroke(colorWithAlpha(COLORS.dartmouthGreen, arrowProgress));
      p.strokeWeight(2);
      p.line(w/2, rawY + 40, w/2, softY - barMaxHeight - 30);
      
      if (arrowProgress > 0.8) {
        p.fill(COLORS.dartmouthGreen);
        p.noStroke();
        p.triangle(w/2, softY - barMaxHeight - 20, w/2 - 6, softY - barMaxHeight - 32, w/2 + 6, softY - barMaxHeight - 32);
      }
      
      this.drawUtils.text("softmax", w/2 + 40, (rawY + softY - barMaxHeight) / 2, 14, colorWithAlpha(COLORS.dartmouthGreen, arrowProgress));
      p.pop();
    }
    
    this.drawUtils.text("Attention Weights (sum = 1)", w / 2, softY - barMaxHeight - 50, 14, COLORS.textSecondary);
    
    const softProgress = Math.max(0, (progress - 0.6) / 0.4);
    softmaxScores.forEach((score, i) => {
      const x = startX + i * (barWidth + spacing) + barWidth / 2;
      const barHeight = score * barMaxHeight * 2;
      const sp = Math.max(0, Math.min(1, (softProgress - i * 0.1) / 0.3));
      
      p.push();
      p.fill(colorWithAlpha(COLORS.dartmouthGreen, sp * 0.8));
      p.noStroke();
      p.rect(x - barWidth/2, softY - barHeight * sp, barWidth, barHeight * sp, 4);
      p.pop();
      
      this.drawUtils.monoText(
        (score * 100).toFixed(0) + '%', x, softY + 20,
        12, colorWithAlpha(COLORS.textSecondary, sp)
      );
    });
  }
  
  renderAttentionOutput(w, h, progress) {
    const p = this.p5Instance;
    
    this.drawUtils.text("Attention Output", w / 2, h * 0.1, 18, COLORS.textPrimary);
    this.drawUtils.monoText("Output = Attention · V", w / 2, h * 0.2, 14, COLORS.textSecondary);
    
    const numTokens = this.tokens.length;
    const boxSize = 50;
    const spacing = 30;
    const totalWidth = numTokens * boxSize + (numTokens - 1) * spacing;
    const startX = (w - totalWidth) / 2;
    const valueY = h * 0.4;
    const outputY = h * 0.75;
    
    const weights = [0.7, 0.2, 0.1];
    
    this.drawUtils.text("Value Vectors", w / 2, valueY - 50, 12, COLORS.textSecondary);
    
    this.tokens.forEach((token, i) => {
      const x = startX + i * (boxSize + spacing) + boxSize / 2;
      const tp = Math.max(0, Math.min(1, progress - i * 0.05));
      
      p.push();
      p.fill(colorWithAlpha(COLORS.bonfireOrange, 0.3 * tp));
      p.stroke(colorWithAlpha(COLORS.bonfireOrange, tp));
      p.strokeWeight(2);
      p.rect(x - boxSize/2, valueY - boxSize/2, boxSize, boxSize, 6);
      this.drawUtils.text(`V${i+1}`, x, valueY, 16, colorWithAlpha(COLORS.textPrimary, tp));
      p.pop();
      
      const weight = weights[i % weights.length];
      this.drawUtils.text(
        `${(weight * 100).toFixed(0)}%`,
        x, valueY + boxSize/2 + 15,
        11, colorWithAlpha(COLORS.textMuted, tp)
      );
    });
    
    const lineProgress = Math.max(0, (progress - 0.3) / 0.4);
    if (lineProgress > 0) {
      const outputX = w / 2;
      
      this.tokens.forEach((_, i) => {
        const x = startX + i * (boxSize + spacing) + boxSize / 2;
        const weight = weights[i % weights.length];
        const lp = Math.max(0, Math.min(1, (lineProgress - i * 0.1) / 0.3));
        
        p.push();
        p.stroke(colorWithAlpha(COLORS.dartmouthGreen, weight * lp));
        p.strokeWeight(1 + weight * 4);
        p.line(x, valueY + boxSize/2 + 30, outputX, outputY - boxSize/2 - 10);
        p.pop();
      });
    }
    
    const outputProgress = Math.max(0, (progress - 0.7) / 0.3);
    if (outputProgress > 0) {
      const outputX = w / 2;
      
      p.push();
      p.fill(colorWithAlpha(COLORS.dartmouthGreen, 0.3 * outputProgress));
      p.stroke(colorWithAlpha(COLORS.dartmouthGreen, outputProgress));
      p.strokeWeight(2);
      p.rect(outputX - boxSize, outputY - boxSize/2, boxSize * 2, boxSize, 8);
      this.drawUtils.text("Output", outputX, outputY, 16, colorWithAlpha(COLORS.textPrimary, outputProgress));
      p.pop();
      
      this.drawUtils.text(
        "Weighted sum of value vectors",
        w / 2, outputY + boxSize/2 + 25, 12, colorWithAlpha(COLORS.textMuted, outputProgress)
      );
    }
  }
  
  renderMultihead(w, h, progress) {
    const p = this.p5Instance;
    const numHeads = 4;
    const headWidth = 50;
    const headHeight = 60;
    const spacing = 20;
    const totalWidth = numHeads * headWidth + (numHeads - 1) * spacing;
    const startX = (w - totalWidth) / 2;
    const headY = h * 0.45;
    const inputY = h * 0.15;
    const outputY = h * 0.8;
    
    this.drawUtils.text("Multi-Head Attention", w / 2, h * 0.05, 18, COLORS.textPrimary);
    
    p.push();
    p.fill(colorWithAlpha(COLORS.surface, 0.5));
    p.stroke(colorWithAlpha(COLORS.textSecondary, progress));
    p.strokeWeight(2);
    p.rect(w/2 - 60, inputY - 20, 120, 40, 8);
    this.drawUtils.text("Input X", w/2, inputY, 14, COLORS.textPrimary);
    p.pop();
    
    const headColors = [COLORS.riverBlue, COLORS.dartmouthGreen, COLORS.bonfireOrange, COLORS.violet];
    
    for (let i = 0; i < numHeads; i++) {
      const x = startX + i * (headWidth + spacing) + headWidth / 2;
      const delay = i * 0.1;
      const hp = Math.max(0, Math.min(1, (progress - 0.2 - delay) / 0.3));
      
      if (hp > 0) {
        p.push();
        p.stroke(colorWithAlpha(headColors[i], hp * 0.6));
        p.strokeWeight(2);
        p.line(w/2, inputY + 20, x, headY - headHeight/2 - 10);
        p.pop();
        
        p.push();
        p.fill(colorWithAlpha(headColors[i], 0.2 * hp));
        p.stroke(colorWithAlpha(headColors[i], hp));
        p.strokeWeight(2);
        p.rect(x - headWidth/2, headY - headHeight/2, headWidth, headHeight, 6);
        this.drawUtils.text(`Head ${i+1}`, x, headY, 12, colorWithAlpha(COLORS.textPrimary, hp));
        p.pop();
      }
    }
    
    const concatProgress = Math.max(0, (progress - 0.6) / 0.2);
    if (concatProgress > 0) {
      for (let i = 0; i < numHeads; i++) {
        const x = startX + i * (headWidth + spacing) + headWidth / 2;
        
        p.push();
        p.stroke(colorWithAlpha(headColors[i], concatProgress * 0.6));
        p.strokeWeight(2);
        p.line(x, headY + headHeight/2, w/2, outputY - 30);
        p.pop();
      }
      
      this.drawUtils.text("Concat", w/2, headY + headHeight/2 + 30, 12, colorWithAlpha(COLORS.textSecondary, concatProgress));
    }
    
    const outputProgress = Math.max(0, (progress - 0.8) / 0.2);
    if (outputProgress > 0) {
      p.push();
      p.fill(colorWithAlpha(COLORS.summerYellow, 0.2 * outputProgress));
      p.stroke(colorWithAlpha(COLORS.summerYellow, outputProgress));
      p.strokeWeight(2);
      p.rect(w/2 - 70, outputY - 20, 140, 40, 8);
      this.drawUtils.text("Multi-Head Output", w/2, outputY, 14, colorWithAlpha(COLORS.textPrimary, outputProgress));
      p.pop();
    }
  }
  
  renderFFN(w, h, progress) {
    const p = this.p5Instance;
    const layerWidth = 80;
    const layerHeight = 120;
    const nodeRadius = 8;
    
    const inputX = w * 0.2;
    const hidden1X = w * 0.45;
    const hidden2X = w * 0.65;
    const outputX = w * 0.85;
    const centerY = h * 0.5;
    
    this.drawUtils.text("Feed-Forward Network", w / 2, h * 0.08, 18, COLORS.textPrimary);
    this.drawUtils.monoText("FFN(x) = ReLU(xW1 + b1)W2 + b2", w / 2, h * 0.18, 12, COLORS.textSecondary);
    
    const layers = [
      { x: inputX, nodes: 4, color: COLORS.riverBlue, label: 'Input\n(d=768)' },
      { x: hidden1X, nodes: 6, color: COLORS.dartmouthGreen, label: 'Hidden\n(d=3072)' },
      { x: hidden2X, nodes: 6, color: COLORS.dartmouthGreen, label: '' },
      { x: outputX, nodes: 4, color: COLORS.bonfireOrange, label: 'Output\n(d=768)' }
    ];
    
    const nodePositions = [];
    
    layers.forEach((layer, layerIdx) => {
      const delay = layerIdx * 0.15;
      const lp = Math.max(0, Math.min(1, (progress - delay) / 0.3));
      
      const positions = this.drawUtils.layerNodes(
        layer.x, centerY, layer.nodes, nodeRadius, layer.color, lp
      );
      nodePositions.push(positions);
      
      if (layer.label && lp > 0.5) {
        this.drawUtils.text(
          layer.label, layer.x, centerY + layerHeight/2 + 30,
          10, colorWithAlpha(COLORS.textSecondary, lp)
        );
      }
    });
    
    const connectionProgress = Math.max(0, (progress - 0.3) / 0.5);
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const cp = Math.max(0, Math.min(1, (connectionProgress - i * 0.15) / 0.3));
      if (cp > 0 && nodePositions[i].length && nodePositions[i+1].length) {
        this.drawUtils.layerConnections(
          nodePositions[i], nodePositions[i+1],
          null, COLORS.textMuted, cp
        );
      }
    }
    
    const reluProgress = Math.max(0, (progress - 0.5) / 0.3);
    if (reluProgress > 0) {
      this.drawUtils.text(
        "ReLU", (hidden1X + hidden2X) / 2, centerY - layerHeight/2 - 20,
        14, colorWithAlpha(COLORS.success, reluProgress)
      );
    }
  }
  
  renderStacking(w, h, progress) {
    const p = this.p5Instance;
    const numLayers = 6;
    const layerWidth = w * 0.6;
    const layerHeight = 35;
    const spacing = 8;
    const startX = (w - layerWidth) / 2;
    const startY = h * 0.2;
    
    this.drawUtils.text("Stacked Transformer Blocks", w / 2, h * 0.08, 18, COLORS.textPrimary);
    
    for (let i = 0; i < numLayers; i++) {
      const delay = i * 0.1;
      const lp = Math.max(0, Math.min(1, (progress - delay) / 0.25));
      const y = startY + i * (layerHeight + spacing);
      
      const layerColor = lerpColor(COLORS.riverNavy, COLORS.dartmouthGreen, i / (numLayers - 1));
      
      p.push();
      p.fill(colorWithAlpha(layerColor, 0.3 * lp));
      p.stroke(colorWithAlpha(layerColor, lp));
      p.strokeWeight(2);
      p.rect(startX, y, layerWidth, layerHeight, 6);
      
      this.drawUtils.text(
        `Layer ${i + 1}`,
        w / 2, y + layerHeight / 2,
        12, colorWithAlpha(COLORS.textPrimary, lp)
      );
      
      if (i < numLayers - 1 && lp > 0.5) {
        const arrowY = y + layerHeight + spacing / 2;
        p.stroke(colorWithAlpha(COLORS.textMuted, lp - 0.5));
        p.strokeWeight(1);
        p.line(w/2, y + layerHeight + 2, w/2, y + layerHeight + spacing - 2);
      }
      p.pop();
    }
    
    const outputProgress = Math.max(0, (progress - 0.7) / 0.3);
    if (outputProgress > 0) {
      const outputY = startY + numLayers * (layerHeight + spacing) + 20;
      
      p.push();
      p.stroke(colorWithAlpha(COLORS.bonfireOrange, outputProgress));
      p.strokeWeight(2);
      p.line(w/2, outputY - 20, w/2, outputY);
      
      p.fill(COLORS.bonfireOrange);
      p.noStroke();
      p.triangle(w/2, outputY + 10, w/2 - 6, outputY, w/2 + 6, outputY);
      
      p.fill(colorWithAlpha(COLORS.bonfireOrange, 0.2 * outputProgress));
      p.stroke(colorWithAlpha(COLORS.bonfireOrange, outputProgress));
      p.strokeWeight(2);
      p.rect(startX + layerWidth * 0.2, outputY + 15, layerWidth * 0.6, 40, 8);
      this.drawUtils.text(
        "Output Logits → Next Token Prediction",
        w / 2, outputY + 35,
        12, colorWithAlpha(COLORS.textPrimary, outputProgress)
      );
      p.pop();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.transformerAnimator = new TransformerAnimator('canvas-container');
  
  if (typeof ThemeManager !== 'undefined') {
    ThemeManager.init();
  }
  
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      if (themeIcon) {
        themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';
      }
    });
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeIcon) {
      themeIcon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
    }
  }
});
