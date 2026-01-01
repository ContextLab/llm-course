/**
 * Rule Editor - Live editing of ELIZA rules with GUI and JSON modes
 */

class RuleEditor {
  constructor(eliza) {
    this.eliza = eliza;
    this.editor = null;
    this.originalRules = null;
    this.defaultRules = null;
    this.isDirty = false;
    this.currentMode = 'gui';
    this.guiInitialized = false;
  }

  /**
   * Initialize the editor
   */
  initialize(editorElement) {
    this.editor = editorElement;
    this.originalRules = JSON.stringify(this.eliza.getRulesAsJSON(), null, 2);
    this.defaultRules = this.originalRules;
    this.editor.value = this.originalRules;
    this.applyCodeHighlighting();
    this.initializeGUI();
  }

  /**
   * Initialize the GUI editor
   */
  initializeGUI() {
    if (this.guiInitialized) return;
    this.setupModeToggle();
    this.setupSectionNavigation();
    this.setupAddButtons();
    this.populateGUI();
    this.guiInitialized = true;
  }

  /**
   * Set up mode toggle between GUI and JSON
   */
  setupModeToggle() {
    const guiBtn = document.getElementById('gui-mode-btn');
    const jsonBtn = document.getElementById('json-mode-btn');
    if (!guiBtn || !jsonBtn) return;
    guiBtn.addEventListener('click', () => this.switchMode('gui'));
    jsonBtn.addEventListener('click', () => this.switchMode('json'));
  }

  /**
   * Switch between GUI and JSON editor modes
   */
  switchMode(mode) {
    this.currentMode = mode;
    const guiBtn = document.getElementById('gui-mode-btn');
    const jsonBtn = document.getElementById('json-mode-btn');
    const guiMode = document.getElementById('editor-gui-mode');
    const jsonMode = document.getElementById('editor-json-mode');
    if (mode === 'gui') {
      guiBtn.classList.add('active');
      jsonBtn.classList.remove('active');
      guiMode.style.display = 'block';
      jsonMode.style.display = 'none';
      this.populateGUI();
    } else {
      guiBtn.classList.remove('active');
      jsonBtn.classList.add('active');
      guiMode.style.display = 'none';
      jsonMode.style.display = 'flex';
      this.syncJSONFromGUI();
    }
  }

