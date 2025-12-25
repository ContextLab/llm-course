# ELIZA Interactive Demo

A comprehensive, interactive demonstration of the classic ELIZA chatbot with visual rule breakdown and live editing capabilities.

## Overview

This demo provides three interactive modes for exploring how ELIZA works:

1. **Chat Interface** - Chat with ELIZA and see which rules match
2. **Rule Breakdown** - Step-by-step visualization of text processing
3. **Live Rule Editor** - Edit rules in real-time with syntax validation

## Features

### Tab 1: Chat Interface
- Clean, modern chat UI with conversation history
- Visual indicators showing which pattern/keyword matched each response
- Pattern rank display to understand rule priority
- Export conversation history as JSON
- Clear chat and restart functionality

### Tab 2: Rule Breakdown Visualizer
- Detailed step-by-step processing visualization:
  1. **Pre-substitutions** - Canonical form conversion (e.g., "dreamt" → "dreamed")
  2. **Keyword Detection** - Finding relevant keywords with rank ordering
  3. **Pattern Matching** - Shows all tested patterns and which matched
  4. **Decomposition** - Displays captured groups from wildcards
  5. **Template Selection** - Shows chosen response template
  6. **Post-substitutions & Assembly** - Pronoun reflection and final assembly
- Pre-loaded examples for quick exploration
- Animated, color-coded steps with expandable details
- Visual highlighting of matched patterns and transformations

### Tab 3: Live Rule Editor
- Full-featured JSON editor for ELIZA rules
- Real-time syntax validation with error messages
- Statistics display (rules count, patterns, responses)
- Template loading (minimal, therapeutic)
- Import/Export rule sets as JSON files
- Format JSON button for cleaning up syntax
- Reset to original rules
- Changes apply to chat immediately
- Integrated help panel with examples and syntax guide

## How ELIZA Works

### Pattern Matching Algorithm

1. **Input Processing**: User input is normalized using pre-substitutions
2. **Keyword Detection**: ELIZA scans for keywords in the input
3. **Rank Ordering**: Keywords are prioritized by rank (higher = more important)
4. **Pattern Testing**: For each keyword, ELIZA tests associated patterns in order
5. **Wildcard Matching**: Patterns use `*` to match any text sequence
6. **Synonym Expansion**: Special `@` syntax matches synonym groups (e.g., `@family`)
7. **Response Assembly**: Matched groups are inserted into response templates
8. **Reflection**: Pronouns are swapped (I → you, my → your) using post-substitutions

### Rule Structure

```json
{
  "keyword": "remember",
  "rank": 5,
  "patterns": [
    {
      "pattern": "* i remember *",
      "responses": [
        "Do you often think of (2)?",
        "What else do you recollect?"
      ]
    }
  ]
}
```

- **keyword**: Word that triggers this rule
- **rank**: Priority (higher ranks tested first)
- **pattern**: Match template (`*` = wildcard)
- **responses**: Array of possible responses
- **(1), (2), etc.**: Reference captured wildcard groups

### Substitution System

**Pre-substitutions** (before matching):
- Normalize variations: "can't" → "cannot", "recollect" → "remember"
- Standardize tense: "dreamt" → "dreamed"

**Post-substitutions** (for reflection):
- Swap pronouns: "I" → "you", "my" → "your"
- Maintain perspective: "I am" → "you are"

### Synonym Groups

Allow patterns to match multiple related words:
```json
"synonyms": {
  "belief": ["believe", "feel", "think", "wish"],
  "family": ["mother", "father", "sister", "brother"]
}
```

Pattern `"* i @belief *"` matches:
- "I believe you understand"
- "I think computers are smart"
- "I feel happy today"

## Technical Implementation

### Architecture

- **eliza-engine.js**: Core chatbot logic, conversation management
- **pattern-matcher.js**: Pattern matching algorithm, substitutions, rule breakdown
- **rule-editor.js**: Rule editing, validation, import/export
- **eliza.css**: Modern, responsive styling with animations
- **eliza-rules.json**: Comprehensive rule set based on classic ELIZA

### Key Classes

