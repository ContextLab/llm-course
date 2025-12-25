// Dependency Parser Module
const DependencyParser = {
    dependencies: [],

    analyze(doc, text) {
        // Parse dependencies from the sentence structure
        this.dependencies = this.extractDependencies(doc, text);

        // Render visualizations
        TreeVisualizer.renderTree(this.dependencies);
        this.renderArcDiagram(this.dependencies);
    },

    extractDependencies(doc, text) {
        const dependencies = [];
        const json = doc.json()[0];

        if (!json || !json.terms) {
            return dependencies;
        }

        const terms = json.terms;
        const words = terms.map((t, idx) => ({
            id: idx,
            word: t.text,
            pos: this.getPrimaryTag(t.tags || []),
            tags: t.tags || []
        }));

        // Find the main verb (root)
        let rootIdx = words.findIndex(w =>
            w.tags.includes('Verb') && !w.tags.includes('Auxiliary') && !w.tags.includes('Gerund')
        );

        if (rootIdx === -1) {
            rootIdx = words.findIndex(w => w.tags.includes('Verb'));
        }

        if (rootIdx === -1) {
            rootIdx = Math.floor(words.length / 2);
        }

        // Build dependency tree
        words.forEach((word, idx) => {
            if (idx === rootIdx) {
                dependencies.push({
                    source: idx,
                    target: idx,
                    type: 'ROOT',
                    word: word.word,
                    pos: word.pos
                });
            } else {
                // Determine dependency type and head
                const dep = this.determineDependency(words, idx, rootIdx);
                dependencies.push({
                    source: dep.head,
                    target: idx,
                    type: dep.type,
                    word: word.word,
                    pos: word.pos
                });
            }
        });

        return dependencies;
    },

    determineDependency(words, idx, rootIdx) {
        const word = words[idx];
        const tags = word.tags;

        // Determiners
        if (tags.includes('Determiner')) {
            const nextNoun = this.findNext(words, idx, ['Noun', 'Pronoun']);
            return { head: nextNoun !== -1 ? nextNoun : rootIdx, type: 'det' };
        }

        // Adjectives
        if (tags.includes('Adjective')) {
            const nextNoun = this.findNext(words, idx, ['Noun']);
            return { head: nextNoun !== -1 ? nextNoun : rootIdx, type: 'amod' };
        }

        // Adverbs
        if (tags.includes('Adverb')) {
            const nextVerb = this.findNext(words, idx, ['Verb']);
            const prevVerb = this.findPrev(words, idx, ['Verb']);
            const head = nextVerb !== -1 ? nextVerb : (prevVerb !== -1 ? prevVerb : rootIdx);
            return { head, type: 'advmod' };
        }

        // Prepositions
        if (tags.includes('Preposition')) {
            const prevVerb = this.findPrev(words, idx, ['Verb', 'Noun']);
            return { head: prevVerb !== -1 ? prevVerb : rootIdx, type: 'prep' };
        }

        // Nouns - determine if subject or object
        if (tags.includes('Noun') || tags.includes('Pronoun')) {
            if (idx < rootIdx) {
                return { head: rootIdx, type: 'nsubj' };
            } else {
                const prevPrep = this.findPrev(words, idx, ['Preposition']);
                if (prevPrep !== -1 && prevPrep > rootIdx) {
                    return { head: prevPrep, type: 'pobj' };
                }
                return { head: rootIdx, type: 'dobj' };
            }
        }

        // Auxiliaries
        if (tags.includes('Auxiliary') || tags.includes('Modal')) {
            const nextVerb = this.findNext(words, idx, ['Verb']);
            return { head: nextVerb !== -1 ? nextVerb : rootIdx, type: 'aux' };
        }

        // Conjunctions
        if (tags.includes('Conjunction')) {
            return { head: rootIdx, type: 'cc' };
        }

        // Default to root
        return { head: rootIdx, type: 'dep' };
    },

    findNext(words, fromIdx, tags) {
        for (let i = fromIdx + 1; i < words.length; i++) {
            if (tags.some(tag => words[i].tags.includes(tag))) {
                return i;
            }
        }
        return -1;
    },

    findPrev(words, fromIdx, tags) {
        for (let i = fromIdx - 1; i >= 0; i--) {
            if (tags.some(tag => words[i].tags.includes(tag))) {
                return i;
            }
        }
        return -1;
    },

    getPrimaryTag(tags) {
        const priority = [
            'Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun',
            'Preposition', 'Conjunction', 'Determiner', 'Auxiliary'
        ];

        for (let tag of priority) {
            if (tags.includes(tag)) {
                return tag;
            }
        }

        return tags[0] || 'Other';
    },

    renderArcDiagram(dependencies) {
        const container = document.getElementById('arc-diagram');
        container.innerHTML = '';

        if (!dependencies || dependencies.length === 0) {
            container.innerHTML = '<p class="placeholder">No dependencies to display</p>';
            return;
        }

        const width = container.clientWidth || 900;
        const height = 400;
        const padding = { top: 100, right: 40, bottom: 60, left: 40 };

        const svg = d3.select('#arc-diagram')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create word positions
        const words = dependencies.map(d => d.word);
        const wordWidth = (width - padding.left - padding.right) / words.length;
        const positions = words.map((word, i) => ({
            x: padding.left + (i + 0.5) * wordWidth,
            y: height - padding.bottom,
            word: word,
            id: i
        }));

        // Draw arcs
        const arcs = svg.append('g').attr('class', 'arcs');

        dependencies.forEach(dep => {
            if (dep.source === dep.target) return; // Skip root

            const sourcePos = positions[dep.source];
            const targetPos = positions[dep.target];

            const distance = Math.abs(targetPos.x - sourcePos.x);
            const arcHeight = Math.min(distance / 2, 80);

            const path = d3.path();
            path.moveTo(sourcePos.x, sourcePos.y - 20);

            // Create arc
            const midX = (sourcePos.x + targetPos.x) / 2;
            const controlY = sourcePos.y - arcHeight - 20;

            path.quadraticCurveTo(midX, controlY, targetPos.x, targetPos.y - 20);

            arcs.append('path')
                .attr('d', path.toString())
                .attr('class', `arc ${dep.type}`)
                .attr('fill', 'none')
                .attr('stroke', this.getDependencyColor(dep.type))
                .attr('stroke-width', 2)
                .attr('marker-end', 'url(#arrowhead)');

            // Add label
            arcs.append('text')
                .attr('x', midX)
                .attr('y', controlY + 5)
                .attr('class', 'arc-label')
                .attr('text-anchor', 'middle')
                .text(dep.type);
        });

        // Define arrowhead marker
        svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', 9)
            .attr('refY', 3)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 10 3, 0 6')
            .attr('fill', '#666');

        // Draw words
        const wordGroup = svg.append('g').attr('class', 'words');

        positions.forEach((pos, i) => {
            const dep = dependencies.find(d => d.target === i);

            wordGroup.append('text')
                .attr('x', pos.x)
                .attr('y', pos.y)
                .attr('class', 'word-text')
                .attr('text-anchor', 'middle')
                .text(pos.word)
                .style('cursor', 'pointer')
                .on('click', () => {
                    this.showDependencyInfo(dep, pos.word, i);
                });

            wordGroup.append('circle')
                .attr('cx', pos.x)
                .attr('cy', pos.y - 10)
                .attr('r', 4)
                .attr('fill', '#4a90e2');
        });
    },

    getDependencyColor(type) {
        const colors = {
            'nsubj': '#e74c3c',
            'dobj': '#3498db',
            'obj': '#3498db',
            'det': '#2ecc71',
            'amod': '#f39c12',
            'advmod': '#9b59b6',
            'prep': '#1abc9c',
            'pobj': '#16a085',
            'aux': '#e67e22',
            'cc': '#34495e',
            'ROOT': '#c0392b'
        };

        return colors[type] || '#95a5a6';
    },

    showDependencyInfo(dep, word, idx) {
        const infoBox = document.getElementById('dependency-info');

        if (!dep) return;

        const headWord = dependencies.find(d => d.target === dep.source)?.word || 'ROOT';

        let html = '<h3>Dependency Information</h3>';
        html += '<div class="dep-details">';
        html += `<p><strong>Word:</strong> "${word}"</p>`;
        html += `<p><strong>POS:</strong> ${dep.pos}</p>`;
        html += `<p><strong>Dependency Type:</strong> <span class="dep-type">${dep.type}</span></p>`;
        html += `<p><strong>Head:</strong> "${headWord}"</p>`;
        html += `<p><strong>Description:</strong> ${this.getDependencyDescription(dep.type)}</p>`;
        html += '</div>';

        infoBox.innerHTML = html;
    },

    getDependencyDescription(type) {
        const descriptions = {
            'ROOT': 'The root of the sentence (main verb)',
            'nsubj': 'Nominal subject - the noun phrase performing the action',
            'dobj': 'Direct object - receives the action of the verb',
            'obj': 'Object of the verb',
            'det': 'Determiner - articles and demonstratives',
            'amod': 'Adjectival modifier - adjective modifying a noun',
            'advmod': 'Adverbial modifier - adverb modifying a verb/adjective',
            'prep': 'Prepositional modifier',
            'pobj': 'Object of a preposition',
            'aux': 'Auxiliary verb - helping verb',
            'cc': 'Coordinating conjunction',
            'conj': 'Conjunct - word connected by a conjunction',
            'dep': 'Dependent - general dependency'
        };

        return descriptions[type] || 'Dependency relation';
    }
};
