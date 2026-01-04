/**
 * Component Explorer - Handles detailed component views and educational content
 */

class ComponentExplorer {
    constructor() {
        this.currentMode = 'beginner';
        this.components = this.initializeComponentData();
    }

    initializeComponentData() {
        return {
            embedding: {
                name: 'Token Embedding Layer',
                icon: 'E',
                description: {
                    beginner: 'Converts each word or token into a numerical vector that the model can process.',
                    intermediate: 'Maps discrete tokens to continuous vector representations using a learned embedding matrix. Each token gets a unique d_model dimensional vector.',
                    advanced: 'Learned embedding matrix E ∈ ℝ^(V×d_model) where V is vocabulary size. Uses lookup operation to map token IDs to dense vectors.'
                },
                formula: 'x = Embedding(token_id) → ℝ^d_model',
                tensorShapes: {
                    input: '[batch_size, seq_len]',
                    output: '[batch_size, seq_len, d_model]'
                },
                code: `# PyTorch implementation
import torch.nn as nn

embedding = nn.Embedding(
    num_embeddings=vocab_size,  # 50000
    embedding_dim=d_model        # 512
)

# Forward pass
x = embedding(input_ids)  # [batch, seq] → [batch, seq, 512]`,
                keyPoints: [
                    'Vocabulary size determines embedding matrix rows',
                    'Each token maps to a unique d_model dimensional vector',
                    'Embeddings are learned during training',
                    'Can use pre-trained embeddings (Word2Vec, GloVe)',
                    'Reduces sparsity of one-hot encodings'
                ]
            },

            positional: {
                name: 'Positional Encoding',
                icon: 'P',
                description: {
                    beginner: 'Adds information about the position of each word in the sentence, since transformers process all words simultaneously.',
                    intermediate: 'Injects position information using sinusoidal functions. Allows the model to understand word order without recurrence.',
                    advanced: 'Fixed sinusoidal encoding: PE(pos,2i) = sin(pos/10000^(2i/d_model)), PE(pos,2i+1) = cos(pos/10000^(2i/d_model)). Can also use learned embeddings.'
                },
                formula: 'PE(pos, 2i) = sin(pos / 10000^(2i/d_model))\nPE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))',
                tensorShapes: {
                    input: '[batch_size, seq_len, d_model]',
                    output: '[batch_size, seq_len, d_model]'
                },
                code: `# Sinusoidal positional encoding
import torch
import math

def positional_encoding(seq_len, d_model):
    position = torch.arange(seq_len).unsqueeze(1)
    div_term = torch.exp(
        torch.arange(0, d_model, 2) *
        -(math.log(10000.0) / d_model)
    )

    pe = torch.zeros(seq_len, d_model)
    pe[:, 0::2] = torch.sin(position * div_term)
    pe[:, 1::2] = torch.cos(position * div_term)

    return pe  # [seq_len, d_model]

# Add to embeddings
x = embeddings + positional_encoding(seq_len, d_model)`,
                keyPoints: [
                    'Enables position-awareness without recurrence',
                    'Sinusoidal functions allow extrapolation to longer sequences',
                    'Added element-wise to token embeddings',
                    'Each dimension has different frequency',
                    'Alternative: learned positional embeddings (BERT, GPT)'
                ]
            },

            attention: {
                name: 'Multi-Head Attention',
                icon: 'A',
                description: {
                    beginner: 'Allows the model to focus on different parts of the input when processing each word.',
                    intermediate: 'Computes weighted combinations of values based on query-key similarity. Multiple heads capture different types of relationships in parallel.',
                    advanced: 'Scaled dot-product attention with multiple projection subspaces. Attention(Q,K,V) = softmax(QK^T/√d_k)V. Concatenate h heads and project: MultiHead(Q,K,V) = Concat(head_1,...,head_h)W^O.'
                },
                formula: 'Attention(Q,K,V) = softmax(QK^T / √d_k) × V\nMultiHead(Q,K,V) = Concat(head₁, ..., head_h)W^O\nwhere head_i = Attention(QW_i^Q, KW_i^K, VW_i^V)',
                tensorShapes: {
                    input: '[batch_size, seq_len, d_model]',
                    Q: '[batch_size, num_heads, seq_len, d_k]',
                    K: '[batch_size, num_heads, seq_len, d_k]',
                    V: '[batch_size, num_heads, seq_len, d_v]',
                    scores: '[batch_size, num_heads, seq_len, seq_len]',
                    output: '[batch_size, seq_len, d_model]'
                },
                code: `# Multi-Head Attention
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads

        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, q, k, v, mask=None):
        batch_size = q.size(0)

        # Linear projections and reshape
        Q = self.W_q(q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1,2)
        K = self.W_k(k).view(batch_size, -1, self.num_heads, self.d_k).transpose(1,2)
        V = self.W_v(v).view(batch_size, -1, self.num_heads, self.d_k).transpose(1,2)

        # Scaled dot-product attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)

        attn = F.softmax(scores, dim=-1)
        context = torch.matmul(attn, V)

        # Concatenate heads and project
        context = context.transpose(1,2).contiguous().view(batch_size, -1, self.d_model)
        output = self.W_o(context)

        return output, attn`,
                keyPoints: [
                    'Query-Key similarity determines attention weights',
                    'Scaling by √d_k prevents softmax saturation',
                    'Multiple heads capture different relationship types',
                    'Self-attention: Q, K, V from same source',
                    'Cross-attention: K, V from encoder, Q from decoder',
                    'Masked attention prevents looking ahead (decoder)'
                ]
            },

            feedforward: {
                name: 'Feed-Forward Network',
                icon: 'F',
                description: {
                    beginner: 'A simple neural network that processes each position independently to add complexity to the model.',
                    intermediate: 'Two-layer fully connected network with ReLU activation. Applied identically to each position. Adds non-linearity and model capacity.',
                    advanced: 'FFN(x) = max(0, xW₁ + b₁)W₂ + b₂. Typically d_ff = 4×d_model. Position-wise: same network applied to each position independently.'
                },
                formula: 'FFN(x) = max(0, xW₁ + b₁)W₂ + b₂\nwhere d_ff = 4 × d_model (typically)',
                tensorShapes: {
                    input: '[batch_size, seq_len, d_model]',
                    hidden: '[batch_size, seq_len, d_ff]',
                    output: '[batch_size, seq_len, d_model]'
                },
                code: `# Position-wise Feed-Forward Network
class PositionwiseFeedForward(nn.Module):
    def __init__(self, d_model, d_ff, dropout=0.1):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x):
        # x: [batch, seq_len, d_model]
        x = self.linear1(x)           # → [batch, seq_len, d_ff]
        x = F.relu(x)                 # ReLU activation
        x = self.dropout(x)
        x = self.linear2(x)           # → [batch, seq_len, d_model]
        return x

# Variants:
# - GELU activation (BERT, GPT)
# - Gated Linear Units (GPT-3)
# - SwiGLU (PaLM, LLaMA)`,
                keyPoints: [
                    'Applied independently to each position',
                    'Two linear transformations with activation',
                    'd_ff typically 4× larger than d_model',
                    'Adds non-linearity to the model',
                    'Same weights across all positions',
                    'Modern variants: GELU, SwiGLU'
                ]
            },

            layernorm: {
                name: 'Layer Normalization',
                icon: 'N',
                description: {
                    beginner: 'Normalizes the data to keep values in a reasonable range, making training more stable.',
                    intermediate: 'Normalizes inputs across features for each example. Stabilizes training and allows higher learning rates. Applied before/after sub-layers.',
                    advanced: 'LayerNorm(x) = γ ⊙ (x - μ)/σ + β where μ, σ computed per layer per example. Unlike BatchNorm, independent of batch. Pre-LN vs Post-LN variants.'
                },
                formula: 'LayerNorm(x) = γ ⊙ (x - μ) / σ + β\nμ = mean(x), σ = std(x)',
                tensorShapes: {
                    input: '[batch_size, seq_len, d_model]',
                    output: '[batch_size, seq_len, d_model]'
                },
                code: `# Layer Normalization
class LayerNorm(nn.Module):
    def __init__(self, d_model, eps=1e-6):
        super().__init__()
        self.gamma = nn.Parameter(torch.ones(d_model))
        self.beta = nn.Parameter(torch.zeros(d_model))
        self.eps = eps

    def forward(self, x):
        # x: [batch, seq_len, d_model]
        mean = x.mean(-1, keepdim=True)     # [batch, seq_len, 1]
        std = x.std(-1, keepdim=True)       # [batch, seq_len, 1]

        normalized = (x - mean) / (std + self.eps)
        return self.gamma * normalized + self.beta

# Pre-LN (modern):  LayerNorm → Sublayer → Residual
# Post-LN (original): Sublayer → Residual → LayerNorm`,
                keyPoints: [
                    'Normalizes across feature dimension',
                    'Independent of batch size (unlike BatchNorm)',
                    'Learnable scale (γ) and shift (β) parameters',
                    'Stabilizes gradients in deep networks',
                    'Pre-LN generally more stable than Post-LN',
                    'Applied before or after each sub-layer'
                ]
            },

            residual: {
                name: 'Residual Connection',
                icon: '+',
                description: {
                    beginner: 'Creates shortcuts that help information flow through deep networks more easily.',
                    intermediate: 'Adds input directly to output of sub-layer. Enables gradient flow and allows training very deep networks. Combined with layer normalization.',
                    advanced: 'y = x + Sublayer(x) for each sub-layer. Enables identity mapping, mitigates vanishing gradients. With LayerNorm: y = x + Sublayer(LayerNorm(x)) or y = LayerNorm(x + Sublayer(x)).'
                },
                formula: 'output = x + Sublayer(LayerNorm(x))  [Pre-LN]\nor\noutput = LayerNorm(x + Sublayer(x))  [Post-LN]',
                tensorShapes: {
                    input: '[batch_size, seq_len, d_model]',
                    sublayer_output: '[batch_size, seq_len, d_model]',
                    output: '[batch_size, seq_len, d_model]'
                },
                code: `# Residual Connection with Layer Norm
class SublayerConnection(nn.Module):
    def __init__(self, d_model, dropout=0.1):
        super().__init__()
        self.norm = LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, sublayer):
        # Pre-LN: Norm → Sublayer → Dropout → Residual
        return x + self.dropout(sublayer(self.norm(x)))

# Usage in transformer layer:
class TransformerEncoderLayer(nn.Module):
    def __init__(self, d_model, num_heads, d_ff):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, num_heads)
        self.ffn = PositionwiseFeedForward(d_model, d_ff)
        self.sublayer1 = SublayerConnection(d_model)
        self.sublayer2 = SublayerConnection(d_model)

    def forward(self, x):
        # First residual: self-attention
        x = self.sublayer1(x, lambda x: self.self_attn(x, x, x))
        # Second residual: feed-forward
        x = self.sublayer2(x, self.ffn)
        return x`,
                keyPoints: [
                    'Enables training of very deep networks',
                    'Provides direct gradient path backward',
                    'Each sub-layer has residual connection',
                    'Combined with dropout for regularization',
                    'Allows identity mapping when needed',
                    'Critical for convergence in deep transformers'
                ]
            }
        };
    }

