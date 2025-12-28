#!/bin/bash
# Compile all lecture slides and collect warnings

SLIDES_DIR="/Users/jmanning/llm-course/slides"
OUTPUT_FILE="$SLIDES_DIR/compilation_report.txt"

echo "Compilation Report - $(date)" > "$OUTPUT_FILE"
echo "======================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Function to compile a single lecture file
compile_lecture() {
    local tex_file="$1"
    local dir=$(dirname "$tex_file")
    local base=$(basename "$tex_file" .tex)

    echo "Compiling: $tex_file"

    cd "$dir"

    # Set TEXINPUTS to include parent directory for Dartmouth theme
    export TEXINPUTS=".:..:"

    # Compile with lualatex
    lualatex -interaction=nonstopmode "$base.tex" > "/tmp/${base}_compile.log" 2>&1

    # Extract warnings and errors
    echo "" >> "$OUTPUT_FILE"
    echo "File: $tex_file" >> "$OUTPUT_FILE"
    echo "---" >> "$OUTPUT_FILE"

    # Count overfull boxes
    overfull_h=$(grep -c "Overfull \\\\hbox" "/tmp/${base}_compile.log" || echo "0")
    overfull_v=$(grep -c "Overfull \\\\vbox" "/tmp/${base}_compile.log" || echo "0")
    errors=$(grep -c "^!" "/tmp/${base}_compile.log" || echo "0")

    echo "  Overfull hbox: $overfull_h" >> "$OUTPUT_FILE"
    echo "  Overfull vbox: $overfull_v" >> "$OUTPUT_FILE"
    echo "  LaTeX Errors: $errors" >> "$OUTPUT_FILE"

    if [ "$errors" -gt 0 ]; then
        echo "  ERRORS FOUND:" >> "$OUTPUT_FILE"
        grep "^!" "/tmp/${base}_compile.log" | head -10 >> "$OUTPUT_FILE"
    fi

    # Return to original directory
    cd - > /dev/null
}

# Find and compile all lecture files
find "$SLIDES_DIR/week"* -name "lecture*.tex" -type f | sort | while read tex_file; do
    compile_lecture "$tex_file"
done

echo "" >> "$OUTPUT_FILE"
echo "======================================" >> "$OUTPUT_FILE"
echo "Compilation complete!" >> "$OUTPUT_FILE"

# Display summary
echo ""
echo "Compilation complete! Report saved to: $OUTPUT_FILE"
echo ""
echo "Summary:"
grep -E "(File:|Overfull|LaTeX Errors)" "$OUTPUT_FILE" | tail -20
