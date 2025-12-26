#!/usr/bin/env python3
"""
Generate a correct eliza-rules.json from the original instructions.txt
This ensures exact compatibility with Weizenbaum's original ELIZA implementation.
"""

import json

def parse_instructions_txt(filepath: str) -> dict:
    """Parse the original instructions.txt format into JSON structure."""
    with open(filepath, 'r') as f:
        lines = f.read().strip().split('\n')

    data = {
        'preSubstitutions': {},
        'postSubstitutions': {},
        'synonyms': {},
        'quitWords': [],
        'initialGreetings': [],
        'finalGreetings': [],
        'rules': [],
        'fallbacks': []
    }

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if not line:
            i += 1
            continue

        if line.startswith('initial:'):
            data['initialGreetings'].append(line.split('initial:', 1)[1].strip())
        elif line.startswith('final:'):
            data['finalGreetings'].append(line.split('final:', 1)[1].strip())
        elif line.startswith('quit:'):
            quit_word = line.split('quit:', 1)[1].strip()
            if quit_word not in data['quitWords']:  # Avoid duplicates
                data['quitWords'].append(quit_word)
        elif line.startswith('pre:'):
            parts = line.split('pre:', 1)[1].strip().split(None, 1)
            if len(parts) == 2:
                data['preSubstitutions'][parts[0]] = parts[1]
        elif line.startswith('post:'):
            parts = line.split('post:', 1)[1].strip().split(None, 1)
            if len(parts) == 2:
                data['postSubstitutions'][parts[0]] = parts[1]
        elif line.startswith('synon:'):
            synon_line = line.split('synon:', 1)[1].strip()
            parts = synon_line.split()
            if parts:
                key = parts[0]
                data['synonyms'][key] = parts[1:]
        elif line.startswith('key:'):
            # Parse keyword
            key_line = line.split('key:', 1)[1].strip()
            parts = key_line.split()
            keyword = parts[0]
            rank = None
            if len(parts) > 1 and parts[1].isdigit():
                rank = int(parts[1])

            patterns = []
            i += 1

            # Parse decompositions and reassemblies
            current_pattern = None
            while i < len(lines):
                line = lines[i].strip()

                if line.startswith('key:'):
                    i -= 1
                    break
                elif line.startswith('decomp:'):
                    # Save previous pattern if exists
                    if current_pattern:
                        patterns.append(current_pattern)

                    # Start new pattern
                    pattern_text = line.split('decomp:', 1)[1].strip()
                    current_pattern = {
                        'pattern': pattern_text,
                        'responses': []
                    }
                elif line.startswith('reasmb:'):
                    if current_pattern is not None:
                        reasm = line.split('reasmb:', 1)[1].strip()
                        current_pattern['responses'].append(reasm)

                i += 1

            # Add last pattern
            if current_pattern:
                patterns.append(current_pattern)

            # Build rule
            rule = {
                'keyword': keyword,
                'patterns': patterns
            }
            if rank is not None:
                rule['rank'] = rank

            # Special handling for xnone - save responses as fallbacks
            if keyword == 'xnone':
                data['fallbacks'] = patterns[0]['responses']
            else:
                data['rules'].append(rule)

        i += 1

    return data

def main():
    input_file = '/Users/jmanning/llm-course/demos/01-eliza/scripts/instructions.txt'
    output_file = '/Users/jmanning/llm-course/demos/01-eliza/data/eliza-rules.json'

    print(f"Parsing {input_file}...")
    data = parse_instructions_txt(input_file)

    print(f"Writing {output_file}...")
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)

    print("\nGenerated file statistics:")
    print(f"  Initial greetings: {len(data['initialGreetings'])}")
    print(f"  Final greetings: {len(data['finalGreetings'])}")
    print(f"  Quit words: {len(data['quitWords'])}")
    print(f"  Pre-substitutions: {len(data['preSubstitutions'])}")
    print(f"  Post-substitutions: {len(data['postSubstitutions'])}")
    print(f"  Synonym groups: {len(data['synonyms'])}")
    print(f"  Keywords/rules: {len(data['rules'])}")
    print(f"  Fallback responses: {len(data['fallbacks'])}")

    print("\nKeywords:")
    for rule in sorted(data['rules'], key=lambda r: r.get('rank', 0) if r.get('rank') else 999):
        rank = rule.get('rank', 'None')
        keyword = rule['keyword']
        pattern_count = len(rule['patterns'])
        print(f"  {keyword:15s} (rank: {str(rank):4s}, patterns: {pattern_count})")

    print("\nDone!")

if __name__ == '__main__':
    main()
