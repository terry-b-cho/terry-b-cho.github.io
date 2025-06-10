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
    const color1 = new THREE.Color(styles.getPropertyValue('--primary-color') || '#64ffda');
    const color2 = new THREE.Color(styles.getPropertyValue('--secondary-color') || '#ff00ff');
    const basePairColor = new THREE.Color(styles.getPropertyValue('--accent-color') || '#00ffff');
    const bgColor = styles.getPropertyValue('--background-color') || '#000d0d';

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 7);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // DNA Parameters
    const numRungs = 16;
    const rungSpacing = 0.22;
    const helixRadius = 1.1;
    const helixHeight = rungSpacing * (numRungs - 1);
    const turns = 2.5;
    const phaseOffset = Math.PI / 8;

    // Group for all DNA elements
    const dnaGroup = new THREE.Group();

    // Create rungs (base pairs)
    const rungMeshes = [];
    for (let i = 0; i < numRungs; i++) {
        const t = i / (numRungs - 1);
        const angle = t * Math.PI * 2 * turns;
        const y = (t - 0.5) * helixHeight;
        // Helix points
        const x1 = Math.cos(angle) * helixRadius;
        const z1 = Math.sin(angle) * helixRadius;
        const x2 = Math.cos(angle + Math.PI) * helixRadius;
        const z2 = Math.sin(angle + Math.PI) * helixRadius;
        // Glowing spheres (ends)
        const sphereGeo = new THREE.SphereGeometry(0.09, 24, 24);
        const sphereMat1 = new THREE.MeshBasicMaterial({ color: color1, transparent: true, opacity: 0.95 });
        const sphereMat2 = new THREE.MeshBasicMaterial({ color: color2, transparent: true, opacity: 0.95 });
        const sphere1 = new THREE.Mesh(sphereGeo, sphereMat1);
        const sphere2 = new THREE.Mesh(sphereGeo, sphereMat2);
        sphere1.position.set(x1, y, z1);
        sphere2.position.set(x2, y, z2);
        // Glowing effect
        const glowMat1 = new THREE.MeshBasicMaterial({ color: color1, transparent: true, opacity: 0.25 });
        const glowMat2 = new THREE.MeshBasicMaterial({ color: color2, transparent: true, opacity: 0.25 });
        const glow1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), glowMat1);
        const glow2 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), glowMat2);
        glow1.position.copy(sphere1.position);
        glow2.position.copy(sphere2.position);
        // Rung (base pair line)
        const rungGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y, z1),
            new THREE.Vector3(x2, y, z2)
        ]);
        const rungMat = new THREE.LineBasicMaterial({ color: basePairColor, transparent: true, opacity: 0.7 });
        const rungLine = new THREE.Line(rungGeo, rungMat);
        dnaGroup.add(sphere1, sphere2, glow1, glow2, rungLine);
        rungMeshes.push({ sphere1, sphere2, glow1, glow2, rungLine, i });
    }

    // Add vertical dotted lines for the helix backbone
    function createBackbone(offset, color) {
        const points = [];
        for (let i = 0; i < numRungs; i++) {
            const t = i / (numRungs - 1);
            const angle = t * Math.PI * 2 * turns + offset;
            const x = Math.cos(angle) * helixRadius;
            const y = (t - 0.5) * helixHeight;
            const z = Math.sin(angle) * helixRadius;
            points.push(new THREE.Vector3(x, y, z));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineDashedMaterial({ color, dashSize: 0.13, gapSize: 0.09, linewidth: 2 });
        const line = new THREE.Line(geo, mat);
        line.computeLineDistances();
        dnaGroup.add(line);
    }
    createBackbone(0, color1);
    createBackbone(Math.PI, color2);

    scene.add(dnaGroup);

    // Animation
    let theta = 0;
    function animate() {
        if (!container || container.style.display === 'none') return;
        requestAnimationFrame(animate);
        theta += 0.012;
        // DNA group rotation for 3D effect
        dnaGroup.rotation.y = Math.sin(theta * 0.5) * 0.18 + theta * 0.08;
        dnaGroup.rotation.x = Math.cos(theta * 0.3) * 0.08;
        // Animate rungs with phase offset for cascading effect
        rungMeshes.forEach(({ sphere1, sphere2, glow1, glow2, rungLine, i }) => {
            const t = i / (numRungs - 1);
            const angle = t * Math.PI * 2 * turns + Math.sin(theta + i * 0.18) * 0.18;
            const y = (t - 0.5) * helixHeight + Math.sin(theta * 2 + i * 0.25) * 0.09;
            const x1 = Math.cos(angle) * helixRadius;
            const z1 = Math.sin(angle) * helixRadius;
            const x2 = Math.cos(angle + Math.PI) * helixRadius;
            const z2 = Math.sin(angle + Math.PI) * helixRadius;
            sphere1.position.set(x1, y, z1);
            sphere2.position.set(x2, y, z2);
            glow1.position.copy(sphere1.position);
            glow2.position.copy(sphere2.position);
            rungLine.geometry.setFromPoints([
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