    showComponentDetails(component) {
        const componentData = this.components[component.type];
        if (!componentData) {
            this.showDefaultInfo(component);
            return;
        }

        const panel = document.getElementById('panel-content');
        const title = document.getElementById('component-title');

        title.textContent = componentData.name;

        const html = `
            <div class="component-detail">
                <div class="component-header">
                    <span class="component-icon-large">${componentData.icon}</span>
                    <h3>${componentData.name}</h3>
                </div>

                <div class="description-section">
                    <h4>Description</h4>
                    <p>${componentData.description[this.currentMode]}</p>
                </div>

                <div class="formula-section">
                    <h4>Mathematical Formula</h4>
                    <div class="formula">${this.formatFormula(componentData.formula)}</div>
                </div>

                <div class="tensor-section">
                    <h4>Tensor Shapes</h4>
                    <div class="tensor-shapes">
                        ${Object.entries(componentData.tensorShapes).map(([key, shape]) => `
                            <div class="tensor-item">
                                <span class="tensor-label">${key}:</span>
                                <span class="tensor-shape">${shape}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="code-section">
                    <h4>Implementation</h4>
                    <div class="code-block"><pre>${this.escapeHtml(componentData.code)}</pre></div>
                </div>

                <div class="keypoints-section">
                    <h4>Key Points</h4>
                    <ul>
                        ${componentData.keyPoints.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        panel.innerHTML = html;
    }

    showDefaultInfo(component) {
        const panel = document.getElementById('panel-content');
        const title = document.getElementById('component-title');

        title.textContent = component.name;

        const html = `
            <div class="component-detail">
                <h3>${component.name}</h3>
                <p>Component type: ${component.type}</p>
                <p>Position: (${component.position.x.toFixed(1)}, ${component.position.y.toFixed(1)}, ${component.position.z.toFixed(1)})</p>
                <p>Click on components in the 3D view to explore their details.</p>
            </div>
        `;

        panel.innerHTML = html;
    }

    formatFormula(formula) {
        // Simple formatting for mathematical formulas
        return formula.replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    setMode(mode) {
        this.currentMode = mode;
    }
}

/**
 * Tensor Flow Visualizer - Shows data flowing through the network
 */
class TensorFlowVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.width = 0;
        this.height = 200;
    }

