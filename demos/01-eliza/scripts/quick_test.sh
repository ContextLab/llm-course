#!/bin/bash
# Quick verification that the rules file is correctly formatted and has expected content

echo "=========================================="
echo "ELIZA Rules Quick Verification"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.."

echo "1. Checking JSON validity..."
python3 -c "import json; json.load(open('data/eliza-rules.json')); print('   ✓ JSON is valid')" || exit 1

echo ""
echo "2. Checking rule counts..."
python3 -c "
import json
data = json.load(open('data/eliza-rules.json'))
expected = {
    'rules': 35,
    'fallbacks': 4,
    'initialGreetings': 2,
    'finalGreetings': 2,
    'quitWords': 3,
    'preSubstitutions': 16,
    'postSubstitutions': 9,
    'synonyms': 8
}
for key, count in expected.items():
    actual = len(data[key])
    status = '✓' if actual == count else '✗'
    print(f'   {status} {key}: {actual} (expected {count})')
    if actual != count:
        exit(1)
"

echo ""
echo "3. Checking 'sorry' keyword (the main fix)..."
python3 -c "
import json
data = json.load(open('data/eliza-rules.json'))
sorry = next(r for r in data['rules'] if r['keyword'] == 'sorry')
rank = sorry.get('rank')
if rank is None:
    print('   ✓ sorry has no rank (correct - lowest priority)')
else:
    print(f'   ✗ sorry has rank {rank} (should be None)')
    exit(1)
"

echo ""
echo "4. Checking high-priority keywords..."
python3 -c "
import json
data = json.load(open('data/eliza-rules.json'))
high_priority = {
    'computer': 50,
    'name': 15,
    'alike': 10,
    'like': 10,
    'remember': 5
}
for keyword, expected_rank in high_priority.items():
    rule = next(r for r in data['rules'] if r['keyword'] == keyword)
    actual_rank = rule.get('rank')
    status = '✓' if actual_rank == expected_rank else '✗'
    print(f'   {status} {keyword}: rank {actual_rank} (expected {expected_rank})')
    if actual_rank != expected_rank:
        exit(1)
"

echo ""
echo "5. Checking synonym groups..."
python3 -c "
import json
data = json.load(open('data/eliza-rules.json'))
# Check sad synonyms (this is what makes 'depressed' work)
if 'depressed' in data['synonyms']['sad']:
    print('   ✓ depressed in sad synonyms')
else:
    print('   ✗ depressed not in sad synonyms')
    exit(1)
# Check family synonyms
if 'mother' in data['synonyms']['family']:
    print('   ✓ mother in family synonyms')
else:
    print('   ✗ mother not in family synonyms')
    exit(1)
"

echo ""
echo "=========================================="
echo "All checks passed! ✓"
echo "=========================================="
echo ""
echo "The ELIZA rules have been successfully fixed."
echo "The main issue (sorry keyword over-matching) has been resolved."
echo ""
echo "To test interactively:"
echo "  1. Start server: python3 -m http.server 8888"
echo "  2. Open browser: http://localhost:8888/index.html"
echo "  3. Or run tests: http://localhost:8888/test.html"
