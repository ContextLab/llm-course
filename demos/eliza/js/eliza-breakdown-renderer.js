/**
 * ELIZA Breakdown Renderer
 * Shared module for rendering ELIZA rule breakdowns with interactive features.
 * Used by both Demo 01 (ELIZA standalone) and Demo 02 (Chatbot Evolution).
 */

export class ElizaBreakdownRenderer {
  constructor(options = {}) {
    this.containerId = options.containerId || 'breakdown-steps';
    this.engine = options.engine || null;
    this.currentBreakdown = null;
    this.memoryDisplayId = options.memoryDisplayId || 'memory-display';
  }

  setEngine(engine) {
    this.engine = engine;
  }

  renderMemoryStack() {
    const memoryDisplay = document.getElementById(this.memoryDisplayId);
    if (!memoryDisplay || !this.engine) return;

    const memory = this.engine.getMemoryStack();
    
    if (memory.length === 0) {
      memoryDisplay.innerHTML = `
        <div class="memory-empty">
          <span class="memory-empty-icon">\u{1F4AD}</span>
          <span>No memories stored</span>
        </div>
      `;
      return;
    }

    let html = '<div class="memory-list">';
    memory.forEach((item, index) => {
      html += `
        <div class="memory-item">
          <span class="memory-index">${index + 1}</span>
          <span class="memory-text">"${this.escapeHtml(item)}"</span>
        </div>
      `;
    });
    html += '</div>';
    memoryDisplay.innerHTML = html;
  }

  /**
   * Get the container element
   */
  getContainer() {
    return document.getElementById(this.containerId);
  }

  /**
   * Escape HTML characters to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  togglePatternTests(stepId) {
    const content = document.getElementById(stepId);
    const icon = document.getElementById(stepId + '-icon');
    if (content && icon) {
      if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '\u25BC';
      } else {
        content.style.display = 'none';
        icon.textContent = '\u25B6';
      }
    }
  }

  selectMemoryOption(memoryIndex) {
    if (!this.currentBreakdown || !this.engine) return;
    
    const memoryStep = this.currentBreakdown.steps.find(s => s.name === 'Memory Recall');
    if (!memoryStep || !memoryStep.memoryRecall) return;
    
    const memories = memoryStep.memoryRecall.availableMemories;
    if (memoryIndex < 0 || memoryIndex >= memories.length) return;
    
    const selectedMemory = memories[memoryIndex];
    
    document.querySelectorAll('.memory-option').forEach((el, i) => {
      if (i === memoryIndex) {
        el.classList.add('matched');
        el.style.opacity = '1';
        el.innerHTML = `<strong>${i + 1}.</strong> "${this.escapeHtml(memories[i])}" <span class="highlight">SELECTED</span>`;
      } else {
        el.classList.remove('matched');
        el.style.opacity = '0.7';
        el.innerHTML = `<strong>${i + 1}.</strong> "${this.escapeHtml(memories[i])}"`;
      }
    });
    
    const memoryDisplay = document.getElementById('selected-memory-display');
    if (memoryDisplay) {
      memoryDisplay.textContent = `"${selectedMemory}"`;
    }
    
    const tempStack = [selectedMemory];
    const newBreakdown = this.engine.patternMatcher.getProcessingBreakdown(
      this.currentBreakdown.originalInput,
      this.engine.rules,
      this.engine.preSubstitutions,
      this.engine.postSubstitutions,
      this.engine.synonyms,
      tempStack
    );
    
    this.updateDownstreamSteps(newBreakdown);
  }

  updateDownstreamSteps(newBreakdown) {
    const stepsDiv = this.getContainer();
    if (!stepsDiv) return;
    
    const allSteps = stepsDiv.querySelectorAll('.breakdown-step');
    allSteps.forEach(stepEl => {
      const titleEl = stepEl.querySelector('.step-title');
      if (!titleEl) return;
      const title = titleEl.textContent;
      
      const newStep = newBreakdown.steps.find(s => s.name === title);
      if (!newStep) return;
      
      const ioBoxes = stepEl.querySelectorAll('.step-io .io-box');
      if (ioBoxes.length >= 1 && newStep.input !== undefined) {
        ioBoxes[0].textContent = newStep.input;
      }
      if (ioBoxes.length >= 2 && newStep.output !== undefined) {
        ioBoxes[1].textContent = newStep.output;
      }
      
      if (title === 'Template Selection' && newStep.allTemplates) {
        const dropdown = stepEl.querySelector('.template-dropdown');
        if (dropdown) {
          dropdown.innerHTML = newStep.allTemplates.map((t, i) => 
            `<option value="${i}" ${i === newStep.selectedTemplateIndex ? 'selected' : ''}>${this.escapeHtml(t)}</option>`
          ).join('');
        }
        const selectedDisplay = stepEl.querySelector('#selected-template-display');
        if (selectedDisplay && newStep.allTemplates[newStep.selectedTemplateIndex]) {
          selectedDisplay.textContent = `"${newStep.allTemplates[newStep.selectedTemplateIndex]}"`;
        }
      }
    });
    
    const finalStep = document.getElementById('final-response-step');
    if (finalStep && newBreakdown.finalResponse) {
      const responseEl = finalStep.querySelector('#final-response-content');
      if (responseEl) {
        responseEl.textContent = newBreakdown.finalResponse;
      }
    }
  }

  /**
   * Update step numbers after adding/removing steps
   */
  updateStepNumbers() {
    const stepsDiv = this.getContainer();
    if (!stepsDiv) return;
    
    const stepElements = stepsDiv.querySelectorAll('.breakdown-step:not(#final-response-step)');
    stepElements.forEach((stepEl, index) => {
      const stepNumber = stepEl.querySelector('.step-number');
      if (stepNumber && !stepNumber.textContent.includes('\u2713') && !stepNumber.textContent.includes('\u21AA')) {
        stepNumber.textContent = `${index + 1}`;
      }
    });
  }