  /**
   * Set up section navigation
   */
  setupSectionNavigation() {
    const navItems = document.querySelectorAll('.step-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const sectionId = item.dataset.section;
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.editor-section').forEach(s => s.classList.remove('active'));
        const section = document.getElementById('section-' + sectionId);
        if (section) section.classList.add('active');
      });
    });
  }

  /**
   * Set up add buttons for each section
   */
  setupAddButtons() {
    const addPreSubBtn = document.getElementById('add-pre-sub-btn');
    if (addPreSubBtn) addPreSubBtn.addEventListener('click', () => this.addSubstitution('pre-sub'));
    const addPostSubBtn = document.getElementById('add-post-sub-btn');
    if (addPostSubBtn) addPostSubBtn.addEventListener('click', () => this.addSubstitution('post-sub'));
    const addSynonymBtn = document.getElementById('add-synonym-btn');
    if (addSynonymBtn) addSynonymBtn.addEventListener('click', () => this.addSynonymGroup());
    const addKeywordBtn = document.getElementById('add-keyword-btn');
    if (addKeywordBtn) addKeywordBtn.addEventListener('click', () => this.addKeyword());
    const addGreetingBtn = document.getElementById('add-greeting-btn');
    if (addGreetingBtn) addGreetingBtn.addEventListener('click', () => this.addMessage('greetings'));
    const addFarewellBtn = document.getElementById('add-farewell-btn');
    if (addFarewellBtn) addFarewellBtn.addEventListener('click', () => this.addMessage('farewells'));
    const addFallbackBtn = document.getElementById('add-fallback-btn');
    if (addFallbackBtn) addFallbackBtn.addEventListener('click', () => this.addMessage('fallbacks'));
  }

  /**
   * Apply basic syntax highlighting using a simpler approach
   */
  applyCodeHighlighting() {
    this.editor.style.fontFamily = 'Monaco, Consolas, "Courier New", monospace';
    this.editor.style.fontSize = '14px';
    this.editor.style.lineHeight = '1.5';
    this.editor.style.tabSize = '2';
  }

  /**
   * Get current editor content
   */
  getContent() {
    if (this.currentMode === 'gui') {
      return JSON.stringify(this.collectGUIData(), null, 2);
    }
    return this.editor.value;
  }

  /**
   * Set editor content
   */
  setContent(content) {
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }
    this.editor.value = content;
    this.isDirty = content !== this.originalRules;
    if (this.guiInitialized) {
      this.populateGUI();
    }
  }

  /**
   * Escape HTML for safe display
   */
  escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  /**
   * Mark editor as dirty
   */
  markDirty() {
    this.isDirty = true;
  }

  /**
   * Populate GUI with current rules data
   */
  populateGUI() {
    // Always parse from the JSON textarea, not from getContent() which may recurse
    let data;
    try {
      data = JSON.parse(this.editor.value);
    } catch (e) {
      console.error('Failed to parse rules JSON for GUI:', e);
      return;
    }
    this.renderSubstitutions('pre-sub', data.preSubstitutions || {});
    this.renderSubstitutions('post-sub', data.postSubstitutions || {});
    this.renderSynonyms(data.synonyms || {});
    this.renderKeywords(data.rules || []);
    this.renderMessages('greetings', data.initialGreetings || []);
    this.renderMessages('farewells', data.finalGreetings || []);
    this.renderMessages('fallbacks', data.fallbacks || []);
    this.renderQuitWords(data.quitWords || []);
  }

  /**
   * Render substitutions list
   */
  renderSubstitutions(type, substitutions) {
    const listId = type === 'pre-sub' ? 'pre-sub-list' : 'post-sub-list';
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = '';
    const entries = Object.entries(substitutions);
    if (entries.length === 0) {
      list.innerHTML = '<div class="empty-state" style="padding: 20px; font-size: 0.9rem;">No substitutions defined. Click "+ Add" to create one.</div>';
      return;
    }
    entries.forEach(([from, to]) => {
      const toValue = Array.isArray(to) ? to.join(' ') : to;
      const item = this.createSubstitutionItem(type, from, toValue);
      list.appendChild(item);
    });
  }

  /**
   * Create a substitution item element
   */
  createSubstitutionItem(type, from, to) {
    const item = document.createElement('div');
    item.className = 'substitution-item';
    item.innerHTML = '<input type="text" class="sub-from" value="' + this.escapeHtml(from) + '" placeholder="From...">' +
      '<span class="sub-arrow">-></span>' +
      '<input type="text" class="sub-to" value="' + this.escapeHtml(to) + '" placeholder="To...">' +
      '<button class="delete-btn" title="Delete">X</button>';
    item.querySelector('.delete-btn').addEventListener('click', () => { item.remove(); this.markDirty(); });
    item.querySelectorAll('input').forEach(input => input.addEventListener('change', () => this.markDirty()));
    return item;
  }

  /**
   * Add a new substitution
   */
  addSubstitution(type) {
    const listId = type === 'pre-sub' ? 'pre-sub-list' : 'post-sub-list';
    const list = document.getElementById(listId);
    if (!list) return;
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    const item = this.createSubstitutionItem(type, '', '');
    list.appendChild(item);
    item.querySelector('.sub-from').focus();
    this.markDirty();
  }

  /**
   * Render synonyms list
   */
  renderSynonyms(synonyms) {
    const list = document.getElementById('synonym-list');
    if (!list) return;
    list.innerHTML = '';
    const entries = Object.entries(synonyms);
    if (entries.length === 0) {
      list.innerHTML = '<div class="empty-state" style="padding: 20px; font-size: 0.9rem;">No synonym groups defined. Click "+ Add Group" to create one.</div>';
      return;
    }
    entries.forEach(([name, words]) => {
      const item = this.createSynonymItem(name, words);
      list.appendChild(item);
    });
  }

  /**
   * Create a synonym group item element
   */
  createSynonymItem(name, words) {
    const item = document.createElement('div');
    item.className = 'synonym-item';
    const wordsHtml = words.map(w => '<span class="synonym-word">' + this.escapeHtml(w) + '<span class="remove-word" title="Remove">x</span></span>').join('');
    item.innerHTML = '<div class="synonym-header">' +
      '<input type="text" class="synonym-name" value="' + this.escapeHtml(name) + '" placeholder="Group name (e.g., family)">' +
      '<button class="delete-btn" title="Delete group">X</button></div>' +
      '<div class="synonym-words">' + wordsHtml + '<input type="text" class="add-word-input" placeholder="+ word"></div>';
    item.querySelector('.delete-btn').addEventListener('click', () => { item.remove(); this.markDirty(); });
    item.querySelectorAll('.remove-word').forEach(btn => btn.addEventListener('click', (e) => { e.target.parentElement.remove(); this.markDirty(); }));
    const addInput = item.querySelector('.add-word-input');
    addInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && addInput.value.trim()) {
        const wordsContainer = item.querySelector('.synonym-words');
        const newWord = document.createElement('span');
        newWord.className = 'synonym-word';
        newWord.innerHTML = this.escapeHtml(addInput.value.trim()) + '<span class="remove-word" title="Remove">x</span>';
        newWord.querySelector('.remove-word').addEventListener('click', () => { newWord.remove(); this.markDirty(); });
        wordsContainer.insertBefore(newWord, addInput);
        addInput.value = '';
        this.markDirty();
      }
    });
    item.querySelector('.synonym-name').addEventListener('change', () => this.markDirty());
    return item;
  }

  /**
   * Add a new synonym group
   */
  addSynonymGroup() {
    const list = document.getElementById('synonym-list');
    if (!list) return;
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    const item = this.createSynonymItem('', []);
    list.appendChild(item);
    item.querySelector('.synonym-name').focus();
    this.markDirty();
  }

  /**
   * Render keywords list
   */
  renderKeywords(rules) {
    const list = document.getElementById('keyword-list');
    if (!list) return;
    list.innerHTML = '';
    if (rules.length === 0) {
      list.innerHTML = '<div class="empty-state" style="padding: 20px; font-size: 0.9rem;">No keywords defined. Click "+ Add Keyword" to create one.</div>';
      return;
    }
    rules.forEach((rule, index) => {
      const card = this.createKeywordCard(rule, index);
      list.appendChild(card);
    });
  }

  /**
   * Create a keyword card element
   */
  createKeywordCard(rule, index) {
    const card = document.createElement('div');
    card.className = 'keyword-card';
    card.dataset.index = index;
    const patternsHtml = (rule.patterns || []).map((pattern, pIndex) => this.createPatternHTML(pattern, pIndex)).join('');
    card.innerHTML = '<div class="keyword-header">' +
      '<span class="keyword-toggle">></span>' +
      '<input type="text" class="keyword-name-input" value="' + this.escapeHtml(rule.keyword || '') + '" placeholder="Keyword...">' +
      '<div class="keyword-rank"><label>Rank:</label><input type="number" class="keyword-rank-input" value="' + (rule.rank || 0) + '" min="0" max="100"></div>' +
      '<button class="delete-btn" title="Delete keyword">X</button></div>' +
      '<div class="keyword-content"><div class="pattern-list">' + patternsHtml + '</div><button class="add-pattern-btn">+ Add Pattern</button></div>';
    const header = card.querySelector('.keyword-header');
    header.addEventListener('click', (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') card.classList.toggle('expanded');
    });
    card.querySelector('.delete-btn').addEventListener('click', (e) => { e.stopPropagation(); card.remove(); this.markDirty(); });
    card.querySelector('.add-pattern-btn').addEventListener('click', () => this.addPattern(card));
    card.querySelectorAll('input').forEach(input => input.addEventListener('change', () => this.markDirty()));
    this.setupPatternDeleteButtons(card);
    return card;
  }

  /**
   * Create pattern HTML
   */
  createPatternHTML(pattern, pIndex) {
    const responsesHtml = (pattern.responses || []).map((response) =>
      '<div class="response-item"><input type="text" class="response-input" value="' + this.escapeHtml(response) + '" placeholder="Response template..."><button class="delete-btn" title="Delete response">X</button></div>'
    ).join('');
    return '<div class="pattern-item" data-pattern-index="' + pIndex + '">' +
      '<div class="pattern-header"><label>Pattern:</label><input type="text" class="pattern-input" value="' + this.escapeHtml(pattern.pattern || '*') + '" placeholder="* pattern *"><button class="delete-btn" title="Delete pattern">X</button></div>' +
      '<div class="responses-label">Responses:</div><div class="responses-list">' + responsesHtml + '</div><button class="add-response-btn">+ Add Response</button></div>';
  }

  /**
   * Set up pattern delete buttons in a keyword card
   */
  setupPatternDeleteButtons(card) {
    card.querySelectorAll('.pattern-item > .pattern-header > .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => { btn.closest('.pattern-item').remove(); this.markDirty(); });
    });
    card.querySelectorAll('.response-item > .delete-btn').forEach(btn => {
      btn.addEventListener('click', () => { btn.closest('.response-item').remove(); this.markDirty(); });
    });
    card.querySelectorAll('.add-response-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const responsesList = btn.previousElementSibling;
        const responseItem = document.createElement('div');
        responseItem.className = 'response-item';
        responseItem.innerHTML = '<input type="text" class="response-input" value="" placeholder="Response template..."><button class="delete-btn" title="Delete response">X</button>';
        responseItem.querySelector('.delete-btn').addEventListener('click', () => { responseItem.remove(); this.markDirty(); });
        responseItem.querySelector('input').addEventListener('change', () => this.markDirty());
        responsesList.appendChild(responseItem);
        responseItem.querySelector('input').focus();
        this.markDirty();
      });
    });
  }

  /**
   * Add a new pattern to a keyword card
   */
  addPattern(card) {
    const patternList = card.querySelector('.pattern-list');
    const patternItem = document.createElement('div');
    patternItem.className = 'pattern-item';
    patternItem.innerHTML = '<div class="pattern-header"><label>Pattern:</label><input type="text" class="pattern-input" value="*" placeholder="* pattern *"><button class="delete-btn" title="Delete pattern">X</button></div>' +
      '<div class="responses-label">Responses:</div><div class="responses-list"><div class="response-item"><input type="text" class="response-input" value="" placeholder="Response template..."><button class="delete-btn" title="Delete response">X</button></div></div><button class="add-response-btn">+ Add Response</button>';
    patternList.appendChild(patternItem);
    this.setupPatternDeleteButtons(card);
    patternItem.querySelector('.pattern-input').focus();
    this.markDirty();
  }

  /**
   * Add a new keyword
   */
  addKeyword() {
    const list = document.getElementById('keyword-list');
    if (!list) return;
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    const newRule = { keyword: '', rank: 0, patterns: [{ pattern: '*', responses: [''] }] };
    const card = this.createKeywordCard(newRule, list.children.length);
    card.classList.add('expanded');
    list.appendChild(card);
    card.querySelector('.keyword-name-input').focus();
    this.markDirty();
  }

  /**
   * Render messages list
   */
  renderMessages(type, messages) {
    const list = document.getElementById(type + '-list');
    if (!list) return;
    list.innerHTML = '';
    messages.forEach((message) => {
      const item = document.createElement('div');
      item.className = 'message-item';
      item.innerHTML = '<input type="text" value="' + this.escapeHtml(message) + '" placeholder="Enter message..."><button class="delete-btn" title="Delete">X</button>';
      item.querySelector('.delete-btn').addEventListener('click', () => { item.remove(); this.markDirty(); });
      item.querySelector('input').addEventListener('change', () => this.markDirty());
      list.appendChild(item);
    });
  }

  /**
   * Render quit words
   */
  renderQuitWords(words) {
    const editor = document.getElementById('quit-words-editor');
    if (!editor) return;
    editor.innerHTML = '';
    words.forEach(word => {
      const tag = document.createElement('span');
      tag.className = 'quit-word-tag';
      tag.innerHTML = this.escapeHtml(word) + '<span class="remove-word" title="Remove">x</span>';
      tag.querySelector('.remove-word').addEventListener('click', () => { tag.remove(); this.markDirty(); });
      editor.appendChild(tag);
    });
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'add-quit-word-input';
    input.placeholder = '+ word';
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const tag = document.createElement('span');
        tag.className = 'quit-word-tag';
        tag.innerHTML = this.escapeHtml(input.value.trim()) + '<span class="remove-word" title="Remove">x</span>';
        tag.querySelector('.remove-word').addEventListener('click', () => { tag.remove(); this.markDirty(); });
        editor.insertBefore(tag, input);
        input.value = '';
        this.markDirty();
      }
    });
    editor.appendChild(input);
  }

  /**
   * Add a new message
   */
  addMessage(type) {
    const list = document.getElementById(type + '-list');
    if (!list) return;
    const item = document.createElement('div');
    item.className = 'message-item';
    item.innerHTML = '<input type="text" value="" placeholder="Enter message..."><button class="delete-btn" title="Delete">X</button>';
    item.querySelector('.delete-btn').addEventListener('click', () => { item.remove(); this.markDirty(); });
    item.querySelector('input').addEventListener('change', () => this.markDirty());
    list.appendChild(item);
    item.querySelector('input').focus();
    this.markDirty();
  }

  /**
   * Sync JSON editor from GUI
   */
  syncJSONFromGUI() {
    const data = this.collectGUIData();
    this.editor.value = JSON.stringify(data, null, 2);
  }

  /**
   * Collect data from GUI elements
   */
  collectGUIData() {
    const data = {
      preSubstitutions: {},
      postSubstitutions: {},
      synonyms: {},
      quitWords: [],
      initialGreetings: [],
      finalGreetings: [],
      fallbacks: [],
      rules: []
    };
    document.querySelectorAll('#pre-sub-list .substitution-item').forEach(item => {
      const from = item.querySelector('.sub-from').value.trim();
      const to = item.querySelector('.sub-to').value.trim();
      if (from && to) data.preSubstitutions[from] = to;
    });
    document.querySelectorAll('#post-sub-list .substitution-item').forEach(item => {
      const from = item.querySelector('.sub-from').value.trim();
      const to = item.querySelector('.sub-to').value.trim();
      if (from && to) data.postSubstitutions[from] = to;
    });
    document.querySelectorAll('#synonym-list .synonym-item').forEach(item => {
      const name = item.querySelector('.synonym-name').value.trim();
      const words = [];
      item.querySelectorAll('.synonym-word').forEach(wordEl => {
        const text = wordEl.childNodes[0].textContent.trim();
        if (text) words.push(text);
      });
      if (name && words.length > 0) data.synonyms[name] = words;
    });
    document.querySelectorAll('#keyword-list .keyword-card').forEach(card => {
      const keyword = card.querySelector('.keyword-name-input').value.trim();
      const rank = parseInt(card.querySelector('.keyword-rank-input').value) || 0;
      const patterns = [];
      card.querySelectorAll('.pattern-item').forEach(patternItem => {
        const pattern = patternItem.querySelector('.pattern-input').value.trim();
        const responses = [];
        patternItem.querySelectorAll('.response-input').forEach(respInput => {
          const resp = respInput.value.trim();
          if (resp) responses.push(resp);
        });
        if (pattern && responses.length > 0) patterns.push({ pattern, responses });
      });
      if (keyword && patterns.length > 0) data.rules.push({ keyword, rank, patterns });
    });
    document.querySelectorAll('#greetings-list .message-item input').forEach(input => {
      const msg = input.value.trim();
      if (msg) data.initialGreetings.push(msg);
    });
    document.querySelectorAll('#farewells-list .message-item input').forEach(input => {
      const msg = input.value.trim();
      if (msg) data.finalGreetings.push(msg);
    });
    document.querySelectorAll('#fallbacks-list .message-item input').forEach(input => {
      const msg = input.value.trim();
      if (msg) data.fallbacks.push(msg);
    });
    document.querySelectorAll('#quit-words-editor .quit-word-tag').forEach(tag => {
      const word = tag.childNodes[0].textContent.trim();
      if (word) data.quitWords.push(word);
    });
    return data;
  }

  /**
   * Validate JSON syntax
   */
  validate() {
    try {
      const content = this.getContent();
      const parsed = JSON.parse(content);
      return { valid: true, data: parsed };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        line: this.getErrorLine(error)
      };
    }
  }

  /**
   * Extract line number from JSON parse error
   */
  getErrorLine(error) {
    const match = error.message.match(/position (\d+)/);
    if (match) {
      const position = parseInt(match[1]);
      const content = this.getContent();
      const lines = content.substring(0, position).split('\n');
      return lines.length;
    }
    return null;
  }

  /**
   * Apply changes to ELIZA engine
   */
  apply() {
    if (this.currentMode === 'gui') {
      this.syncJSONFromGUI();
    }
    const validation = this.validate();
    if (!validation.valid) {
      return { success: false, error: validation.error, line: validation.line };
    }
    const result = this.eliza.updateRules(validation.data);
    if (result.success) {
      this.originalRules = this.getContent();
      this.isDirty = false;
    }
    return result;
  }

  /**
   * Reset to original rules
   */
  reset() {
    this.editor.value = this.originalRules;
    this.isDirty = false;
    if (this.guiInitialized) {
      this.populateGUI();
    }
  }

  /**
   * Format JSON content
   */
  format() {
    const validation = this.validate();

    if (validation.valid) {
      this.setContent(validation.data);
      return { success: true };
    }

    return {
      success: false,
      error: validation.error
    };
  }

  /**
   * Export rules to file
   */
  export() {
    if (this.currentMode === 'gui') {
      this.syncJSONFromGUI();
    }
    const validation = this.validate();
    if (!validation.valid) {
      return { success: false, error: 'Cannot export invalid JSON' };
    }
    const content = JSON.stringify(validation.data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eliza-rules.json';
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  }

  /**
   * Import rules from file
   */
  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const parsed = JSON.parse(content);
          this.setContent(parsed);
          resolve({ success: true });
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      };

      reader.onerror = () => {
        reject({ success: false, error: 'Failed to read file' });
      };

      reader.readAsText(file);
    });
  }

  /**
   * Load template (predefined rule sets)
   */
  loadTemplate(template) {
    if (template === 'default') {
      // Load original rules from the defaultRules stored at initialization
      this.editor.value = this.defaultRules;
      this.isDirty = false;
      if (this.guiInitialized) {
        this.populateGUI();
      }
      return { success: true };
    }
    const templates = {
      minimal: {
        preSubstitutions: {},
        postSubstitutions: { "i": "you", "you": "I", "my": "your", "your": "my" },
        synonyms: {},
        quitWords: ["bye", "goodbye"],
        initialGreetings: ["Hello. How are you?"],
        finalGreetings: ["Goodbye."],
        fallbacks: ["Tell me more.", "I see.", "Go on."],
        rules: [
          { keyword: "hello", rank: 1, patterns: [{ pattern: "*", responses: ["Hello! How can I help you?", "Hi there!"] }] },
          { keyword: "i", rank: 1, patterns: [
            { pattern: "* i feel *", responses: ["Why do you feel (2)?", "Tell me more about feeling (2)."] },
            { pattern: "* i * you *", responses: ["Why do you (2) me?", "What makes you (2) me?"] }
          ]}
        ]
      },
      therapeutic: {
        preSubstitutions: {},
        postSubstitutions: { "i": "you", "you": "I", "my": "your", "your": "my", "am": "are", "are": "am" },
        synonyms: { "family": ["mother", "father", "sister", "brother"], "sad": ["depressed", "unhappy", "miserable"] },
        quitWords: ["bye", "goodbye"],
        initialGreetings: ["Hello. I'm here to listen. What's on your mind?"],
        finalGreetings: ["Take care. See you next time."],
        fallbacks: ["Can you elaborate?", "How does that make you feel?"],
        rules: [
          { keyword: "mother", rank: 5, patterns: [{ pattern: "* my mother *", responses: ["Tell me more about your mother.", "How is your relationship with your mother?", "What role does your mother play in your life?"] }] },
          { keyword: "sad", rank: 3, patterns: [{ pattern: "* i am sad *", responses: ["I'm sorry you're feeling sad. What's making you feel this way?", "When did you start feeling sad?", "Can you tell me more about your sadness?"] }] }
        ]
      }
    };
    if (templates[template]) {
      this.setContent(templates[template]);
      return { success: true };
    }
    return { success: false, error: 'Template not found' };
  }

  /**
   * Check if editor has unsaved changes
   */
  hasUnsavedChanges() {
    return this.isDirty;
  }

  /**
   * Add a new rule to the editor
   */
  addRule(keyword, pattern, responses) {
    const validation = this.validate();

    if (!validation.valid) {
      return { success: false, error: 'Fix syntax errors before adding rules' };
    }

    const rules = validation.data;

    // Add new rule
    rules.rules.push({
      keyword: keyword,
      rank: 1,
      patterns: [
        {
          pattern: pattern,
          responses: responses
        }
      ]
    });

    this.setContent(rules);
    return { success: true };
  }

  /**
   * Get statistics about current rules
   */
  getStatistics() {
    const validation = this.validate();

    if (!validation.valid) {
      return null;
    }

    const data = validation.data;
    let totalPatterns = 0;
    let totalResponses = 0;

    for (const rule of data.rules || []) {
      totalPatterns += rule.patterns.length;
      for (const pattern of rule.patterns) {
        totalResponses += pattern.responses.length;
      }
    }

    return {
      ruleCount: (data.rules || []).length,
      patternCount: totalPatterns,
      responseCount: totalResponses,
      preSubCount: Object.keys(data.preSubstitutions || {}).length,
      postSubCount: Object.keys(data.postSubstitutions || {}).length,
      synonymCount: Object.keys(data.synonyms || {}).length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RuleEditor;
}
