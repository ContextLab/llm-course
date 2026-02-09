# Lectures 19-26 Overhaul Session Notes
**Date**: 2026-02-09
**Status**: Wave 2 (Content Rewriting) COMPLETE — all 8 lectures rewritten

## Plan Summary
Aggressive refactoring of 8 lectures (19-26) following lecture 18 approach:
- Remove redundancy with earlier lectures
- Add 2025-2026 developments
- Add verified hyperlinks + further reading boxes
- Create companion notebooks (L19, L20, L23, L24, L25)
- Compile and test

## Wave 1 Research — ALL COMPLETE
| Lecture | Status | Key Findings |
|---------|--------|-------------|
| L19 | ✅ | ModernBERT, Gemma Encoder, SpanBERT/ERNIE/BART URLs |
| L20 | ✅ | Mind's Transformer (ICLR 2026), SAGED (COLING 2025), Caucheteux DOI fixed |
| L21 | ✅ | RoPE/RMSNorm/SwiGLU/GQA, multi-token prediction, Jamba hybrid |
| L22 | ✅ | DPO, GRPO, DeepSeek-R1, Schaeffer emergent critique, Kojima CoT |
| L23 | ✅ | KV cache, FlashAttention-3, GPT-2 vs modern decoder code diffs |
| L24 | ✅ | MCP, Computer Use, SWE-bench, Hagendorff safety, agentic coding |
| L25 | ✅ | CO2 corrected, Mixtral 6x/12.9B, DeepSeek-V3/V4, Mamba-2, SLMs |
| L26 | ✅ | EU AI Act 7%/3%, elections, strategic dishonesty, alignment faking, copyright |

## Wave 2 Content Rewrites — ALL COMPLETE
| Lecture | Slides | Key Changes |
|---------|--------|-------------|
| L19 | 25 | ✅ Prior session. ModernBERT, Gemma Encoder, architecture evolution |
| L20 | 20 | ✅ Removed bias/N400/prediction dupes. Added SAGED, Brain-LLM frontiers, industry |
| L21 | 22 | ✅ Removed 6 code slides (→L23). Added modern decoder stack, multi-token pred, Jamba |
| L22 | 17 | ✅ Condensed scaling/RLHF (→L16 recap). Added DPO/GRPO, reasoning models, emergence debate |
| L23 | 26 | ✅ Added KV cache, FlashAttention, GPT-2 vs modern code diffs, companion notebook |
| L24 | 23 | ✅ Added MCP, Computer Use, agentic coding, principal-agent safety. Updated agents list |
| L25 | 21 | ✅ Fixed CO2/Mixtral. Added DeepSeek MoE, SLMs, democratization discussion |
| L26 | 21 | ✅ Fixed EU fines. Added elections, strategic dishonesty, copyright, ethics framework |

## Key Corrections Applied
1. ✅ L25: CO2 source → Patterson et al. 2021 (NOT Strubell 2019)
2. ✅ L25: Mixtral → 6x faster (not 5x), 12.9B active (not 13B)
3. ✅ L20: Caucheteux DOI → 10.1038/s42003-022-03036-1 (Communications Biology)
4. ✅ L26: EU AI Act fines → 7%/3% (NOT 6%)
5. ✅ L22: Kojima CoT → 17.7% → 78.7% on GSM8K

## Wave 4 Notebooks — ALL COMPLETE
| Notebook | Location | Cells | Content |
|----------|----------|-------|---------|
| bert_variants_demo.ipynb | slides/week6/ | 18 | Compare fill-mask, speed benchmarks, embeddings, ELECTRA |
| encoder_applications_demo.ipynb | slides/week6/ | 18 | Classification, NER, QA, systematic bias measurement |
| gpt_from_scratch_demo.ipynb | slides/week7/ | 23 | Build mini-GPT, train on Shakespeare, sampling strategies |
| agents_demo.ipynb | slides/week9/ | 17 | Simulated agent loop (no API key), ReAct, safety demos |
| moe_efficiency_demo.ipynb | slides/week9/ | 23 | MoE layer, load balancing, quantization, dense vs sparse |

All notebooks: valid JSON, Colab badge, 4-5 parts, discussion questions, summary, further exploration.

## Wave 5 Compile + Test + README — ALL COMPLETE
- ✅ All 8 lectures compiled (HTML + PDF) with Marp
- ✅ Tests: 1,397/1,398 passed (1 pre-existing topic-modeling failure, not our change)
- ✅ RAG test skipped (known memory issue per AGENTS.md)
- ✅ slides/README.md updated: weeks 6, 7, 9 have notebook links + updated readings

## Status: READY FOR COMMIT
All work complete. Awaiting user request to commit and push.
