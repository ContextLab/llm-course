/**
 * Pattern Matcher - Handles pattern matching and decomposition for ELIZA
 */

export class PatternMatcher {
  constructor() {
    this.debugMode = false;
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
        result = result.replace(regex, to);
        steps.push({ from, to, before: oldResult, after: result });
      }
    }

    return { result, steps };
  }

  /**
   * Apply post-substitutions to text (for reflection)
   */
  applyPostSubstitutions(text, substitutions) {
    let result = ' ' + text + ' ';
    const steps = [];

    // Create sorted list by length (longer first to avoid partial matches)
    const sortedSubs = Object.entries(substitutions).sort((a, b) => b[0].length - a[0].length);

    for (const [from, to] of sortedSubs) {
      const regex = new RegExp('\\b' + from + '\\b', 'gi');
      if (regex.test(result)) {
        const oldResult = result;
        result = result.replace(regex, to);
        steps.push({ from, to, before: oldResult.trim(), after: result.trim() });
      }
    }

    return { result: result.trim(), steps };
  }

  /**
   * Expand synonyms in pattern
   */
  expandSynonyms(pattern, synonyms) {
    let expanded = pattern;
    const regex = /@(\w+)/g;
    let match;

    while ((match = regex.exec(pattern)) !== null) {
      const synKey = match[1];
      if (synonyms[synKey]) {
        const alternatives = synonyms[synKey].join('|');
        expanded = expanded.replace(match[0], `(${alternatives})`);
      }
    }

    return expanded;
  }

  /**
   * Convert ELIZA pattern to regex
   */
  patternToRegex(pattern, synonyms) {
    // Expand synonyms first
    let regexPattern = this.expandSynonyms(pattern, synonyms);

    // Escape special regex characters except * and ()
    regexPattern = regexPattern.replace(/[.+?^${}[\]\\|]/g, '\\$&');

    // Convert ELIZA wildcards to regex
    // * matches any sequence of words
    regexPattern = regexPattern.replace(/\*/g, '(.*)');

    // Add anchors
    regexPattern = '^' + regexPattern + '$';

    return new RegExp(regexPattern, 'i');
  }

  /**
   * Match input against pattern and extract components
   */
  matchPattern(input, pattern, synonyms) {
    const regex = this.patternToRegex(pattern, synonyms);
    const match = input.match(regex);

    if (match) {
      const captures = match.slice(1).map(g => (g || '').trim());
      return {
        matched: true,
        captures,
        pattern,
        regex: regex.toString()
      };
    }

    return { matched: false, pattern, regex: regex.toString() };
  }

  /**
   * Find best matching rule for input
   */
  findMatchingRule(input, rules, synonyms) {
    // Split and clean words, removing punctuation
    const words = input.toLowerCase()
      .replace(/[.,!?;:]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
    const matchedRules = [];

    // Find all rules with keywords present in input
    for (const rule of rules) {
      const keyword = rule.keyword.toLowerCase();
      if (words.includes(keyword)) {
        matchedRules.push(rule);
      }
    }

    // Sort by rank (higher rank = higher priority)
    matchedRules.sort((a, b) => (b.rank || 0) - (a.rank || 0));

    // Try to match patterns for each rule
    for (const rule of matchedRules) {
      for (const patternObj of rule.patterns) {
        const matchResult = this.matchPattern(input, patternObj.pattern, synonyms);

        if (matchResult.matched) {
          return {
            rule,
            pattern: patternObj,
            matchResult,
            allTestedRules: matchedRules
          };
        }
      }
    }

    // No keyword matched, try catch-all patterns
    for (const rule of rules) {
      for (const patternObj of rule.patterns) {
        if (patternObj.pattern === '*') {
          const matchResult = this.matchPattern(input, patternObj.pattern, synonyms);
          return {
            rule,
            pattern: patternObj,
            matchResult,
            allTestedRules: []
          };
        }
      }
    }

    return null;
  }

  /**
   * Assemble response from template and captures
   */
  assembleResponse(template, captures, postSubstitutions) {
    let response = template;
    const lowercaseMarkers = [];

    // Replace (1), (2), etc. with captured groups
    for (let i = 0; i < captures.length; i++) {
      const placeholder = `(${i + 1})`;
      if (response.includes(placeholder)) {
        // Apply post-substitutions to captured text
        const { result } = this.applyPostSubstitutions(captures[i], postSubstitutions);

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

    // Step 2: Keyword detection
    // Split and clean words, removing punctuation
    const words = processedInput.toLowerCase()
      .replace(/[.,!?;:]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
    const keywordsFound = [];
    const keywordsNotFound = [];

    for (const rule of rules) {
      const keyword = rule.keyword.toLowerCase();
      if (words.includes(keyword)) {
        keywordsFound.push({ keyword, rank: rule.rank || 0, rule });
      } else {
        keywordsNotFound.push(keyword);
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

    // Step 3: Pattern matching
    const patternTests = [];
    let matchedRule = null;
    let matchedPattern = null;
    let matchResult = null;

    // Test each keyword's patterns
    for (const { keyword, rule } of keywordsFound) {
      for (const patternObj of rule.patterns) {
        const result = this.matchPattern(processedInput, patternObj.pattern, synonyms);
        patternTests.push({
          keyword,
          pattern: patternObj.pattern,
          matched: result.matched,
          regex: result.regex,
          captures: result.captures
        });

        if (result.matched && !matchedRule) {
          matchedRule = rule;
          matchedPattern = patternObj;
          matchResult = result;
        }
      }
    }

    // If no keyword matched, try fallback patterns
    if (!matchedRule) {
      for (const rule of rules) {
        for (const patternObj of rule.patterns) {
          if (patternObj.pattern === '*') {
            const result = this.matchPattern(processedInput, patternObj.pattern, synonyms);
            patternTests.push({
              keyword: rule.keyword,
              pattern: patternObj.pattern,
              matched: result.matched,
              regex: result.regex,
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
          ? matchResult.captures.map((c, i) => `(${i + 1}): "${c}"`).join(', ')
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
          const capture = matchResult.captures[i];
          const { result: reflected, steps } = this.applyPostSubstitutions(capture, postSubstitutions);

          if (steps.length > 0) {
            postSubSteps.push({
              capture: i + 1,
              original: capture,
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