    init() {
        this.width = this.container.clientWidth;
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    visualize(architecture) {
        if (!this.svg) this.init();

        this.svg.selectAll('*').remove();

        const stages = this.getArchitectureStages(architecture);
        const stageWidth = this.width / (stages.length + 1);

        // Draw stages
        stages.forEach((stage, i) => {
            const x = (i + 1) * stageWidth;
            const y = this.height / 2;

            // Draw node
            this.svg.append('rect')
                .attr('x', x - 40)
                .attr('y', y - 30)
                .attr('width', 80)
                .attr('height', 60)
                .attr('rx', 8)
                .attr('fill', stage.color)
                .attr('opacity', 0.8)
                .attr('stroke', '#fff')
                .attr('stroke-width', 2);

            // Draw label
            this.svg.append('text')
                .attr('x', x)
                .attr('y', y - 5)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .text(stage.name);

            // Draw shape
            this.svg.append('text')
                .attr('x', x)
                .attr('y', y + 10)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .attr('font-size', '10px')
                .text(stage.shape);

            // Draw arrow to next stage
            if (i < stages.length - 1) {
                const nextX = (i + 2) * stageWidth;
                this.svg.append('line')
                    .attr('x1', x + 40)
                    .attr('y1', y)
                    .attr('x2', nextX - 40)
                    .attr('y2', y)
                    .attr('stroke', '#666')
                    .attr('stroke-width', 2)
                    .attr('marker-end', 'url(#arrowhead)');
            }
        });

        // Add arrow marker
        this.svg.append('defs')
            .append('marker')
            .attr('id', 'arrowhead')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('refX', 5)
            .attr('refY', 3)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '0 0, 5 3, 0 6')
            .attr('fill', '#666');
    }

