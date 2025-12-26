# ALICE Full - Recommended Fixes Implementation Guide

This document provides detailed implementation guidance for fixing the issues found in ALICE Full testing.

## Fix #1: Nested Brace Handling in Template Processor (CRITICAL)

### Problem
Current regex-based template processing cannot handle nested template tags like `{{THINK:{{SET:it:value}}}}`.

### Solution: Brace-Counting Parser

Replace simple regex matching with a proper brace-counting parser for each template tag type.

### Implementation

#### File: `js/alice-full.js`

**Replace lines 79-156 with this improved implementation:**

```javascript
/**
 * Process template with AIML tags - improved to handle nested braces
 */
processTemplate(template, wildcards = []) {
    if (!template) return "";

    let result = template;

    // Process tags in order (most nested first)
    // 1. First process STAR (no nesting issues)
    result = this.processStarTags(result, wildcards);

    // 2. Process BOT, GET (simple lookups)
    result = this.processBotTags(result);
    result = this.processGetTags(result);

    // 3. Process SET (can contain nested values)
    result = this.processSetTags(result, wildcards);

    // 4. Process PERSON (can contain nested values)
    result = this.processPersonTags(result, wildcards);

    // 5. Process THINK (must handle nested tags)
    result = this.processThinkTags(result, wildcards);

    // 6. Process RANDOM (can contain nested tags)
    result = this.processRandomTags(result, wildcards);

    // 7. Process SRAI (recursive, must be last)
    result = this.processSraiTags(result);

    // 8. Process text transformations
    result = this.processTextTransformTags(result);

    // 9. Process THAT (simple replacement)
    result = result.replace(/\{THAT\}/g, this.context.that || "");

    // Clean up any remaining unprocessed markers
    result = result.replace(/\{\{[^}]*\}\}/g, '');

    return result.trim();
}

/**
 * Helper: Find matching closing brace for a tag
 */
findMatchingBrace(str, startPos) {
    let braceCount = 0;
    let pos = startPos;

    while (pos < str.length) {
        if (str.substring(pos, pos + 2) === '{{') {
            braceCount++;
            pos += 2;
        } else if (str.substring(pos, pos + 2) === '}}') {
            if (braceCount === 0) {
                return pos;
            }
            braceCount--;
            pos += 2;
        } else {
            pos++;
        }
    }

    return -1; // No matching brace found
}

/**
 * Process THINK tags (execute but don't output)
 */
processThinkTags(template, wildcards) {
    let result = template;
    let startPos = 0;

    while ((startPos = result.indexOf('{{THINK:', startPos)) !== -1) {
        const contentStart = startPos + 8; // Length of "{{THINK:"
        const endPos = this.findMatchingBrace(result, contentStart);

        if (endPos !== -1) {
            const content = result.substring(contentStart, endPos);
            // Execute the content (for side effects like SET) but don't include in output
            this.processTemplate(content, wildcards);
            // Remove the entire THINK tag
            result = result.substring(0, startPos) + result.substring(endPos + 2);
        } else {
            // No matching brace, skip this tag
            startPos += 8;
        }
    }

    return result;
}

/**
 * Process SET tags
 */
processSetTags(template, wildcards) {
    let result = template;
    let startPos = 0;

    while ((startPos = result.indexOf('{{SET:', startPos)) !== -1) {
        const tagStart = startPos;
        const contentStart = startPos + 6; // Length of "{{SET:"

        // Find the first colon after SET:
        const colonPos = result.indexOf(':', contentStart);
        if (colonPos === -1) {
            startPos += 6;
            continue;
        }

        const varName = result.substring(contentStart, colonPos).trim();
        const valueStart = colonPos + 1;
        const endPos = this.findMatchingBrace(result, valueStart);

        if (endPos !== -1) {
            let value = result.substring(valueStart, endPos);
            // Process the value (might contain nested tags)
            value = this.processTemplate(value, wildcards);
            this.context[varName] = value;
            // Replace the entire SET tag with the value
            result = result.substring(0, tagStart) + value + result.substring(endPos + 2);
            startPos = tagStart + value.length;
        } else {
            startPos += 6;
        }
    }

    return result;
}

/**
 * Process GET tags
 */
processGetTags(template) {
    let result = template;
    let startPos = 0;

    while ((startPos = result.indexOf('{{GET:', startPos)) !== -1) {
        const contentStart = startPos + 6;
        const endPos = this.findMatchingBrace(result, contentStart);

        if (endPos !== -1) {
            const varName = result.substring(contentStart, endPos).trim();
            const value = this.context[varName] || "";
            result = result.substring(0, startPos) + value + result.substring(endPos + 2);
            startPos += value.length;
        } else {
            startPos += 6;
        }
    }

    return result;
}

/**
 * Process BOT tags
 */
processBotTags(template) {
    let result = template;
    let startPos = 0;

    while ((startPos = result.indexOf('{{BOT:', startPos)) !== -1) {
        const contentStart = startPos + 6;
        const endPos = this.findMatchingBrace(result, contentStart);

        if (endPos !== -1) {
            const property = result.substring(contentStart, endPos).trim();
            const value = this.context[property] || this.context.botName || "";
            result = result.substring(0, startPos) + value + result.substring(endPos + 2);
            startPos += value.length;
        } else {
            startPos += 6;
        }
    }

    return result;
}

/**
 * Process SRAI tags (recursive pattern matching)
 */
processSraiTags(template) {
    let result = template;
    let startPos = 0;

    while ((startPos = result.indexOf('{{SRAI:', startPos)) !== -1) {
        const contentStart = startPos + 7;
        const endPos = this.findMatchingBrace(result, contentStart);

        if (endPos !== -1) {
            const sraiInput = result.substring(contentStart, endPos);
            const sraiResponse = this.srai(sraiInput);
            result = result.substring(0, startPos) + sraiResponse + result.substring(endPos + 2);
            startPos += sraiResponse.length;
        } else {
            startPos += 7;
        }
    }

    return result;
}

/**
 * Process RANDOM tags
 */
processRandomTags(template, wildcards) {
    let result = template;
    let startPos = 0;

    while ((startPos = result.indexOf('{{RANDOM:', startPos)) !== -1) {
        const contentStart = startPos + 9;
        const endPos = this.findMatchingBrace(result, contentStart);

        if (endPos !== -1) {
            const content = result.substring(contentStart, endPos);
            try {
                // Expect JSON array format
                const options = JSON.parse(content);
                if (Array.isArray(options) && options.length > 0) {
                    let chosen = options[Math.floor(Math.random() * options.length)];
                    // Process the chosen option (might contain nested tags)
                    chosen = this.processTemplate(chosen, wildcards);
                    result = result.substring(0, startPos) + chosen + result.substring(endPos + 2);
                    startPos += chosen.length;
                } else {
                    result = result.substring(0, startPos) + result.substring(endPos + 2);
                }
            } catch (e) {
                // Invalid JSON, remove the tag
                result = result.substring(0, startPos) + result.substring(endPos + 2);
            }
        } else {
            startPos += 9;
        }
    }

    return result;
}

/**
 * Process PERSON tags (pronoun transformation)
 */
processPersonTags(template, wildcards) {
    let result = template;
    let startPos = 0;

    while ((startPos = result.indexOf('{{PERSON:', startPos)) !== -1) {
        const contentStart = startPos + 9;
        const endPos = this.findMatchingBrace(result, contentStart);

        if (endPos !== -1) {
            let text = result.substring(contentStart, endPos);
            if (text === 'WILDCARD' && wildcards.length > 0) {
                text = wildcards[0];
            }
            const transformed = this.transformPerson(text);
            result = result.substring(0, startPos) + transformed + result.substring(endPos + 2);
            startPos += transformed.length;
        } else {
            startPos += 9;
        }
    }

    return result;
}

/**
 * Process STAR tags (wildcard captures)
 */
processStarTags(template, wildcards) {
    let result = template;

    // Process STAR:N tags
    result = result.replace(/\{\{STAR:(\d+)\}\}/g, (match, index) => {
        const idx = parseInt(index) - 1;
        return wildcards[idx] || "";
    });

    return result;
}

/**
 * Process text transformation tags
 */
processTextTransformTags(template) {
    let result = template;

    // FORMAL (capitalize first letter)
    result = result.replace(/\{\{FORMAL:([^}]+)\}\}/g, (match, text) => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    });

    // UPPERCASE
    result = result.replace(/\{\{UPPERCASE:([^}]+)\}\}/g, (match, text) => {
        return text.toUpperCase();
    });

    // LOWERCASE
    result = result.replace(/\{\{LOWERCASE:([^}]+)\}\}/g, (match, text) => {
        return text.toLowerCase();
    });

    return result;
}
```

