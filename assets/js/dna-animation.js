// DNA Animation using Three.js
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

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // DNA Helix Parameters
    const helixRadius = 1.2;
    const helixHeight = 3.5;
    const turns = 6;
    const pointsPerTurn = 40;
    const totalPoints = turns * pointsPerTurn;
    const color1 = 0x64ffda;
    const color2 = 0xff00ff;
    const basePairColor = 0x00ffff;

    // Create two helices as TubeGeometries for smoothness
    function createHelix(offset, color) {
        const curve = new THREE.Curve();
        curve.getPoint = function(t) {
            const angle = t * Math.PI * 2 * turns + offset;
            const x = Math.cos(angle) * helixRadius;
            const y = (t - 0.5) * helixHeight;
            const z = Math.sin(angle) * helixRadius;
            return new THREE.Vector3(x, y, z);
        };
        const geometry = new THREE.TubeGeometry(curve, totalPoints, 0.045, 8, false);
        const material = new THREE.MeshBasicMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        return curve;
    }
    const curve1 = createHelix(0, color1);
    const curve2 = createHelix(Math.PI, color2);

    // Add base pairs (lines connecting the two helices)
    const basePairs = [];
    for (let i = 0; i < totalPoints; i += 4) {
        const t = i / totalPoints;
        const p1 = curve1.getPoint(t);
        const p2 = curve2.getPoint(t);
        const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const material = new THREE.LineBasicMaterial({ color: basePairColor, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        basePairs.push({ line, t });
    }

    // Add glowing spheres for base pairs
    for (let i = 0; i < totalPoints; i += 8) {
        const t = i / totalPoints;
        [curve1, curve2].forEach((curve, idx) => {
            const p = curve.getPoint(t);
            const color = idx === 0 ? color1 : color2;
            const geometry = new THREE.SphereGeometry(0.07, 24, 24);
            const material = new THREE.MeshBasicMaterial({ color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.copy(p);
            scene.add(sphere);
        });
    }

    camera.position.z = 5;
    window.dnaScene = scene;
    window.dnaRenderer = renderer;
    window.dnaCamera = camera;

    let theta = 0;
    function animate() {
        if (!container || container.style.display === 'none') return;
        requestAnimationFrame(animate);
        theta += 0.01;
        scene.rotation.y = Math.sin(theta * 0.5) * 0.2 + theta * 0.1;
        scene.rotation.x = Math.cos(theta * 0.3) * 0.1;
        // Animate base pairs to undulate
        basePairs.forEach(({ line, t }) => {
            const phase = theta + t * Math.PI * 2 * turns;
            const yOffset = Math.sin(phase * 2) * 0.08;
            const p1 = curve1.getPoint(t);
            const p2 = curve2.getPoint(t);
            p1.y += yOffset;
            p2.y += yOffset;
            line.geometry.setFromPoints([p1, p2]);
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