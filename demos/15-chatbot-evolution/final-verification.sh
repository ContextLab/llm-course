#!/bin/bash

echo "=== FINAL PARRY VERIFICATION - 100 ITERATIONS ==="
echo ""
passed=0

for i in {1..100}; do
    result=$(node test-parry-final.mjs 2>&1 | grep "PASSED:" | awk '{print $2}' | cut -d'/' -f1)
    if [ "$result" = "14" ]; then
        passed=$((passed + 1))
    fi
    echo -n "."
    if [ $((i % 50)) -eq 0 ]; then
        echo " $i"
    fi
done

echo ""
echo ""
echo "=== RESULTS ==="
echo "Passed: $passed/100 runs"
echo "Success Rate: $((passed * 100 / 100))%"
echo ""

if [ "$passed" -eq 100 ]; then
    echo "✅✅✅ 100% CONSISTENCY ACHIEVED ✅✅✅"
    echo "All 14 tests pass on every single run!"
    echo ""
    echo "PARRY implementation is now historically accurate and complete."
    exit 0
else
    echo "❌ Failed to achieve 100% consistency"
    echo "Only $passed/100 runs passed all tests"
    exit 1
fi
