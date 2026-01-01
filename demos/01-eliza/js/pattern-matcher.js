/**
 * Pattern Matcher - Handles pattern matching and decomposition for ELIZA
 */

export class PatternMatcher {
  constructor() {
    this.debugMode = false;
    // Punctuation that splits input - matches Python solution exactly
    // 'but' is treated as a clause separator (like the Python solution)
    this.punctuation = [',', ':', ';', '!', '.', '?', 'but'];
  }

  /**
   * Strip punctuation characters from a word
   */
  stripPunctuation(word) {
    return word.replace(/[,:;!.?]/g, '');
  }

  /**
   * Parse punctuation: truncate at first punctuation occurrence
   * Following the Python solution's parse_punctuation method
   */
  parsePunctuation(words) {
    const result = [];
    for (const word of words) {
      // Check if word is a punctuation separator (like 'but')
      if (this.punctuation.includes(word.toLowerCase())) {
        break;
      }
      // Check if word contains punctuation - strip it and potentially stop
      const stripped = this.stripPunctuation(word);
      if (stripped) {
        result.push(stripped);
      }
      // If word ended with punctuation, stop processing
      if (word !== stripped && /[,:;!.?]$/.test(word)) {
        break;
      }
    }
    return result;
  }

  /**
   * Split input into clauses at punctuation separators
   * Returns array of clause strings
   */
  splitIntoClauses(input) {
    const clauses = [];
    let currentClause = [];
    const words = input.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    for (const word of words) {
      // Check if word is a punctuation separator (like 'but')
      if (this.punctuation.includes(word.toLowerCase())) {
        if (currentClause.length > 0) {
          clauses.push(currentClause.map(w => this.stripPunctuation(w)).filter(w => w).join(' '));
          currentClause = [];
        }
        continue;
      }
      
      currentClause.push(word);
      
      // If word ends with punctuation, end this clause
      if (/[,:;!.?]$/.test(word)) {
        clauses.push(currentClause.map(w => this.stripPunctuation(w)).filter(w => w).join(' '));
        currentClause = [];
      }
    }
    
    // Don't forget the last clause
    if (currentClause.length > 0) {
      clauses.push(currentClause.map(w => this.stripPunctuation(w)).filter(w => w).join(' '));
    }
    
    return clauses;
  }

  /**
   * Apply pre-substitutions to input text
   */
  applyPreSubstitutions(text, substitutions) {
    let result = text.toLowerCase();
    const steps = [];

    for (const [from, to] of Object.entries(substitutions)) {
      const regex = new RegExp('\\b' + from + '\\b', 'gi');
      if (regex.test(result)) {
        const oldResult = result;
        // Handle array replacements (e.g., "i'm" → ["i", "am"])
        const replacement = Array.isArray(to) ? to.join(' ') : to;
        result = result.replace(regex, replacement);
        steps.push({ from, to: replacement, before: oldResult, after: result });
      }
    }

    return { result, steps };
  }

  /**
   * Apply post-substitutions to text (for reflection)
   * Uses placeholder markers to prevent bidirectional substitution conflicts
   */
  applyPostSubstitutions(text, substitutions) {
    let result = ' ' + text + ' ';
    const steps = [];

    // Create sorted list by length (longer first to avoid partial matches)
    const sortedSubs = Object.entries(substitutions).sort((a, b) => b[0].length - a[0].length);

    // Use placeholders to avoid bidirectional conflicts (e.g., "you" -> "me" and "me" -> "you")
    const placeholders = new Map();
    let placeholderIndex = 0;

    for (const [from, to] of sortedSubs) {
      const regex = new RegExp('\\b' + from + '\\b', 'gi');
      if (regex.test(result)) {
        const oldResult = result;
        // Use a unique placeholder that won't match any substitution pattern
        const placeholder = `__POSTSUB_${placeholderIndex++}__`;
        // Handle array replacements (e.g., "i'm" → ["you", "are"])
        const replacement = Array.isArray(to) ? to.join(' ') : to;
        placeholders.set(placeholder, replacement);
        result = result.replace(regex, placeholder);
        steps.push({ from, to: replacement, before: oldResult.trim(), after: result.trim() });
      }
    }

    // Now replace all placeholders with their final values
    for (const [placeholder, value] of placeholders) {
      result = result.split(placeholder).join(value);
    }

    return { result: result.trim(), steps };
  }

