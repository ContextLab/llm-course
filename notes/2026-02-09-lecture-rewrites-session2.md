# Lecture Rewrite Session 2 - Feb 9, 2026

## Status

### Completed (manually edited):
- **L22** (Scaling Up): Condensed "Scaling laws recap" → "Beyond Chinchilla: the overtraining era" (removed verbose recall, added Phi-4 example). Condensed "From GPT-3 to ChatGPT" RLHF recap.
- **L24** (Agents): Condensed "ReAct vs chain-of-thought" comparison (removed CoT re-definition, replaced with brief cross-ref to L22). Condensed "Agent memory" RAG re-explanation → brief "(Lecture 17)" cross-ref. Condensed "Agent spectrum" table (removed chatbot/RAG rows that recap L1/L17, focused on agent paradigms).
- **L25** (MoE): Condensed "The scaling dilemma" (removed GPT-1/GPT-3/GPT-4 cost table that was the 3rd time this info appeared; replaced with focused statement). Condensed "Chinchilla lesson" in small language models section → brief cross-ref to L22.
- **L26** (Ethics): Condensed "The alignment problem" (removed RLHF/DPO re-explanation, added new techniques: representation engineering, weak-to-strong generalization). Condensed "What is bias in LLMs?" (removed generic definition, refocused on LLM-specific bias vs L11's word embedding bias, added sycophancy bias).

### In Progress (delegated to background agents):
- **L21** (GPT Architecture): bg_fc313aef - Heavy rewrite. Removing ~5 redundant slides, adding BooksCorpus controversy, open-weight decoders, test-time compute, weight tying.
- **L23** (GPT from Scratch): bg_c1f2c85e - Strip theory, keep code, add gradient accumulation, LR scheduling, mixed precision, nanoGPT comparison.
- **L19** (BERT Variants): bg_c9e2f091 - Remove recall slide, condense masking recap, add ModernBERT deep dive, Gemma Encoder, production deployment.
- **L20** (Applications): bg_0b6ab9c4 - Remove roadmap slide, replace "Where BERT excels" with novel applications, expand neuroscience.

### Pending:
- Compile all modified lectures (HTML + PDF)
- Update slides/README.md if titles change
- Commit, push, verify CI

## Session IDs for continuation:
- L21: ses_3bd0ca2adffe6mUkfyjnM4xWci
- L23: ses_3bd0c4ab8ffebbCQe6N0T0q3FI
- L19: ses_3bd0c025cffeEI1dPyKTe9fXQh
- L20: ses_3bd0bbf7effeHH58bQ77J0aikK

## Git State:
- Last commit: 7a57e25 (all pushed, clean)
- Working tree: Modified L22, L24, L25, L26 (not yet committed)
- All CI: passing