    getArchitectureStages(architecture) {
        const baseStages = [
            { name: 'Input', shape: '[B, L]', color: '#4CAF50' },
            { name: 'Embed', shape: '[B, L, 512]', color: '#4CAF50' },
            { name: 'Pos Enc', shape: '[B, L, 512]', color: '#8BC34A' },
            { name: 'Attention', shape: '[B, L, 512]', color: '#2196F3' },
            { name: 'FFN', shape: '[B, L, 512]', color: '#FF9800' },
            { name: 'Output', shape: '[B, L, V]', color: '#F44336' }
        ];

        return baseStages;
    }

    animateFlow() {
        // Add animated particles flowing through the network
        const particle = this.svg.append('circle')
            .attr('r', 5)
            .attr('fill', '#FFD700')
            .attr('cx', 0)
            .attr('cy', this.height / 2);

        particle.transition()
            .duration(3000)
            .ease(d3.easeLinear)
            .attr('cx', this.width)
            .on('end', () => particle.remove());
    }
}

/**
 * Main Transformer Explorer Application
 */
class TransformerExplorer {
    constructor() {
        this.architecture3D = null;
        this.componentExplorer = null;
        this.tensorFlowViz = null;
    }

    init() {
        // Check for required dependencies
        if (typeof THREE === 'undefined') {
            alert('Error: Three.js library failed to load. Please refresh the page.');
            return;
        }

        if (typeof THREE.OrbitControls === 'undefined') {
            alert('Error: OrbitControls failed to load. Please refresh the page.');
            return;
        }

        if (typeof d3 === 'undefined') {
            alert('Error: D3.js library failed to load. Please refresh the page.');
            return;
        }

        if (typeof anime === 'undefined') {
            alert('Error: Anime.js library failed to load. Please refresh the page.');
            return;
        }

        // Initialize 3D architecture
        this.architecture3D = new Architecture3D('scene-container');
        this.architecture3D.init();

        // Initialize component explorer
        this.componentExplorer = new ComponentExplorer();

        // Initialize tensor flow visualizer
        this.tensorFlowViz = new TensorFlowVisualizer('tensor-flow-viz');
        this.tensorFlowViz.init();
        this.tensorFlowViz.visualize('vanilla');

        // Setup event listeners
        this.setupEventListeners();

        // Initial info
        this.updateArchitectureInfo('vanilla');
    }

