#!/bin/bash

echo "Running 50 test iterations to verify 100% consistency..."
passed=0

for i in {1..50}; do
    result=$(node test-parry-final.mjs 2>&1 | grep "PASSED:" | awk '{print $2}' | cut -d'/' -f1)
    if [ "$result" = "14" ]; then
        passed=$((passed + 1))
    fi
    echo -n "."
done

echo ""
echo "RESULTS: $passed/50 runs achieved 14/14 tests"

if [ "$passed" -eq 50 ]; then
    echo "✅ 100% CONSISTENCY ACHIEVED - ALL TESTS PASS"
    exit 0
else
    echo "⚠ Inconsistency detected: only $passed/50 passed all tests"
    exit 1
fi
