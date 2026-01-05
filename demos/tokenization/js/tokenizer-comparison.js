import { AutoTokenizer } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Global state
let tokenizers = {
    gpt2: null,
    bert: null,
    t5: null
};

let vocabData = {
    gpt2: null,
    bert: null,
    t5: null
};

let currentVocabPage = 0;
const VOCAB_PAGE_SIZE = 100;
let filteredVocab = [];
let currentSortColumn = 'id';
let sortAscending = true;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeTabs();
    setupEventListeners();  // Setup listeners BEFORE loading so button is always responsive
    await loadTokenizers();

    // Auto-tokenize with default text after tokenizers are ready
    const defaultText = document.getElementById('text-input').value;
    if (defaultText && tokenizers.gpt2 && tokenizers.bert && tokenizers.t5) {
        await tokenizeText(defaultText);
    }
});

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // Load vocab when vocab browser is opened
            if (tabId === 'vocab-browser') {
                updateVocabulary();
            }
        });
    });
}

async function loadTokenizers() {
    const loadingOverlay = document.getElementById('tokenizer-loading-overlay');
    const comparisonContent = document.getElementById('comparison-content');
    const progressText = document.getElementById('loading-progress-text');

    try {
        console.log('Loading tokenizers...');

        progressText.textContent = 'Loading GPT-2 tokenizer...';
        tokenizers.gpt2 = await AutoTokenizer.from_pretrained('gpt2');
        
        progressText.textContent = 'Loading BERT tokenizer...';
        tokenizers.bert = await AutoTokenizer.from_pretrained('bert-base-uncased');
        
        progressText.textContent = 'Loading T5 tokenizer...';
        tokenizers.t5 = await AutoTokenizer.from_pretrained('t5-small');

        console.log('All tokenizers loaded successfully');
        
        loadingOverlay.style.display = 'none';
        comparisonContent.style.display = 'block';
    } catch (error) {
        console.error('Error loading tokenizers:', error);
        loadingOverlay.classList.add('error');
        const loadingText = loadingOverlay.querySelector('.loading-text');
        if (loadingText) loadingText.textContent = 'Loading Failed';
        progressText.textContent = `Error: ${error.message}. Please refresh the page.`;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tokenization
    document.getElementById('tokenize-btn').addEventListener('click', async () => {
        const text = document.getElementById('text-input').value;
        if (text) {
            await tokenizeText(text);
        }
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
        document.getElementById('text-input').value = '';
        clearOutputs();
    });

    document.getElementById('text-input').addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            const text = e.target.value;
            if (text) {
                await tokenizeText(text);
            }
        }
    });

    // Vocabulary browser
    document.getElementById('vocab-tokenizer').addEventListener('change', updateVocabulary);
    document.getElementById('vocab-search').addEventListener('input', updateVocabulary);
    document.getElementById('vocab-filter').addEventListener('change', updateVocabulary);
    document.getElementById('vocab-prev').addEventListener('click', () => {
        if (currentVocabPage > 0) {
            currentVocabPage--;
            displayVocabPage();
        }
    });
    document.getElementById('vocab-next').addEventListener('click', () => {
        if ((currentVocabPage + 1) * VOCAB_PAGE_SIZE < filteredVocab.length) {
            currentVocabPage++;
            displayVocabPage();
        }
    });
}

// Tokenize text with all tokenizers
async function tokenizeText(text) {
    if (!tokenizers.gpt2 || !tokenizers.bert || !tokenizers.t5) {
        alert('Tokenizers are still loading. Please wait...');
        return;
    }

    try {
        // GPT-2
        await processTokenizer('gpt2', text, tokenizers.gpt2);

        // BERT
        await processTokenizer('bert', text, tokenizers.bert);

        // T5
        await processTokenizer('t5', text, tokenizers.t5);

        // Update comparison chart
        updateComparisonChart();
    } catch (error) {
        console.error('Error tokenizing:', error);
    }
}