    setupEventListeners() {
        // Architecture selector
        document.getElementById('architecture-select').addEventListener('change', (e) => {
            this.architecture3D.buildArchitecture(e.target.value);
            this.tensorFlowViz.visualize(e.target.value);
            this.updateArchitectureInfo(e.target.value);
        });

        // Mode selector
        document.getElementById('mode-select').addEventListener('change', (e) => {
            this.componentExplorer.setMode(e.target.value);
        });

        // Animate button
        document.getElementById('animate-btn').addEventListener('click', () => {
            const inputText = document.getElementById('input-text').value;
            this.architecture3D.animateForwardPass(inputText);
            this.tensorFlowViz.animateFlow();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.architecture3D.resetCamera();
        });

        // Toggle labels button
        document.getElementById('toggle-labels-btn').addEventListener('click', () => {
            this.architecture3D.toggleLabels();
        });

        // Component selection from 3D view
        document.addEventListener('componentSelected', (e) => {
            this.componentExplorer.showComponentDetails(e.detail);
        });

        // Component cards
        document.querySelectorAll('.component-card').forEach(card => {
            card.addEventListener('click', () => {
                const componentType = card.dataset.component;
                const component = { type: componentType };
                this.componentExplorer.showComponentDetails(component);
            });
        });

        // Close panel
        document.getElementById('close-panel').addEventListener('click', () => {
            const panel = document.getElementById('panel-content');
            panel.innerHTML = `
                <div class="overview-content">
                    <h3>About the Transformer</h3>
                    <p>Click on components to explore their details.</p>
                </div>
            `;
            document.getElementById('component-title').textContent = 'Transformer Overview';
        });
    }

    updateArchitectureInfo(type) {
        const config = this.architecture3D.configs[type];
        document.getElementById('num-layers').textContent = config.layers;
        document.getElementById('num-heads').textContent = config.heads;
        document.getElementById('model-dim').textContent = config.dModel;
        document.getElementById('ffn-dim').textContent = config.dFF;
    }
}