  /**
   * Check if a word matches a pattern part (handles @synonyms)
   */
  matchWord(word, patternPart, synonyms) {
    word = word.toLowerCase();

    if (patternPart === '*') {
      return 'wildcard';
    }

    if (patternPart.startsWith('@')) {
      // Synonym match
      const synKey = patternPart.substring(1);
      if (synonyms[synKey]) {
        // Check if word matches the synonym group name or any synonym
        if (word === synKey || synonyms[synKey].includes(word)) {
          return 'synonym';
        }
      }
      return false;
    }

    // Exact match
    if (word === patternPart.toLowerCase()) {
      return 'exact';
    }

    return false;
  }

  /**
   * Word-based pattern matching (like Python implementation)
   * Pattern parts: ['*', 'i', 'am', '*', '@sad', '*']
   * Input words: ['i', 'am', 'unhappy']
   * Returns: { matched: true, captures: [[], [], ['unhappy'], []] }
   */
  matchPattern(input, pattern, synonyms) {
    // Split input into words, preserving punctuation for now
    const rawWords = input.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0);

    // Strip punctuation from each word for matching purposes
    const inputWords = rawWords.map(w => this.stripPunctuation(w))
      .filter(w => w.length > 0);

    // Split pattern into parts
    const patternParts = pattern.toLowerCase()
      .split(/\s+/)
      .filter(p => p.length > 0);

    // Use recursive matching
    const result = this._matchHelper(inputWords, patternParts, synonyms);

    if (result.matched) {
      return {
        matched: true,
        captures: result.captures,
        pattern,
        patternParts
      };
    }