// Process individual tokenizer
async function processTokenizer(name, text, tokenizer) {
    // encode() returns the token IDs as an array
    const encoded = await tokenizer.encode(text);

    // Get token strings by decoding each ID individually
    // This works around the fact that tokenize() may not be available
    const tokens = [];
    for (let i = 0; i < encoded.length; i++) {
        const tokenStr = tokenizer.decode([encoded[i]], { skip_special_tokens: false });
        tokens.push(tokenStr);
    }

    const outputDiv = document.getElementById(`${name}-output`);
    const idsDiv = document.getElementById(`${name}-ids`);
    const tokenCountSpan = document.getElementById(`${name}-token-count`);
    const ratioSpan = document.getElementById(`${name}-ratio`);

    // Clear previous output using safe DOM method
    while (outputDiv.firstChild) {
        outputDiv.removeChild(outputDiv.firstChild);
    }

    // Display tokens with colors
    tokens.forEach((token, idx) => {
        const span = document.createElement('span');
        span.className = `token token-${idx % 8}`;
        // Clean up special characters for display
        span.textContent = token.replace(/▁/g, '·').replace(/Ġ/g, '·');
        span.title = `Token ID: ${encoded[idx]}`;
        outputDiv.appendChild(span);
    });

    // Display token IDs
    idsDiv.textContent = encoded.join(', ');

    // Display stats
    const tokenCount = tokens.length;
    const charCount = text.length;
    const ratio = (charCount / tokenCount).toFixed(2);

    tokenCountSpan.textContent = `Tokens: ${tokenCount}`;
    ratioSpan.textContent = `Ratio: ${ratio}`;
}

