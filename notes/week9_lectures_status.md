# Week 9 Lectures Status — Feb 27, 2026

## Completed
- [x] Research latest LLM advances (5 parallel research agents)
- [x] Plan topic distribution across 3 lectures
- [x] Lecture 24: "The Thinking Revolution" (22 slides) — reasoning, frontier models, benchmarks
- [x] Lecture 25: "Agents, Tools, and the Agentic Era" (20 slides) — ReAct, MCP, coding agents, safety
- [x] Lecture 26: "The Reckoning" (20 slides) — alignment faking, copyright, jobs, regulation
- [x] Link verification (3 parallel agents checked all links)
- [x] Fix broken Bender et al. link (ACM DOI → faculty.washington.edu PDF)

## Commits
- `0569257` — Initial write of all 3 lectures
- `3b87d2a` — Fix Bender et al. citation link

## Remaining Tasks
1. **Update README.md** (`slides/README.md`) with new lecture titles/descriptions for week 9
2. **Update syllabus.md** (`admin/syllabus.md`) with new lecture titles/topics
3. **Compile slides** (`cd slides/week9 && ../../slides/template_deck/compile.sh lecture24.md` etc.)
4. **Final commit and push**

## Notes on Links
- OpenAI links (o3 page, Deep Research) return 403 due to Cloudflare bot protection — these are valid URLs, just blocked for automated access. No fix needed.
- Claude Code docs redirect from docs.anthropic.com to code.claude.com/docs — works fine, could optionally update.
- transformer-circuits.pub links were unverifiable by agents but are known-good Anthropic research URLs.

## SVG Graphics
- User requested SVG graphics (like week 7) to illustrate core points. Not yet added. Could enhance:
  - Lecture 24: test-time compute scaling diagram, MoE architecture
  - Lecture 25: ReAct loop diagram, agent spectrum visualization
  - Lecture 26: attribution graph conceptual diagram
