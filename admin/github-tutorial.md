# GitHub Tutorial for PSYC 51.17

This tutorial will help you get started with GitHub and GitHub Classroom for submitting assignments in this course.

## Table of Contents

1. [What is Git and GitHub?](#what-is-git-and-github)
2. [Setting Up Your Account](#setting-up-your-account)
3. [Installing Git](#installing-git)
4. [Accepting an Assignment](#accepting-an-assignment)
5. [Cloning Your Repository](#cloning-your-repository)
6. [Working on Your Assignment](#working-on-your-assignment)
7. [Submitting Your Work](#submitting-your-work)
8. [Common Issues and Solutions](#common-issues-and-solutions)
9. [Quick Reference](#quick-reference)

---

## What is Git and GitHub?

**Git** is a version control system that tracks changes to files. Think of it like "Track Changes" in Word, but much more powerful. It lets you:
- Save snapshots of your work at any point
- Go back to previous versions if something breaks
- Work on different features without affecting your main code

**GitHub** is a website that hosts Git repositories online. It lets you:
- Back up your code to the cloud
- Share your work with instructors and collaborators
- Submit assignments through GitHub Classroom

**GitHub Classroom** is a tool that creates private repositories for each student when they accept an assignment.

---

## Setting Up Your Account

### Step 1: Create a GitHub Account

1. Go to [github.com](https://github.com)
2. Click **Sign up**
3. Enter your email (you can use your Dartmouth email or personal email)
4. Create a password and username
5. Verify your email address

**Tip**: Choose a professional username - potential employers may see this!

### Step 2: Configure Git with Your Identity

After installing Git (see next section), open a terminal and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@dartmouth.edu"
```

Replace with your actual name and email. This identifies you as the author of your commits.

---

## Installing Git

### Mac

Git comes pre-installed on most Macs. To check, open Terminal and type:

```bash
git --version
```

If it's not installed, you'll be prompted to install it. Alternatively:
- Install [Homebrew](https://brew.sh), then run `brew install git`
- Or download from [git-scm.com](https://git-scm.com/download/mac)

### Windows

1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer with default settings
3. Use **Git Bash** (installed with Git) for running commands

### Linux

```bash
# Ubuntu/Debian
sudo apt-get install git

# Fedora
sudo dnf install git
```

---

## Accepting an Assignment

When a new assignment is released:

1. **Click the assignment link** provided in Canvas or by your instructor
2. **Authorize GitHub Classroom** if prompted (first time only)
3. **Accept the assignment** - this creates your personal repository
4. **Note your repository URL** - it will look like:
   ```
   https://github.com/ContextLab/assignment-name-YOUR_USERNAME
   ```

Your repository is private - only you and the instructors can see it.

---

## Cloning Your Repository

"Cloning" downloads your repository to your computer so you can work on it locally.

### Step 1: Copy the Repository URL

1. Go to your repository on GitHub
2. Click the green **Code** button
3. Copy the HTTPS URL

### Step 2: Clone in Terminal

Open Terminal (Mac/Linux) or Git Bash (Windows) and run:

```bash
git clone https://github.com/ContextLab/assignment-name-YOUR_USERNAME.git
```

This creates a folder with your repository contents.

### Step 3: Navigate to the Folder

```bash
cd assignment-name-YOUR_USERNAME
```

---

## Working on Your Assignment

### Option A: Work in Google Colab (Recommended)

1. Open [Google Colab](https://colab.research.google.com)
2. Create or open your notebook
3. When done, download the notebook:
   - File > Download > Download .ipynb
4. Move the downloaded file to your cloned repository folder

### Option B: Work Locally with Jupyter

1. Navigate to your repository folder
2. Start Jupyter:
   ```bash
   jupyter notebook
   ```
3. Work on your notebook directly in the repository

### Checking Your Changes

At any point, you can see what files have changed:

```bash
git status
```

This shows:
- **Untracked files**: New files Git doesn't know about yet
- **Modified files**: Existing files you've changed
- **Staged files**: Files ready to be committed

---

## Submitting Your Work

Submitting involves three steps: **add**, **commit**, and **push**.

### Step 1: Add Your Files

Tell Git which files to include in your submission:

```bash
# Add a specific file
git add your_notebook.ipynb

# Or add all changed files
git add .
```

### Step 2: Commit Your Changes

Create a snapshot with a descriptive message:

```bash
git commit -m "Complete assignment 1"
```

**Good commit messages**:
- "Complete ELIZA implementation"
- "Add analysis section"
- "Fix bug in pattern matching"

**Bad commit messages**:
- "done"
- "stuff"
- "asdfgh"

### Step 3: Push to GitHub

Upload your commits to GitHub:

```bash
git push
```

You may be prompted for your GitHub username and password. See [Authentication](#authentication) if you have issues.

### Step 4: Verify Your Submission

1. Go to your repository on GitHub
2. Check that your latest files are visible
3. Verify the timestamp is before the deadline

**Your most recent commit before the deadline is your submission.**

---

## Common Issues and Solutions

### Authentication

GitHub no longer accepts passwords for Git operations. You need either:

**Option 1: Personal Access Token (Recommended)**
1. Go to GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name, set expiration, and check "repo" scope
4. Copy the token and use it as your password when pushing

**Option 2: SSH Keys**
1. Generate an SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "your.email@dartmouth.edu"
   ```
2. Add to GitHub: Settings > SSH and GPG keys > New SSH key
3. Paste the contents of `~/.ssh/id_ed25519.pub`
4. Clone using SSH URL instead of HTTPS

### "Permission Denied" Error

- Make sure you accepted the assignment first
- Verify you're pushing to YOUR repository (check the URL)
- Check your authentication (see above)

### "Repository Not Found" Error

- Double-check the repository URL
- Make sure you accepted the assignment
- Verify you're logged into the correct GitHub account

### Merge Conflicts

If you edited files on GitHub and locally:

```bash
git pull   # Get changes from GitHub first
# Resolve any conflicts in the files
git add .
git commit -m "Resolve merge conflict"
git push
```

### Large Files Error

GitHub has a 100MB file limit. For large files:
- Don't commit datasets - download them in your notebook
- Use `.gitignore` to exclude large files
- Consider Git LFS for unavoidable large files

### "Nothing to Commit"

This means Git doesn't see any changes. Check:
- Are you in the right directory?
- Did you save your files?
- Run `git status` to see the current state

---

## Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `git clone <url>` | Download a repository |
| `git status` | See current changes |
| `git add <file>` | Stage a file for commit |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save a snapshot |
| `git push` | Upload to GitHub |
| `git pull` | Download latest changes |
| `git log --oneline` | View commit history |

### Typical Workflow

```bash
# 1. Clone (first time only)
git clone https://github.com/ContextLab/assignment-YOUR_USERNAME.git
cd assignment-YOUR_USERNAME

# 2. Work on your assignment...

# 3. Check what changed
git status

# 4. Stage your changes
git add .

# 5. Commit with a message
git commit -m "Complete assignment"

# 6. Push to GitHub
git push

# 7. Verify on GitHub website
```

### Before Every Deadline

1. **Save** your notebook in Colab/Jupyter
2. **Copy** it to your repository folder (if using Colab)
3. **Add** the files: `git add .`
4. **Commit**: `git commit -m "Final submission"`
5. **Push**: `git push`
6. **Verify** on GitHub that your files are there

---

## Getting Help

- **Git Documentation**: [git-scm.com/doc](https://git-scm.com/doc)
- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **Course Discord**: Ask questions in the #help channel
- **Office Hours**: Bring your laptop and we can troubleshoot together

---

## Assignment Repositories

| Assignment | Repository | Deadline |
|------------|------------|----------|
| 1: ELIZA | `ContextLab/eliza-llm-course` | Jan 19, 11:59 PM |
| 2: SPAM Classifier | `ContextLab/spam-classifier-llm-course` | Jan 26, 11:59 PM |
| 3: Wikipedia Embeddings | `ContextLab/embeddings-llm-course` | Feb 2, 11:59 PM |
| 4: Customer Service Bot | `ContextLab/customer-service-bot-llm-course` | Feb 9, 11:59 PM |
| 5: Build GPT | `ContextLab/gpt-llm-course` | Feb 16, 11:59 PM |
| Final Project | `ContextLab/final-project-llm-course` | Mar 9, 11:59 PM |

All deadlines are Eastern Standard Time (EST).

---

*Last updated: January 2026*
