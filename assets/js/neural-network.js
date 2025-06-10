class NeuralNetwork {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.nodes = [];
        this.connections = [];
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
        const material = new THREE.LineBasicMaterial({ color: 0x64ffda, transparent: true, opacity: 0.2 });

        // Connect each node to its neighbors
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                
                // Only connect if nodes are close enough
                if (node1.position.distanceTo(node2.position) < 2) {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        node1.position,
                        node2.position
                    ]);
                    const line = new THREE.Line(geometry, material);
                    this.connections.push(line);
                    this.scene.add(line);
                }
            }
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
            const node1 = this.nodes[Math.floor(index / (this.nodes.length - 1))];
            const node2 = this.nodes[index % (this.nodes.length - 1)];
            
            positions[0] = node1.position.x;
            positions[1] = node1.position.y;
            positions[2] = node1.position.z;
            positions[3] = node2.position.x;
            positions[4] = node2.position.y;
            positions[5] = node2.position.z;
            
            connection.geometry.attributes.position.needsUpdate = true;
        });

        this.renderer.render(this.scene, this.camera);
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