#!/bin/bash
# Local slide compilation test script
# Usage: ./scripts/compile-slides-local.sh [week]
# Example: ./scripts/compile-slides-local.sh week1
#          ./scripts/compile-slides-local.sh all

set -e

SLIDES_DIR="$(dirname "$0")/../slides"
cd "$SLIDES_DIR"

compile_tex() {
    local tex_file="$1"
    local dir=$(dirname "$tex_file")
    local filename=$(basename "$tex_file" .tex)

    echo "📝 Compiling $tex_file..."
    cd "$dir"

    # Try xelatex first
    if xelatex -interaction=nonstopmode -halt-on-error "$filename.tex" > /dev/null 2>&1; then
        xelatex -interaction=nonstopmode -halt-on-error "$filename.tex" > /dev/null 2>&1
        echo "✅ Success: $filename.pdf created"
    else
        echo "⚠️  xelatex failed, trying pdflatex..."
        if pdflatex -interaction=nonstopmode -halt-on-error "$filename.tex" > /dev/null 2>&1; then
            pdflatex -interaction=nonstopmode -halt-on-error "$filename.tex" > /dev/null 2>&1
            echo "✅ Success: $filename.pdf created (pdflatex)"
        else
            echo "❌ Failed: $tex_file"
            return 1
        fi
    fi

    cd - > /dev/null
}

cleanup() {
    echo "🧹 Cleaning up auxiliary files..."
    find . -name "*.aux" -o -name "*.log" -o -name "*.out" -o -name "*.nav" \
           -o -name "*.snm" -o -name "*.toc" -o -name "*.vrb" | xargs rm -f 2>/dev/null
}

if [ "$1" = "all" ] || [ -z "$1" ]; then
    echo "🔍 Compiling all slides..."
    find . -name "lecture.tex" -type f | while read -r tex_file; do
        compile_tex "$tex_file" || true
    done
    cleanup
    echo "✨ Done!"
elif [ -d "$1" ]; then
    if [ -f "$1/lecture.tex" ]; then
        compile_tex "$1/lecture.tex"
        cleanup
    else
        echo "❌ No lecture.tex found in $1"
        exit 1
    fi
else
    echo "Usage: $0 [week-dir|all]"
    echo "Examples:"
    echo "  $0 week1      # Compile week1 slides"
    echo "  $0 all        # Compile all slides"
    exit 1
fi
