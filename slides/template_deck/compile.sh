#!/bin/bash
#
# compile.sh - Marp Presentation Compiler with Code Block Processing
#
# This script compiles Marp markdown presentations with automatic features:
# - Line numbering for all code blocks
# - Auto-splitting of long code blocks across multiple slides
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
#   -f, --format      Output format: html, pdf, pptx (default: html)
#   -t, --theme       Theme directory (default: ./themes/)
#   -h, --help        Show this help message
#   --no-split        Disable auto-splitting (use JavaScript-only approach)
#   --keep-temp       Keep temporary processed file for debugging
#
# Examples:
#   ./compile.sh                           # Compile theme_showcase.md to HTML
#   ./compile.sh my_deck.md                # Compile my_deck.md to HTML
#   ./compile.sh deck.md -o output.html    # Specify output file
#   ./compile.sh deck.md -l 15             # Use 15 lines per slide for code
#   ./compile.sh deck.md -f pdf            # Output as PDF
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
OUTPUT_FORMAT="html"
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
    OUTPUT_FILE="${BASENAME}.${OUTPUT_FORMAT}"
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

# Create temporary file
TEMP_FILE=$(mktemp "/tmp/marp_processed_XXXXXX.md")
trap "if [[ \$KEEP_TEMP != true ]]; then rm -f '$TEMP_FILE'; fi" EXIT

log_info "Processing: $INPUT_FILE"
log_info "Output: $OUTPUT_FILE"
log_info "Max lines per slide: $MAX_LINES_PER_SLIDE"

# Build Python processing command
PYTHON_CMD="python3 \"$PROCESS_SCRIPT\" \"$INPUT_FILE\" \"$TEMP_FILE\" --max-lines $MAX_LINES_PER_SLIDE"
if [[ "$NO_SPLIT" == true ]]; then
    PYTHON_CMD="$PYTHON_CMD --no-split"
fi

# Run the processing
log_info "Processing markdown..."
eval $PYTHON_CMD

# Build marp command
MARP_CMD="marp \"$TEMP_FILE\" --theme-set \"$THEME_DIR\" --html"

# Add output format specific options
case $OUTPUT_FORMAT in
    html)
        MARP_CMD="$MARP_CMD -o \"$OUTPUT_FILE\""
        ;;
    pdf)
        MARP_CMD="$MARP_CMD --pdf -o \"$OUTPUT_FILE\""
        ;;
    pptx)
        MARP_CMD="$MARP_CMD --pptx -o \"$OUTPUT_FILE\""
        ;;
    *)
        log_error "Unknown output format: $OUTPUT_FORMAT"
        exit 1
        ;;
esac

# Run marp
log_info "Running marp..."
eval $MARP_CMD

# Report success
if [[ -f "$OUTPUT_FILE" ]]; then
    log_info "Successfully created: $OUTPUT_FILE"
    if [[ "$KEEP_TEMP" == true ]]; then
        log_info "Temporary file kept: $TEMP_FILE"
    fi
else
    log_error "Failed to create output file"
    exit 1
fi

# Print summary
FILE_SIZE=$(ls -lh "$OUTPUT_FILE" | awk '{print $5}')
log_info "Output file size: $FILE_SIZE"
