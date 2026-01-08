/**
 * ELIZA Engine - Main chatbot logic
 */

import { PatternMatcher } from './pattern-matcher.js';

export class ElizaEngine {
  constructor() {
    this.patternMatcher = new PatternMatcher();
    this.rules = null;
    this.preSubstitutions = {};
    this.postSubstitutions = {};
    this.synonyms = {};
    this.quitWords = [];
    this.initialGreetings = [];
    this.finalGreetings = [];
    this.fallbacks = [];
    this.conversationHistory = [];
    this.memoryStack = [];
    this.responseIndices = {}; // Track which response to use next for each pattern
  }

  /**
   * Load rules from JSON data
   */
  async loadRules(rulesData) {
    if (typeof rulesData === 'string') {
      // Assume it's a URL or path
      const response = await fetch(rulesData);
      rulesData = await response.json();
    }

    this.preSubstitutions = rulesData.preSubstitutions || {};
    this.postSubstitutions = rulesData.postSubstitutions || {};
    this.synonyms = rulesData.synonyms || {};
    this.quitWords = rulesData.quitWords || [];
    this.initialGreetings = rulesData.initialGreetings || ['Hello.'];
    this.finalGreetings = rulesData.finalGreetings || ['Goodbye.'];
    this.fallbacks = rulesData.fallbacks || ['Please go on.'];
    this.rules = rulesData.rules || [];

    return true;
  }

  /**
   * Get initial greeting
   */
  getGreeting() {
    let greeting = this.initialGreetings[Math.floor(Math.random() * this.initialGreetings.length)];
    greeting = greeting.replace(/\s+([.!?,;:])/g, '$1');
    this.conversationHistory.push({
      type: 'bot',
      text: greeting,
      timestamp: Date.now()
    });
    return greeting;
  }

  /**
   * Check if input is a quit command
   */
  isQuitWord(input) {
    const normalized = input.toLowerCase().trim();
    return this.quitWords.includes(normalized);
  }

  /**
   * Get response for user input
   */
  getResponse(userInput, saveOverride = false) {
    // Add to conversation history
    this.conversationHistory.push({
      type: 'user',
      text: userInput,
      timestamp: Date.now()
    });

    if (this.isQuitWord(userInput)) {
      let farewell = this.finalGreetings[Math.floor(Math.random() * this.finalGreetings.length)];
      farewell = farewell.replace(/\s+([.!?,;:])/g, '$1');
      this.conversationHistory.push({
        type: 'bot',
        text: farewell,
        timestamp: Date.now()
      });
      return {
        response: farewell,
        isQuit: true
      };
    }

    // Apply pre-substitutions
    const { result: processedInput } = this.patternMatcher.applyPreSubstitutions(
      userInput,
      this.preSubstitutions
    );

    // Find matching rule
    const match = this.patternMatcher.findMatchingRule(
      processedInput,
      this.rules,
      this.synonyms
    );

    let response;
    let matchInfo = null;

    if (match && match.pattern) {
      // Get next response for this pattern (cycling through them)
      const patternKey = `${match.rule.keyword}:${match.pattern.pattern}`;
      if (!this.responseIndices[patternKey]) {
        this.responseIndices[patternKey] = 0;
      }

      const responseIndex = this.responseIndices[patternKey];
      let template = match.pattern.responses[responseIndex];

      // Cycle to next response
      this.responseIndices[patternKey] =
        (responseIndex + 1) % match.pattern.responses.length;

      // Handle "goto" statements
      if (template.startsWith('goto ')) {
        const targetKeyword = template.substring(5).trim();
        const targetRule = this.rules.find(r => r.keyword === targetKeyword);

        if (targetRule && targetRule.patterns && targetRule.patterns.length > 0) {
          // Use the first pattern's responses from the target rule
          const targetPattern = targetRule.patterns[0];
          const targetPatternKey = `${targetRule.keyword}:${targetPattern.pattern}`;

          if (!this.responseIndices[targetPatternKey]) {
            this.responseIndices[targetPatternKey] = 0;
          }

          const targetResponseIndex = this.responseIndices[targetPatternKey];
          template = targetPattern.responses[targetResponseIndex];

          // Cycle the target's response index
          this.responseIndices[targetPatternKey] =
            (targetResponseIndex + 1) % targetPattern.responses.length;
        }
      }

      // Assemble response
      const assembled = this.patternMatcher.assembleResponse(
        template,
        match.matchResult.captures || [],
        this.postSubstitutions
      );

      // Format response: sentence case (capitalize first letter)
      response = assembled.response;

      // Replace markers with captured text
      for (const { marker, text } of assembled.lowercaseMarkers) {
        // Clean captured text: truncate at first punctuation, remove trailing punctuation
        let cleanedText = text.split(/[.!?,;:]/)[0].trim();
        cleanedText = cleanedText.replace(/[.!?,;:]+$/, '').trim();
        response = response.replace(marker, cleanedText);
      }

      // Clean up punctuation: remove double punctuation like ".?" or ".."
      response = response.replace(/([.!?])[.!?]+/g, '$1');
      response = response.replace(/\s+([.!?,;:])/g, '$1');

      // Ensure sentence case: first letter uppercase, rest as-is
      response = response.charAt(0).toUpperCase() + response.slice(1);

      matchInfo = {
        keyword: match.rule.keyword,
        pattern: match.pattern.pattern,
        rank: match.rule.rank,
        template,
        captures: match.matchResult.captures
      };

      // Save to memory if flagged and not overridden
      if (match.shouldSave && !saveOverride) {
        this.memoryStack.push(userInput);
        // Ensure memory stack doesn't grow indefinitely (keep last 20)
        if (this.memoryStack.length > 20) {
          this.memoryStack.shift();
        }
      }
    } else {
      // No match found

      // Step 7: Try to use memory if available (matching Python solution)
      if (this.memoryStack.length > 0) {
        const memory = this.memoryStack.pop();
        // Recursively call getResponse with the memory, forcing saveOverride=true
        const memoryResponse = this.getResponse(memory, true);

        // Return the response generated from memory
        // We use the same match info but note it came from memory
        if (memoryResponse.matchInfo) {
          memoryResponse.matchInfo.fromMemory = true;
        }
        return memoryResponse;
      }

      // Step 8: Use xnone keyword as fallback (matching Python solution exactly)
      // The Python solution does: words = self.respond('xnone')
      const xnoneRule = this.rules.find(r => r.keyword === 'xnone');
      if (xnoneRule && xnoneRule.patterns && xnoneRule.patterns.length > 0) {
        const xnonePattern = xnoneRule.patterns[0];
        const patternKey = 'xnone:*';

        if (!this.responseIndices[patternKey]) {
          this.responseIndices[patternKey] = 0;
        }

        const responseIndex = this.responseIndices[patternKey];
        response = xnonePattern.responses[responseIndex];

        // Cycle to next response
        this.responseIndices[patternKey] =
          (responseIndex + 1) % xnonePattern.responses.length;

        matchInfo = {
          keyword: 'xnone',
          pattern: '*',
          rank: 0,
          template: response,
          captures: []
        };
      } else {
        // Ultimate fallback if xnone rule is missing
        response = this.fallbacks[Math.floor(Math.random() * this.fallbacks.length)];
        matchInfo = {
          keyword: 'fallback',
          pattern: 'none',
          rank: 0,
          template: response,
          captures: []
        };
      }
    }

    // Add to conversation history
    this.conversationHistory.push({
      type: 'bot',
      text: response,
      timestamp: Date.now(),
      matchInfo
    });

    return {
      response,
      matchInfo,
      isQuit: false
    };
  }

