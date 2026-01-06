#!/bin/bash
#
# compile.sh - Marp Presentation Compiler with Code Block and Table Processing
#
# This script compiles Marp markdown presentations with automatic features:
# - Line numbering for all code blocks
# - Auto-splitting of long code blocks across multiple slides
# - Auto-splitting of long tables across multiple slides
# - Continued line numbering across split slides
# - "continued..." indicators on slides with more content
#
# Usage:
#   ./compile.sh [input.md] [options]
#
# Arguments:
#   input.md          Input markdown file (default: theme_showcase.md)
#
# Options:
#   -o, --output      Output file (default: <input_basename>.html)
#   -l, --lines       Max lines per slide for code blocks (default: 20)
#   -r, --rows        Max data rows per slide for tables (default: 8)
#   -f, --format      Output format: html, pdf, pptx, both (default: both)
#   -t, --theme       Theme directory (default: ./themes/)
#   -h, --help        Show this help message
#   --no-split        Disable auto-splitting (use JavaScript-only approach)
#   --keep-temp       Keep temporary processed file for debugging
#
# Examples:
#   ./compile.sh                           # Compile theme_showcase.md to HTML+PDF
#   ./compile.sh my_deck.md                # Compile my_deck.md to HTML+PDF
#   ./compile.sh deck.md -o output.html    # Specify output file
#   ./compile.sh deck.md -l 15             # Use 15 lines per slide for code
#   ./compile.sh deck.md -r 6              # Use 6 data rows per slide for tables
#   ./compile.sh deck.md -f pdf            # Output as PDF only
#   ./compile.sh deck.md -f html           # Output as HTML only
#
# Requirements:
#   - marp-cli (npm install -g @marp-team/marp-cli)
#   - python3 (for code block processing)
#
# Author: CDL Theme Project
# Version: 1.0.0
#

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default configuration
INPUT_FILE="theme_showcase.md"
OUTPUT_FILE=""
MAX_LINES_PER_SLIDE=20
MAX_TABLE_ROWS=8
OUTPUT_FORMAT="both"
THEME_DIR="./themes/"
NO_SPLIT=false
KEEP_TEMP=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print usage information
usage() {
    sed -n '3,38p' "$0" | sed 's/^# //' | sed 's/^#//'
    exit 0
}

# Print colored message
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -l|--lines)
            MAX_LINES_PER_SLIDE="$2"
            shift 2
            ;;
        -r|--rows)
            MAX_TABLE_ROWS="$2"
            shift 2
            ;;
        -f|--format)
            OUTPUT_FORMAT="$2"
            shift 2
            ;;
        -t|--theme)
            THEME_DIR="$2"
            shift 2
            ;;
        --no-split)
            NO_SPLIT=true
            shift
            ;;
        --keep-temp)
            KEEP_TEMP=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        -*)
            log_error "Unknown option: $1"
            usage
            ;;
        *)
            INPUT_FILE="$1"
            shift
            ;;
    esac
done

# Validate input file
if [[ ! -f "$INPUT_FILE" ]]; then
    log_error "Input file not found: $INPUT_FILE"
    exit 1
fi

# Set default output file if not specified
if [[ -z "$OUTPUT_FILE" ]]; then
    BASENAME="${INPUT_FILE%.md}"
    if [[ "$OUTPUT_FORMAT" == "both" ]]; then
        OUTPUT_FILE="${BASENAME}.html"
        PDF_OUTPUT_FILE="${BASENAME}.pdf"
    else
        OUTPUT_FILE="${BASENAME}.${OUTPUT_FORMAT}"
    fi
fi

# Check for marp-cli
if ! command -v marp &> /dev/null; then
    log_error "marp-cli is not installed. Install with: npm install -g @marp-team/marp-cli"
    exit 1
fi

# Check for Python processing script
PROCESS_SCRIPT="$SCRIPT_DIR/process_markdown.py"
if [[ ! -f "$PROCESS_SCRIPT" ]]; then
    log_error "Processing script not found: $PROCESS_SCRIPT"
    exit 1
fi

# Create temporary file in the same directory as input to preserve relative paths
# This is crucial for PDF generation where relative image paths must resolve correctly
INPUT_DIR="$(cd "$(dirname "$INPUT_FILE")" && pwd)"
TEMP_FILE=$(mktemp "${INPUT_DIR}/.marp_processed_XXXXXX.md")
trap "if [[ \$KEEP_TEMP != true ]]; then rm -f '$TEMP_FILE'; fi" EXIT

