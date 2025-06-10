class NeuralNetwork {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.nodes = [];
        this.connections = [];
        this.firingConnections = [];
        this.firingSpheres = [];
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        document.getElementById('neuralNetwork').appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.z = 5;

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

        // Create a grid of nodes
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
        // Each connection gets its own material for animation
        // Store extra state for synapse effect
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                if (node1.position.distanceTo(node2.position) < 2) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        node1.position,
                        node2.position
                    ]);
                    const material = new THREE.LineBasicMaterial({ color: 0x64ffda, transparent: true, opacity: 0.2 });
                    const line = new THREE.Line(geometry, material);
                    line.userData = {
                        firing: false,
                        pulse: 0,
                        node1Idx: i,
                        node2Idx: j
                    };
                    this.connections.push(line);
                    this.scene.add(line);
                }
            }
        }
    }

    triggerRandomSynapses() {
        // Reset all
        this.connections.forEach(conn => {
            conn.userData.firing = false;
            conn.userData.pulse = 0;
        });
        this.firingConnections = [];
        this.firingSpheres.forEach(s => this.scene.remove(s));
        this.firingSpheres = [];
        // Pick a few random connections to fire
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

        // Rotate the entire network
        this.scene.rotation.y += 0.001;
        this.scene.rotation.x += 0.0005;

        // Update connections
        this.connections.forEach((connection, index) => {
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
                connection.userData.pulse += 0.09; // Faster
                // Animate color and opacity
                const t = connection.userData.pulse;
                const color = new THREE.Color().setHSL(0.55 + 0.25 * Math.sin(t * Math.PI), 1, 0.7);
                connection.material.color.copy(color);
                connection.material.opacity = 0.8 + 0.2 * Math.sin(t * Math.PI);
                // Animate a glowing sprite along the connection
                if (t <= 1) {
                    const map = this.getGlowTexture();
                    const spriteMaterial = new THREE.SpriteMaterial({ map, color: 0xffff99, transparent: true, opacity: 0.7 });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    // Glow size: large at start, small at end
                    const size = 0.35 * (1 - t) + 0.08;
                    sprite.scale.set(size, size, size);
                    sprite.position.lerpVectors(node1.position, node2.position, t);
                    this.scene.add(sprite);
                    this.firingSpheres.push(sprite);
                }
                if (connection.userData.pulse > 1) {
                    connection.userData.firing = false;
                    connection.material.color.set(0x64ffda);
                    connection.material.opacity = 0.2;
                }
            } else {
                connection.material.color.set(0x64ffda);
                connection.material.opacity = 0.2;
            }
        });

        // Remove old firing sprites
        if (this.firingSpheres.length > 30) {
            const toRemove = this.firingSpheres.splice(0, this.firingSpheres.length - 30);
            toRemove.forEach(s => this.scene.remove(s));
        }

        this.renderer.render(this.scene, this.camera);
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
    }
}

// Initialize the neural network when the page loads
window.addEventListener('load', () => {
    new NeuralNetwork();
}); 