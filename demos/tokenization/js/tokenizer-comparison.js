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

const exampleTexts = {
    'default': 'The quick brown fox jumps over the lazy dog. Tokenization is fundamental to NLP!',
    'multilingual': 'Hello 世界! Bonjour le monde! こんにちは世界！',
    'technical': 'The GPT-4 model uses byte-pair encoding (BPE) with a vocabulary of ~100,000 tokens.',
    'numbers': 'In 2024, AI models processed 1,000,000+ tokens per second at $0.002/1K tokens.',
    'code': 'function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }',
    'emoji': 'I love pizza 🍕 and coffee ☕! Machine learning is 🔥🚀✨',
    'contractions': "I've been thinking that we're going to be able to tokenize it's and won't differently."
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    initializeTabs();
    setupExamplesDropdown();
    setupEventListeners();
    await loadTokenizers();
});

function setupExamplesDropdown() {
    const examplesContainer = document.getElementById('comparison-examples');
    if (!examplesContainer) return;
    
    const select = document.createElement('select');
    select.id = 'example-select';
    select.className = 'example-select';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Choose an example...';
    select.appendChild(defaultOption);
    
    Object.entries(exampleTexts).forEach(([key, text]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        select.appendChild(option);
    });
    
    select.addEventListener('change', async (e) => {
        if (e.target.value && exampleTexts[e.target.value]) {
            const textInput = document.getElementById('text-input');
            textInput.value = exampleTexts[e.target.value];
            if (tokenizers.gpt2 && tokenizers.bert && tokenizers.t5) {
                await tokenizeText(exampleTexts[e.target.value]);
            }
        }
    });
    
    examplesContainer.appendChild(select);
}

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
        tokenizers.gpt2 = await AutoTokenizer.from_pretrained('Xenova/gpt2');
        
        progressText.textContent = 'Loading BERT tokenizer...';
        tokenizers.bert = await AutoTokenizer.from_pretrained('Xenova/bert-base-uncased');
        
        progressText.textContent = 'Loading T5 tokenizer...';
        tokenizers.t5 = await AutoTokenizer.from_pretrained('Xenova/t5-small');

        console.log('All tokenizers loaded successfully');
        
        loadingOverlay.style.display = 'none';
        comparisonContent.style.display = 'block';
        
        const defaultText = document.getElementById('text-input').value;
        if (defaultText) {
            await tokenizeText(defaultText);
        }
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
    try {
        // Call tokenizer as a function - returns { input_ids: Tensor, attention_mask: Tensor }
        const output = await tokenizer(text, { add_special_tokens: false });
        
        // Convert Tensor to array - handle different tensor formats
        let encoded;
        if (output.input_ids) {
            // Get the data from the tensor
            const inputIds = output.input_ids;
            if (inputIds.tolist) {
                // Tensor with tolist() method
                const listed = inputIds.tolist();
                encoded = Array.isArray(listed[0]) ? listed[0] : listed;
            } else if (inputIds.data) {
                // Tensor with data property
                encoded = Array.from(inputIds.data);
            } else if (Array.isArray(inputIds)) {
                encoded = inputIds;
            } else {
                encoded = Array.from(inputIds);
            }
        } else {
            // Fallback: try encode() method
            const result = await tokenizer.encode(text);
            encoded = Array.isArray(result) ? result : Array.from(result);
        }

        // Get token strings by decoding each ID individually
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
            span.textContent = token.replace(/▁/g, '␣').replace(/Ġ/g, '␣');
            span.title = `Token ID: ${encoded[idx]}`;
            outputDiv.appendChild(span);
        });

        // Display token IDs
        idsDiv.textContent = encoded.join(', ');

        // Display stats
        const tokenCount = tokens.length;
        const charCount = text.length;
        const ratio = tokenCount > 0 ? (charCount / tokenCount).toFixed(2) : '0.00';

        tokenCountSpan.textContent = `Tokens: ${tokenCount}`;
        ratioSpan.textContent = `Ratio: ${ratio}`;
    } catch (error) {
        console.error(`Error processing ${name} tokenizer:`, error);
        const outputDiv = document.getElementById(`${name}-output`);
        while (outputDiv.firstChild) {
            outputDiv.removeChild(outputDiv.firstChild);
        }
        const errorSpan = document.createElement('span');
        errorSpan.className = 'token error';
        errorSpan.textContent = `Error: ${error.message}`;
        outputDiv.appendChild(errorSpan);
    }
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
        let vocabArray = [];
        let totalVocabSize = 0;
        
        const vocab = getVocabFromTokenizer(tokenizer);
        
        if (vocab && Object.keys(vocab).length > 0) {
            vocabArray = buildVocabArrayFromDict(vocab);
            totalVocabSize = Object.keys(vocab).length;
        } else {
            const result = await buildVocabArrayFromIds(tokenizer, tokenizerName);
            vocabArray = result.vocabArray;
            totalVocabSize = result.totalSize;
        }

        if (vocabArray.length === 0) {
            const tbody = document.getElementById('vocab-table-body');
            tbody.innerHTML = '<tr><td colspan="4" class="loading">Vocabulary not accessible for this tokenizer</td></tr>';
            return;
        }

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
        updateVocabStats(vocabArray, totalVocabSize);
        displayVocabPage();
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        const tbody = document.getElementById('vocab-table-body');
        tbody.innerHTML = `<tr><td colspan="4" class="loading">Error: ${error.message}</td></tr>`;
    }
}