### Testing the Fix

After implementing, test with these inputs:

```javascript
// Test 1: THINK with nested SET
const template1 = "{{THINK:{{SET:it:ROBOT}}}}You asked about robots.";
// Should output: "You asked about robots."
// Should set context.it = "ROBOT"

// Test 2: SET with STAR
const template2 = "Hello {{SET:name:{{STAR:1}}}}!";
const wildcards = ["Alice"];
// Should output: "Hello Alice!"
// Should set context.name = "Alice"

// Test 3: Multiple nesting
const template3 = "{{THINK:{{SET:topic:{{STAR:1}}}}}}Let's talk about {{GET:topic}}.";
const wildcards = ["robots"];
// Should output: "Let's talk about robots."
// Should set context.topic = "robots"
```

## Fix #2: Wildcard Capture in SET Statements (CRITICAL)

### Problem
Patterns like "MY NAME IS *" don't properly capture the wildcard into context variables.

### Solution: Fix Pattern Database

#### Option A: Patch the JSON file (Quick Fix)

Create a script to patch the existing JSON file:

**File: `patch-alice-patterns.js`**

```javascript
const fs = require('fs');

// Load patterns
const data = JSON.parse(fs.readFileSync('./data/alice-patterns-full.json', 'utf-8'));

let patchCount = 0;

// Patch broken SET statements
data.patterns.forEach(pattern => {
    let original = pattern.template;

    // Fix: {{SET:name:}} → {{SET:name:{{STAR:1}}}}
    pattern.template = pattern.template.replace(
        /\{\{SET:([^:]+):\}\}/g,
        (match, varName) => {
            patchCount++;
            return `{{SET:${varName}:{{STAR:1}}}}`;
        }
    );

    // Fix: {{SET:it:}} in THINK tags
    pattern.template = pattern.template.replace(
        /\{\{THINK:\{\{SET:([^:]+):\}\}\}\}/g,
        (match, varName) => {
            patchCount++;
            return `{{THINK:{{SET:${varName}:{{STAR:1}}}}}}`;
        }
    );

    if (original !== pattern.template) {
        console.log(`Patched: ${pattern.pattern}`);
        console.log(`  Before: ${original}`);
        console.log(`  After: ${pattern.template}`);
        console.log();
    }
});

// Save patched file
fs.writeFileSync(
    './data/alice-patterns-full-patched.json',
    JSON.stringify(data, null, 2)
);

console.log(`\nPatched ${patchCount} SET statements`);
console.log('Saved to: alice-patterns-full-patched.json');
```

