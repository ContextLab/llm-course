# ASSIGNMENTS KNOWLEDGE BASE

**Parent:** [llm-course](https://github.com/ContextLab/llm-course) (see root AGENTS.md)

## OVERVIEW

Course assignments for PSYC 51.17. Contains web instruction pages and GitHub Classroom template repositories as submodules.

## STRUCTURE

```
assignments/
├── index.html              # Main assignments listing page
├── assignment-1/           # ELIZA instructions (web page)
├── assignment-2/           # SPAM Classifier instructions
├── assignment-3/           # Wikipedia Embeddings instructions
├── assignment-4/           # Customer Service Chatbot instructions
├── assignment-5/           # Build GPT instructions
├── final-project/          # Final Project instructions
├── eliza-llm-course/           # [SUBMODULE] Template repo
├── spam-classifier-llm-course/ # [SUBMODULE] Template repo
├── embeddings-llm-course/      # [SUBMODULE] Template repo
├── customer-service-bot-llm-course/ # [SUBMODULE] Template repo
├── gpt-llm-course/             # [SUBMODULE] Template repo
├── final-project-llm-course/   # [SUBMODULE] Template repo
└── AGENTS.md               # This file
```

## TWO TYPES OF DIRECTORIES

| Type | Pattern | Contents | Purpose |
|------|---------|----------|---------|
| Web pages | `assignment-X/` | `index.html` | Detailed instructions rendered from markdown |
| Submodules | `*-llm-course/` | Notebooks, data files | GitHub Classroom templates students fork |

## GITHUB PAGES URLs

Assignment instruction pages are served via GitHub Pages:

| Assignment | URL |
|------------|-----|
| Assignment 1 | `https://contextlab.github.io/llm-course/assignments/assignment-1/` |
| Assignment 2 | `https://contextlab.github.io/llm-course/assignments/assignment-2/` |
| Assignment 3 | `https://contextlab.github.io/llm-course/assignments/assignment-3/` |
| Assignment 4 | `https://contextlab.github.io/llm-course/assignments/assignment-4/` |
| Assignment 5 | `https://contextlab.github.io/llm-course/assignments/assignment-5/` |
| Final Project | `https://contextlab.github.io/llm-course/assignments/final-project/` |

**IMPORTANT**: When linking to assignments in course materials (slides/README.md, etc.), use these GitHub Pages URLs, NOT GitHub tree URLs like `github.com/ContextLab/llm-course/tree/main/assignments/...`.

## SUBMODULE DETAILS

Each submodule is a separate GitHub repo under `ContextLab/`:

| Submodule | Notebook | Data Files | Colab Badge |
|-----------|----------|------------|-------------|
| `eliza-llm-course` | Assignment1_ELIZA.ipynb | instructions.txt | Yes |
| `spam-classifier-llm-course` | Assignment2_SPAM_Classifier.ipynb | training.zip | Yes |
| `embeddings-llm-course` | Assignment3_Wikipedia_Embeddings.ipynb | - | Yes |
| `customer-service-bot-llm-course` | Assignment4_Customer_Service_Chatbot.ipynb | - | Yes |
| `gpt-llm-course` | Assignment5_GPT.ipynb | - | Yes |
| `final-project-llm-course` | FinalProject_Template.ipynb | - | Yes |

## CONVENTIONS

- Web pages in `assignment-X/index.html` link to data files in submodules via `../eliza-llm-course/instructions.txt`
- Each notebook has an "Open in Colab" badge at the top cell
- Students fork via GitHub Classroom, not direct clone
- Autograders are in private `ContextLabCourses/teaching-tools` repo

## COMMANDS

```bash
git submodule update --init --recursive  # Initialize submodules after clone
git submodule update --remote            # Pull latest from all submodules

# To commit changes in a submodule:
cd assignments/eliza-llm-course
git add . && git commit -m "message"
git push
cd ../..
git add assignments/eliza-llm-course
git commit -m "Update eliza-llm-course submodule"
```

## ANTI-PATTERNS

- Don't commit solution code to template repos
- Don't modify data file formats (breaks student code)
- Don't forget to push both submodule AND parent repo after changes