function getVocabFromTokenizer(tokenizer) {
    if (tokenizer.model && tokenizer.model.vocab && typeof tokenizer.model.vocab === 'object') {
        const vocab = tokenizer.model.vocab;
        const keys = Object.keys(vocab);
        if (keys.length > 0 && typeof vocab[keys[0]] === 'number') {
            return vocab;
        }
    }
    return null;
}

function buildVocabArrayFromDict(vocab) {
    const entries = Object.entries(vocab);
    return entries
        .map(([token, id]) => ({
            token: String(token),
            id: typeof id === 'number' ? id : parseInt(id),
            type: getTokenType(String(token)),
            length: String(token).length
        }))
        .filter(item => !isNaN(item.id) && item.id >= 0);
}

async function buildVocabArrayFromIds(tokenizer, tokenizerName) {
    const vocabSizes = { gpt2: 50257, bert: 30522, t5: 32128 };
    const vocabSize = vocabSizes[tokenizerName] || 32000;
    
    const vocabArray = [];
    const batchSize = 100;
    
    for (let startId = 0; startId < Math.min(vocabSize, 5000); startId += batchSize) {
        const ids = [];
        for (let i = startId; i < Math.min(startId + batchSize, vocabSize); i++) {
            ids.push(i);
        }
        
        try {
            const tokens = tokenizer.convert_ids_to_tokens(ids);
            if (tokens && Array.isArray(tokens)) {
                tokens.forEach((token, idx) => {
                    if (token && typeof token === 'string' && token.length > 0) {
                        vocabArray.push({
                            token: token,
                            id: startId + idx,
                            type: getTokenType(token),
                            length: token.length
                        });
                    }
                });
            }
        } catch (e) {
            for (const id of ids) {
                try {
                    const decoded = tokenizer.decode([id], { skip_special_tokens: false });
                    if (decoded && decoded.length > 0) {
                        vocabArray.push({
                            token: decoded,
                            id: id,
                            type: getTokenType(decoded),
                            length: decoded.length
                        });
                    }
                } catch (e2) {
                    continue;
                }
            }
        }
    }
    
    return { vocabArray, totalSize: vocabSize };
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

        const displayToken = formatTokenForDisplay(item.token);
        row.innerHTML = `
            <td>${item.id}</td>
            <td><code class="token-display" title="Raw: ${escapeHtml(item.token)}">${escapeHtml(displayToken)}</code></td>
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

function formatTokenForDisplay(token) {
    return token
        .replace(/Ġ/g, '␣')
        .replace(/▁/g, '␣')
        .replace(/##/g, '··');
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
