// DNA Animation using Three.js
window.initDNAAnimation = function() {
    if (window.dnaScene) return; // Prevent re-initialization
    const container = document.getElementById('dnaAnimation');
    container.innerHTML = '';
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

    // Create two helices
    function createHelix(offset, color) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        for (let i = 0; i < totalPoints; i++) {
            const t = (i / pointsPerTurn) * Math.PI * 2;
            const x = Math.cos(t + offset) * helixRadius;
            const y = (i / totalPoints - 0.5) * helixHeight;
            const z = Math.sin(t + offset) * helixRadius;
            positions.push(x, y, z);
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
    }
    createHelix(0, color1);
    createHelix(Math.PI, color2);

    // Add base pairs (lines connecting the two helices)
    for (let i = 0; i < totalPoints; i += 4) {
        const t = (i / pointsPerTurn) * Math.PI * 2;
        const x1 = Math.cos(t) * helixRadius;
        const y = (i / totalPoints - 0.5) * helixHeight;
        const z1 = Math.sin(t) * helixRadius;
        const x2 = Math.cos(t + Math.PI) * helixRadius;
        const z2 = Math.sin(t + Math.PI) * helixRadius;
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y, z1),
            new THREE.Vector3(x2, y, z2)
        ]);
        const material = new THREE.LineBasicMaterial({ color: basePairColor, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
    }

    // Add glowing spheres for base pairs
    for (let i = 0; i < totalPoints; i += 8) {
        const t = (i / pointsPerTurn) * Math.PI * 2;
        const y = (i / totalPoints - 0.5) * helixHeight;
        [0, Math.PI].forEach((offset, idx) => {
            const x = Math.cos(t + offset) * helixRadius;
            const z = Math.sin(t + offset) * helixRadius;
            const color = idx === 0 ? color1 : color2;
            const geometry = new THREE.SphereGeometry(0.07, 24, 24);
            const material = new THREE.MeshBasicMaterial({ color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(x, y, z);
            scene.add(sphere);
        });
    }

    camera.position.z = 5;
    window.dnaScene = scene;
    window.dnaRenderer = renderer;
    window.dnaCamera = camera;

    function animate() {
        if (!container || container.style.display === 'none') return;
        requestAnimationFrame(animate);
        scene.rotation.y += 0.003;
        scene.rotation.x += 0.001;
        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}; 