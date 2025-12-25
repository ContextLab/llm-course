/**
 * Rule Editor - Live editing of ELIZA rules
 */

class RuleEditor {
  constructor(eliza) {
    this.eliza = eliza;
    this.editor = null;
    this.originalRules = null;
    this.isDirty = false;
  }

  /**
   * Initialize the editor
   */
  initialize(editorElement) {
    this.editor = editorElement;
    this.originalRules = JSON.stringify(this.eliza.getRulesAsJSON(), null, 2);
    this.editor.value = this.originalRules;
    this.applyCodeHighlighting();
  }

  /**
   * Apply basic syntax highlighting using a simpler approach
   */
  applyCodeHighlighting() {
    // For simplicity, we'll use a textarea with monospace font
    // Real syntax highlighting would require a library like CodeMirror
    this.editor.style.fontFamily = 'Monaco, Consolas, "Courier New", monospace';
    this.editor.style.fontSize = '14px';
    this.editor.style.lineHeight = '1.5';
    this.editor.style.tabSize = '2';
  }

  /**
   * Get current editor content
   */
  getContent() {
    return this.editor.value;
  }

  /**
   * Set editor content
   */
  setContent(content) {
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }
    this.editor.value = content;
    this.isDirty = content !== this.originalRules;
  }

  /**
   * Validate JSON syntax
   */
  validate() {
    try {
      const content = this.getContent();
      const parsed = JSON.parse(content);
      return { valid: true, data: parsed };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        line: this.getErrorLine(error)
      };
    }
  }

  /**
   * Extract line number from JSON parse error
   */
  getErrorLine(error) {
    const match = error.message.match(/position (\d+)/);
    if (match) {
      const position = parseInt(match[1]);
      const content = this.getContent();
      const lines = content.substring(0, position).split('\n');
      return lines.length;
    }
    return null;
  }

  /**
   * Apply changes to ELIZA engine
   */
  apply() {
    const validation = this.validate();

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        line: validation.line
      };
    }

    const result = this.eliza.updateRules(validation.data);

    if (result.success) {
      this.originalRules = this.getContent();
      this.isDirty = false;
    }

    return result;
  }

  /**
   * Reset to original rules
   */
  reset() {
    this.editor.value = this.originalRules;
    this.isDirty = false;
  }

  /**
   * Format JSON content
   */
  format() {
    const validation = this.validate();

    if (validation.valid) {
      this.setContent(validation.data);
      return { success: true };
    }

    return {
      success: false,
      error: validation.error
    };
  }

  /**
   * Export rules to file
   */
  export() {
    const validation = this.validate();

    if (!validation.valid) {
      return {
        success: false,
        error: 'Cannot export invalid JSON'
      };
    }

    const content = JSON.stringify(validation.data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eliza-rules.json';
    a.click();
    URL.revokeObjectURL(url);

    return { success: true };
  }

  /**
   * Import rules from file
   */
  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const parsed = JSON.parse(content);
          this.setContent(parsed);
          resolve({ success: true });
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      };

      reader.onerror = () => {
        reject({ success: false, error: 'Failed to read file' });
      };

      reader.readAsText(file);
    });
  }

  /**
   * Load template (predefined rule sets)
   */
  loadTemplate(template) {
    const templates = {
      minimal: {
        preSubstitutions: {},
        postSubstitutions: {
          "i": "you",
          "you": "I",
          "my": "your",
          "your": "my"
        },
        synonyms: {},
        quitWords: ["bye", "goodbye"],
        initialGreetings: ["Hello. How are you?"],
        fallbacks: ["Tell me more.", "I see.", "Go on."],
        rules: [
          {
            keyword: "hello",
            rank: 1,
            patterns: [
              {
                pattern: "*",
                responses: ["Hello! How can I help you?", "Hi there!"]
              }
            ]
          },
          {
            keyword: "i",
            rank: 1,
            patterns: [
              {
                pattern: "* i feel *",
                responses: ["Why do you feel (2)?", "Tell me more about feeling (2)."]
              },
              {
                pattern: "* i * you *",
                responses: ["Why do you (2) me?", "What makes you (2) me?"]
              }
            ]
          }
        ]
      },
      therapeutic: {
        preSubstitutions: {},
        postSubstitutions: {
          "i": "you",
          "you": "I",
          "my": "your",
          "your": "my",
          "am": "are",
          "are": "am"
        },
        synonyms: {
          "family": ["mother", "father", "sister", "brother"],
          "sad": ["depressed", "unhappy", "miserable"]
        },
        quitWords: ["bye", "goodbye"],
        initialGreetings: ["Hello. I'm here to listen. What's on your mind?"],
        fallbacks: ["Can you elaborate?", "How does that make you feel?"],
        rules: [
          {
            keyword: "mother",
            rank: 5,
            patterns: [
              {
                pattern: "* my mother *",
                responses: [
                  "Tell me more about your mother.",
                  "How is your relationship with your mother?",
                  "What role does your mother play in your life?"
                ]
              }
            ]
          },
          {
            keyword: "sad",
            rank: 3,
            patterns: [
              {
                pattern: "* i am sad *",
                responses: [
                  "I'm sorry you're feeling sad. What's making you feel this way?",
                  "When did you start feeling sad?",
                  "Can you tell me more about your sadness?"
                ]
              }
            ]
          }
        ]
      }
    };

    if (templates[template]) {
      this.setContent(templates[template]);
      return { success: true };
    }

    return { success: false, error: 'Template not found' };
  }

  /**
   * Check if editor has unsaved changes
   */
  hasUnsavedChanges() {
    return this.isDirty;
  }

  /**
   * Add a new rule to the editor
   */
  addRule(keyword, pattern, responses) {
    const validation = this.validate();

    if (!validation.valid) {
      return { success: false, error: 'Fix syntax errors before adding rules' };
    }

    const rules = validation.data;

    // Add new rule
    rules.rules.push({
      keyword: keyword,
      rank: 1,
      patterns: [
        {
          pattern: pattern,
          responses: responses
        }
      ]
    });

    this.setContent(rules);
    return { success: true };
  }

  /**
   * Get statistics about current rules
   */
  getStatistics() {
    const validation = this.validate();

    if (!validation.valid) {
      return null;
    }

    const data = validation.data;
    let totalPatterns = 0;
    let totalResponses = 0;

    for (const rule of data.rules || []) {
      totalPatterns += rule.patterns.length;
      for (const pattern of rule.patterns) {
        totalResponses += pattern.responses.length;
      }
    }

    return {
      ruleCount: (data.rules || []).length,
      patternCount: totalPatterns,
      responseCount: totalResponses,
      preSubCount: Object.keys(data.preSubstitutions || {}).length,
      postSubCount: Object.keys(data.postSubstitutions || {}).length,
      synonymCount: Object.keys(data.synonyms || {}).length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RuleEditor;
}