  /**
   * Main display function - renders the complete breakdown
   */
  displayBreakdown(breakdown) {
    // Store breakdown for template selection changes
    this.currentBreakdown = breakdown;

    const stepsDiv = this.getContainer();
    if (!stepsDiv) {
      console.error('Breakdown container not found:', this.containerId);
      return;
    }
    stepsDiv.innerHTML = '';

    // Expose toggle function globally for onclick handlers
    window.togglePatternTests = (stepId) => this.togglePatternTests(stepId);
    window.selectMemoryOption = (memoryIndex) => this.selectMemoryOption(memoryIndex);

    breakdown.steps.forEach((step, index) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'breakdown-step';

      let stepHTML = `
        <div class="step-header">
          <div class="step-number">${index + 1}</div>
          <div class="step-title">${step.name}</div>
        </div>
        <div class="step-description">${step.description}</div>
      `;

      // Special handling for Template Selection step - show dropdown
      if (step.name === 'Template Selection' && step.allTemplates && step.allTemplates.length > 0) {
        stepHTML += `
          <div class="step-io">
            <div style="flex: 1;">
              <div class="io-label">${step.allTemplates.length} Available Template(s)</div>
              <select class="template-dropdown" id="breakdown-template-selector" style="width: 100%; padding: 10px; border: 2px solid var(--border-color); border-radius: 6px; font-size: 0.9rem; background: var(--surface-color); color: var(--text-primary); cursor: pointer;">
                ${step.allTemplates.map((t, i) => `<option value="${i}" ${i === step.selectedTemplateIndex ? 'selected' : ''}>${this.escapeHtml(t)}</option>`).join('')}
              </select>
            </div>
            <div class="arrow">&rarr;</div>
            <div style="flex: 1;">
              <div class="io-label">Selected Template</div>
              <div class="io-box" id="selected-template-display">"${this.escapeHtml(step.allTemplates[step.selectedTemplateIndex])}"</div>
            </div>
          </div>
        `;
        stepHTML += `<div class="step-details">Select a different template to see how it changes the response</div>`;
      } else if (step.name === 'Goto Resolution' && step.targetTemplates && step.targetTemplates.length > 0) {
        // Special handling for Goto Resolution - recursive mini-breakdown
        stepHTML += this.renderGotoResolutionStep(step, index);
      } else if (step.name === 'Memory Recall' && step.memoryRecall) {
        // Special handling for Memory Recall - show available memories
        stepHTML += this.renderMemoryRecallStep(step, index);
      } else if (step.input !== undefined && step.output !== undefined) {
        // Add input/output visualization for other steps
        stepHTML += `
          <div class="step-io">
            <div>
              <div class="io-label">Input</div>
              <div class="io-box">${this.escapeHtml(step.input)}</div>
            </div>
            <div class="arrow">&rarr;</div>
            <div>
              <div class="io-label">Output</div>
              <div class="io-box">${this.escapeHtml(step.output)}</div>
            </div>
          </div>
        `;
      }

      // Add details (but not for template selection or goto resolution since we add custom details)
      if (step.details && step.name !== 'Template Selection' && step.name !== 'Goto Resolution') {
        if (step.name === 'Keyword Detection' && step.keywordsFound && step.keywordsFound.length > 0) {
          const keywordStepId = `keywords-${index}`;
          stepHTML += `<div class="pattern-tests-header" onclick="togglePatternTests('${keywordStepId}')" style="cursor: pointer; color: var(--primary-color); margin-bottom: 8px;">
            <span class="pattern-toggle-icon" id="${keywordStepId}-icon">\u25B6</span>
            Found ${step.keywordsFound.length} keyword(s) - <em>click to show details</em>
          </div>`;
          stepHTML += `<div class="step-content" id="${keywordStepId}" style="display: none;">`;
          step.keywordsFound.forEach(kw => {
            stepHTML += `
              <div class="pattern-test" style="opacity: 1;">
                <strong>${this.escapeHtml(kw.keyword)}</strong> (rank: ${kw.rank}) - ${kw.patternCount} pattern(s)
              </div>
            `;
          });
          stepHTML += '</div>';
        } else {
          stepHTML += `<div class="step-details">${step.details}</div>`;
        }
      }

      // Add pattern tests if available
      if (step.patternTests && step.patternTests.length > 0) {
        stepHTML += this.renderPatternTests(step.patternTests, index);
      }

      // Add post-substitution steps if available
      if (step.postSubSteps && step.postSubSteps.length > 0) {
        stepHTML += '<div class="step-content">';
        step.postSubSteps.forEach(subStep => {
          stepHTML += `
            <div class="post-sub-step">
              Capture (${subStep.capture}): "${subStep.original}" &rarr; "${subStep.reflected}"
              ${subStep.substitutions.map(s => `<br>&nbsp;&nbsp;&bull; "${s.from}" &rarr; "${s.to}"`).join('')}
            </div>
          `;
        });
        stepHTML += '</div>';
      }

      stepDiv.innerHTML = stepHTML;
      stepsDiv.appendChild(stepDiv);
    });

