# Changelog

All notable changes to the Interactive Tokenization Visualizer.

## [2.0.0] - 2025-12-25

### Added - Real GPT-2 BPE Integration

#### Major Features
- **Real GPT-2 Merge Rules**: Integrated 5,000 actual merge operations from OpenAI's GPT-2 tokenizer
  - Downloaded from HuggingFace: https://huggingface.co/gpt2
  - Parsed and optimized for browser performance
  - Stored in `data/gpt2-merges.json` (184KB)

- **Dual-Mode BPE Visualizer**:
  - **Simplified Mode** (Educational): 16 hardcoded common patterns for learning
  - **Real GPT-2 Mode**: 5,000 authentic merge rules showing production behavior
  - Toggle button to switch between modes
  - Mode indicator showing current configuration

#### Implementation Details
- Created `parse_gpt2_merges.py` script to extract and format merge rules
- Updated `bpe-visualizer.js` with:
  - Async loading of GPT-2 merges from JSON file
  - Mode toggle functionality
  - GPT-2 space character (Ġ) handling
  - Display formatting (Ġ → ▁ for readability)
  - Merge priority based on GPT-2's training order

#### UI/UX Improvements
- Mode selection buttons with visual state indicators
- Informative mode description in UI
- Updated example texts for better demonstrations
- Enhanced tooltips showing original tokens on hover
- Added emojis to mode buttons for visual clarity

#### Documentation
- Updated README.md with:
  - Recent Updates section highlighting new feature
  - Detailed mode descriptions
  - Usage instructions for both modes
  - Implementation details
  - Known limitations clearly stated
- Added inline code comments explaining GPT-2 specifics
- Created this CHANGELOG.md

#### Data Files
- `data/merges.txt`: Original GPT-2 merge file (50,000 rules, 446KB)
- `data/vocab.json`: GPT-2 vocabulary mapping (1018KB)
- `data/gpt2-merges.json`: Parsed top 5,000 merges (184KB)
- `data/parse_gpt2_merges.py`: Python script for parsing merge rules

#### CSS Enhancements
- Added `.mode-btn` styles for toggle buttons
- Active/inactive state styling
- Hover effects for better interactivity
- Responsive button layout

### Technical Notes

**Why 5,000 merges instead of all 50,000?**
- Performance optimization for browser visualization
- Top 5,000 merges cover the vast majority of common patterns
- Reduces JSON file size from ~1.8MB to 184KB
- Maintains educational value while ensuring smooth performance

**GPT-2 Space Character (Ġ)**
- GPT-2 uses Ġ (U+0120) to represent spaces
- Displayed as ▁ (U+2581) in the visualizer for better readability
- Original character shown in tooltip on hover
- Consistent representation across all visualization components

### Future Considerations
- Option to load all 50,000 merges for advanced users
- GPT-2 pre-tokenization regex step (currently omitted for simplicity)
- Side-by-side comparison view of both modes
- Export merge sequence for analysis

## [1.0.0] - Initial Release

### Features
- Tokenizer comparison (GPT-2, BERT, T5)
- Simplified BPE step-by-step visualizer
- Vocabulary browser
- Interactive visualizations
- Responsive design
