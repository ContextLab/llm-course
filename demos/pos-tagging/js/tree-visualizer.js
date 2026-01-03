// Tree Visualizer Module
const TreeVisualizer = {
    svg: null,
    g: null,
    zoom: null,
    currentZoom: 1,

    renderTree(dependencies) {
        const container = document.getElementById('dependency-tree');
        container.innerHTML = '';

        if (!dependencies || dependencies.length === 0) {
            container.innerHTML = '<p class="placeholder">No dependencies to display</p>';
            return;
        }

        const width = container.clientWidth || 900;
        const height = 600;

        // Create SVG
        this.svg = d3.select('#dependency-tree')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.5, 3])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
                this.currentZoom = event.transform.k;
            });

        this.svg.call(this.zoom);

        // Create main group
        this.g = this.svg.append('g');

        // Convert dependencies to tree structure
        const root = this.buildTree(dependencies);

        // Create tree layout
        const treeLayout = d3.tree()
            .size([width - 100, height - 150]);

        const treeData = d3.hierarchy(root);
        const nodes = treeLayout(treeData);

        // Create links
        const links = this.g.selectAll('.link')
            .data(nodes.links())
            .enter()
            .append('g')
            .attr('class', 'link-group');

        // Draw link paths
        links.append('path')
            .attr('class', 'link')
            .attr('d', d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y + 50)
            )
            .attr('fill', 'none')
            .attr('stroke', d => this.getDependencyColor(d.target.data.depType))
            .attr('stroke-width', 2);

        // Add link labels
        links.append('text')
            .attr('class', 'link-label')
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2 + 50)
            .attr('text-anchor', 'middle')
            .attr('dy', -5)
            .text(d => d.target.data.depType)
            .style('font-size', '12px')
            .style('fill', '#666');

        // Create node groups
        const nodeGroups = this.g.selectAll('.node')
            .data(nodes.descendants())
            .enter()
            .append('g')
            .attr('class', d => `node ${d.data.isRoot ? 'root-node' : ''}`)
            .attr('transform', d => `translate(${d.x},${d.y + 50})`)
            .style('cursor', 'pointer')
            .on('click', (event, d) => this.showNodeDetails(d.data));

        // Add circles
        nodeGroups.append('circle')
            .attr('r', 8)
            .attr('fill', d => d.data.isRoot ? '#e74c3c' : '#4a90e2')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        // Add word labels
        nodeGroups.append('text')
            .attr('dy', -15)
            .attr('text-anchor', 'middle')
            .attr('class', 'node-word')
            .text(d => d.data.word)
            .style('font-size', '14px')
            .style('font-weight', 'bold');

        // Add POS labels
        nodeGroups.append('text')
            .attr('dy', 25)
            .attr('text-anchor', 'middle')
            .attr('class', 'node-pos')
            .text(d => d.data.pos)
            .style('font-size', '11px')
            .style('fill', '#666');

        // Center the tree
        const bbox = this.g.node().getBBox();
        const centerX = (width - bbox.width) / 2 - bbox.x;
        const centerY = 50;
        this.g.attr('transform', `translate(${centerX},${centerY})`);
    },

    buildTree(dependencies) {
        // Find root
        const rootDep = dependencies.find(d => d.type === 'ROOT');
        if (!rootDep) {
            // Create a default root if none found
            return {
                word: dependencies[0]?.word || 'ROOT',
                pos: 'ROOT',
                depType: 'ROOT',
                isRoot: true,
                children: []
            };
        }

        const rootId = rootDep.target;

        const buildNode = (nodeId) => {
            const dep = dependencies.find(d => d.target === nodeId);
            if (!dep) return null;

            const node = {
                word: dep.word,
                pos: dep.pos,
                depType: dep.type,
                isRoot: dep.type === 'ROOT',
                id: nodeId,
                children: []
            };

            // Find children
            const children = dependencies.filter(d => d.source === nodeId && d.target !== nodeId);
            node.children = children.map(child => buildNode(child.target)).filter(n => n !== null);

            return node;
        };

        return buildNode(rootId);
    },

    getDependencyColor(type) {
        const colors = {
            'ROOT': '#e74c3c',
            'nsubj': '#e74c3c',
            'dobj': '#3498db',
            'obj': '#3498db',
            'det': '#2ecc71',
            'amod': '#f39c12',
            'advmod': '#9b59b6',
            'prep': '#1abc9c',
            'pobj': '#16a085',
            'aux': '#e67e22',
            'cc': '#34495e'
        };

        return colors[type] || '#95a5a6';
    },

    showNodeDetails(data) {
        const content = `
            <div class="node-details">
                <p><strong>Word:</strong> "${data.word}"</p>
                <p><strong>POS Tag:</strong> <span class="pos-badge">${data.pos}</span></p>
                <p><strong>Dependency:</strong> <span class="dep-badge">${data.depType}</span></p>
                <p><strong>Description:</strong><br>${this.getDependencyDescription(data.depType)}</p>
                ${data.children && data.children.length > 0 ?
                    `<p><strong>Dependents:</strong> ${data.children.map(c => c.word).join(', ')}</p>` :
                    ''}
            </div>
        `;

        app.showModal(`Node: ${data.word}`, content);
    },

    getDependencyDescription(type) {
        const descriptions = {
            'ROOT': 'The root of the sentence, typically the main verb',
            'nsubj': 'Nominal subject - the noun phrase that performs the action',
            'dobj': 'Direct object - the noun phrase receiving the action',
            'obj': 'Object of the verb',
            'det': 'Determiner - articles (a, an, the) and demonstratives (this, that)',
            'amod': 'Adjectival modifier - an adjective that modifies a noun',
            'advmod': 'Adverbial modifier - an adverb that modifies a verb or adjective',
            'prep': 'Prepositional modifier - indicates a prepositional relationship',
            'pobj': 'Object of a preposition - the noun following a preposition',
            'aux': 'Auxiliary verb - helping verbs like "is", "have", "will"',
            'cc': 'Coordinating conjunction - connects words or phrases (and, but, or)',
            'conj': 'Conjunct - a word connected by a conjunction',
            'dep': 'Dependent - a general dependency relationship'
        };

        return descriptions[type] || 'A dependency relationship in the sentence';
    },

    zoom(factor) {
        if (!this.svg) return;

        this.currentZoom *= factor;
        this.currentZoom = Math.max(0.5, Math.min(3, this.currentZoom));

        this.svg.transition()
            .duration(300)
            .call(this.zoom.scaleTo, this.currentZoom);
    },

    resetZoom() {
        if (!this.svg) return;

        this.currentZoom = 1;
        this.svg.transition()
            .duration(300)
            .call(this.zoom.transform, d3.zoomIdentity);
    }
};