    // Add memory save indicator if pattern saves to memory (but not when using recalled memory)
    if (breakdown.shouldSave && !breakdown.usingMemory) {
      const memoryDiv = document.createElement('div');
      memoryDiv.className = 'breakdown-step';
      memoryDiv.id = 'memory-save-step';
      memoryDiv.style.borderColor = 'var(--warning-color, #ffc107)';
      memoryDiv.innerHTML = `
        <div class="step-header">
          <div class="step-number" style="background: var(--warning-color, #ffc107); font-size: 0.6rem;">mem</div>
          <div class="step-title" style="color: var(--warning-color, #ffc107);">Memory Save</div>
        </div>
        <div class="step-description">This input will be saved to ELIZA's memory for later recall</div>
        <div class="step-content">
          <div class="io-box" style="background: rgba(255, 193, 7, 0.1); border-color: var(--warning-color, #ffc107);">
            "${this.escapeHtml(breakdown.originalInput)}"
          </div>
          <div class="step-details" style="margin-top: 8px;">
            When no keywords match a future input, ELIZA may recall this statement and generate a response based on it.
          </div>
        </div>
      `;
      stepsDiv.appendChild(memoryDiv);
    }

    // Add final result with chat bubble styling
    if (breakdown.finalResponse) {
      const finalDiv = document.createElement('div');
      finalDiv.className = 'breakdown-step';
      finalDiv.id = 'final-response-step';
      finalDiv.style.borderColor = 'var(--secondary-color)';
      finalDiv.innerHTML = `
        <div class="step-header">
          <div class="step-number" style="background: var(--secondary-color);">&#10003;</div>
          <div class="step-title" style="color: var(--secondary-color);">Final Response</div>
        </div>
        <div class="step-content">
          <div class="message bot" style="margin: 0; animation: none;">
            <div class="message-content" id="final-response-content">
              ${this.escapeHtml(breakdown.finalResponse)}
            </div>
            <div class="message-meta">
              <span>ELIZA's response</span>
            </div>
          </div>
        </div>
      `;
      stepsDiv.appendChild(finalDiv);
    }