**ElizaEngine**
- `loadRules(data)` - Load rule set
- `getResponse(input)` - Get chatbot response
- `getDetailedBreakdown(input)` - Get processing steps for visualization
- `updateRules(data)` - Update rules dynamically
- `exportConversation()` - Export chat history

**PatternMatcher**
- `matchPattern(input, pattern, synonyms)` - Test pattern match
- `findMatchingRule(input, rules, synonyms)` - Find best matching rule
- `applyPreSubstitutions(text, subs)` - Apply pre-processing
- `applyPostSubstitutions(text, subs)` - Apply reflection
- `getProcessingBreakdown(input, ...)` - Generate detailed breakdown

**RuleEditor**
- `validate()` - Validate JSON syntax
- `apply()` - Apply changes to engine
- `import(file)` - Import rules from file
- `export()` - Export rules to file
- `loadTemplate(name)` - Load predefined template

## Usage

### Opening the Demo

Simply open `index.html` in a modern web browser:

```bash
cd /home/user/llm-course/demos/01-eliza
python3 -m http.server 8000
# Then visit http://localhost:8000
```

Or open directly:
```bash
firefox index.html
```

### Chatting with ELIZA

1. Navigate to the "Chat Interface" tab
2. Type a message in the input field
3. Press Enter or click "Send"
4. Observe the response and the matching rule/keyword displayed
5. Export the conversation or clear chat as needed

### Analyzing Text Processing

1. Navigate to the "Rule Breakdown" tab
2. Enter text or select an example from the dropdown
3. Click "Analyze"
4. Watch the step-by-step visualization of how ELIZA processes the input
5. Expand each step to see detailed transformations

### Editing Rules

1. Navigate to the "Live Rule Editor" tab
2. Edit the JSON directly in the text area
3. Click "Format JSON" to clean up syntax
4. Click "Apply Changes" to test new rules
5. Switch to "Chat Interface" to try the modified rules
6. Export your custom rule set or import existing ones

### Creating Custom Rules

Example of adding a new rule:

```json
{
  "keyword": "angry",
  "rank": 3,
  "patterns": [
    {
      "pattern": "* i am angry *",
      "responses": [
        "What makes you angry?",
        "Tell me more about your anger.",
        "How long have you been feeling angry?"
      ]
    }
  ]
}
```

Add this to the `rules` array in the editor, click "Apply Changes", and test it in the chat!

## Educational Value

This demo illustrates fundamental NLP concepts:

1. **Pattern Matching**: Core technique for rule-based systems
2. **Text Normalization**: Preparing input for processing
3. **Wildcard Expansion**: Flexible pattern matching
4. **Priority Ranking**: Handling multiple matching rules
5. **Template-Based Generation**: Simple response generation
6. **Reflection/Transformation**: Maintaining conversational coherence
7. **State Management**: Tracking conversation history

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires JavaScript enabled. No external dependencies.

## File Structure

```
01-eliza/
├── index.html              # Main application
├── README.md               # This file
├── css/
│   └── eliza.css          # Styles and animations
├── js/
│   ├── eliza-engine.js    # Core chatbot logic
│   ├── pattern-matcher.js # Pattern matching algorithm
│   └── rule-editor.js     # Rule editing functionality
└── data/
    └── eliza-rules.json   # Comprehensive ELIZA rules
```

## Extending the Demo

### Adding New Features

1. **Memory Stack**: Store and recall previous topics
2. **Sentiment Analysis**: Adjust responses based on emotion
3. **Context Tracking**: Maintain conversation context
4. **Learning Mode**: Allow ELIZA to learn new patterns from conversation
5. **Multi-language Support**: Add translation capabilities

### Customizing Appearance

Edit `css/eliza.css` to change colors, fonts, layout:

```css
:root {
  --primary-color: #4a90e2;  /* Change to your preferred color */
  --secondary-color: #50c878;
  /* ... */
}
```

## Credits

Based on Joseph Weizenbaum's original ELIZA (1966), one of the first chatbots and a landmark in natural language processing history.

## License

Educational use only. Part of the LLM Course materials.
