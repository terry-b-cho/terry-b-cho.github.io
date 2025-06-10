import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

// DNA Animation using Three.js (Apple-like, CSS-inspired)
window.initDNAAnimation = function() {
    if (window.dnaScene) return; // Prevent re-initialization
    const container = document.getElementById('dnaAnimation');
    container.innerHTML = '';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    container.style.background = 'transparent';

    // Get theme colors from CSS variables
    const styles = getComputedStyle(document.documentElement);
    const adenine = new THREE.Color('#EDD382');    // A: Yellow
    const thymine = new THREE.Color('#717EC3');    // T: Blue
    const cytosine = new THREE.Color('#FF6F59');   // C: Red
    const guanine = new THREE.Color('#85FFC7');    // G: Green
    const backbone = new THREE.Color(styles.getPropertyValue('--primary-color') || '#64ffda');

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // DNA Parameters
    const numBasePairs = 24;
    const basePairSpacing = 0.5;
    const helixRadius = 2;
    const helixHeight = basePairSpacing * (numBasePairs - 1);
    const turns = 2.5;
    const baseSize = 0.3;
    const backboneSize = 0.15;

    // Group for all DNA elements
    const dnaGroup = new THREE.Group();

    // Create base pairs
    const basePairs = [];
    for (let i = 0; i < numBasePairs; i++) {
        const t = i / (numBasePairs - 1);
        const angle = t * Math.PI * 2 * turns;
        const y = (t - 0.5) * helixHeight;

        // Helix points
        const x1 = Math.cos(angle) * helixRadius;
        const z1 = Math.sin(angle) * helixRadius;
        const x2 = Math.cos(angle + Math.PI) * helixRadius;
        const z2 = Math.sin(angle + Math.PI) * helixRadius;

        // Randomly choose base pair type
        const basePairType = Math.floor(Math.random() * 4);
        let base1Color, base2Color;
        switch(basePairType) {
            case 0: // A-T
                base1Color = adenine;
                base2Color = thymine;
                break;
            case 1: // T-A
                base1Color = thymine;
                base2Color = adenine;
                break;
            case 2: // C-G
                base1Color = cytosine;
                base2Color = guanine;
                break;
            case 3: // G-C
                base1Color = guanine;
                base2Color = cytosine;
                break;
        }

        // Create base pair spheres
        const base1Geo = new THREE.SphereGeometry(baseSize, 16, 16);
        const base2Geo = new THREE.SphereGeometry(baseSize, 16, 16);
        const base1Mat = new THREE.MeshBasicMaterial({ color: base1Color, transparent: true, opacity: 0.9 });
        const base2Mat = new THREE.MeshBasicMaterial({ color: base2Color, transparent: true, opacity: 0.9 });
        const base1 = new THREE.Mesh(base1Geo, base1Mat);
        const base2 = new THREE.Mesh(base2Geo, base2Mat);
        base1.position.set(x1, y, z1);
        base2.position.set(x2, y, z2);

        // Create base pair connection
        let basePairLineColor, basePairLineGlow;
        switch(basePairType) {
            case 0: // A-T
                basePairLineColor = 0x717EC3; // thymine
                basePairLineGlow = 0xEDD382; // adenine
                break;
            case 1: // T-A
                basePairLineColor = 0xEDD382; // adenine
                basePairLineGlow = 0x717EC3; // thymine
                break;
            case 2: // C-G
                basePairLineColor = 0x85FFC7; // guanine
                basePairLineGlow = 0xFF6F59; // cytosine
                break;
            case 3: // G-C
                basePairLineColor = 0xFF6F59; // cytosine
                basePairLineGlow = 0x85FFC7; // guanine
                break;
        }
        const basePairGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y, z1),
            new THREE.Vector3(x2, y, z2)
        ]);
        // Main colored line
        const basePairMat = new THREE.LineBasicMaterial({ 
            color: basePairLineColor,
            transparent: true,
            opacity: 0.7,
            linewidth: 3
        });
        const basePairLine = new THREE.Line(basePairGeo, basePairMat);
        // Subtle glow (wider, more transparent line)
        const glowMat = new THREE.LineBasicMaterial({
            color: basePairLineGlow,
            transparent: true,
            opacity: 0.18,
            linewidth: 8
        });
        const basePairGlow = new THREE.Line(basePairGeo, glowMat);

        // Add glowing effect
        const glow1Geo = new THREE.SphereGeometry(baseSize * 1.5, 16, 16);
        const glow2Geo = new THREE.SphereGeometry(baseSize * 1.5, 16, 16);
        const glow1Mat = new THREE.MeshBasicMaterial({ color: base1Color, transparent: true, opacity: 0.2 });
        const glow2Mat = new THREE.MeshBasicMaterial({ color: base2Color, transparent: true, opacity: 0.2 });
        const glow1 = new THREE.Mesh(glow1Geo, glow1Mat);
        const glow2 = new THREE.Mesh(glow2Geo, glow2Mat);
        glow1.position.copy(base1.position);
        glow2.position.copy(base2.position);

        dnaGroup.add(base1, base2, basePairGlow, basePairLine, glow1, glow2);
        basePairs.push({ base1, base2, basePairLine, basePairGlow, glow1, glow2, i });
    }

    // Create backbone strands
    function createBackbone(offset, color) {
        const points = [];
        for (let i = 0; i < numBasePairs; i++) {
            const t = i / (numBasePairs - 1);
            const angle = t * Math.PI * 2 * turns + offset;
            const x = Math.cos(angle) * helixRadius;
            const y = (t - 0.5) * helixHeight;
            const z = Math.sin(angle) * helixRadius;
            points.push(new THREE.Vector3(x, y, z));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineDashedMaterial({ 
            color: color,
            dashSize: 0.5,
            gapSize: 0.3,
            linewidth: 2
        });
        const line = new THREE.Line(geo, mat);
        line.computeLineDistances();
        dnaGroup.add(line);
    }
    createBackbone(0, backbone);
    createBackbone(Math.PI, backbone);

    scene.add(dnaGroup);

    // Animation
    let theta = 0;
    function animate() {
        if (!container || container.style.display === 'none') return;
        requestAnimationFrame(animate);
        theta += 0.01;

        // DNA group rotation for 3D effect
        dnaGroup.rotation.y = Math.sin(theta * 0.5) * 0.2 + theta * 0.1;
        dnaGroup.rotation.x = Math.cos(theta * 0.3) * 0.1;

        // Animate base pairs with phase offset for cascading effect
        basePairs.forEach(({ base1, base2, basePairLine, basePairGlow, glow1, glow2, i }) => {
            const t = i / (numBasePairs - 1);
            const angle = t * Math.PI * 2 * turns + Math.sin(theta + i * 0.2) * 0.2;
            const y = (t - 0.5) * helixHeight + Math.sin(theta * 2 + i * 0.3) * 0.2;
            const x1 = Math.cos(angle) * helixRadius;
            const z1 = Math.sin(angle) * helixRadius;
            const x2 = Math.cos(angle + Math.PI) * helixRadius;
            const z2 = Math.sin(angle + Math.PI) * helixRadius;

            base1.position.set(x1, y, z1);
            base2.position.set(x2, y, z2);
            glow1.position.copy(base1.position);
            glow2.position.copy(base2.position);
            basePairLine.geometry.setFromPoints([
                new THREE.Vector3(x1, y, z1),
                new THREE.Vector3(x2, y, z2)
            ]);
            basePairGlow.geometry.setFromPoints([
                new THREE.Vector3(x1, y, z1),
                new THREE.Vector3(x2, y, z2)
            ]);
        });

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}; 