    // Add event listener for template dropdown
    const templateSelector = document.getElementById('breakdown-template-selector');
    if (templateSelector) {
      templateSelector.addEventListener('change', (e) => this.handleTemplateChange(e));
    }
  }

  renderMemoryRecallStep(step, index) {
    const memoryRecall = step.memoryRecall;
    const memories = memoryRecall.availableMemories || [];
    const selectedIdx = memoryRecall.selectedIndex;
    const memoryStepId = `memory-recall-${index}`;

    let html = `
      <div class="memory-recall-container" style="margin-top: 12px; padding: 16px; background: rgba(255, 193, 7, 0.08); border-radius: 8px; border-left: 3px solid var(--warning-color, #ffc107);">
        <div style="font-weight: 600; margin-bottom: 12px; color: var(--warning-color, #ffc107);">
          <span class="memory-badge-header" title="Recalling from memory">mem</span>
          No keywords found - recalling from memory
        </div>
        <div class="step-io">
          <div style="flex: 1;">
            <div class="io-label">Original Input (no keywords)</div>
            <div class="io-box" style="opacity: 0.6; text-decoration: line-through;">${this.escapeHtml(step.input)}</div>
          </div>
          <div class="arrow" style="color: var(--warning-color, #ffc107);">&rarr;</div>
          <div style="flex: 1;">
            <div class="io-label">Recalled Memory</div>
            <div class="io-box" id="selected-memory-display" style="border-color: var(--warning-color, #ffc107); background: rgba(255, 193, 7, 0.1);">"${this.escapeHtml(memoryRecall.selectedMemory)}"</div>
          </div>
        </div>
    `;

    if (memories.length > 1) {
      html += `
        <div style="margin: 12px 0 8px 0;">
          <div class="io-label">${memories.length} memories available - click to select:</div>
          <div class="memory-selector-list" style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
      `;
      memories.forEach((mem, i) => {
        const isSelected = i === selectedIdx;
        html += `
          <div class="memory-option pattern-test ${isSelected ? 'matched' : ''}" 
               data-memory-index="${i}"
               onclick="window.selectMemoryOption(${i})"
               style="cursor: pointer; opacity: ${isSelected ? '1' : '0.7'}; transition: all 0.2s ease;">
            <strong>${i + 1}.</strong> "${this.escapeHtml(mem)}" ${isSelected ? '<span class="highlight">SELECTED</span>' : ''}
          </div>
        `;
      });
      html += '</div></div>';
    } else {
      html += `<div class="step-details" style="margin-top: 8px;">1 memory item available</div>`;
    }

    html += `
        <div class="step-details" style="margin-top: 8px; font-style: italic;">
          The recalled memory will be processed through the pattern matching pipeline instead of the original input.
        </div>
      </div>
    `;

    return html;
  }

  renderGotoResolutionStep(step, index) {
    const gotoPatternId = `goto-patterns-${index}`;
    const patternTests = step.targetPatternTests || [];
    const matchedPattern = patternTests.find(t => t.matched);
    const targetCaptures = matchedPattern?.captures || [];
    const selectedIdx = step.selectedTemplateIndex !== undefined ? step.selectedTemplateIndex : 0;

    // Header showing the goto statement
    let html = `
      <div class="step-io">
        <div style="flex: 1;">
          <div class="io-label">Redirect Statement</div>
          <div class="io-box">goto ${this.escapeHtml(step.targetKeyword)}</div>
        </div>
      </div>
    `;

    // Mini-breakdown container for the goto target
    html += `<div class="goto-breakdown" style="margin-top: 16px; padding: 16px; background: rgba(var(--primary-rgb, 99, 102, 241), 0.05); border-radius: 8px; border-left: 3px solid var(--primary-color);">`;
    html += `<div style="font-weight: 600; margin-bottom: 12px; color: var(--primary-color);">\u2192 Processing "${this.escapeHtml(step.targetKeyword)}" keyword:</div>`;

    // Sub-step A: Pattern Matching for goto target
    const preSubOutput = this.currentBreakdown?.steps?.find(s => s.name === 'Pre-substitutions')?.output || '';
    html += `
      <div class="goto-substep" style="margin-bottom: 16px;">
        <div style="font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">\u21AA Pattern Matching</div>
        <div class="step-io">
          <div style="flex: 1;">
            <div class="io-label">Input</div>
            <div class="io-box">${this.escapeHtml(preSubOutput)}</div>
          </div>
          <div class="arrow">\u2192</div>
          <div style="flex: 1;">
            <div class="io-label">Matched Pattern</div>
            <div class="io-box">"${this.escapeHtml(step.targetPatternString || '*')}"</div>
          </div>
        </div>
    `;

    // Expandable pattern tests (if more than 1 pattern)
    if (patternTests.length > 1) {
      html += `<div class="pattern-tests-header" onclick="togglePatternTests('${gotoPatternId}')" style="cursor: pointer; color: var(--primary-color); margin: 8px 0;">
        <span class="pattern-toggle-icon" id="${gotoPatternId}-icon">\u25B6</span>
        Tested ${patternTests.length} pattern(s) - <em>click to show all</em>
      </div>`;
      html += `<div class="step-content" id="${gotoPatternId}" style="display: none;">`;
      patternTests.forEach((test, i) => {
        html += `
          <div class="pattern-test ${test.matched ? 'matched' : ''}" style="opacity: ${test.matched ? '1' : '0.6'};">
            <strong>${i + 1}.</strong> "${this.escapeHtml(test.pattern)}" ${test.matched ? '<span class="highlight">MATCH</span>' : '<span style="color: var(--text-secondary);">no match</span>'}
          </div>
        `;
      });
      html += '</div>';
    } else if (patternTests.length === 1) {
      html += `<div class="step-details">Pattern "*" matches any input</div>`;
    }
    html += `</div>`; // Close Pattern Matching substep

    // Sub-step B: Decomposition (if pattern has captures)
    if (targetCaptures.length > 0) {
      html += `
        <div class="goto-substep" style="margin-bottom: 16px;">
          <div style="font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">\u21AA Decomposition</div>
          <div class="step-io">
            <div style="flex: 1;">
              <div class="io-label">Input</div>
              <div class="io-box">${this.escapeHtml(preSubOutput)}</div>
            </div>
            <div class="arrow">\u2192</div>
            <div style="flex: 1;">
              <div class="io-label">Captures</div>
              <div class="io-box">${targetCaptures.map((c, i) => `(${i + 1}): "${Array.isArray(c) ? c.join(' ') : c}"`).join(', ')}</div>
            </div>
          </div>
          <div class="step-details">Extracted ${targetCaptures.length} component(s)</div>
        </div>
      `;
    }

    // Sub-step C: Template Selection
    html += `
      <div class="goto-substep">
        <div style="font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">\u21AA Template Selection</div>
        <div class="step-io">
          <div style="flex: 1;">
            <div class="io-label">${step.targetTemplates.length} Available Response(s)</div>
            <select class="template-dropdown" id="goto-template-selector" style="width: 100%; padding: 10px; border: 2px solid var(--border-color); border-radius: 6px; font-size: 0.9rem; background: var(--surface-color); color: var(--text-primary); cursor: pointer;">
              ${step.targetTemplates.map((t, i) => `<option value="${i}" ${i === selectedIdx ? 'selected' : ''}>${this.escapeHtml(t)}</option>`).join('')}
            </select>
          </div>
          <div class="arrow">\u2192</div>
          <div style="flex: 1;">
            <div class="io-label">Selected Response</div>
            <div class="io-box" id="goto-selected-template">"${this.escapeHtml(step.output.replace(/^"|"$/g, ''))}"</div>
          </div>
        </div>
        <div class="step-details">Select a different response to see how it changes the final output</div>
      </div>
    `;

    html += `</div>`; // Close goto-breakdown container

    // Note about captures preservation
    if (step.originalCapturesPreserved) {
      html += `<div class="step-details" style="font-style: italic; margin-top: 12px;">
        Note: Original captures (${step.capturesAvailable}) from the main pattern match are preserved and can be used in the selected response.
      </div>`;
    }

    return html;
  }

  renderPatternTests(patternTests, index) {
    const stepId = `pattern-tests-${index}`;
    const totalPatterns = patternTests.length;
    const memoryPatterns = patternTests.filter(t => t.savesToMemory).length;

    let headerExtra = '';
    if (memoryPatterns > 0) {
      headerExtra = ` (${memoryPatterns} with memory)`;
    }

    let html = `<div class="pattern-tests-header" onclick="togglePatternTests('${stepId}')" style="cursor: pointer; color: var(--primary-color); margin-bottom: 8px;">
      <span class="pattern-toggle-icon" id="${stepId}-icon">\u25B6</span>
      Tested ${totalPatterns} pattern(s)${headerExtra} - <em>click to ${totalPatterns > 5 ? 'show all' : 'toggle'}</em>
    </div>`;

    html += `<div class="step-content" id="${stepId}" style="display: none;">`;

    for (let i = 0; i < patternTests.length; i++) {
      const test = patternTests[i];
      const testClass = test.matched ? 'matched' : 'not-matched';
      const memoryBadge = test.savesToMemory 
        ? '<span class="memory-badge" title="Saves matching input to memory for later recall when no keywords match">mem</span>' 
        : '';
      const capturesHtml = test.captures && test.captures.length > 0
        ? `<br>Captures: ${test.captures.map((c, j) => {
            const captureText = Array.isArray(c) ? c.join(' ') : c;
            return `(${j+1}): "${captureText}"`;
          }).join(', ')}`
        : '';

      html += `
        <div class="pattern-test ${testClass}">
          ${memoryBadge}<strong>${this.escapeHtml(test.keyword)}</strong>: "${this.escapeHtml(test.pattern)}"
          ${test.matched ? ' <span class="highlight">MATCHED</span>' : ''}
          ${capturesHtml}
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  /**
   * Handle template selection change in breakdown
   */
  handleTemplateChange(e) {
    if (!this.engine) {
      console.error('ELIZA engine not set');
      return;
    }

    const selectedIndex = parseInt(e.target.value);

    // Find the Template Selection step and get data
    const templateStep = this.currentBreakdown.steps.find(s => s.name === 'Template Selection');
    if (!templateStep || !templateStep.allTemplates) return;

    const selectedTemplate = templateStep.allTemplates[selectedIndex];

    // Update the selected template display
    const templateDisplay = document.getElementById('selected-template-display');
    if (templateDisplay) {
      templateDisplay.textContent = `"${selectedTemplate}"`;
    }

    // Find decomposition step to get captures
    const patternStep = this.currentBreakdown.steps.find(s => s.name === 'Pattern Matching');
    const captures = [];
    if (patternStep && patternStep.patternTests) {
      const matchedTest = patternStep.patternTests.find(t => t.matched);
      if (matchedTest && matchedTest.captures) {
        captures.push(...matchedTest.captures);
      }
    }

    const patternMatcher = this.engine.patternMatcher;
    const postSubs = this.engine.postSubstitutions;
    const rules = this.engine.rules;
    const synonyms = this.engine.synonyms || {};

    // Check if selected template is a goto statement
    let finalTemplate = selectedTemplate;
    let gotoResolutionData = null;

    if (selectedTemplate.startsWith('goto ')) {
      // Resolve the goto
      const gotoChain = [];
      let currentTemplate = selectedTemplate;
      let targetRule = null;
      let targetPattern = null;
      let targetPatternTests = [];

      // Get the normalized input for pattern testing
      const preSubStep = this.currentBreakdown.steps.find(s => s.name === 'Pre-substitutions');
      const normalizedInput = preSubStep ? preSubStep.output : '';

      while (currentTemplate && currentTemplate.startsWith('goto ')) {
        const targetKeyword = currentTemplate.substring(5).trim();
        gotoChain.push(targetKeyword);

        targetRule = rules.find(r => r.keyword === targetKeyword);
        if (targetRule && targetRule.patterns && targetRule.patterns.length > 0) {
          // Test all patterns against the input
          targetPatternTests = [];
          let matchedPattern = null;

          for (const pattern of targetRule.patterns) {
            const testResult = patternMatcher.matchPattern(normalizedInput, pattern.pattern, synonyms);
            targetPatternTests.push({
              pattern: pattern.pattern,
              matched: testResult.matched,
              captures: testResult.captures || [],
              responses: pattern.responses
            });
            if (testResult.matched && !matchedPattern) {
              matchedPattern = pattern;
            }
          }

          // Use matched pattern or fall back to first (usually "*")
          targetPattern = matchedPattern || targetRule.patterns[0];
          const targetTemplates = targetPattern.responses;
          // Select first template by default (user can change via goto dropdown)
          currentTemplate = targetTemplates[0];
        } else {
          break;
        }

        if (gotoChain.length >= 10) break;
      }

      finalTemplate = currentTemplate;
      gotoResolutionData = {
        gotoChain,
        targetKeyword: gotoChain[gotoChain.length - 1],
        targetRule,
        targetPattern,
        targetTemplates: targetPattern ? targetPattern.responses : [],
        targetPatternTests,
        selectedTemplateIndex: 0,
        resolvedTemplate: finalTemplate
      };
    }

    // Re-assemble the response with the final template
    let newResponse = finalTemplate;
    for (let i = 0; i < captures.length; i++) {
      const placeholder = `(${i + 1})`;
      if (newResponse.includes(placeholder)) {
        const captureText = Array.isArray(captures[i]) ? captures[i].join(' ') : captures[i];
        const { result } = patternMatcher.applyPostSubstitutions(captureText, postSubs);
        newResponse = newResponse.replace(placeholder, result);
      }
    }

    // Format response (uppercase to match ELIZA style)
    newResponse = newResponse.toUpperCase();

    // Update the breakdown steps dynamically
    this.updateBreakdownWithGoto(selectedTemplate, gotoResolutionData, finalTemplate, newResponse, captures);
  }

  /**
   * Update breakdown steps when a goto is selected or deselected
   */
  updateBreakdownWithGoto(selectedTemplate, gotoData, finalTemplate, finalResponse, captures) {
    const stepsDiv = this.getContainer();
    if (!stepsDiv) return;

    const finalResponseStep = document.getElementById('final-response-step');

    // Find existing goto resolution step (by id or by title)
    let gotoStep = document.getElementById('goto-resolution-step');
    if (!gotoStep) {
      const stepElements = stepsDiv.querySelectorAll('.breakdown-step');
      stepElements.forEach(stepEl => {
        const titleEl = stepEl.querySelector('.step-title');
        if (titleEl && titleEl.textContent === 'Goto Resolution') {
          gotoStep = stepEl;
        }
      });
    }

    // Find the Post-substitutions step
    let postSubStep = null;
    const stepElements = stepsDiv.querySelectorAll('.breakdown-step');
    stepElements.forEach(stepEl => {
      const titleEl = stepEl.querySelector('.step-title');
      if (titleEl && titleEl.textContent === 'Post-substitutions & Assembly') {
        postSubStep = stepEl;
      }
    });

    if (gotoData) {
      // Need to show/update goto resolution step
      if (!gotoStep) {
        gotoStep = document.createElement('div');
        gotoStep.className = 'breakdown-step';
        gotoStep.id = 'goto-resolution-step';
        gotoStep.style.borderColor = 'var(--warning-color, #ffc107)';

        // Insert before post-substitutions step
        if (postSubStep) {
          stepsDiv.insertBefore(gotoStep, postSubStep);
          this.updateStepNumbers();
        }
      }

      // Update goto step content
      const gotoPatternId = 'goto-patterns-dynamic';
      const preSubStep = this.currentBreakdown.steps.find(s => s.name === 'Pre-substitutions');
      const normalizedInput = preSubStep ? preSubStep.output : '';
      const patternTests = gotoData.targetPatternTests || [];
      const matchedPattern = patternTests.find(t => t.matched);
      const targetCaptures = matchedPattern?.captures || [];
      const selectedIdx = gotoData.selectedTemplateIndex !== undefined ? gotoData.selectedTemplateIndex : 0;

      let gotoHTML = `
        <div class="step-header">
          <div class="step-number">\u21AA</div>
          <div class="step-title">Goto Resolution</div>
        </div>
        <div class="step-description">Following redirect to another keyword's responses</div>
        <div class="step-io">
          <div style="flex: 1;">
            <div class="io-label">Redirect Statement</div>
            <div class="io-box">goto ${this.escapeHtml(gotoData.targetKeyword)}</div>
          </div>
        </div>

        <!-- Mini-breakdown container -->
        <div class="goto-breakdown" style="margin-top: 16px; padding: 16px; background: rgba(var(--primary-rgb, 99, 102, 241), 0.05); border-radius: 8px; border-left: 3px solid var(--primary-color);">
          <div style="font-weight: 600; margin-bottom: 12px; color: var(--primary-color);">\u2192 Processing "${this.escapeHtml(gotoData.targetKeyword)}" keyword:</div>

          <!-- Sub-step A: Pattern Matching -->
          <div class="goto-substep" style="margin-bottom: 16px;">
            <div style="font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">\u21AA Pattern Matching</div>
            <div class="step-io">
              <div style="flex: 1;">
                <div class="io-label">Input</div>
                <div class="io-box">${this.escapeHtml(normalizedInput)}</div>
              </div>
              <div class="arrow">\u2192</div>
              <div style="flex: 1;">
                <div class="io-label">Matched Pattern</div>
                <div class="io-box">"${this.escapeHtml(gotoData.targetPattern ? gotoData.targetPattern.pattern : '*')}"</div>
              </div>
            </div>
      `;

      // Expandable pattern tests
      if (patternTests.length > 1) {
        gotoHTML += `<div class="pattern-tests-header" onclick="togglePatternTests('${gotoPatternId}')" style="cursor: pointer; color: var(--primary-color); margin: 8px 0;">
          <span class="pattern-toggle-icon" id="${gotoPatternId}-icon">\u25B6</span>
          Tested ${patternTests.length} pattern(s) - <em>click to show all</em>
        </div>`;
        gotoHTML += `<div class="step-content" id="${gotoPatternId}" style="display: none;">`;
        patternTests.forEach((test, i) => {
          gotoHTML += `
            <div class="pattern-test ${test.matched ? 'matched' : ''}" style="opacity: ${test.matched ? '1' : '0.6'};">
              <strong>${i + 1}.</strong> "${this.escapeHtml(test.pattern)}" ${test.matched ? '<span class="highlight">MATCH</span>' : '<span style="color: var(--text-secondary);">no match</span>'}
            </div>
          `;
        });
        gotoHTML += '</div>';
      } else if (patternTests.length === 1) {
        gotoHTML += `<div class="step-details">Pattern "*" matches any input</div>`;
      }
      gotoHTML += `</div>`; // Close Pattern Matching substep

      // Sub-step B: Decomposition
      if (targetCaptures.length > 0) {
        gotoHTML += `
          <div class="goto-substep" style="margin-bottom: 16px;">
            <div style="font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">\u21AA Decomposition</div>
            <div class="step-io">
              <div style="flex: 1;">
                <div class="io-label">Input</div>
                <div class="io-box">${this.escapeHtml(normalizedInput)}</div>
              </div>
              <div class="arrow">\u2192</div>
              <div style="flex: 1;">
                <div class="io-label">Captures</div>
                <div class="io-box">${targetCaptures.map((c, i) => `(${i + 1}): "${Array.isArray(c) ? c.join(' ') : c}"`).join(', ')}</div>
              </div>
            </div>
            <div class="step-details">Extracted ${targetCaptures.length} component(s)</div>
          </div>
        `;
      }

      // Sub-step C: Template Selection
      gotoHTML += `
          <div class="goto-substep">
            <div style="font-weight: 500; margin-bottom: 8px; font-size: 0.9rem;">\u21AA Template Selection</div>
            <div class="step-io">
              <div style="flex: 1;">
                <div class="io-label">${gotoData.targetTemplates.length} Available Response(s)</div>
                <select class="template-dropdown" id="goto-template-selector" style="width: 100%; padding: 10px; border: 2px solid var(--border-color); border-radius: 6px; font-size: 0.9rem; background: var(--surface-color); color: var(--text-primary); cursor: pointer;">
                  ${gotoData.targetTemplates.map((t, i) => `<option value="${i}" ${i === selectedIdx ? 'selected' : ''}>${this.escapeHtml(t)}</option>`).join('')}
                </select>
              </div>
              <div class="arrow">\u2192</div>
              <div style="flex: 1;">
                <div class="io-label">Selected Response</div>
                <div class="io-box" id="goto-selected-template">"${this.escapeHtml(finalTemplate)}"</div>
              </div>
            </div>
            <div class="step-details">Select a different response to see how it changes the final output</div>
          </div>
        </div>
      `;

      // Note about captures preservation
      if (captures.length > 0) {
        gotoHTML += `<div class="step-details" style="font-style: italic; margin-top: 12px;">
          Note: Original captures (${captures.length}) from the main pattern match are preserved and can be used in the selected response.
        </div>`;
      }

      gotoStep.innerHTML = gotoHTML;

      // Add event listener for the goto template selector
      const gotoSelector = document.getElementById('goto-template-selector');
      if (gotoSelector) {
        gotoSelector.addEventListener('change', (e) => this.handleGotoTemplateChange(e));
      }
    } else {
      // Remove goto resolution step if it exists
      if (gotoStep) {
        gotoStep.remove();
        this.updateStepNumbers();
      }
    }

    // Update Post-substitutions step
    if (postSubStep) {
      const inputBox = postSubStep.querySelector('.io-box');
      const outputBox = postSubStep.querySelectorAll('.io-box')[1];
      if (inputBox) inputBox.textContent = finalTemplate;
      if (outputBox) outputBox.textContent = finalResponse;
    }

    // Update final response
    const finalResponseContent = document.getElementById('final-response-content');
    if (finalResponseContent) {
      finalResponseContent.textContent = finalResponse;
    }
  }

  /**
   * Handle goto template dropdown change
   */
  handleGotoTemplateChange(e) {
    if (!this.engine) return;

    const selectedIndex = parseInt(e.target.value);

    // Re-resolve by looking at the current template selection
    const templateSelector = document.getElementById('breakdown-template-selector');
    if (!templateSelector) return;

    const templateStep = this.currentBreakdown.steps.find(s => s.name === 'Template Selection');
    if (!templateStep) return;

    const mainTemplate = templateStep.allTemplates[parseInt(templateSelector.value)];
    if (!mainTemplate.startsWith('goto ')) return;

    const rules = this.engine.rules;
    const patternMatcher = this.engine.patternMatcher;
    const postSubs = this.engine.postSubstitutions;

    let targetKeyword = mainTemplate.substring(5).trim();
    let targetRule = rules.find(r => r.keyword === targetKeyword);

    while (targetRule && targetRule.patterns && targetRule.patterns.length > 0) {
      const targetPattern = targetRule.patterns[0];
      const templates = targetPattern.responses;
      const selectedGotoTemplate = templates[selectedIndex];

      if (selectedGotoTemplate && selectedGotoTemplate.startsWith('goto ')) {
        targetKeyword = selectedGotoTemplate.substring(5).trim();
        targetRule = rules.find(r => r.keyword === targetKeyword);
      } else {
        // Found the final template - get captures
        const patternStep = this.currentBreakdown.steps.find(s => s.name === 'Pattern Matching');
        const captures = [];
        if (patternStep && patternStep.patternTests) {
          const matchedTest = patternStep.patternTests.find(t => t.matched);
          if (matchedTest && matchedTest.captures) {
            captures.push(...matchedTest.captures);
          }
        }

        // Assemble response
        let newResponse = selectedGotoTemplate;
        for (let i = 0; i < captures.length; i++) {
          const placeholder = `(${i + 1})`;
          if (newResponse.includes(placeholder)) {
            const captureText = Array.isArray(captures[i]) ? captures[i].join(' ') : captures[i];
            const { result } = patternMatcher.applyPostSubstitutions(captureText, postSubs);
            newResponse = newResponse.replace(placeholder, result);
          }
        }
        newResponse = newResponse.toUpperCase();

        // Update displays
        const selectedTemplateBox = document.getElementById('goto-selected-template');
        if (selectedTemplateBox) {
          selectedTemplateBox.textContent = `"${selectedGotoTemplate}"`;
        }

        // Update post-sub step
        const stepsDiv = this.getContainer();
        stepsDiv.querySelectorAll('.breakdown-step').forEach(stepEl => {
          const titleEl = stepEl.querySelector('.step-title');
          if (titleEl && titleEl.textContent === 'Post-substitutions & Assembly') {
            const inputBox = stepEl.querySelector('.io-box');
            const outputBox = stepEl.querySelectorAll('.io-box')[1];
            if (inputBox) inputBox.textContent = selectedGotoTemplate;
            if (outputBox) outputBox.textContent = newResponse;
          }
        });

        // Update final response
        const finalResponseContent = document.getElementById('final-response-content');
        if (finalResponseContent) {
          finalResponseContent.textContent = newResponse;
        }

        break;
      }
    }
  }
}