#### Option B: Fix the Conversion Script (Better Long-term)

**File: `convert-aiml-to-json.py`**

Find the code that converts `<set>` tags and update it:

```python
# Current (broken):
def convert_set_tag(element):
    var_name = element.get('name', '')
    value = element.text or ''
    return f"{{{{SET:{var_name}:{value}}}}}"

# Fixed:
def convert_set_tag(element):
    var_name = element.get('name', '')
    value = element.text or ''

    # If value is empty but we're in a pattern with wildcards,
    # use STAR capture
    if not value.strip():
        # Check if we have a <star/> tag inside
        star_elem = element.find('star')
        if star_elem is not None:
            index = star_elem.get('index', '1')
            value = f"{{{{STAR:{index}}}}}"
        else:
            # Default to STAR:1 for empty sets
            value = "{{STAR:1}}"

    return f"{{{{SET:{var_name}:{value}}}}}"
```

Then re-convert the AIML files:

```bash
python convert-aiml-to-json.py
```

## Fix #3: Malformed Templates from AIML Conversion (MAJOR)

### Problem
Many templates have corrupted content from improper AIML→JSON conversion.

### Solution: Fix Conversion Script

**File: `convert-aiml-to-json.py`**

Key areas to fix:

#### 1. Handle `<random>` with `<li>` elements

