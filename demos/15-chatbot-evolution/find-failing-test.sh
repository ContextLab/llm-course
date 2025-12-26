#!/bin/bash

for i in {1..30}; do
    output=$(node test-parry-final.mjs 2>&1)

    if echo "$output" | grep -q "FAIL"; then
        echo "=== FOUND FAILURE IN RUN $i ==="
        echo "$output" | grep -B1 -A2 "FAIL"
        break
    fi
done
