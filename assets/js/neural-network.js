import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Line2 } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/lines/LineGeometry.js';

// Neural Network with Bloom Glowing Synapse Effect
class NeuralNetwork {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.nodes = [];
        this.connections = [];
        this.spritePool = [];
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
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.bloom = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(this.bloom);

        // Create nodes
        this.createNodes();

        // Create connections
        this.createConnections();

        // Handle window resize
        window.addEventListener('resize', () => this.onResize(), false);

        // Start synapse firing interval (reduced pause, more overlap)
        this.fireTimer = setInterval(() => this.triggerRandomSynapses(), 1000); // slower

        // Start animation
        this.animate();
    }

    createNodes() {
        const geometry = new THREE.SphereGeometry(0.05, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x64ffda });
        for (let x = -2; x <= 2; x++) {
            for (let y = -2; y <= 2; y++) {
                for (let z = -2; z <= 2; z++) {
                    const node = new THREE.Mesh(geometry, material);
                    node.position.set(x, y, z);
                    this.nodes.push(node);
                    this.scene.add(node);
                }
            }
        }
    }

    createConnections() {
        const res = new THREE.Vector2(window.innerWidth, window.innerHeight);
        const lim = 1.5;
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                if (node1.position.distanceTo(node2.position) > lim) continue;

                const positions = [
                    node1.position.x, node1.position.y, node1.position.z,
                    node2.position.x, node2.position.y, node2.position.z
                ];
                const geometry = new LineGeometry();
                geometry.setPositions(positions);
                const material = new LineMaterial({
                    color: 0x64ffda,
                    linewidth: 1.0,
                    transparent: true,
                    opacity: 0.25,
                    worldUnits: true
                });
                material.resolution.copy(res);
                const line = new Line2(geometry, material);
                line.computeLineDistances();
                line.userData = {
                    firing: false,
                    t: 0,
                    aIdx: i,
                    bIdx: j
                };
                this.connections.push(line);
                this.scene.add(line);
            }
        }
    }

    triggerRandomSynapses() {
        // Only fire one connection per node at a time
        const used = new Set();
        let fired = 0;
        const maxFirings = Math.min(this.nodes.length, 10);
        while (fired < maxFirings) {
            const idx = Math.floor(Math.random() * this.connections.length);
            const conn = this.connections[idx];
            const aIdx = conn.userData.aIdx;
            const bIdx = conn.userData.bIdx;
            if (!conn.userData.firing && !used.has(aIdx) && !used.has(bIdx)) {
                conn.userData.firing = true;
                conn.userData.t = 0;
                used.add(aIdx);
                used.add(bIdx);
                fired++;
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.scene.rotation.y += 0.001;
        this.scene.rotation.x += 0.0005;
        this.connections.forEach((connection) => {
            const u = connection.userData;
            if (u.firing) {
                u.t += 0.03;
                const t = Math.min(u.t, 1.0);
                connection.material.linewidth = 3.0 - 2.0 * t;
                connection.material.color.setHSL(0.15 + 0.5 * Math.sin(t * Math.PI), 1, 0.7);
                const sprite = this.fetchSprite();
                sprite.position.lerpVectors(this.nodes[u.aIdx].position, this.nodes[u.bIdx].position, t);
                sprite.material.opacity = 0.8 * (1 - t) + 0.2;
                if (u.t > 1.8) {
                    u.firing = false;
                    connection.material.linewidth = 1.0;
                    connection.material.color.set(0x64ffda);
                }
            }
        });
        this.composer.render();
    }

    fetchSprite() {
        let s = this.spritePool.pop();
        if (!s) {
            const tex = this.getGlowTexture();
            const sm = new THREE.SpriteMaterial({ map: tex, color: 0xffff99, transparent: true, depthWrite: false });
            s = new THREE.Sprite(sm);
            s.scale.set(0.25, 0.25, 0.25);
            this.scene.add(s);
        }
        return s;
    }

    getGlowTexture() {
        if (this._tex) return this._tex;
        const S = 64;
        const c = document.createElement('canvas');
        c.width = c.height = S;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
        g.addColorStop(0, 'rgba(255,255,200,1)');
        g.addColorStop(0.3, 'rgba(255,255,200,0.5)');
        g.addColorStop(1, 'rgba(255,255,200,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, S, S);
        this._tex = new THREE.CanvasTexture(c);
        return this._tex;
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.bloom.setSize(window.innerWidth, window.innerHeight);
        this.bloom.resolution.set(window.innerWidth, window.innerHeight);
        const res = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.connections.forEach((conn) => {
            if (conn.material && conn.material.resolution) {
                conn.material.resolution.copy(res);
            }
        });
    }
}

// Initialize the neural network when the page loads
window.addEventListener('load', () => {
    new NeuralNetwork();
}); 