```python
def convert_random_tag(element):
    """Convert AIML <random> tag with <li> elements"""
    items = []
    for li in element.findall('li'):
        # Recursively convert the content of each li
        content = convert_template_content(li)
        items.append(content)

    if not items:
        return ""

    # Return as JSON array for JavaScript to parse
    items_json = json.dumps(items)
    return f"{{{{RANDOM:{items_json}}}}}"
```

#### 2. Handle `<condition>` tags

```python
def convert_condition_tag(element):
    """Convert AIML <condition> tag"""
    # AIML conditions can be complex - for now, use first matching li
    items = []
    for li in element.findall('li'):
        # Check if li has value attribute (conditional)
        value = li.get('value')
        content = convert_template_content(li)

        if value:
            # This is a conditional li
            # For JSON, we'll simplify to just the first one for now
            # TODO: Implement proper condition logic
            items.append(content)
        else:
            # Default/fallback li
            items.append(content)

    if items:
        # For now, use RANDOM to pick one
        items_json = json.dumps(items)
        return f"{{{{RANDOM:{items_json}}}}}"
    return ""
```

#### 3. Handle `<learn>` tags

```python
def convert_learn_tag(element):
    """Convert AIML <learn> tag"""
    # Learn tags are dynamic pattern creation - not supported in static JSON
    # Convert to a placeholder
    return "[Learning mode not supported in static conversion]"
```

#### 4. Recursively process nested tags

```python
def convert_template_content(element):
    """Recursively convert all AIML tags in template content"""
    if element.text:
        result = element.text
    else:
        result = ""

    for child in element:
        if child.tag == 'set':
            result += convert_set_tag(child)
        elif child.tag == 'get':
            result += convert_get_tag(child)
        elif child.tag == 'srai':
            result += convert_srai_tag(child)
        elif child.tag == 'think':
            result += convert_think_tag(child)
        elif child.tag == 'random':
            result += convert_random_tag(child)
        elif child.tag == 'condition':
            result += convert_condition_tag(child)
        elif child.tag == 'star':
            index = child.get('index', '1')
            result += f"{{{{STAR:{index}}}}}"
        elif child.tag == 'bot':
            name = child.get('name', '')
            result += f"{{{{BOT:{name}}}}}"
        # Add more tag handlers as needed

        # Add tail text after the tag
        if child.tail:
            result += child.tail

    return result
```

### Re-conversion Steps

1. Backup current JSON file:
```bash
cp data/alice-patterns-full.json data/alice-patterns-full-backup.json
```

2. Update conversion script with fixes above

3. Re-convert:
```bash
python convert-aiml-to-json.py
```

4. Validate output:
```bash
node validate-patterns.js
```

## Fix #4: Input Validation (MINOR)

Add empty input handling in `getResponse()`:

**File: `js/alice-full.js`, line 276**

```javascript
async getResponse(input) {
    // Handle empty or whitespace-only input
    if (!input || !input.trim()) {
        return "I didn't catch that. Could you please say something?";
    }

    if (!this.patternsLoaded) {
        return "Please wait, I'm still loading my knowledge base...";
    }

    this.sraiDepth = 0;
    const response = this.matchPattern(input, false);
    return response;
}
```

