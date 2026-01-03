/**
 * Interactive 3D Transformer Architecture Visualization
 * Uses Three.js for 3D rendering and animations
 */

class Architecture3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.components = [];
        this.connections = [];
        this.animationId = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedObject = null;
        this.labelsVisible = true;
        this.currentArchitecture = 'vanilla';

        // Architecture configurations
        this.configs = {
            vanilla: {
                name: 'Vanilla Transformer',
                layers: 6,
                heads: 8,
                dModel: 512,
                dFF: 2048,
                hasEncoder: true,
                hasDecoder: true
            },
            bert: {
                name: 'BERT',
                layers: 12,
                heads: 12,
                dModel: 768,
                dFF: 3072,
                hasEncoder: true,
                hasDecoder: false
            },
            gpt: {
                name: 'GPT',
                layers: 12,
                heads: 12,
                dModel: 768,
                dFF: 3072,
                hasEncoder: false,
                hasDecoder: true
            },
            t5: {
                name: 'T5',
                layers: 12,
                heads: 12,
                dModel: 768,
                dFF: 3072,
                hasEncoder: true,
                hasDecoder: true
            }
        };
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();
        this.buildArchitecture('vanilla');
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f3460);
        this.scene.fog = new THREE.Fog(0x0f3460, 20, 50);
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 8, 20);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0x2196F3, 1, 30);
        pointLight1.position.set(-5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x4CAF50, 1, 30);
        pointLight2.position.set(5, 5, -5);
        this.scene.add(pointLight2);
    }

    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 40;
        this.controls.minDistance = 5;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e), false);
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    }

    buildArchitecture(type) {
        // Clear existing architecture
        this.clearArchitecture();

        this.currentArchitecture = type;
        const config = this.configs[type];

        if (config.hasEncoder && config.hasDecoder) {
            this.buildEncoderDecoder(config);
        } else if (config.hasEncoder) {
            this.buildEncoderOnly(config);
        } else {
            this.buildDecoderOnly(config);
        }

        this.createConnections();
    }

    clearArchitecture() {
        // Remove all components
        this.components.forEach(comp => {
            if (comp.mesh) {
                this.scene.remove(comp.mesh);
            }
            if (comp.label) {
                this.scene.remove(comp.label);
            }
        });

        // Remove all connections
        this.connections.forEach(conn => {
            this.scene.remove(conn);
        });

        this.components = [];
        this.connections = [];
    }

    buildEncoderDecoder(config) {
        const encoderX = -6;
        const decoderX = 6;

        // Build encoder stack
        this.buildEncoderStack(encoderX, 0, config.layers, 'Encoder');

        // Build decoder stack
        this.buildDecoderStack(decoderX, 0, config.layers, 'Decoder');

        // Add input embeddings
        this.addComponent('embedding', encoderX, -8, 0, 'Input Embedding', 0x4CAF50);
        this.addComponent('embedding', decoderX, -8, 0, 'Output Embedding', 0x4CAF50);

        // Add positional encoding
        this.addComponent('positional', encoderX, -6.5, 0, 'Positional Encoding', 0x8BC34A);
        this.addComponent('positional', decoderX, -6.5, 0, 'Positional Encoding', 0x8BC34A);

        // Add output layer
        this.addComponent('output', decoderX, config.layers * 2.5 + 1, 0, 'Output', 0xF44336);
    }

    buildEncoderOnly(config) {
        const x = 0;
        this.buildEncoderStack(x, 0, config.layers, 'BERT Encoder');
        this.addComponent('embedding', x, -8, 0, 'Input Embedding', 0x4CAF50);
        this.addComponent('positional', x, -6.5, 0, 'Positional Encoding', 0x8BC34A);
        this.addComponent('output', x, config.layers * 2.5 + 1, 0, 'Pooler/Output', 0xF44336);
    }

    buildDecoderOnly(config) {
        const x = 0;
        this.buildDecoderStack(x, 0, config.layers, 'GPT Decoder');
        this.addComponent('embedding', x, -8, 0, 'Token Embedding', 0x4CAF50);
        this.addComponent('positional', x, -6.5, 0, 'Positional Encoding', 0x8BC34A);
        this.addComponent('output', x, config.layers * 2.5 + 1, 0, 'LM Head', 0xF44336);
    }

    buildEncoderStack(x, z, numLayers, label) {
        for (let i = 0; i < numLayers; i++) {
            const y = i * 2.5 - 2;
            const layerNum = i + 1;

            // Multi-head attention
            this.addComponent('attention', x, y, z,
                `${label} L${layerNum}: Multi-Head Attention`, 0x2196F3);

            // Add & Norm
            this.addComponent('layernorm', x, y + 0.6, z,
                `${label} L${layerNum}: Add & Norm`, 0x9C27B0, 0.3);

            // Feed-forward
            this.addComponent('feedforward', x, y + 1.2, z,
                `${label} L${layerNum}: Feed-Forward`, 0xFF9800);

            // Add & Norm
            this.addComponent('layernorm', x, y + 1.8, z,
                `${label} L${layerNum}: Add & Norm`, 0x9C27B0, 0.3);
        }
    }

    buildDecoderStack(x, z, numLayers, label) {
        for (let i = 0; i < numLayers; i++) {
            const y = i * 2.5 - 2;
            const layerNum = i + 1;

            // Masked multi-head attention
            this.addComponent('attention', x, y, z,
                `${label} L${layerNum}: Masked Self-Attention`, 0x1976D2);

            // Add & Norm
            this.addComponent('layernorm', x, y + 0.4, z,
                `${label} L${layerNum}: Add & Norm`, 0x9C27B0, 0.3);

            // Cross attention (if encoder-decoder)
            if (this.configs[this.currentArchitecture].hasEncoder) {
                this.addComponent('attention', x, y + 0.8, z,
                    `${label} L${layerNum}: Cross-Attention`, 0x2196F3);
                this.addComponent('layernorm', x, y + 1.2, z,
                    `${label} L${layerNum}: Add & Norm`, 0x9C27B0, 0.3);
            }

            // Feed-forward
            this.addComponent('feedforward', x, y + 1.6, z,
                `${label} L${layerNum}: Feed-Forward`, 0xFF9800);

            // Add & Norm
            this.addComponent('layernorm', x, y + 2.0, z,
                `${label} L${layerNum}: Add & Norm`, 0x9C27B0, 0.3);
        }
    }

    addComponent(type, x, y, z, label, color, scale = 1.0) {
        let geometry, width, height, depth;

        switch (type) {
            case 'embedding':
                width = 2.5;
                height = 0.3;
                depth = 1.5;
                geometry = new THREE.BoxGeometry(width, height, depth);
                break;
            case 'positional':
                width = 2.5;
                height = 0.2;
                depth = 1.5;
                geometry = new THREE.BoxGeometry(width, height, depth);
                break;
            case 'attention':
                width = 2.0 * scale;
                height = 0.4 * scale;
                depth = 1.2 * scale;
                geometry = new THREE.BoxGeometry(width, height, depth);
                break;
            case 'feedforward':
                width = 2.0 * scale;
                height = 0.5 * scale;
                depth = 1.2 * scale;
                geometry = new THREE.BoxGeometry(width, height, depth);
                break;
            case 'layernorm':
                width = 2.0 * scale;
                height = 0.15 * scale;
                depth = 1.2 * scale;
                geometry = new THREE.BoxGeometry(width, height, depth);
                break;
            case 'output':
                width = 2.5;
                height = 0.4;
                depth = 1.5;
                geometry = new THREE.BoxGeometry(width, height, depth);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 0.5, 1);
        }

        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.85,
            shininess: 100,
            specular: 0x444444
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Add edge lines for better visibility
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        mesh.add(wireframe);

        this.scene.add(mesh);

        // Create text label
        const labelSprite = this.createTextLabel(label);
        labelSprite.position.set(x + width/2 + 1, y, z);
        this.scene.add(labelSprite);

        // Store component data
        const component = {
            type,
            mesh,
            label: labelSprite,
            name: label,
            color,
            originalColor: color,
            position: { x, y, z }
        };

        mesh.userData = component;
        this.components.push(component);

        return component;
    }

    createTextLabel(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 128;

        context.fillStyle = 'rgba(26, 26, 46, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = 'Bold 32px Arial';
        context.fillStyle = '#ffffff';
        context.textAlign = 'left';
        context.textBaseline = 'middle';
        context.fillText(text, 10, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(4, 1, 1);

        return sprite;
    }

    createConnections() {
        // Create connections between components
        for (let i = 0; i < this.components.length - 1; i++) {
            const comp1 = this.components[i];
            const comp2 = this.components[i + 1];

            // Only connect vertically adjacent components
            if (Math.abs(comp1.position.x - comp2.position.x) < 0.1 &&
                Math.abs(comp1.position.y - comp2.position.y) < 3) {
                this.createConnection(comp1, comp2);
            }
        }
    }

    createConnection(comp1, comp2) {
        const points = [];
        points.push(new THREE.Vector3(comp1.position.x, comp1.position.y, comp1.position.z));
        points.push(new THREE.Vector3(comp2.position.x, comp2.position.y, comp2.position.z));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x666666,
            transparent: true,
            opacity: 0.3
        });

        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.connections.push(line);
    }

    animateForwardPass(inputText) {
        const tokens = inputText.split(' ');
        const config = this.configs[this.currentArchitecture];

        // Create animated particles for data flow
        tokens.forEach((token, idx) => {
            setTimeout(() => {
                this.animateToken(token, idx);
            }, idx * 500);
        });
    }

    animateToken(token, index) {
        // Create a particle representing the token
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.5
        });
        const particle = new THREE.Mesh(geometry, material);

        // Start at embedding layer
        const startComp = this.components.find(c => c.type === 'embedding');
        if (!startComp) return;

        particle.position.copy(startComp.mesh.position);
        this.scene.add(particle);

        // Animate through layers
        let currentIdx = 0;
        const animateNext = () => {
            if (currentIdx >= this.components.length - 1) {
                this.scene.remove(particle);
                return;
            }

            const nextComp = this.components[currentIdx + 1];

            anime({
                targets: particle.position,
                x: nextComp.position.x,
                y: nextComp.position.y,
                z: nextComp.position.z,
                duration: 300,
                easing: 'easeInOutQuad',
                complete: () => {
                    // Highlight the component
                    this.highlightComponent(nextComp);
                    currentIdx++;
                    animateNext();
                }
            });
        };

        animateNext();
    }

    highlightComponent(component) {
        const originalColor = component.mesh.material.color.getHex();

        anime({
            targets: component.mesh.material,
            opacity: [0.85, 1.0, 0.85],
            duration: 300,
            easing: 'easeInOutQuad'
        });

        component.mesh.material.emissive = new THREE.Color(0xffffff);
        component.mesh.material.emissiveIntensity = 0.3;

        setTimeout(() => {
            component.mesh.material.emissive = new THREE.Color(0x000000);
            component.mesh.material.emissiveIntensity = 0;
        }, 300);
    }

    onMouseClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = this.components.map(c => c.mesh);
        const intersects = this.raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            const component = object.userData;
            this.onComponentClick(component);
        }
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = this.components.map(c => c.mesh);
        const intersects = this.raycaster.intersectObjects(meshes);

        // Reset previous hover
        if (this.selectedObject && (!intersects.length || intersects[0].object !== this.selectedObject)) {
            this.selectedObject.material.emissive = new THREE.Color(0x000000);
            this.selectedObject = null;
            document.body.style.cursor = 'default';
        }

        // Highlight hovered object
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object !== this.selectedObject) {
                this.selectedObject = object;
                object.material.emissive = new THREE.Color(0x444444);
                document.body.style.cursor = 'pointer';
            }
        }
    }

    onComponentClick(component) {
        // Dispatch custom event for component explorer
        const event = new CustomEvent('componentSelected', { detail: component });
        document.dispatchEvent(event);

        // Zoom to component
        this.zoomToComponent(component);
    }

    zoomToComponent(component) {
        const targetPos = component.mesh.position.clone();
        targetPos.z += 5;

        anime({
            targets: this.camera.position,
            x: targetPos.x,
            y: targetPos.y + 2,
            z: targetPos.z,
            duration: 1000,
            easing: 'easeInOutCubic'
        });

        anime({
            targets: this.controls.target,
            x: component.position.x,
            y: component.position.y,
            z: component.position.z,
            duration: 1000,
            easing: 'easeInOutCubic'
        });
    }

    resetCamera() {
        anime({
            targets: this.camera.position,
            x: 0,
            y: 8,
            z: 20,
            duration: 1000,
            easing: 'easeInOutCubic'
        });

        anime({
            targets: this.controls.target,
            x: 0,
            y: 0,
            z: 0,
            duration: 1000,
            easing: 'easeInOutCubic'
        });
    }

    toggleLabels() {
        this.labelsVisible = !this.labelsVisible;
        this.components.forEach(comp => {
            if (comp.label) {
                comp.label.visible = this.labelsVisible;
            }
        });
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        // Rotate components slightly for effect
        this.components.forEach((comp, idx) => {
            if (comp.mesh) {
                comp.mesh.rotation.y += 0.001;
            }
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.clearArchitecture();
        this.renderer.dispose();
    }
}
