// POS Tagger Module
const POSTagger = {
    tagDescriptions: {
        'Noun': 'A word that represents a person, place, thing, or idea',
        'Verb': 'A word that describes an action, state, or occurrence',
        'Adjective': 'A word that modifies or describes a noun',
        'Adverb': 'A word that modifies a verb, adjective, or other adverb',
        'Pronoun': 'A word that substitutes for a noun or noun phrase',
        'Preposition': 'A word that shows relationship between nouns/pronouns',
        'Conjunction': 'A word that connects clauses, sentences, or words',
        'Determiner': 'A word that introduces a noun (a, an, the, this, etc.)',
        'Auxiliary': 'A helping verb (be, do, have, will, etc.)',
        'Participle': 'A verb form used as an adjective',
        'Gerund': 'A verb form ending in -ing used as a noun',
        'Infinitive': 'The base form of a verb, often with "to"',
        'Modal': 'A verb expressing necessity or possibility',
        'Negative': 'A word expressing negation',
        'Possessive': 'A word showing ownership'
    },

    tagExamples: {
        'Noun': 'dog, city, happiness, computer',
        'Verb': 'run, think, is, became',
        'Adjective': 'quick, beautiful, tall, red',
        'Adverb': 'quickly, very, well, often',
        'Pronoun': 'he, she, it, they, who',
        'Preposition': 'in, on, at, by, with',
        'Conjunction': 'and, but, or, because',
        'Determiner': 'the, a, an, this, that',
        'Auxiliary': 'is, are, was, have, will',
        'Participle': 'running, broken, written',
        'Gerund': 'swimming, reading, thinking',
        'Infinitive': 'to run, to think, to be',
        'Modal': 'can, should, must, might',
        'Negative': 'not, never, no',
        'Possessive': 'my, your, his, their'
    },

    analyze(doc, text) {
        const output = document.getElementById('pos-output');
        const statsContent = document.getElementById('pos-stats-content');

        // Extract terms with their POS tags
        const terms = doc.terms().out('array');
        const allSentences = doc.json();

        let html = '<div class="pos-tokens">';
        const tagCounts = {};
        let termIndex = 0;

        allSentences.forEach((sentence) => {
            if (sentence && sentence.terms) {
                sentence.terms.forEach((term) => {
                    const tags = term.tags || [];
                    const word = term.text || terms[termIndex];
                    const primaryTag = this.getPrimaryTag(tags);
                    const tagClass = this.getTagClass(primaryTag);

                    tagCounts[primaryTag] = (tagCounts[primaryTag] || 0) + 1;

                    html += `
                        <span class="pos-token ${tagClass}" data-word="${word}" data-tag="${primaryTag}" data-index="${termIndex}">
                            <span class="word">${word}</span>
                            <span class="pos-tag">${primaryTag}</span>
                        </span>
                    `;
                    termIndex++;
                });
            }
        });

        html += '</div>';
        output.innerHTML = html;

        // Add click handlers for word details
        document.querySelectorAll('.pos-token').forEach(token => {
            token.addEventListener('click', (e) => {
                const word = e.currentTarget.dataset.word;
                const tag = e.currentTarget.dataset.tag;
                this.showTagDetails(word, tag);
            });
        });

        // Display statistics
        this.displayStats(tagCounts, terms.length);
    },

    getPrimaryTag(tags) {
        const priority = [
            'Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun',
            'Preposition', 'Conjunction', 'Determiner', 'Auxiliary',
            'Modal', 'Participle', 'Gerund', 'Infinitive',
            'Possessive', 'Negative'
        ];

        for (let tag of priority) {
            if (tags.includes(tag)) {
                return tag;
            }
        }

        return tags[0] || 'Other';
    },

    getTagClass(tag) {
        const classMap = {
            'Noun': 'noun',
            'Verb': 'verb',
            'Adjective': 'adjective',
            'Adverb': 'adverb',
            'Pronoun': 'pronoun',
            'Preposition': 'preposition',
            'Conjunction': 'conjunction',
            'Determiner': 'determiner',
            'Auxiliary': 'auxiliary',
            'Modal': 'modal',
            'Participle': 'participle',
            'Gerund': 'gerund',
            'Infinitive': 'infinitive',
            'Possessive': 'possessive',
            'Negative': 'negative'
        };

        return classMap[tag] || 'other';
    },

    displayStats(tagCounts, totalWords) {
        const statsContent = document.getElementById('pos-stats-content');

        let html = '<div class="stats-grid">';
        html += `<div class="stat-item"><strong>Total Words:</strong> ${totalWords}</div>`;
        html += `<div class="stat-item"><strong>Unique Tags:</strong> ${Object.keys(tagCounts).length}</div>`;

        // Sort tags by frequency
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1]);

        html += '<div class="stat-item full-width"><h4>Tag Distribution:</h4></div>';

        sortedTags.forEach(([tag, count]) => {
            const percentage = ((count / totalWords) * 100).toFixed(1);
            html += `
                <div class="stat-item">
                    <span class="tag-name ${this.getTagClass(tag)}">${tag}:</span>
                    <span class="tag-count">${count} (${percentage}%)</span>
                </div>
            `;
        });

        html += '</div>';

        // Add bar chart
        html += '<div class="bar-chart">';
        sortedTags.slice(0, 8).forEach(([tag, count]) => {
            const percentage = (count / totalWords) * 100;
            html += `
                <div class="bar-item">
                    <span class="bar-label">${tag}</span>
                    <div class="bar-container">
                        <div class="bar ${this.getTagClass(tag)}" style="width: ${percentage}%"></div>
                        <span class="bar-value">${count}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        statsContent.innerHTML = html;
    },

    showTagDetails(word, tag) {
        const description = this.tagDescriptions[tag] || 'No description available';
        const examples = this.tagExamples[tag] || 'No examples available';

        const content = `
            <div class="tag-details">
                <p class="detail-word"><strong>Word:</strong> "${word}"</p>
                <p class="detail-tag">
                    <strong>POS Tag:</strong>
                    <span class="tag-badge ${this.getTagClass(tag)}">${tag}</span>
                </p>
                <p class="detail-description"><strong>Description:</strong><br>${description}</p>
                <p class="detail-examples"><strong>Examples:</strong><br>${examples}</p>
            </div>
        `;

        app.showModal(`${tag} - Details`, content);
    }
};