## Fix #5: Catch-All Pattern Priority (MAJOR)

### Option A: Manual Patch

Edit `data/alice-patterns-full.json` and find all patterns with `"pattern": "_"` or `"pattern": "*"` and change their priority from 4 to 0.

### Option B: Programmatic Patch

```javascript
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data/alice-patterns-full.json', 'utf-8'));

data.patterns.forEach(pattern => {
    // Lower priority of catch-all patterns
    if (pattern.pattern === '_' || pattern.pattern === '*') {
        console.log(`Lowering priority: ${pattern.pattern} from ${pattern.priority} to 0`);
        pattern.priority = 0;
    }
});

fs.writeFileSync('./data/alice-patterns-full.json', JSON.stringify(data, null, 2));
```

## Validation Script

After applying fixes, use this validation script:

**File: `validate-alice-fixes.mjs`**

```javascript
import { AliceFull } from './js/alice-full.js';

const alice = new AliceFull();
await alice.loadPatterns();

console.log('VALIDATION TESTS\n');

// Test 1: Template artifacts
console.log('Test 1: No template artifacts');
const tests = [
    'Can you think?',
    'Who created you?',
    'Tell me about AI'
];

let artifactsFound = false;
for (const test of tests) {
    const response = await alice.getResponse(test);
    if (response.includes('}}') || response.includes('{{')) {
        console.log(`❌ FAIL: "${test}" → "${response}"`);
        artifactsFound = true;
    } else {
        console.log(`✓ PASS: "${test}"`);
    }
}

if (!artifactsFound) {
    console.log('✓ No template artifacts found\n');
} else {
    console.log('❌ Template artifacts still present\n');
}

// Test 2: Context memory
console.log('Test 2: Context memory');
await alice.getResponse('My name is Bob');
const context = alice.getContext();

if (context.userName === 'Bob') {
    console.log('✓ PASS: Name stored correctly');
} else {
    console.log(`❌ FAIL: Expected userName='Bob', got '${context.userName}'`);
}

const nameResponse = await alice.getResponse('What is my name?');
if (nameResponse.toLowerCase().includes('bob')) {
    console.log('✓ PASS: Name retrieved correctly\n');
} else {
    console.log(`❌ FAIL: "${nameResponse}"\n`);
}

// Test 3: Empty input
console.log('Test 3: Empty input handling');
const emptyResponse = await alice.getResponse('');
if (!emptyResponse.includes('}}') && emptyResponse.length > 0) {
    console.log('✓ PASS: Empty input handled gracefully\n');
} else {
    console.log(`❌ FAIL: "${emptyResponse}"\n`);
}

console.log('Validation complete!');
```

## Implementation Priority

1. **Fix #1 (Nested Braces)** - 4-6 hours
   - Highest impact
   - Fixes 50% of broken responses
   - Must be done first

2. **Fix #2 (Wildcard Capture)** - 2-4 hours
   - Enables context memory
   - Can use quick patch or full re-conversion
   - High priority

3. **Fix #4 (Input Validation)** - 15 minutes
   - Quick win
   - Improves UX
   - Can be done anytime

4. **Fix #5 (Pattern Priority)** - 1 hour
   - Moderate impact
   - Improves pattern matching
   - Can be done after #1

5. **Fix #3 (Re-conversion)** - 1-2 days
   - Biggest effort
   - Fixes remaining 1% of patterns
   - Should be done last

## Testing Checklist

After each fix:

- [ ] Run `test-alice-full-automated.mjs`
- [ ] Verify no template artifacts in responses
- [ ] Test context memory (name, favorites, etc.)
- [ ] Test long conversations (20+ exchanges)
- [ ] Verify performance (< 100ms average)
- [ ] Check regression tests pass
- [ ] Test edge cases (empty input, long input, special chars)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-26
**Estimated Total Implementation Time:** 8-15 hours (excluding re-conversion)
