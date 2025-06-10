// Neural Network with Bloom Glowing Synapse Effect
class NeuralNetwork {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.nodes = [];
        this.connections = [];
        this.firingConnections = [];
        this.firingSprites = [];
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        document.getElementById('neuralNetwork').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

        // Postprocessing: Bloom
        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderScene = new THREE.RenderPass(this.scene, this.camera);
        this.bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(this.renderScene);
        this.composer.addPass(this.bloomPass);

        // Create nodes
        this.createNodes();

        // Create connections
        this.createConnections();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Start synapse firing interval
        setInterval(() => this.triggerRandomSynapses(), 1200);

        // Start animation
        this.animate();
    }

    createNodes() {
        const geometry = new THREE.SphereGeometry(0.05, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x64ffda });
        for (let x = -2; x <= 2; x += 1) {
            for (let y = -2; y <= 2; y += 1) {
                for (let z = -2; z <= 2; z += 1) {
                    const node = new THREE.Mesh(geometry, material);
                    node.position.set(x, y, z);
                    this.nodes.push(node);
                    this.scene.add(node);
                }
            }
        }
    }

    createConnections() {
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                if (node1.position.distanceTo(node2.position) < 2) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        node1.position,
                        node2.position
                    ]);
                    // Use MeshLine for width animation, fallback to LineBasicMaterial for simplicity
                    const material = new THREE.LineBasicMaterial({ color: 0x64ffda, transparent: true, opacity: 0.2 });
                    const line = new THREE.Line(geometry, material);
                    line.userData = {
                        firing: false,
                        pulse: 0,
                        node1Idx: i,
                        node2Idx: j,
                        width: 1
                    };
                    this.connections.push(line);
                    this.scene.add(line);
                }
            }
        }
    }

    triggerRandomSynapses() {
        this.connections.forEach(conn => {
            conn.userData.firing = false;
            conn.userData.pulse = 0;
        });
        this.firingConnections = [];
        this.firingSprites.forEach(s => this.scene.remove(s));
        this.firingSprites = [];
        for (let i = 0; i < 10; i++) {
            const idx = Math.floor(Math.random() * this.connections.length);
            const conn = this.connections[idx];
            conn.userData.firing = true;
            conn.userData.pulse = 0;
            this.firingConnections.push(conn);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.scene.rotation.y += 0.001;
        this.scene.rotation.x += 0.0005;

        this.connections.forEach((connection) => {
            const positions = connection.geometry.attributes.position.array;
            const node1 = this.nodes[connection.userData.node1Idx];
            const node2 = this.nodes[connection.userData.node2Idx];
            positions[0] = node1.position.x;
            positions[1] = node1.position.y;
            positions[2] = node1.position.z;
            positions[3] = node2.position.x;
            positions[4] = node2.position.y;
            positions[5] = node2.position.z;
            connection.geometry.attributes.position.needsUpdate = true;

            // Animate synapse effect
            if (connection.userData.firing) {
                connection.userData.pulse += 0.13; // Even faster
                const t = connection.userData.pulse;
                // Animate color and opacity
                const color = new THREE.Color().setHSL(0.15 + 0.5 * Math.sin(t * Math.PI), 1, 0.7);
                connection.material.color.copy(color);
                connection.material.opacity = 0.95 * (1 - t) + 0.2;
                // Animate line width (simulate with scale)
                connection.scale.setScalar(1.5 * (1 - t) + 1);
                // Animate a glowing sprite at the firing point
                if (t <= 1) {
                    const map = this.getGlowTexture();
                    const spriteMaterial = new THREE.SpriteMaterial({ map, color: 0xffff99, transparent: true, opacity: 0.7 * (1 - t) + 0.2 });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    const size = 0.55 * (1 - t) + 0.08;
                    sprite.scale.set(size, size, size);
                    sprite.position.lerpVectors(node1.position, node2.position, t);
                    this.scene.add(sprite);
                    this.firingSprites.push(sprite);
                }
                if (connection.userData.pulse > 1) {
                    connection.userData.firing = false;
                    connection.material.color.set(0x64ffda);
                    connection.material.opacity = 0.2;
                    connection.scale.setScalar(1);
                }
            } else {
                connection.material.color.set(0x64ffda);
                connection.material.opacity = 0.2;
                connection.scale.setScalar(1);
            }
        });

        // Remove old firing sprites
        if (this.firingSprites.length > 30) {
            const toRemove = this.firingSprites.splice(0, this.firingSprites.length - 30);
            toRemove.forEach(s => this.scene.remove(s));
        }

        // Render with bloom
        this.composer.render();
    }

    getGlowTexture() {
        if (!this._glowTexture) {
            const size = 64;
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
            gradient.addColorStop(0, 'rgba(255,255,200,1)');
            gradient.addColorStop(0.2, 'rgba(255,255,200,0.7)');
            gradient.addColorStop(0.4, 'rgba(255,255,200,0.3)');
            gradient.addColorStop(1, 'rgba(255,255,200,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            this._glowTexture = new THREE.CanvasTexture(canvas);
        }
        return this._glowTexture;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
        this.bloomPass.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize the neural network when the page loads
window.addEventListener('load', () => {
    new NeuralNetwork();
}); 