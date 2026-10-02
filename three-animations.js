/* ===================================================================
   HARINDER SINGH — PURPLE TEAM PORTFOLIO
   Three.js Animations · Particles · Wireframes · Interactive 3D
   =================================================================== */

(function () {
    'use strict';

    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded — skipping 3D animations.');
        return;
    }

    // ================================================================
    // 1. HERO — Interactive Particle Network with Connections
    // ================================================================
    function initHeroNetwork() {
        const heroSection = document.getElementById('hero');
        const heroBg = heroSection?.querySelector('.hero-bg');
        if (!heroBg) return;

        // Create & insert canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'heroCanvas';
        heroBg.appendChild(canvas);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 12;

        // Config — scale down for mobile
        const isMobile = window.innerWidth < 768;
        const PARTICLE_COUNT = isMobile ? 80 : 180;
        const FIELD = 18;
        const HALF = FIELD / 2;
        const CONNECT_DIST = isMobile ? 2.8 : 3.2;
        const MAX_LINES = isMobile ? 120 : 400;

        // --- Particle colors ---
        const cPurple     = new THREE.Color(0x9333ea);
        const cNeonPurple = new THREE.Color(0xc084fc);
        const cBlue       = new THREE.Color(0x3b82f6);
        const cRed        = new THREE.Color(0xef4444);
        const cWhite      = new THREE.Color(0xffffff);

        // --- Build particle data ---
        const pPos = new Float32Array(PARTICLE_COUNT * 3);
        const pCol = new Float32Array(PARTICLE_COUNT * 3);
        const vels = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            pPos[i * 3]     = (Math.random() - 0.5) * FIELD;
            pPos[i * 3 + 1] = (Math.random() - 0.5) * FIELD;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * FIELD;

            vels.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.012,
                (Math.random() - 0.5) * 0.012,
                (Math.random() - 0.5) * 0.012
            ));

            const r = Math.random();
            const c = r < 0.35 ? cPurple
                    : r < 0.55 ? cNeonPurple
                    : r < 0.72 ? cBlue
                    : r < 0.86 ? cRed
                    : cWhite;
            pCol[i * 3]     = c.r;
            pCol[i * 3 + 1] = c.g;
            pCol[i * 3 + 2] = c.b;
        }

        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));

        const pMat = new THREE.PointsMaterial({
            size: isMobile ? 0.09 : 0.065,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });

        const points = new THREE.Points(pGeo, pMat);
        scene.add(points);

        // --- Connection lines (pre-allocated) ---
        const lPos = new Float32Array(MAX_LINES * 6);
        const lCol = new Float32Array(MAX_LINES * 6);
        const lGeo = new THREE.BufferGeometry();
        lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
        lGeo.setAttribute('color',    new THREE.BufferAttribute(lCol, 3));
        lGeo.setDrawRange(0, 0);

        const lMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.35,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const lines = new THREE.LineSegments(lGeo, lMat);
        scene.add(lines);

        // --- Mouse tracking ---
        const mouse = { x: 0, y: 0, worldX: 0, worldY: 0, active: false };

        heroSection.addEventListener('mousemove', function (e) {
            const rect = heroSection.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            // Project to 3D world space (approximate)
            mouse.worldX = mouse.x * (FIELD * 0.5);
            mouse.worldY = mouse.y * (FIELD * 0.5);
            mouse.active = true;
        });
        heroSection.addEventListener('mouseleave', function () { mouse.active = false; });

        // --- Animation loop ---
        var frame = 0;

        function animate() {
            requestAnimationFrame(animate);
            frame++;

            var p = pGeo.attributes.position.array;
            var mouseInfluence = 0.06;
            var mouseRadius = 3.5;

            // Update particles
            for (var i = 0; i < PARTICLE_COUNT; i++) {
                var ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;

                p[ix]   += vels[i].x;
                p[iy]   += vels[i].y;
                p[iz]   += vels[i].z;

                // Mouse attraction
                if (mouse.active) {
                    var dx = mouse.worldX - p[ix];
                    var dy = mouse.worldY - p[iy];
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouseRadius && dist > 0.1) {
                        var force = (1 - dist / mouseRadius) * mouseInfluence;
                        p[ix] += dx * force * 0.3;
                        p[iy] += dy * force * 0.3;
                    }
                }

                // Wrap boundaries
                if (p[ix] > HALF)  p[ix] = -HALF;
                if (p[ix] < -HALF) p[ix] = HALF;
                if (p[iy] > HALF)  p[iy] = -HALF;
                if (p[iy] < -HALF) p[iy] = HALF;
                if (p[iz] > HALF)  p[iz] = -HALF;
                if (p[iz] < -HALF) p[iz] = HALF;
            }
            pGeo.attributes.position.needsUpdate = true;

            // Update connections (skip every other frame on mobile)
            if (!isMobile || frame % 2 === 0) {
                var li = 0;
                var lp = lGeo.attributes.position.array;
                var lc = lGeo.attributes.color.array;
                var cd2 = CONNECT_DIST * CONNECT_DIST;

                for (var a = 0; a < PARTICLE_COUNT && li < MAX_LINES; a++) {
                    for (var b = a + 1; b < PARTICLE_COUNT && li < MAX_LINES; b++) {
                        var ddx = p[a*3] - p[b*3];
                        var ddy = p[a*3+1] - p[b*3+1];
                        var ddz = p[a*3+2] - p[b*3+2];
                        var d2 = ddx*ddx + ddy*ddy + ddz*ddz;

                        if (d2 < cd2) {
                            var alpha = 1 - Math.sqrt(d2) / CONNECT_DIST;
                            var k = li * 6;

                            lp[k]   = p[a*3];   lp[k+1] = p[a*3+1]; lp[k+2] = p[a*3+2];
                            lp[k+3] = p[b*3];   lp[k+4] = p[b*3+1]; lp[k+5] = p[b*3+2];

                            // Gradient line color: purple → blue
                            var cr = 0.576 * alpha;
                            var cg = 0.20  * alpha;
                            var cb = 0.918 * alpha;
                            lc[k]=cr; lc[k+1]=cg; lc[k+2]=cb;
                            // Slightly different second vertex for gradient feel
                            lc[k+3]=cr*0.7; lc[k+4]=cg*1.2; lc[k+5]=cb*1.1;

                            li++;
                        }
                    }
                }

                lGeo.setDrawRange(0, li * 2);
                lGeo.attributes.position.needsUpdate = true;
                lGeo.attributes.color.needsUpdate = true;
            }

            // Camera follows mouse or drifts
            if (mouse.active) {
                camera.position.x += (mouse.x * 2.5 - camera.position.x) * 0.018;
                camera.position.y += (mouse.y * 1.5 - camera.position.y) * 0.018;
            } else {
                camera.position.x += (Math.sin(frame * 0.002) * 0.8 - camera.position.x) * 0.005;
                camera.position.y += (Math.cos(frame * 0.003) * 0.5 - camera.position.y) * 0.005;
            }
            camera.lookAt(0, 0, 0);

            // Ambient rotation
            points.rotation.y += 0.0005;
            lines.rotation.y  += 0.0005;
            points.rotation.x  = Math.sin(frame * 0.001) * 0.05;
            lines.rotation.x   = Math.sin(frame * 0.001) * 0.05;

            renderer.render(scene, camera);
        }

        // Size helper
        function resize() {
            var w = heroSection.clientWidth;
            var h = heroSection.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        resize();
        window.addEventListener('resize', resize);

        animate();
    }

    // ================================================================
    // 2. SKILLS — Rotating Double Wireframe Icosahedron
    // ================================================================
    function initSkillsWireframe() {
        var section = document.getElementById('skills');
        if (!section) return;

        var canvas = document.createElement('canvas');
        canvas.id = 'skillsCanvas';
        section.insertBefore(canvas, section.firstChild);

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.z = 12;

        // --- Outer wireframe ---
        var outerGeo = new THREE.IcosahedronGeometry(4, 1);
        var outerEdges = new THREE.EdgesGeometry(outerGeo);
        var outerMat = new THREE.LineBasicMaterial({
            color: 0x9333ea,
            transparent: true,
            opacity: 0.5
        });
        var outerWire = new THREE.LineSegments(outerEdges, outerMat);
        scene.add(outerWire);

        // Vertex dots on outer
        var dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute('position', outerGeo.getAttribute('position').clone());
        var dotMat = new THREE.PointsMaterial({
            color: 0xc084fc,
            size: 0.15,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        var dots = new THREE.Points(dotGeo, dotMat);
        scene.add(dots);

        // --- Inner wireframe (counter-rotating) ---
        var innerGeo = new THREE.IcosahedronGeometry(2.5, 0);
        var innerEdges = new THREE.EdgesGeometry(innerGeo);
        var innerMat = new THREE.LineBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.3
        });
        var innerWire = new THREE.LineSegments(innerEdges, innerMat);
        scene.add(innerWire);

        // --- Core glow (tiny sphere) ---
        var coreGeo = new THREE.SphereGeometry(0.4, 16, 16);
        var coreMat = new THREE.MeshBasicMaterial({
            color: 0xc084fc,
            transparent: true,
            opacity: 0.3
        });
        var core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        var frame = 0;
        var isVisible = false;

        var observer = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        observer.observe(section);

        function animate() {
            requestAnimationFrame(animate);
            if (!isVisible) return;

            frame++;

            // Outer rotates forward
            outerWire.rotation.x += 0.003;
            outerWire.rotation.y += 0.005;
            outerWire.rotation.z += 0.001;
            dots.rotation.copy(outerWire.rotation);

            // Inner counter-rotates
            innerWire.rotation.x -= 0.004;
            innerWire.rotation.y -= 0.003;
            innerWire.rotation.z += 0.002;

            // Floating bob
            var bob = Math.sin(frame * 0.008) * 0.4;
            outerWire.position.y = bob;
            dots.position.y = bob;
            innerWire.position.y = bob;
            core.position.y = bob;

            // Core pulse
            var pulse = 0.3 + Math.sin(frame * 0.04) * 0.15;
            coreMat.opacity = pulse;
            var s = 1 + Math.sin(frame * 0.03) * 0.1;
            core.scale.set(s, s, s);

            renderer.render(scene, camera);
        }

        function resize() {
            var w = section.clientWidth;
            var h = section.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        resize();
        window.addEventListener('resize', resize);

        animate();
    }

    // ================================================================
    // 3. CONTACT — Rotating Wireframe Torus Knot
    // ================================================================
    function initContactKnot() {
        var section = document.getElementById('contact');
        if (!section) return;

        var canvas = document.createElement('canvas');
        canvas.id = 'contactCanvas';
        section.insertBefore(canvas, section.firstChild);

        var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.z = 14;

        // Torus knot wireframe
        var knotGeo = new THREE.TorusKnotGeometry(3.5, 1, 128, 16, 2, 3);
        var knotEdges = new THREE.EdgesGeometry(knotGeo);
        var knotMat = new THREE.LineBasicMaterial({
            color: 0x9333ea,
            transparent: true,
            opacity: 0.4
        });
        var knot = new THREE.LineSegments(knotEdges, knotMat);
        scene.add(knot);

        // Surrounding ring of dots
        var ringCount = 60;
        var ringPos = new Float32Array(ringCount * 3);
        for (var i = 0; i < ringCount; i++) {
            var angle = (i / ringCount) * Math.PI * 2;
            ringPos[i * 3]     = Math.cos(angle) * 6;
            ringPos[i * 3 + 1] = 0;
            ringPos[i * 3 + 2] = Math.sin(angle) * 6;
        }
        var ringGeo = new THREE.BufferGeometry();
        ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));
        var ringMat = new THREE.PointsMaterial({
            color: 0xc084fc,
            size: 0.08,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false
        });
        var ring = new THREE.Points(ringGeo, ringMat);
        scene.add(ring);

        var frame = 0;
        var isVisible = false;

        var observer = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        observer.observe(section);

        function animate() {
            requestAnimationFrame(animate);
            if (!isVisible) return;

            frame++;

            knot.rotation.x += 0.002;
            knot.rotation.y += 0.004;
            knot.rotation.z += 0.001;

            ring.rotation.y -= 0.003;
            ring.rotation.x = Math.sin(frame * 0.005) * 0.3;

            renderer.render(scene, camera);
        }

        function resize() {
            var w = section.clientWidth;
            var h = section.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        resize();
        window.addEventListener('resize', resize);

        animate();
    }

    // ================================================================
    // INITIALIZE ALL SCENES
    // ================================================================
    function initAll() {
        initHeroNetwork();
        initSkillsWireframe();
        initContactKnot();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

})();
