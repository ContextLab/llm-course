# 📊 Course Slides - Automated Build System

This directory contains LaTeX Beamer presentations for each week of the course. The slides are automatically compiled to PDF and deployed as a website whenever changes are pushed to the repository.

## 🚀 Automated Workflow

### How It Works

When you push changes to any `.tex` file in the `slides/` directory:

1. **GitHub Actions triggers** the build workflow
2. **LaTeX compilation** happens automatically (tries `pdflatex` first, then `xelatex` if needed)
3. **PDFs are generated** for all `lecture.tex` files
4. **Web index page** is created with links to all slides
5. **GitHub Pages deployment** makes slides accessible online

### Viewing the Slides

Once deployed, slides are available at:
```
https://[your-username].github.io/llm-course/
```

Each week has its own PDF accessible via the web interface.

## 📁 Directory Structure

```
slides/
├── week1/
│   ├── lecture.tex          # Week 1 slides source
│   └── lecture.pdf          # (auto-generated)
├── week2/
│   ├── lecture.tex          # Week 2 slides source
│   └── lecture.pdf          # (auto-generated)
├── week3-4/
│   ├── lecture.tex          # Weeks 3-4 slides source
│   └── lecture.pdf          # (auto-generated)
├── week5-6/
│   ├── lecture.tex          # Weeks 5-6 slides source
│   └── lecture.pdf          # (auto-generated)
├── week7/
│   ├── lecture.tex          # Week 7 slides source
│   └── lecture.pdf          # (auto-generated)
├── week8/
│   ├── lecture.tex          # Week 8 slides source
│   └── lecture.pdf          # (auto-generated)
└── week9/
    ├── lecture.tex          # Week 9 slides source
    └── lecture.pdf          # (auto-generated)
```

## 🛠️ Local Compilation

### Prerequisites

Install a LaTeX distribution:
- **Mac**: [MacTeX](https://www.tug.org/mactex/)
- **Windows**: [MiKTeX](https://miktex.org/) or [TeX Live](https://www.tug.org/texlive/)
- **Linux**: `sudo apt-get install texlive-full` (Debian/Ubuntu)

### Compiling Slides

Navigate to any week's directory and run:

```bash
cd slides/week1
pdflatex lecture.tex
pdflatex lecture.tex  # Run twice for references
```

Or use `xelatex` for better font support:

```bash
xelatex lecture.tex
xelatex lecture.tex
```

Or use `latexmk` for automated compilation:

```bash
latexmk -pdf lecture.tex
```

### Using Overleaf

Alternatively, upload `lecture.tex` to [Overleaf](https://www.overleaf.com/) for cloud-based compilation.

## ✨ Slide Features

All slides include:
- 🎨 **Modern metropolis theme** for clean, professional appearance
- 📱 **16:9 aspect ratio** optimized for modern displays
- 😊 **Emoji integration** for visual engagement
- 💻 **Syntax-highlighted code** examples
- 🔗 **Hyperlinked references** to papers and resources
- 💭 **Discussion prompts** for interactive learning
- 📊 **Visual diagrams** using TikZ
- 🎯 **Learning objectives** clearly stated

## 📝 Editing Slides

### Adding New Slides

1. Create a new directory: `slides/week10/`
2. Add your `lecture.tex` file
3. Commit and push to trigger automatic build
4. Update `web_slides/index.html` template in the GitHub Actions workflow

### Modifying Existing Slides

1. Edit the relevant `lecture.tex` file
2. Test locally with `pdflatex` or `xelatex`
3. Commit and push changes
4. GitHub Actions will automatically rebuild and redeploy

## 🎓 Course Slide Topics

- **Week 1**: Introduction, String Manipulation, ELIZA
- **Week 2**: Computational Linguistics, Tokenization, POS Tagging
- **Weeks 3-4**: Text Embeddings, LSA, LDA, Word2Vec, GloVe
- **Weeks 5-6**: Transformers, Attention, BERT
- **Week 7**: Models of Conversation, Pragmatics, Dialogue
- **Week 8**: GPT Models, Language & the Brain
- **Week 9**: RAG, Mixture of Experts, Future Directions

## 🐛 Troubleshooting

### Compilation Fails Locally

- **Missing packages**: Install the full TeXLive distribution
- **Font errors**: Use `xelatex` instead of `pdflatex`
- **TikZ errors**: Ensure `texlive-latex-extra` is installed

### GitHub Actions Build Fails

- Check the Actions tab for detailed error logs
- Verify `.tex` file has no syntax errors
- Ensure all required packages are in `texlive-latex-extra`

### Slides Not Appearing on Website

- Check that GitHub Pages is enabled in repository settings
- Verify the workflow completed successfully
- Allow 5-10 minutes for deployment to propagate

## 📚 Resources

- [Beamer Documentation](https://ctan.org/pkg/beamer)
- [Metropolis Theme](https://github.com/matze/mtheme)
- [TikZ & PGF Manual](https://ctan.org/pkg/pgf)
- [Overleaf Beamer Guide](https://www.overleaf.com/learn/latex/Beamer)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX)

## 🤝 Contributing

To contribute slides or improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test compilation locally
5. Submit a pull request

---

**Happy Teaching! 🎓**