  /**
   * Get detailed breakdown for visualization
   */
  getDetailedBreakdown(userInput) {
    return this.patternMatcher.getProcessingBreakdown(
      userInput,
      this.rules,
      this.preSubstitutions,
      this.postSubstitutions,
      this.synonyms,
      this.memoryStack
    );
  }

  /**
   * Reset conversation
   */
  reset() {
    this.conversationHistory = [];
    this.memoryStack = [];
    this.responseIndices = {};
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Get current memory stack (for UI display)
   */
  getMemoryStack() {
    return [...this.memoryStack];
  }

  /**
   * Clear memory stack
   */
  clearMemory() {
    this.memoryStack = [];
  }

  /**
   * Save input to memory stack (for breakdown tab integration)
   */
  saveToMemory(input) {
    this.memoryStack.push(input);
  }

  /**
   * Export conversation
   */
  exportConversation() {
    return {
      timestamp: Date.now(),
      messages: this.conversationHistory,
      messageCount: this.conversationHistory.length
    };
  }

  /**
   * Update rules dynamically (for rule editor)
   */
  updateRules(newRulesData) {
    try {
      // Validate the structure
      if (!newRulesData.rules || !Array.isArray(newRulesData.rules)) {
        throw new Error('Invalid rules structure: missing rules array');
      }

      // Validate each rule
      for (const rule of newRulesData.rules) {
        if (!rule.keyword) {
          throw new Error('Rule missing keyword');
        }
        if (!rule.patterns || !Array.isArray(rule.patterns)) {
          throw new Error(`Rule "${rule.keyword}" missing patterns array`);
        }
        for (const pattern of rule.patterns) {
          if (!pattern.pattern) {
            throw new Error(`Pattern in rule "${rule.keyword}" missing pattern string`);
          }
          if (!pattern.responses || !Array.isArray(pattern.responses)) {
            throw new Error(`Pattern "${pattern.pattern}" missing responses array`);
          }
        }
      }

      // Update all rule components
      this.preSubstitutions = newRulesData.preSubstitutions || this.preSubstitutions;
      this.postSubstitutions = newRulesData.postSubstitutions || this.postSubstitutions;
      this.synonyms = newRulesData.synonyms || this.synonyms;
      this.quitWords = newRulesData.quitWords || this.quitWords;
      this.initialGreetings = newRulesData.initialGreetings || this.initialGreetings;
      this.finalGreetings = newRulesData.finalGreetings || this.finalGreetings;
      this.fallbacks = newRulesData.fallbacks || this.fallbacks;
      this.rules = newRulesData.rules;

      // Reset response indices when rules change
      this.responseIndices = {};

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current rules as JSON
   */
  getRulesAsJSON() {
    return {
      preSubstitutions: this.preSubstitutions,
      postSubstitutions: this.postSubstitutions,
      synonyms: this.synonyms,
      quitWords: this.quitWords,
      initialGreetings: this.initialGreetings,
      finalGreetings: this.finalGreetings,
      fallbacks: this.fallbacks,
      rules: this.rules
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElizaEngine;
}
