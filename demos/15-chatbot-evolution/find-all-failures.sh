#!/bin/bash

echo "Running tests to find all failing responses..."

for i in {1..100}; do
    output=$(node test-parry-final.mjs 2>&1)

    if echo "$output" | grep -q "FAIL"; then
        echo "=== FAILURE FOUND ==="
        echo "$output" | grep -B1 -A2 "FAIL"
        echo ""
    fi
done
