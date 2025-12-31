# Project Instructions

## Slide Development Workflow

When testing slide changes with Playwright browser:

1. **Compile the slides** using `../template_deck/compile.sh <lecture>.md`
2. **Refresh the browser** with F5 or by navigating to the URL again
3. **Then take a screenshot** to see the actual changes

**Important:** Navigating to the same URL does NOT refresh cached content. You MUST press F5 or use `browser_navigate` to a fresh URL to see updated files.

## CRITICAL: Testing and Version Control Rules

### Browser Testing
- **ALWAYS refresh the browser** after recompiling to view the current version
- **Verify screenshot timestamps**: If the screenshot file already exists, check its creation time BEFORE taking a new screenshot, then verify the timestamp changed AFTER taking it
- Never assume you're viewing updated content without explicit refresh

### Version Control
- **COMMIT changes BEFORE editing** so we can roll back to previous versions
- Changes get lost in the shuffle without commits - we can't track what was done!
- Use descriptive commit messages that explain what was fixed

### ⚠️ CRITICAL: NEVER REVERT WITHOUT BACKUP ⚠️
- **NEVER run `git checkout`, `git restore`, or `git reset` without FIRST committing or stashing current changes**
- Even if the current state seems "broken," it contains valuable work that will be LOST
- Before ANY destructive git operation:
  1. Run `git stash` or `git commit -m "WIP: backup before revert"`
  2. THEN perform the revert/checkout
  3. This allows recovery of work if the revert was a mistake
- **VIOLATING THIS RULE DESTROYS WORK AND WASTES HOURS OF EFFORT**

## Slide Theme Architecture

- **CSS** (`themes/cdl-theme.css`): Static styling rules that don't know about slide content
- **JavaScript** (`template_deck/autoscale.js`): Dynamic content scaling that measures actual rendered content
- Multi-column layouts use CSS custom property `--content-scale` which JS can set dynamically
- Content scaling philosophy: **Start at max font size, only scale DOWN when content overflows**

## Key Files

- `slides/template_deck/compile.sh` - Main build script
- `slides/template_deck/autoscale.js` - Dynamic content scaling
- `slides/week1/themes/cdl-theme.css` - Theme CSS
