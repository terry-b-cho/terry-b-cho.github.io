/* neural-network.js  – simple grid + travelling-pulse synapse animation
   (relies on a global THREE already loaded by a <script src="three.js"> tag) */
class NeuralNetwork {
    constructor() {
        this.scene        = new THREE.Scene();
        this.camera       = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
        this.renderer     = new THREE.WebGLRenderer({ antialias:true, alpha:true });
        this.nodes        = [];
        this.connections  = [];   // lines
        this.firings      = [];   // {connection, sprite, t}
        this.init();
    }

    /* ────────── set-up ────────── */
    init() {
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        document.getElementById('neuralNetwork').appendChild(this.renderer.domElement);
        this.camera.position.z = 5;

        this.createNodes();
        this.createConnections();

        addEventListener('resize', () => this.onWindowResize(), false);
        /* fire a few random edges every second */
        this.fireTimer = setInterval(() => this.triggerRandomSynapses(), 1000);

        this.animate();
    }

    /* ────────── nodes ────────── */
    createNodes() {
        const g = new THREE.SphereGeometry(0.05, 32, 32);
        const m = new THREE.MeshBasicMaterial({ color:0x1e3a36, transparent:true, opacity:0.45 });

        for (let x=-2;x<=2;x++)
            for (let y=-2;y<=2;y++)
                for (let z=-2;z<=2;z++) {
                    const n = new THREE.Mesh(g, m);
                    n.position.set(x,y,z);
                    this.nodes.push(n);
                    this.scene.add(n);
                }
    }

    /* ────────── edges ────────── */
    createConnections() {
        const mat = new THREE.LineBasicMaterial({ color:0x64ffda, transparent:true, opacity:0.08 });

        for (let i=0;i<this.nodes.length;i++){
            for (let j=i+1;j<this.nodes.length;j++){
                const a=this.nodes[i], b=this.nodes[j];
                if (a.position.distanceTo(b.position) >= 2) continue;

                const geo  = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
                const line = new THREE.Line(geo, mat.clone());
                line.userData = { nodeA:a, nodeB:b };         // store endpoints for animation
                this.connections.push(line);
                this.scene.add(line);
            }
        }
    }

    /* ────────── spawn firing sprites ────────── */
    triggerRandomSynapses() {
        const used = new Set();
        let spawned = 0, max = Math.min(this.connections.length, 10);

        while (spawned < max) {
            const conn = this.connections[Math.floor(Math.random()*this.connections.length)];
            const { nodeA, nodeB } = conn.userData;
            if (used.has(nodeA) || used.has(nodeB)) continue;

            const sprite = this.makeGlowSprite();
            this.firings.push({ connection:conn, sprite:sprite, t:0 });
            used.add(nodeA); used.add(nodeB);
            spawned++;
        }
    }

    /* ────────── build / recycle sprite ────────── */
    makeGlowSprite() {
        if (!this._glowTex) this._glowTex = this.buildGlowTexture();
        const mat = new THREE.SpriteMaterial({ map:this._glowTex, color:0x888866,
                                               transparent:true, opacity:0.3, depthWrite:false });
        const s   = new THREE.Sprite(mat);
        s.scale.set(0.25,0.25,0.25);
        this.scene.add(s);
        return s;
    }

    buildGlowTexture() {
        const S = 64, c = document.createElement('canvas'); c.width=c.height=S;
        const ctx = c.getContext('2d'),
              grd = ctx.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
        grd.addColorStop(0,'rgba(255,255,200,1)');
        grd.addColorStop(0.35,'rgba(255,255,200,0.5)');
        grd.addColorStop(1,'rgba(255,255,200,0)');
        ctx.fillStyle = grd; ctx.fillRect(0,0,S,S);
        return new THREE.CanvasTexture(c);
    }

    /* ────────── per-frame update ────────── */
    animate() {
        requestAnimationFrame(() => this.animate());

        /* slow, gentle rotation */
        this.scene.rotation.y += 0.001;
        this.scene.rotation.x += 0.0005;

        /* advance active firings */
        for (let i=this.firings.length-1;i>=0;i--){
            const f = this.firings[i];
            f.t += 0.03;                                     // speed
            if (f.t >= 1){                                   // done
                this.scene.remove(f.sprite);
                this.firings.splice(i,1);
                continue;
            }
            const { nodeA, nodeB } = f.connection.userData;
            f.sprite.position.lerpVectors(nodeA.position, nodeB.position, f.t);
            f.sprite.material.opacity = 0.8*(1-f.t) + 0.2;   // fade out
        }

        this.renderer.render(this.scene, this.camera);
    }

    /* ────────── resize ────────── */
    onWindowResize() {
        this.camera.aspect = innerWidth/innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
    }
}

/* kick things off once DOM is ready */
addEventListener('load', () => new NeuralNetwork());