// Clear all outputs
function clearOutputs() {
    ['gpt2', 'bert', 't5'].forEach(name => {
        const outputEl = document.getElementById(`${name}-output`);
        while (outputEl.firstChild) {
            outputEl.removeChild(outputEl.firstChild);
        }
        document.getElementById(`${name}-ids`).textContent = '';
        document.getElementById(`${name}-token-count`).textContent = 'Tokens: -';
        document.getElementById(`${name}-ratio`).textContent = 'Ratio: -';
    });

    const canvas = document.getElementById('comparison-chart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update comparison chart
function updateComparisonChart() {
    const canvas = document.getElementById('comparison-chart');
    const ctx = canvas.getContext('2d');

    const gpt2Count = parseInt(document.getElementById('gpt2-token-count').textContent.split(': ')[1]) || 0;
    const bertCount = parseInt(document.getElementById('bert-token-count').textContent.split(': ')[1]) || 0;
    const t5Count = parseInt(document.getElementById('t5-token-count').textContent.split(': ')[1]) || 0;

    if (gpt2Count === 0 && bertCount === 0 && t5Count === 0) return;

    const data = [
        { name: 'GPT-2', count: gpt2Count, color: '#60a5fa' },
        { name: 'BERT', count: bertCount, color: '#4ade80' },
        { name: 'T5', count: t5Count, color: '#f472b6' }
    ];

    const maxCount = Math.max(gpt2Count, bertCount, t5Count);
    const chartHeight = 250;
    const chartWidth = canvas.width - 100;
    const barHeight = 60;
    const startY = 30;
    const startX = 80;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    data.forEach((item, idx) => {
        const barWidth = (item.count / maxCount) * chartWidth;
        const y = startY + idx * (barHeight + 20);

        // Bar
        ctx.fillStyle = item.color;
        ctx.fillRect(startX, y, barWidth, barHeight);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#e5e7eb' : '#111827';
        
        // Label
        ctx.fillStyle = textColor;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(item.name, startX - 10, y + barHeight / 2 + 6);

        // Count
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(item.count, startX + 10, y + barHeight / 2 + 6);
    });

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const titleColor = isDark ? '#e5e7eb' : '#111827';
    
    // Title
    ctx.fillStyle = titleColor;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Token Count Comparison', 10, 20);
}

async function updateVocabulary() {
    const tokenizerName = document.getElementById('vocab-tokenizer').value;
    const searchTerm = document.getElementById('vocab-search').value.toLowerCase();
    const filter = document.getElementById('vocab-filter').value;

    const tokenizer = tokenizers[tokenizerName];
    if (!tokenizer) {
        const tbody = document.getElementById('vocab-table-body');
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Tokenizer not loaded yet. Please wait...</td></tr>';
        return;
    }

    try {
        let vocab = null;
        
        if (tokenizer.model && tokenizer.model.vocab) {
            vocab = tokenizer.model.vocab;
        } else if (tokenizer.tokenizer && tokenizer.tokenizer.model && tokenizer.tokenizer.model.vocab) {
            vocab = tokenizer.tokenizer.model.vocab;
        } else if (tokenizer.vocab) {
            vocab = tokenizer.vocab;
        }
        
        if (!vocab) {
            const tbody = document.getElementById('vocab-table-body');
            tbody.innerHTML = '<tr><td colspan="4" class="loading">Vocabulary not accessible for this tokenizer</td></tr>';
            console.warn('Could not access vocab for', tokenizerName, 'tokenizer structure:', tokenizer);
            return;
        }

        let vocabArray = [];
        const entries = Object.entries(vocab);
        
        if (entries.length > 0) {
            const [firstKey, firstValue] = entries[0];
            const keyIsNumeric = !isNaN(parseInt(firstKey)) && typeof firstValue === 'string';
            
            if (keyIsNumeric) {
                vocabArray = entries.map(([id, token]) => ({
                    token: String(token),
                    id: parseInt(id),
                    type: getTokenType(String(token)),
                    length: String(token).length
                }));
            } else {
                vocabArray = entries.map(([token, id]) => ({
                    token: String(token),
                    id: typeof id === 'number' ? id : parseInt(id) || 0,
                    type: getTokenType(String(token)),
                    length: String(token).length
                }));
            }
        }

        // Apply filters
        if (searchTerm) {
            vocabArray = vocabArray.filter(item =>
                item.token.toLowerCase().includes(searchTerm)
            );
        }

        if (filter !== 'all') {
            vocabArray = vocabArray.filter(item => {
                if (filter === 'letters') return /^[a-zA-Z]+$/.test(item.token);
                if (filter === 'subwords') return item.type === 'subword';
                if (filter === 'special') return item.type === 'special';
                return true;
            });
        }

        filteredVocab = vocabArray;
        currentVocabPage = 0;
        
        sortVocab();
        updateVocabStats(vocabArray, Object.keys(vocab).length);
        displayVocabPage();
    } catch (error) {
        console.error('Error loading vocabulary:', error);
    }
}

function getTokenType(token) {
    if (token.startsWith('<') && token.endsWith('>')) return 'special';
    if (token.startsWith('[') && token.endsWith(']')) return 'special';
    if (token.startsWith('##') || token.startsWith('▁') || token.startsWith('Ġ')) return 'subword';
    if (/^[a-zA-Z]+$/.test(token)) return 'word';
    return 'other';
}

function sortVocab() {
    filteredVocab.sort((a, b) => {
        let valA = a[currentSortColumn];
        let valB = b[currentSortColumn];
        
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        let comparison = 0;
        if (valA < valB) comparison = -1;
        else if (valA > valB) comparison = 1;
        
        return sortAscending ? comparison : -comparison;
    });
}

function handleSort(column) {
    if (currentSortColumn === column) {
        sortAscending = !sortAscending;
    } else {
        currentSortColumn = column;
        sortAscending = true;
    }
    sortVocab();
    currentVocabPage = 0;
    displayVocabPage();
}

function updateVocabStats(vocabArray, totalSize) {
    document.getElementById('vocab-size').textContent = totalSize.toLocaleString();

    const subwordCount = vocabArray.filter(item => item.type === 'subword').length;
    document.getElementById('subword-tokens-count').textContent = subwordCount.toLocaleString();
}

function displayVocabPage() {
    const tbody = document.getElementById('vocab-table-body');
    tbody.innerHTML = '';

    updateTableHeaders();

    const start = currentVocabPage * VOCAB_PAGE_SIZE;
    const end = Math.min(start + VOCAB_PAGE_SIZE, filteredVocab.length);
    const pageItems = filteredVocab.slice(start, end);

    if (pageItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">No tokens found</td></tr>';
        return;
    }

    pageItems.forEach(item => {
        const row = document.createElement('tr');
        const typeClass = item.type === 'special' ? 'special' :
                         item.type === 'subword' ? 'subword' : 'word';

        row.innerHTML = `
            <td>${item.id}</td>
            <td><code class="token-display">${escapeHtml(item.token)}</code></td>
            <td><span class="token-type ${typeClass}">${item.type}</span></td>
            <td>${item.length}</td>
        `;
        tbody.appendChild(row);
    });

    const totalPages = Math.ceil(filteredVocab.length / VOCAB_PAGE_SIZE);
    document.getElementById('vocab-page-info').textContent =
        `Page ${currentVocabPage + 1} of ${totalPages} (${filteredVocab.length} tokens)`;

    document.getElementById('vocab-prev').disabled = currentVocabPage === 0;
    document.getElementById('vocab-next').disabled = end >= filteredVocab.length;
}

function updateTableHeaders() {
    const headers = document.querySelectorAll('.vocab-table th');
    const columns = ['id', 'token', 'type', 'length'];
    
    headers.forEach((th, index) => {
        const column = columns[index];
        const arrow = currentSortColumn === column ? (sortAscending ? ' ▲' : ' ▼') : '';
        const baseText = ['Token ID', 'Token', 'Type', 'Length'][index];
        th.textContent = baseText + arrow;
        th.style.cursor = 'pointer';
        th.onclick = () => handleSort(column);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export for use in other modules
window.tokenizerComparison = {
    tokenizers,
    tokenizeText
};
