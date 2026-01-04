/**
 * ALICE Rules Viewer - Interactive browser for AIML patterns
 */

export class RulesViewer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.patterns = [];
        this.filteredPatterns = [];
        this.metadata = {};
        this.currentPage = 0;
        this.pageSize = 50;
        this.sortField = 'pattern';
        this.sortAsc = true;
        this.searchQuery = '';
        this.sourceFilter = 'all';
        this.priorityFilter = 'all';
    }

    async loadPatterns(url = 'data/alice-patterns-original.json') {
        const response = await fetch(url);
        const data = await response.json();
        this.patterns = data.patterns;
        this.metadata = data.metadata;
        this.filteredPatterns = [...this.patterns];
        this.buildSourceList();
        return this.patterns.length;
    }

    buildSourceList() {
        const sources = new Set();
        this.patterns.forEach(p => sources.add(p.source_file));
        this.sources = Array.from(sources).sort();
    }

    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="rules-viewer">
                <div class="rules-header">
                    <h3>ALICE Pattern Browser</h3>
                    <div class="rules-meta">
                        <span class="meta-item">${this.metadata.total_patterns?.toLocaleString() || this.patterns.length.toLocaleString()} patterns</span>
                        <span class="meta-item">${this.metadata.files_processed || 53} files</span>
                        <span class="meta-item">${this.metadata.version || 'Original 2001'}</span>
                    </div>
                </div>
                
                <div class="rules-controls">
                    <div class="search-box">
                        <input type="text" id="rules-search" placeholder="Search patterns or responses..." value="${this.searchQuery}">
                        <button id="rules-search-btn">Search</button>
                    </div>
                    
                    <div class="filter-row">
                        <label>
                            Source:
                            <select id="source-filter">
                                <option value="all">All Files (${this.sources?.length || 0})</option>
                                ${this.sources?.map(s => `<option value="${s}" ${this.sourceFilter === s ? 'selected' : ''}>${s}</option>`).join('') || ''}
                            </select>
                        </label>
                        
                        <label>
                            Priority:
                            <select id="priority-filter">
                                <option value="all">All Priorities</option>
                                <option value="10" ${this.priorityFilter === '10' ? 'selected' : ''}>10 (Exact + That)</option>
                                <option value="5" ${this.priorityFilter === '5' ? 'selected' : ''}>5 (Exact)</option>
                                <option value="4" ${this.priorityFilter === '4' ? 'selected' : ''}>4 (Underscore)</option>
                                <option value="2" ${this.priorityFilter === '2' ? 'selected' : ''}>2 (Star)</option>
                            </select>
                        </label>
                        
                        <label>
                            Sort:
                            <select id="sort-field">
                                <option value="pattern" ${this.sortField === 'pattern' ? 'selected' : ''}>Pattern (A-Z)</option>
                                <option value="priority" ${this.sortField === 'priority' ? 'selected' : ''}>Priority</option>
                                <option value="source_file" ${this.sortField === 'source_file' ? 'selected' : ''}>Source File</option>
                                <option value="template_length" ${this.sortField === 'template_length' ? 'selected' : ''}>Response Length</option>
                            </select>
                        </label>
                    </div>
                </div>
                
                <div class="rules-stats">
                    Showing ${this.filteredPatterns.length.toLocaleString()} patterns
                    ${this.searchQuery ? ` matching "${this.searchQuery}"` : ''}
                </div>
                
                <div class="rules-table-container">
                    <table class="rules-table">
                        <thead>
                            <tr>
                                <th class="col-pattern">Pattern</th>
                                <th class="col-response">Response</th>
                                <th class="col-source">Source</th>
                                <th class="col-priority">Pri</th>
                            </tr>
                        </thead>
                        <tbody id="rules-tbody">
                            ${this.renderRows()}
                        </tbody>
                    </table>
                </div>
                
                <div class="rules-pagination">
                    <button id="prev-page" ${this.currentPage === 0 ? 'disabled' : ''}>← Previous</button>
                    <span class="page-info">Page ${this.currentPage + 1} of ${Math.ceil(this.filteredPatterns.length / this.pageSize)}</span>
                    <button id="next-page" ${(this.currentPage + 1) * this.pageSize >= this.filteredPatterns.length ? 'disabled' : ''}>Next →</button>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }

    renderRows() {
        const start = this.currentPage * this.pageSize;
        const end = start + this.pageSize;
        const pagePatterns = this.filteredPatterns.slice(start, end);
        
        if (pagePatterns.length === 0) {
            return '<tr><td colspan="4" class="no-results">No patterns found</td></tr>';
        }
        
        return pagePatterns.map((p, i) => `
            <tr class="rule-row" data-index="${start + i}">
                <td class="col-pattern">
                    <code>${this.escapeHtml(p.pattern)}</code>
                    ${p.that ? `<div class="that-context">that: ${this.escapeHtml(p.that)}</div>` : ''}
                    ${p.topic ? `<div class="topic-context">topic: ${this.escapeHtml(p.topic)}</div>` : ''}
                </td>
                <td class="col-response">
                    <div class="template-preview">${this.formatTemplate(p.template)}</div>
                </td>
                <td class="col-source">${p.source_file?.replace('.aiml', '') || 'unknown'}</td>
                <td class="col-priority">${p.priority}</td>
            </tr>
        `).join('');
    }

    formatTemplate(template) {
        if (!template) return '<em>empty</em>';
        
        let formatted = this.escapeHtml(template);
        
        formatted = formatted.replace(/\{\{SRAI:([^}]+)\}\}/g, '<span class="tag-srai">→ $1</span>');
        formatted = formatted.replace(/\{\{RANDOM:\[([^\]]+)\]\}\}/g, '<span class="tag-random">[random]</span>');
        formatted = formatted.replace(/\{\{BOT:([^}]+)\}\}/g, '<span class="tag-bot">{$1}</span>');
        formatted = formatted.replace(/\{\{GET:([^}]+)\}\}/g, '<span class="tag-get">{$1}</span>');
        formatted = formatted.replace(/\{\{SET:([^:}]+):([^}]*)\}\}/g, '<span class="tag-set">set:$1</span>');
        formatted = formatted.replace(/\{\{STAR:(\d+)\}\}/g, '<span class="tag-star">*$1</span>');
        formatted = formatted.replace(/\{\{THINK:([^}]*)\}\}/g, '');
        
        if (formatted.length > 150) {
            formatted = formatted.substring(0, 150) + '...';
        }
        
        return formatted;
    }

    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    applyFilters() {
        let result = [...this.patterns];
        
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            result = result.filter(p => 
                p.pattern?.toLowerCase().includes(query) ||
                p.template?.toLowerCase().includes(query)
            );
        }
        
        if (this.sourceFilter !== 'all') {
            result = result.filter(p => p.source_file === this.sourceFilter);
        }
        
        if (this.priorityFilter !== 'all') {
            const priority = parseInt(this.priorityFilter);
            result = result.filter(p => p.priority === priority);
        }
        
        result.sort((a, b) => {
            let valA, valB;
            
            switch (this.sortField) {
                case 'priority':
                    valA = a.priority || 0;
                    valB = b.priority || 0;
                    return this.sortAsc ? valB - valA : valA - valB;
                case 'source_file':
                    valA = a.source_file || '';
                    valB = b.source_file || '';
                    break;
                case 'template_length':
                    valA = a.template?.length || 0;
                    valB = b.template?.length || 0;
                    return this.sortAsc ? valB - valA : valA - valB;
                default:
                    valA = a.pattern || '';
                    valB = b.pattern || '';
            }
            
            return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        });
        
        this.filteredPatterns = result;
        this.currentPage = 0;
    }

    attachEventListeners() {
        const searchInput = document.getElementById('rules-search');
        const searchBtn = document.getElementById('rules-search-btn');
        const sourceFilter = document.getElementById('source-filter');
        const priorityFilter = document.getElementById('priority-filter');
        const sortField = document.getElementById('sort-field');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.searchQuery = searchInput.value;
                    this.applyFilters();
                    this.render();
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchQuery = searchInput.value;
                this.applyFilters();
                this.render();
            });
        }
        
        if (sourceFilter) {
            sourceFilter.addEventListener('change', () => {
                this.sourceFilter = sourceFilter.value;
                this.applyFilters();
                this.render();
            });
        }
        
        if (priorityFilter) {
            priorityFilter.addEventListener('change', () => {
                this.priorityFilter = priorityFilter.value;
                this.applyFilters();
                this.render();
            });
        }
        
        if (sortField) {
            sortField.addEventListener('change', () => {
                this.sortField = sortField.value;
                this.applyFilters();
                this.render();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.render();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if ((this.currentPage + 1) * this.pageSize < this.filteredPatterns.length) {
                    this.currentPage++;
                    this.render();
                }
            });
        }
        
        document.querySelectorAll('.rule-row').forEach(row => {
            row.addEventListener('click', () => {
                const index = parseInt(row.dataset.index);
                this.showPatternDetail(this.filteredPatterns[index]);
            });
        });
    }

    showPatternDetail(pattern) {
        const modal = document.createElement('div');
        modal.className = 'pattern-modal';
        modal.innerHTML = `
            <div class="pattern-modal-content">
                <button class="modal-close">&times;</button>
                <h3>Pattern Details</h3>
                
                <div class="detail-section">
                    <label>Pattern:</label>
                    <code class="detail-code">${this.escapeHtml(pattern.pattern)}</code>
                </div>
                
                ${pattern.that ? `
                <div class="detail-section">
                    <label>That (previous response context):</label>
                    <code class="detail-code">${this.escapeHtml(pattern.that)}</code>
                </div>
                ` : ''}
                
                ${pattern.topic ? `
                <div class="detail-section">
                    <label>Topic:</label>
                    <code class="detail-code">${this.escapeHtml(pattern.topic)}</code>
                </div>
                ` : ''}
                
                <div class="detail-section">
                    <label>Response Template:</label>
                    <pre class="detail-template">${this.escapeHtml(pattern.template)}</pre>
                </div>
                
                <div class="detail-section">
                    <label>Regex:</label>
                    <code class="detail-code">${this.escapeHtml(pattern.regex)}</code>
                </div>
                
                <div class="detail-row">
                    <div class="detail-section">
                        <label>Priority:</label>
                        <span>${pattern.priority}</span>
                    </div>
                    <div class="detail-section">
                        <label>Source File:</label>
                        <span>${pattern.source_file}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getStats() {
        const stats = {
            total: this.patterns.length,
            bySource: {},
            byPriority: {},
            withThat: 0,
            withTopic: 0,
            withSrai: 0,
            withRandom: 0
        };
        
        this.patterns.forEach(p => {
            stats.bySource[p.source_file] = (stats.bySource[p.source_file] || 0) + 1;
            stats.byPriority[p.priority] = (stats.byPriority[p.priority] || 0) + 1;
            
            if (p.that) stats.withThat++;
            if (p.topic) stats.withTopic++;
            if (p.template?.includes('SRAI')) stats.withSrai++;
            if (p.template?.includes('RANDOM')) stats.withRandom++;
        });
        
        return stats;
    }
}
