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

    // Create two helices as dotted lines
    function createDottedHelix(offset, color) {
        const points = [];
        for (let i = 0; i < totalPoints; i++) {
            const t = i / totalPoints;
            const angle = t * Math.PI * 2 * turns + offset;
            const x = Math.cos(angle) * helixRadius;
            const y = (t - 0.5) * helixHeight;
            const z = Math.sin(angle) * helixRadius;
            points.push(new THREE.Vector3(x, y, z));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08, linewidth: 2 });
        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();
        scene.add(line);
        return points;
    }
    const helix1 = createDottedHelix(0, color1);
    const helix2 = createDottedHelix(Math.PI, color2);

    // Add glowing base pairs (spheres) between helices
    const basePairs = [];
    for (let i = 0; i < totalPoints; i += 4) {
        const p1 = helix1[i];
        const p2 = helix2[i];
        // Glowing spheres at each end
        [p1, p2].forEach((p, idx) => {
            const color = idx === 0 ? color1 : color2;
            const geometry = new THREE.SphereGeometry(0.07, 24, 24);
            const material = new THREE.MeshBasicMaterial({ color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.copy(p);
            scene.add(sphere);
        });
        // Glowing line (base pair)
        const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const material = new THREE.LineBasicMaterial({ color: basePairColor, transparent: true, opacity: 0.7 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        basePairs.push({ line, i });
    }

    camera.position.z = 5;
    window.dnaScene = scene;
    window.dnaRenderer = renderer;
    window.dnaCamera = camera;

    let theta = 0;
    function animate() {
        if (!container || container.style.display === 'none') return;
        requestAnimationFrame(animate);
        theta += 0.012;
        scene.rotation.y = Math.sin(theta * 0.5) * 0.2 + theta * 0.1;
        scene.rotation.x = Math.cos(theta * 0.3) * 0.1;
        // Undulate the helices
        for (let i = 0; i < totalPoints; i++) {
            const t = i / totalPoints;
            const angle = t * Math.PI * 2 * turns;
            const yOffset = Math.sin(theta * 2 + angle * 2) * 0.08;
            helix1[i].y = (t - 0.5) * helixHeight + yOffset;
            helix2[i].y = (t - 0.5) * helixHeight - yOffset;
        }
        // Update base pairs
        basePairs.forEach(({ line, i }) => {
            line.geometry.setFromPoints([helix1[i], helix2[i]]);
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