log_info "Processing: $INPUT_FILE"
log_info "Output: $OUTPUT_FILE"
log_info "Max lines per slide: $MAX_LINES_PER_SLIDE"
log_info "Max table rows per slide: $MAX_TABLE_ROWS"

# Build Python processing command
PYTHON_CMD="python3 \"$PROCESS_SCRIPT\" \"$INPUT_FILE\" \"$TEMP_FILE\" --max-lines $MAX_LINES_PER_SLIDE --max-table-rows $MAX_TABLE_ROWS"
if [[ "$NO_SPLIT" == true ]]; then
    PYTHON_CMD="$PYTHON_CMD --no-split"
fi

# Run the processing
log_info "Processing markdown..."
eval $PYTHON_CMD

# Build marp command base
MARP_BASE="marp \"$TEMP_FILE\" --theme-set \"$THEME_DIR\" --html"

# Function to run marp for a specific format
run_marp() {
    local format=$1
    local output=$2
    local cmd="$MARP_BASE"

    case $format in
        html)
            cmd="$cmd -o \"$output\""
            ;;
        pdf)
            cmd="$cmd --pdf --allow-local-files -o \"$output\""
            ;;
        pptx)
            cmd="$cmd --pptx --allow-local-files -o \"$output\""
            ;;
        *)
            log_error "Unknown output format: $format"
            return 1
            ;;
    esac

    log_info "Generating $format: $output"
    eval $cmd
}

# Run marp for the specified format(s)
if [[ "$OUTPUT_FORMAT" == "both" ]]; then
    run_marp "html" "$OUTPUT_FILE"
    run_marp "pdf" "$PDF_OUTPUT_FILE"
else
    run_marp "$OUTPUT_FORMAT" "$OUTPUT_FILE"
fi

# Inject chart-defaults script FIRST (must run before any chart creation scripts)
CHART_DEFAULTS_JS="$SCRIPT_DIR/chart-defaults.js"
if [[ ("$OUTPUT_FORMAT" == "html" || "$OUTPUT_FORMAT" == "both") && -f "$OUTPUT_FILE" && -f "$CHART_DEFAULTS_JS" ]]; then
    log_info "Injecting chart-defaults script into head..."

    # Use Python to inject the script into <head> (before any inline scripts run)
    python3 -c "
with open('$CHART_DEFAULTS_JS', 'r') as f:
    chart_script = f.read()

with open('$OUTPUT_FILE', 'r') as f:
    content = f.read()

script_block = '<script>\\n' + chart_script + '\\n</script>'

if '</head>' in content:
    content = content.replace('</head>', script_block + '\\n</head>')

with open('$OUTPUT_FILE', 'w') as f:
    f.write(content)
"
fi

# Inject chart-animations script for HTML output (table alignment + chart replay)
CHART_ANIMATIONS_JS="$SCRIPT_DIR/chart-animations.js"
if [[ ("$OUTPUT_FORMAT" == "html" || "$OUTPUT_FORMAT" == "both") && -f "$OUTPUT_FILE" && -f "$CHART_ANIMATIONS_JS" ]]; then
    log_info "Injecting chart-animations script..."

    SCRIPT_CONTENT=$(cat "$CHART_ANIMATIONS_JS")

    python3 -c "
import sys
with open('$OUTPUT_FILE', 'r') as f:
    content = f.read()
script = '''<script>
$SCRIPT_CONTENT
</script>'''
content = content.replace('</body>', script + '</body>')
with open('$OUTPUT_FILE', 'w') as f:
    f.write(content)
"
fi

# Report success
if [[ -f "$OUTPUT_FILE" ]]; then
    FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
    log_info "Successfully created: $OUTPUT_FILE ($FILE_SIZE)"
else
    log_error "Failed to create output file: $OUTPUT_FILE"
    exit 1
fi

if [[ "$OUTPUT_FORMAT" == "both" && -f "$PDF_OUTPUT_FILE" ]]; then
    PDF_SIZE=$(ls -lh "$PDF_OUTPUT_FILE" | awk '{print $5}')
    log_info "Successfully created: $PDF_OUTPUT_FILE ($PDF_SIZE)"
fi

if [[ "$KEEP_TEMP" == true ]]; then
    log_info "Temporary file kept: $TEMP_FILE"
fi
