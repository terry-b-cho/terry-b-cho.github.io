/**
 * initDNAAnimation()
 * ---------------------------------------------------------------------------
 * Lightweight, biologically faithful B‑DNA double‑helix rendered with Three.js.
 * — 10.5 base‑pairs per turn (≈ B‑DNA)
 * — 0.34 nm rise per base‑pair (scaled to 1 au = 0.34 nm)
 * — Complementary base‑pair colouring (A–T, G–C)
 * — Phosphodiester backbones rendered as smooth tubes following a helical path
 * — Hydrogen‑bond "rungs" rendered as cylinders between bases
 *                                                                          */

window.initDNAAnimation = function () {
  // Prevent multiple initialisations -----------------------------------------------------------
  if (window.dnaScene) return;

  /* ───────────────────────────────────────── Container ─────────────────────────────────────── */
  const container = document.getElementById('dnaAnimation');
  if (!container) return;
  container.innerHTML = '';
  Object.assign(container.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: '-1',
    pointerEvents: 'none',
    background: 'transparent'
  });

  /* ───────────────────────────────────────── Scene setup ────────────────────────────────────── */
  const scene = new THREE.Scene();
  window.dnaScene = scene; // allow external access / safe‑guard re‑init

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 30);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); // transparent bg
  container.appendChild(renderer.domElement);

  /* ──────────────────────────────────────── Colour palette ─────────────────────────────────── */
  const colours = {
    A: 0xedd382, // adenine  – yellow
    T: 0x717ec3, // thymine  – blue
    G: 0x85ffc7, // guanine  – green
    C: 0xff6f59  // cytosine – red
  };

  /* ──────────────────────────────────────── DNA geometry ───────────────────────────────────── */
  const bpPerTurn = 10.5;            // biological B‑DNA
  const rise = 1.0;                  // 1 au ≈ 0.34 nm (visual unit)
  const radius = 4.0;                // helix radius in au
  const numBasePairs = 42;           // ≈ 4 turns

  const helixPitch = bpPerTurn * rise; // height of one full turn
  const totalHeight = (numBasePairs - 1) * rise;
  const anglePerBP = (2 * Math.PI) / bpPerTurn;

  const dnaGroup = new THREE.Group();
  scene.add(dnaGroup);

  /* Helper: build cylinder between two points */
  function cylinderBetween(p1, p2, radius, colour) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    const geom = new THREE.CylinderGeometry(radius, radius, len, 8, 1);
    const mat = new THREE.MeshBasicMaterial({ color: colour });

    // orient the cylinder so that its Y axis matches dir
    const mesh = new THREE.Mesh(geom, mat);
    const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    mesh.position.copy(midpoint);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return mesh;
  }

  /* ───────────────────────────────────────── Backbones ─────────────────────────────────────── */
  function buildBackbone(phase) {
    const pathPts = [];
    for (let i = 0; i < numBasePairs; i++) {
      const y = (i - (numBasePairs - 1) / 2) * rise;
      const angle = -i * anglePerBP + phase;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      pathPts.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pathPts);
    const geom = new THREE.TubeGeometry(curve, 200, 0.15, 16, false);
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, opacity: 0.28, transparent: true, roughness: 0.2, metalness: 0.5, clearcoat: 0.7, clearcoatRoughness: 0.1, emissive: 0x222222 });
    return new THREE.Mesh(geom, mat);
  }
  dnaGroup.add(buildBackbone(0));         // strand 1
  dnaGroup.add(buildBackbone(Math.PI));   // strand 2 (180° offset)

  /* ───────────────────────────────────────── Base pairs ─────────────────────────────────────── */
  const bases = ['A', 'T', 'G', 'C'];
  const complement = { A: 'T', T: 'A', G: 'C', C: 'G' };

  for (let i = 0; i < numBasePairs; i++) {
    const y = (i - (numBasePairs - 1) / 2) * rise;
    const angle = -i * anglePerBP;
    const base1 = bases[Math.floor(Math.random() * 4)];
    const base2 = complement[base1];
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;
    const p1 = new THREE.Vector3(x1, y, z1);
    const p2 = new THREE.Vector3(x2, y, z2);
    // Glassy, colored, softly glowing bases
    const sphereGeom = new THREE.SphereGeometry(0.35, 24, 24);
    const s1 = new THREE.Mesh(
      sphereGeom,
      new THREE.MeshPhysicalMaterial({
        color: colours[base1],
        opacity: 0.6,
        transparent: true,
        roughness: 0.18,
        metalness: 0.55,
        clearcoat: 0.7,
        clearcoatRoughness: 0.08,
        emissive: colours[base1] * 0.3,
        emissiveIntensity: 0.13
      })
    );
    const s2 = new THREE.Mesh(
      sphereGeom,
      new THREE.MeshPhysicalMaterial({
        color: colours[base2],
        opacity: 0.6,
        transparent: true,
        roughness: 0.18,
        metalness: 0.55,
        clearcoat: 0.7,
        clearcoatRoughness: 0.08,
        emissive: colours[base2] * 0.3,
        emissiveIntensity: 0.13
      })
    );
    s1.position.copy(p1);
    s2.position.copy(p2);
    dnaGroup.add(s1, s2);
    // Glassy, softly glowing hydrogen bond (cylinder)
    const bondColour = (base1 === 'A' || base1 === 'T') ? 0xffffff : 0xbbbbbb;
    const bondMat = new THREE.MeshPhysicalMaterial({
      color: bondColour,
      opacity: 0.22,
      transparent: true,
      roughness: 0.22,
      metalness: 0.45,
      clearcoat: 0.6,
      clearcoatRoughness: 0.12,
      emissive: 0x222222,
      emissiveIntensity: 0.08
    });
    const bond = cylinderBetween(p1, p2, 0.08, bondColour);
    bond.material = bondMat;
    dnaGroup.add(bond);
  }

  /* ───────────────────────────────────────── Animation loop ────────────────────────────────── */
  let theta = 0;
  (function animate() {
    if (!container || container.style.display === 'none') return;
    requestAnimationFrame(animate);

    theta += 0.01;
    dnaGroup.rotation.y = theta * 0.3;
    dnaGroup.rotation.x = Math.sin(theta * 0.5) * 0.18;
    dnaGroup.rotation.z = Math.sin(theta * 0.23) * 0.08;

    renderer.render(scene, camera);
  })();

  /* ───────────────────────────────────────── Responsiveness ────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
 