    return { matched: false, pattern, patternParts };
  }

  /**
   * Recursive helper for word-based pattern matching
   */
  _matchHelper(words, parts, synonyms) {
    // Base case: no more pattern parts
    if (parts.length === 0) {
      // Match only if no more words either
      return { matched: words.length === 0, captures: [] };
    }

    const [currentPart, ...remainingParts] = parts;

    if (currentPart === '*') {
      // Wildcard: try matching 0, 1, 2, ... words
      // Try shortest match first (greedy would cause issues)
      for (let i = 0; i <= words.length; i++) {
        const capturedWords = words.slice(0, i);
        const remainingWords = words.slice(i);

        const result = this._matchHelper(remainingWords, remainingParts, synonyms);
        if (result.matched) {
          return {
            matched: true,
            captures: [capturedWords, ...result.captures]
          };
        }
      }
      return { matched: false, captures: [] };
    }

    // Non-wildcard: must match the first word
    if (words.length === 0) {
      return { matched: false, captures: [] };
    }

    const [currentWord, ...remainingWords] = words;
    const matchType = this.matchWord(currentWord, currentPart, synonyms);

    if (matchType) {
      const result = this._matchHelper(remainingWords, remainingParts, synonyms);
      if (result.matched) {
        // For synonym matches, capture the matched word
        if (matchType === 'synonym') {
          return {
            matched: true,
            captures: [[currentWord], ...result.captures]
          };
        }
        // For exact matches, don't capture
        return {
          matched: true,
          captures: result.captures
        };
      }
    }

    return { matched: false, captures: [] };
  }

  /**
   * Find best matching rule for input
   */
  findMatchingRule(input, rules, synonyms) {
    // Build a map of keyword -> rule for quick lookup
    const rulesByKeyword = new Map();
    for (const rule of rules) {
      rulesByKeyword.set(rule.keyword.toLowerCase(), rule);
    }

    // Split input into clauses at punctuation (matching Python behavior)
    const clauses = this.splitIntoClauses(input);

    // Process each clause in order - find keywords and match patterns per clause
    for (const clause of clauses) {
      if (!clause.trim()) continue;

      // Get words from this clause for keyword detection
      const clauseWords = clause.toLowerCase().split(/\s+/).filter(w => w.length > 0);

      // Find keywords in this clause
      const matchedRules = [];
      const seenKeywords = new Set();

      for (const word of clauseWords) {
        const rule = rulesByKeyword.get(word);
        if (rule && !seenKeywords.has(word)) {
          matchedRules.push(rule);
          seenKeywords.add(word);
        }
      }

      if (matchedRules.length === 0) continue;

      // Sort by rank (higher rank = higher priority)
      matchedRules.sort((a, b) => (b.rank || 0) - (a.rank || 0));

      // Try to match patterns for each rule (in rank order)
      // Use THIS CLAUSE for pattern matching (not the full input)
      for (const rule of matchedRules) {
        // First try specific patterns
        for (const patternObj of rule.patterns) {
          let patternStr = patternObj.pattern;
          let shouldSave = false;

          // Check for memory save flag ($)
          if (patternStr.startsWith("$")) {
            shouldSave = true;
            patternStr = patternStr.substring(1).trim();
          }

          if (patternStr === "*") continue;

          const matchResult = this.matchPattern(clause, patternStr, synonyms);

          if (matchResult.matched) {
            return {
              rule,
              pattern: patternObj,
              matchResult,
              allTestedRules: matchedRules,
              shouldSave
            };
          }
        }

        // Then try catch-all for this rule
        for (const patternObj of rule.patterns) {
          let patternStr = patternObj.pattern;
          let shouldSave = false;

          // Check for memory save flag ($)
          if (patternStr.startsWith("$")) {
            shouldSave = true;
            patternStr = patternStr.substring(1).trim();
          }

          if (patternStr === "*") {
            const matchResult = this.matchPattern(clause, patternStr, synonyms);
            if (matchResult.matched) {
              return {
                rule,
                pattern: patternObj,
                matchResult,
                allTestedRules: matchedRules,
                shouldSave
              };
            }
          }
        }
      }
    }

    // No keyword matched in any clause
    return null;
  }


  /**
   * Assemble response from template and captures
   * Captures are now arrays of words (from word-based matching)
   */
  assembleResponse(template, captures, postSubstitutions) {
    let response = template;
    const lowercaseMarkers = [];

    // Replace (1), (2), etc. with captured groups
    for (let i = 0; i < captures.length; i++) {
      const placeholder = `(${i + 1})`;
      if (response.includes(placeholder)) {
        // Convert capture (array of words) to string
        const captureText = Array.isArray(captures[i])
          ? captures[i].join(' ')
          : captures[i];

        // Apply post-substitutions to captured text
        const { result } = this.applyPostSubstitutions(captureText, postSubstitutions);

        // Use a temporary marker to preserve the text that should stay lowercase
        const marker = `__CAPTURE_${i}__`;
        lowercaseMarkers.push({ marker, text: result });
        response = response.replace(placeholder, marker);
      }
    }

    return { response, lowercaseMarkers };
  }

  /**
   * Get detailed processing breakdown for visualization
   */
  getProcessingBreakdown(input, rules, preSubstitutions, postSubstitutions, synonyms) {
    const breakdown = {
      originalInput: input,
      steps: []
    };

    // Step 1: Pre-substitutions
    const preSubResult = this.applyPreSubstitutions(input, preSubstitutions);
    breakdown.steps.push({
      name: 'Pre-substitutions',
      description: 'Converting input to canonical form',
      input: input,
      output: preSubResult.result,
      details: preSubResult.steps.length > 0
        ? preSubResult.steps.map(s => `"${s.from}" → "${s.to}"`).join(', ')
        : 'No substitutions needed'
    });

    const processedInput = preSubResult.result;

    // Step 2: Keyword detection (using input word order)
    // Split and clean words, removing punctuation
    const words = processedInput.toLowerCase()
      .replace(/[.,!?;:]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);

    // Build a map of keyword -> rule for quick lookup
    const rulesByKeyword = new Map();
    for (const rule of rules) {
      rulesByKeyword.set(rule.keyword.toLowerCase(), rule);
    }

    // Find keywords by iterating through INPUT words
    const keywordsFound = [];
    const seenKeywords = new Set();

    for (const word of words) {
      const rule = rulesByKeyword.get(word);
      if (rule && !seenKeywords.has(word)) {
        keywordsFound.push({ keyword: rule.keyword.toLowerCase(), rank: rule.rank || 0, rule });
        seenKeywords.add(word);
      }
    }

    keywordsFound.sort((a, b) => b.rank - a.rank);

    breakdown.steps.push({
      name: 'Keyword Detection',
      description: 'Finding relevant keywords in input',
      input: processedInput,
      output: keywordsFound.map(k => `"${k.keyword}" (rank: ${k.rank})`).join(', ') || 'No keywords found',
      details: `Found ${keywordsFound.length} keyword(s), testing in priority order`
    });

    // Step 3: Pattern matching (specific patterns first, then catch-all)
    const patternTests = [];
    let matchedRule = null;
    let matchedPattern = null;
    let matchResult = null;

    // First pass: try specific patterns (not catch-all '*')
    for (const { keyword, rule } of keywordsFound) {
      for (const patternObj of rule.patterns) {
        if (patternObj.pattern === '*') continue;

        const result = this.matchPattern(processedInput, patternObj.pattern, synonyms);
        patternTests.push({
          keyword,
          pattern: patternObj.pattern,
          matched: result.matched,
          captures: result.captures
        });

        if (result.matched && !matchedRule) {
          matchedRule = rule;
          matchedPattern = patternObj;
          matchResult = result;
        }
      }

      // Then try catch-all for this keyword
      for (const patternObj of rule.patterns) {
        if (patternObj.pattern !== '*') continue;

        const result = this.matchPattern(processedInput, patternObj.pattern, synonyms);
        patternTests.push({
          keyword,
          pattern: patternObj.pattern,
          matched: result.matched,
          captures: result.captures
        });

        if (result.matched && !matchedRule) {
          matchedRule = rule;
          matchedPattern = patternObj;
          matchResult = result;
        }
      }
    }

    // If no keyword matched, try catch-all patterns from any rule
    if (!matchedRule) {
      for (const rule of rules) {
        for (const patternObj of rule.patterns) {
          if (patternObj.pattern === '*') {
            const result = this.matchPattern(processedInput, patternObj.pattern, synonyms);
            patternTests.push({
              keyword: rule.keyword,
              pattern: patternObj.pattern,
              matched: result.matched,
              captures: result.captures
            });

            if (result.matched && !matchedRule) {
              matchedRule = rule;
              matchedPattern = patternObj;
              matchResult = result;
            }
          }
        }
      }
    }

    breakdown.steps.push({
      name: 'Pattern Matching',
      description: 'Testing patterns until one matches',
      input: processedInput,
      output: matchedPattern ? `Pattern: "${matchedPattern.pattern}"` : 'No pattern matched',
      details: `Tested ${patternTests.length} pattern(s)`,
      patternTests
    });

    // Step 4: Decomposition (capture groups)
    if (matchResult && matchResult.captures) {
      breakdown.steps.push({
        name: 'Decomposition',
        description: 'Extracting parts from input',
        input: processedInput,
        output: matchResult.captures.length > 0
          ? matchResult.captures.map((c, i) => `(${i + 1}): "${Array.isArray(c) ? c.join(' ') : c}"`).join(', ')
          : 'No captures',
        details: `Extracted ${matchResult.captures.length} component(s)`
      });
    }

    // Step 5: Response template selection
    const selectedTemplate = matchedPattern
      ? matchedPattern.responses[Math.floor(Math.random() * matchedPattern.responses.length)]
      : null;

    if (selectedTemplate) {
      breakdown.steps.push({
        name: 'Template Selection',
        description: 'Choosing a response template',
        input: `${matchedPattern.responses.length} available template(s)`,
        output: `"${selectedTemplate}"`,
        details: 'Selected randomly from available templates'
      });
    }

    // Step 6: Assembly with post-substitutions
    if (selectedTemplate && matchResult) {
      const postSubSteps = [];
      let assembledResponse = selectedTemplate;

      // Replace captures
      for (let i = 0; i < matchResult.captures.length; i++) {
        const placeholder = `(${i + 1})`;
        if (assembledResponse.includes(placeholder)) {
          // Convert capture (array of words) to string
          const capture = matchResult.captures[i];
          const captureText = Array.isArray(capture) ? capture.join(' ') : capture;
          const { result: reflected, steps } = this.applyPostSubstitutions(captureText, postSubstitutions);

          if (steps.length > 0) {
            postSubSteps.push({
              capture: i + 1,
              original: captureText,
              reflected,
              substitutions: steps
            });
          }

          assembledResponse = assembledResponse.replace(placeholder, reflected);
        }
      }

      // Convert to uppercase to match original ELIZA behavior
      const uppercaseResponse = assembledResponse.toUpperCase();

      breakdown.steps.push({
        name: 'Post-substitutions & Assembly',
        description: 'Reflecting pronouns and assembling final response',
        input: selectedTemplate,
        output: uppercaseResponse,
        details: postSubSteps.length > 0
          ? `Applied ${postSubSteps.length} reflection(s)`
          : 'No post-substitutions needed',
        postSubSteps
      });

      breakdown.finalResponse = uppercaseResponse;
    }

    breakdown.matchedRule = matchedRule;
    breakdown.matchedPattern = matchedPattern;

    return breakdown;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PatternMatcher;
}
