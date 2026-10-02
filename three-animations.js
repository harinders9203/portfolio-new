/* ===================================================================
   HARINDER SINGH — PURPLE TEAM CYBERSECURITY PORTFOLIO
   Three.js 3D Visuals & Interactive Cyber Engine
   =================================================================== */

(function () {
    'use strict';

    // Helper: Check if Three.js is loaded, retry briefly if script is still loading
    function ensureThree(callback, attempts) {
        attempts = attempts || 0;
        if (typeof THREE !== 'undefined') {
            callback();
        } else if (attempts < 20) {
            setTimeout(function () {
                ensureThree(callback, attempts + 1);
            }, 100);
        } else {
            console.warn('Three.js library could not be loaded; 3D canvas disabled.');
        }
    }

    ensureThree(function () {
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Universal loop manager with IntersectionObserver to conserve GPU/CPU
        function createLoop(containerElement, renderCallback) {
            var isVisible = false;
            var reqId = 0;

            function stop() {
                if (reqId) {
                    cancelAnimationFrame(reqId);
                    reqId = 0;
                }
            }

            function tick() {
                reqId = 0;
                if (!isVisible || document.hidden) return;
                renderCallback();
                if (!reducedMotion.matches) {
                    reqId = requestAnimationFrame(tick);
                }
            }

            function start() {
                if (!reqId && isVisible && !document.hidden) {
                    reqId = requestAnimationFrame(tick);
                }
            }

            var observer = new IntersectionObserver(function (entries) {
                isVisible = entries[0].isIntersecting;
                if (isVisible) start();
                else stop();
            }, { threshold: 0.05 });

            observer.observe(containerElement);

            document.addEventListener('visibilitychange', function () {
                if (document.hidden) stop();
                else start();
            });

            if (reducedMotion.addEventListener) {
                reducedMotion.addEventListener('change', function () {
                    if (reducedMotion.matches) {
                        stop();
                        renderCallback();
                    } else {
                        start();
                    }
                });
            }

            // Return method to manually trigger a render frame
            return {
                start: start,
                stop: stop,
                tickOnce: function () { renderCallback(); }
            };
        }

        // Procedural circular glow texture (Zero external dependencies)
        function createGlowTexture(innerRgba, midRgba, outerRgba) {
            var canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            var ctx = canvas.getContext('2d');
            var grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            grad.addColorStop(0, innerRgba || 'rgba(248,250,252,1)');
            grad.addColorStop(0.25, midRgba || 'rgba(167,139,250,0.9)');
            grad.addColorStop(0.6, outerRgba || 'rgba(167,139,250,0.3)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 64, 64);
            return new THREE.CanvasTexture(canvas);
        }

        var glowTexture = createGlowTexture();

        // Safe WebGL Renderer Creator
        function makeRenderer(canvas, alpha) {
            try {
                var renderer = new THREE.WebGLRenderer({
                    canvas: canvas,
                    alpha: alpha !== false,
                    antialias: true,
                    powerPreference: 'high-performance'
                });
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
                renderer.setClearColor(0x000000, 0);
                return renderer;
            } catch (err) {
                console.warn('WebGL init failed:', err);
                return null;
            }
        }

        // ================================================================
        // 1. HERO BACKGROUND: 3D CYBER THREAT NETWORK & DATA PACKETS
        // ================================================================
        function initHeroNetwork() {
            var heroSection = document.getElementById('hero');
            var heroBg = heroSection ? heroSection.querySelector('.hero-bg') : null;
            if (!heroBg) return;

            var canvas = document.createElement('canvas');
            canvas.id = 'heroCanvas';
            heroBg.appendChild(canvas);

            var renderer = makeRenderer(canvas, true);
            if (!renderer) return;

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);
            camera.position.z = 15;

            var isMobile = window.innerWidth < 768;
            var COUNT = isMobile ? 85 : 160;
            var BOUNDS = 22;
            var HALF = BOUNDS / 2;
            var CONNECT_DIST = isMobile ? 3.4 : 4.0;
            var MAX_CONNECTIONS = isMobile ? 180 : 420;

            // Official Palette: Violet Primary (#A78BFA), Sky Blue Secondary (#38BDF8), Amber (#F59E0B), Text (#F8FAFC)
            var cPrimary   = new THREE.Color(0xA78BFA);
            var cSecondary = new THREE.Color(0x38BDF8);
            var cAmber     = new THREE.Color(0xF59E0B);
            var cText      = new THREE.Color(0xF8FAFC);

            var positions = new Float32Array(COUNT * 3);
            var colors    = new Float32Array(COUNT * 3);
            var velocities = [];

            for (var i = 0; i < COUNT; i++) {
                positions[i * 3]     = (Math.random() - 0.5) * BOUNDS;
                positions[i * 3 + 1] = (Math.random() - 0.5) * BOUNDS;
                positions[i * 3 + 2] = (Math.random() - 0.5) * (BOUNDS * 0.6);

                velocities.push(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.016,
                    (Math.random() - 0.5) * 0.016,
                    (Math.random() - 0.5) * 0.012
                ));

                var roll = Math.random();
                var col = roll < 0.45 ? cPrimary : (roll < 0.72 ? cSecondary : (roll < 0.88 ? cAmber : cText));
                colors[i * 3]     = col.r;
                colors[i * 3 + 1] = col.g;
                colors[i * 3 + 2] = col.b;
            }

            var pointsGeo = new THREE.BufferGeometry();
            pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            var pointsMat = new THREE.PointsMaterial({
                size: isMobile ? 0.35 : 0.45,
                map: glowTexture,
                vertexColors: true,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            var pointsMesh = new THREE.Points(pointsGeo, pointsMat);
            scene.add(pointsMesh);

            // Dynamic connection lines
            var linePositions = new Float32Array(MAX_CONNECTIONS * 6);
            var lineColors    = new Float32Array(MAX_CONNECTIONS * 6);
            var linesGeo = new THREE.BufferGeometry();
            linesGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
            linesGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
            linesGeo.setDrawRange(0, 0);

            var linesMat = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            var linesMesh = new THREE.LineSegments(linesGeo, linesMat);
            scene.add(linesMesh);

            // Data packets traveling on network lines
            var PACKET_COUNT = isMobile ? 12 : 24;
            var packetPos = new Float32Array(PACKET_COUNT * 3);
            var packetData = [];

            for (var k = 0; k < PACKET_COUNT; k++) {
                packetData.push({
                    startIdx: Math.floor(Math.random() * COUNT),
                    endIdx:   Math.floor(Math.random() * COUNT),
                    progress: Math.random(),
                    speed:    0.008 + Math.random() * 0.012
                });
            }

            var packetGeo = new THREE.BufferGeometry();
            packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
            var packetMat = new THREE.PointsMaterial({
                size: 0.65,
                map: glowTexture,
                color: 0xF8FAFC,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            var packetMesh = new THREE.Points(packetGeo, packetMat);
            scene.add(packetMesh);

            // Mouse & Interaction
            var mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };
            var shockwave = { active: false, radius: 0, maxRadius: 16, x: 0, y: 0 };

            window.addEventListener('mousemove', function (e) {
                var rect = heroSection.getBoundingClientRect();
                if (e.clientY < rect.bottom && e.clientY > rect.top) {
                    mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                    mouse.targetY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                    mouse.active = true;
                } else {
                    mouse.active = false;
                }
            });

            heroSection.addEventListener('click', function (e) {
                var rect = heroSection.getBoundingClientRect();
                var cx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                var cy = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                shockwave.x = cx * HALF;
                shockwave.y = cy * HALF;
                shockwave.radius = 0.5;
                shockwave.active = true;
            });

            var frame = 0;

            function render() {
                frame++;
                mouse.x += (mouse.targetX - mouse.x) * 0.05;
                mouse.y += (mouse.targetY - mouse.y) * 0.05;

                var posArr = pointsGeo.attributes.position.array;
                var mouseWorldX = mouse.x * HALF;
                var mouseWorldY = mouse.y * HALF;

                // Shockwave expansion
                if (shockwave.active) {
                    shockwave.radius += 0.45;
                    if (shockwave.radius > shockwave.maxRadius) {
                        shockwave.active = false;
                    }
                }

                // Update particles
                for (var i = 0; i < COUNT; i++) {
                    var idx = i * 3;
                    posArr[idx]     += velocities[i].x;
                    posArr[idx + 1] += velocities[i].y;
                    posArr[idx + 2] += velocities[i].z;

                    // Mouse gravity field
                    if (mouse.active) {
                        var dx = mouseWorldX - posArr[idx];
                        var dy = mouseWorldY - posArr[idx + 1];
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 5.0 && dist > 0.2) {
                            var force = (1 - dist / 5.0) * 0.035;
                            posArr[idx]     += dx * force;
                            posArr[idx + 1] += dy * force;
                        }
                    }

                    // Shockwave impulse
                    if (shockwave.active) {
                        var sx = posArr[idx] - shockwave.x;
                        var sy = posArr[idx + 1] - shockwave.y;
                        var sDist = Math.sqrt(sx * sx + sy * sy);
                        if (Math.abs(sDist - shockwave.radius) < 1.8) {
                            var impulse = (1 - Math.abs(sDist - shockwave.radius) / 1.8) * 0.2;
                            posArr[idx]     += (sx / (sDist || 1)) * impulse;
                            posArr[idx + 1] += (sy / (sDist || 1)) * impulse;
                        }
                    }

                    // Wrap boundaries
                    if (posArr[idx] > HALF)  posArr[idx] = -HALF;
                    if (posArr[idx] < -HALF) posArr[idx] = HALF;
                    if (posArr[idx + 1] > HALF)  posArr[idx + 1] = -HALF;
                    if (posArr[idx + 1] < -HALF) posArr[idx + 1] = HALF;
                    if (posArr[idx + 2] > 7)  posArr[idx + 2] = -7;
                    if (posArr[idx + 2] < -7) posArr[idx + 2] = 7;
                }
                pointsGeo.attributes.position.needsUpdate = true;

                // Build connections
                var lineIdx = 0;
                var lPos = linesGeo.attributes.position.array;
                var lCol = linesGeo.attributes.color.array;
                var connectDistSq = CONNECT_DIST * CONNECT_DIST;

                for (var a = 0; a < COUNT && lineIdx < MAX_CONNECTIONS; a++) {
                    var ax = posArr[a * 3];
                    var ay = posArr[a * 3 + 1];
                    var az = posArr[a * 3 + 2];

                    for (var b = a + 1; b < COUNT && lineIdx < MAX_CONNECTIONS; b++) {
                        var bx = posArr[b * 3];
                        var by = posArr[b * 3 + 1];
                        var bz = posArr[b * 3 + 2];

                        var ddx = ax - bx;
                        var ddy = ay - by;
                        var ddz = az - bz;
                        var d2 = ddx * ddx + ddy * ddy + ddz * ddz;

                        if (d2 < connectDistSq) {
                            var alpha = 1.0 - Math.sqrt(d2) / CONNECT_DIST;
                            var off = lineIdx * 6;

                            lPos[off]     = ax; lPos[off + 1] = ay; lPos[off + 2] = az;
                            lPos[off + 3] = bx; lPos[off + 4] = by; lPos[off + 5] = bz;

                            // Gradient line: Primary Violet (#A78BFA) to Secondary Sky Blue (#38BDF8)
                            lCol[off]     = cPrimary.r * alpha;
                            lCol[off + 1] = cPrimary.g * alpha;
                            lCol[off + 2] = cPrimary.b * alpha;
                            lCol[off + 3] = cSecondary.r * alpha;
                            lCol[off + 4] = cSecondary.g * alpha;
                            lCol[off + 5] = cSecondary.b * alpha;

                            lineIdx++;
                        }
                    }
                }

                linesGeo.setDrawRange(0, lineIdx * 2);
                linesGeo.attributes.position.needsUpdate = true;
                linesGeo.attributes.color.needsUpdate = true;

                // Update data packets
                var packArr = packetGeo.attributes.position.array;
                for (var p = 0; p < PACKET_COUNT; p++) {
                    var pkt = packetData[p];
                    pkt.progress += pkt.speed;
                    if (pkt.progress >= 1) {
                        pkt.progress = 0;
                        pkt.startIdx = Math.floor(Math.random() * COUNT);
                        pkt.endIdx   = Math.floor(Math.random() * COUNT);
                    }
                    var sI = pkt.startIdx * 3;
                    var eI = pkt.endIdx * 3;
                    packArr[p * 3]     = posArr[sI]     + (posArr[eI]     - posArr[sI])     * pkt.progress;
                    packArr[p * 3 + 1] = posArr[sI + 1] + (posArr[eI + 1] - posArr[sI + 1]) * pkt.progress;
                    packArr[p * 3 + 2] = posArr[sI + 2] + (posArr[eI + 2] - posArr[sI + 2]) * pkt.progress;
                }
                packetGeo.attributes.position.needsUpdate = true;

                // Camera parallax
                camera.position.x += (mouse.x * 3.0 - camera.position.x) * 0.03;
                camera.position.y += (mouse.y * 2.0 - camera.position.y) * 0.03;
                camera.lookAt(0, 0, 0);

                pointsMesh.rotation.y += 0.0006;
                linesMesh.rotation.y  += 0.0006;

                renderer.render(scene, camera);
            }

            function onResize() {
                var w = heroSection.clientWidth;
                var h = heroSection.clientHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
            onResize();
            window.addEventListener('resize', onResize);

            createLoop(heroSection, render);
        }

        // ================================================================
        // 2. HERO 3D PANEL: INTERACTIVE PURPLE TEAM HOLOGRAPHIC DEFENSE CORE
        // ================================================================
        function initHero3DDefenseCore() {
            var container = document.getElementById('hero3dCanvasContainer');
            var panel = document.getElementById('hero3dPanel');
            var telemetryEl = document.getElementById('coreTelemetry');
            if (!container) return;

            var canvas = document.createElement('canvas');
            container.appendChild(canvas);

            var renderer = makeRenderer(canvas, true);
            if (!renderer) return;

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
            camera.position.set(0, 0, 8.8);

            // Main Core Group (Rotated by User & Physics)
            var coreGroup = new THREE.Group();
            scene.add(coreGroup);

            // A. Outer Geodesic Icosahedron Wireframe
            var outerGeo = new THREE.IcosahedronGeometry(2.35, 1);
            var outerEdges = new THREE.EdgesGeometry(outerGeo);
            var outerMat = new THREE.LineBasicMaterial({
                color: 0xA78BFA,
                transparent: true,
                opacity: 0.85,
                linewidth: 2
            });
            var outerWire = new THREE.LineSegments(outerEdges, outerMat);
            coreGroup.add(outerWire);

            // B. Glowing Nodes on Icosahedron Vertices
            var vPos = outerGeo.getAttribute('position').clone();
            var vGeo = new THREE.BufferGeometry();
            vGeo.setAttribute('position', vPos);
            var vMat = new THREE.PointsMaterial({
                size: 0.35,
                map: glowTexture,
                color: 0xA78BFA,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            var vertexNodes = new THREE.Points(vGeo, vMat);
            coreGroup.add(vertexNodes);

            // C. Inner Counter-Rotating Octahedron / Core Lattice
            var innerGeo = new THREE.OctahedronGeometry(1.6, 0);
            var innerEdges = new THREE.EdgesGeometry(innerGeo);
            var innerMat = new THREE.LineBasicMaterial({
                color: 0xA78BFA,
                transparent: true,
                opacity: 0.7
            });
            var innerWire = new THREE.LineSegments(innerEdges, innerMat);
            coreGroup.add(innerWire);

            // D. Pulsating Quantum Nucleus
            var nucleusGeo = new THREE.SphereGeometry(0.75, 24, 24);
            var nucleusMat = new THREE.MeshBasicMaterial({
                color: 0xA78BFA,
                wireframe: true,
                transparent: true,
                opacity: 0.45
            });
            var nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
            coreGroup.add(nucleus);

            // Inner solid glow core
            var coreGlowGeo = new THREE.SphereGeometry(0.38, 16, 16);
            var coreGlowMat = new THREE.MeshBasicMaterial({
                color: 0xF8FAFC,
                transparent: true,
                opacity: 0.85
            });
            var coreGlow = new THREE.Mesh(coreGlowGeo, coreGlowMat);
            coreGroup.add(coreGlow);

            // E. RED TEAM Orbital Ring (Amber Threat Vector #F59E0B)
            var redRingGeo = new THREE.TorusGeometry(3.3, 0.035, 16, 80);
            var redRingMat = new THREE.MeshBasicMaterial({
                color: 0xF59E0B,
                transparent: true,
                opacity: 0.85
            });
            var redRing = new THREE.Mesh(redRingGeo, redRingMat);
            redRing.rotation.x = Math.PI / 4;
            redRing.rotation.y = Math.PI / 6;
            scene.add(redRing);

            // Red Threat Beacon Node
            var redBeaconGeo = new THREE.SphereGeometry(0.16, 12, 12);
            var redBeaconMat = new THREE.MeshBasicMaterial({ color: 0xF59E0B });
            var redBeacon = new THREE.Mesh(redBeaconGeo, redBeaconMat);
            scene.add(redBeacon);

            // F. BLUE TEAM Orbital Ring (Sky Blue Defense Perimeter #38BDF8)
            var blueRingGeo = new THREE.TorusGeometry(3.6, 0.035, 16, 80);
            var blueRingMat = new THREE.MeshBasicMaterial({
                color: 0x38BDF8,
                transparent: true,
                opacity: 0.85
            });
            var blueRing = new THREE.Mesh(blueRingGeo, blueRingMat);
            blueRing.rotation.x = -Math.PI / 3.5;
            blueRing.rotation.y = -Math.PI / 5;
            scene.add(blueRing);

            // Blue Firewall Beacon Node
            var blueBeaconGeo = new THREE.SphereGeometry(0.16, 12, 12);
            var blueBeaconMat = new THREE.MeshBasicMaterial({ color: 0x38BDF8 });
            var blueBeacon = new THREE.Mesh(blueBeaconGeo, blueBeaconMat);
            scene.add(blueBeacon);

            // G. Shield Cloud of Micro-Satellites
            var SHIELD_NODES = 110;
            var shieldPos = new Float32Array(SHIELD_NODES * 3);
            for (var s = 0; s < SHIELD_NODES; s++) {
                var phi = Math.acos(2 * Math.random() - 1);
                var theta = Math.random() * Math.PI * 2;
                var rad = 2.8 + Math.random() * 0.4;
                shieldPos[s * 3]     = rad * Math.sin(phi) * Math.cos(theta);
                shieldPos[s * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
                shieldPos[s * 3 + 2] = rad * Math.cos(phi);
            }
            var shieldGeo = new THREE.BufferGeometry();
            shieldGeo.setAttribute('position', new THREE.BufferAttribute(shieldPos, 3));
            var shieldMat = new THREE.PointsMaterial({
                size: 0.22,
                map: glowTexture,
                color: 0xA78BFA,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            var shieldCloud = new THREE.Points(shieldGeo, shieldMat);
            coreGroup.add(shieldCloud);

            // Interactive Drag Physics
            var isDragging = false;
            var previousMouse = { x: 0, y: 0 };
            var momentum = { x: 0.004, y: 0.007 };
            var currentMode = 'violet';

            function onPointerDown(e) {
                isDragging = true;
                previousMouse.x = e.clientX;
                previousMouse.y = e.clientY;
            }

            function onPointerMove(e) {
                if (!isDragging) return;
                var deltaX = e.clientX - previousMouse.x;
                var deltaY = e.clientY - previousMouse.y;
                previousMouse.x = e.clientX;
                previousMouse.y = e.clientY;

                coreGroup.rotation.y += deltaX * 0.008;
                coreGroup.rotation.x += deltaY * 0.008;

                momentum.x = deltaY * 0.005;
                momentum.y = deltaX * 0.005;

                updateTelemetry();
            }

            function onPointerUp() {
                isDragging = false;
            }

            container.addEventListener('pointerdown', onPointerDown);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);

            function updateTelemetry() {
                if (!telemetryEl) return;
                var degX = Math.round((coreGroup.rotation.x * 180 / Math.PI) % 360);
                var degY = Math.round((coreGroup.rotation.y * 180 / Math.PI) % 360);
                if (degX < 0) degX += 360;
                if (degY < 0) degY += 360;
                telemetryEl.textContent = 'ROT [' + degX + '°, ' + degY + '°]';
            }

            // Mode Switching Buttons: [VIOLET], [RED / AMBER], [BLUE TEAM]
            var modeButtons = panel ? panel.querySelectorAll('.core-btn') : [];
            modeButtons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    modeButtons.forEach(function (b) { b.classList.remove('active'); });
                    this.classList.add('active');
                    currentMode = this.getAttribute('data-mode') || 'purple';

                    if (currentMode === 'red') {
                        outerMat.color.setHex(0xF59E0B);
                        vMat.color.setHex(0xF59E0B);
                        nucleusMat.color.setHex(0xF59E0B);
                        coreGlowMat.color.setHex(0xF59E0B);
                        redRingMat.opacity = 1.0;
                        blueRingMat.opacity = 0.25;
                    } else if (currentMode === 'blue') {
                        outerMat.color.setHex(0x38BDF8);
                        vMat.color.setHex(0x38BDF8);
                        nucleusMat.color.setHex(0x38BDF8);
                        coreGlowMat.color.setHex(0x38BDF8);
                        redRingMat.opacity = 0.25;
                        blueRingMat.opacity = 1.0;
                    } else {
                        outerMat.color.setHex(0xA78BFA);
                        vMat.color.setHex(0xA78BFA);
                        nucleusMat.color.setHex(0xA78BFA);
                        coreGlowMat.color.setHex(0xF8FAFC);
                        redRingMat.opacity = 0.85;
                        blueRingMat.opacity = 0.85;
                    }
                });
            });

            var clock = 0;

            function render() {
                clock += 0.015;

                // Inertia & Damping
                if (!isDragging) {
                    coreGroup.rotation.y += momentum.y;
                    coreGroup.rotation.x += momentum.x;
                    momentum.x *= 0.96;
                    momentum.y *= 0.96;

                    // Baseline idle rotation
                    coreGroup.rotation.y += 0.004;
                    coreGroup.rotation.x += Math.sin(clock * 0.3) * 0.001;
                }

                innerWire.rotation.y -= 0.007;
                innerWire.rotation.z += 0.003;
                shieldCloud.rotation.y += 0.002;

                // Quantum breathing core
                var pulse = 1.0 + Math.sin(clock * 2.5) * 0.08;
                nucleus.scale.set(pulse, pulse, pulse);
                coreGlow.scale.set(pulse, pulse, pulse);

                // Orbiting Beacons on Rings
                var rAngle = clock * 1.2;
                var rRad = 3.3;
                redBeacon.position.set(
                    rRad * Math.cos(rAngle),
                    rRad * Math.sin(rAngle) * Math.sin(Math.PI / 4),
                    rRad * Math.sin(rAngle) * Math.cos(Math.PI / 4)
                );

                var bAngle = -clock * 0.9;
                var bRad = 3.6;
                blueBeacon.position.set(
                    bRad * Math.cos(bAngle),
                    bRad * Math.sin(bAngle) * Math.sin(-Math.PI / 3.5),
                    bRad * Math.sin(bAngle) * Math.cos(-Math.PI / 3.5)
                );

                // Idle telemetry update every few frames
                if (Math.round(clock * 100) % 6 === 0) {
                    updateTelemetry();
                }

                renderer.render(scene, camera);
            }

            function onResize() {
                var w = container.clientWidth;
                var h = container.clientHeight;
                if (!w || !h) return;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
            onResize();
            window.addEventListener('resize', onResize);

            createLoop(container, render);
        }

        // ================================================================
        // 3. SKILLS SECTION: 3D CYBER RADAR & ARSENAL HARMONIZER
        // ================================================================
        function initSkillsRadar() {
            var section = document.getElementById('skills');
            if (!section) return;

            var canvas = document.createElement('canvas');
            canvas.id = 'skillsCanvas';
            section.insertBefore(canvas, section.firstChild);

            var renderer = makeRenderer(canvas, true);
            if (!renderer) return;

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
            camera.position.z = 12;

            // Concentric Wireframe Shells
            var outerGeo = new THREE.IcosahedronGeometry(4.2, 1);
            var outerEdges = new THREE.EdgesGeometry(outerGeo);
            var outerMat = new THREE.LineBasicMaterial({
                color: 0xA78BFA,
                transparent: true,
                opacity: 0.65
            });
            var outerWire = new THREE.LineSegments(outerEdges, outerMat);
            scene.add(outerWire);

            var innerGeo = new THREE.DodecahedronGeometry(2.6, 0);
            var innerEdges = new THREE.EdgesGeometry(innerGeo);
            var innerMat = new THREE.LineBasicMaterial({
                color: 0x38BDF8,
                transparent: true,
                opacity: 0.55
            });
            var innerWire = new THREE.LineSegments(innerEdges, innerMat);
            scene.add(innerWire);

            // Scanning Radar Sweeper Disk
            var radarGeo = new THREE.RingGeometry(0.1, 4.4, 64);
            var radarMat = new THREE.MeshBasicMaterial({
                color: 0xA78BFA,
                wireframe: true,
                transparent: true,
                opacity: 0.35,
                side: THREE.DoubleSide
            });
            var radarMesh = new THREE.Mesh(radarGeo, radarMat);
            scene.add(radarMesh);

            // Team card hover triggers color changes
            var teamCards = section.querySelectorAll('.team-card');
            teamCards.forEach(function (card) {
                card.addEventListener('mouseenter', function () {
                    if (this.classList.contains('red-team')) {
                        outerMat.color.setHex(0xF59E0B);
                        radarMat.color.setHex(0xF59E0B);
                    } else if (this.classList.contains('blue-team')) {
                        outerMat.color.setHex(0x38BDF8);
                        radarMat.color.setHex(0x38BDF8);
                    } else {
                        outerMat.color.setHex(0xA78BFA);
                        radarMat.color.setHex(0xA78BFA);
                    }
                });
                card.addEventListener('mouseleave', function () {
                    outerMat.color.setHex(0xA78BFA);
                    radarMat.color.setHex(0xA78BFA);
                });
            });

            var clock = 0;

            function render() {
                clock += 0.015;

                outerWire.rotation.x += 0.003;
                outerWire.rotation.y += 0.005;

                innerWire.rotation.x -= 0.004;
                innerWire.rotation.y -= 0.006;

                radarMesh.rotation.z += 0.02;
                radarMesh.rotation.x = Math.PI / 3 + Math.sin(clock * 0.5) * 0.15;

                var bob = Math.sin(clock) * 0.35;
                outerWire.position.y = bob;
                innerWire.position.y = bob;
                radarMesh.position.y = bob;

                renderer.render(scene, camera);
            }

            function onResize() {
                var w = section.clientWidth;
                var h = section.clientHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
            onResize();
            window.addEventListener('resize', onResize);

            createLoop(section, render);
        }

        // ================================================================
        // 4. CONTACT SECTION: 3D CRYPTOGRAPHIC QUANTUM KNOT
        // ================================================================
        function initContactCryptKnot() {
            var section = document.getElementById('contact');
            if (!section) return;

            var canvas = document.createElement('canvas');
            canvas.id = 'contactCanvas';
            section.insertBefore(canvas, section.firstChild);

            var renderer = makeRenderer(canvas, true);
            if (!renderer) return;

            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
            camera.position.z = 14;

            // Wireframe Torus Knot
            var knotGeo = new THREE.TorusKnotGeometry(3.6, 0.95, 128, 18, 2, 3);
            var knotEdges = new THREE.EdgesGeometry(knotGeo);
            var knotMat = new THREE.LineBasicMaterial({
                color: 0xA78BFA,
                transparent: true,
                opacity: 0.65
            });
            var knotMesh = new THREE.LineSegments(knotEdges, knotMat);
            scene.add(knotMesh);

            // Orbiting Quantum Key Points
            var KEY_COUNT = 70;
            var keyPos = new Float32Array(KEY_COUNT * 3);
            for (var i = 0; i < KEY_COUNT; i++) {
                var angle = (i / KEY_COUNT) * Math.PI * 2;
                keyPos[i * 3]     = Math.cos(angle) * 6.2;
                keyPos[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
                keyPos[i * 3 + 2] = Math.sin(angle) * 6.2;
            }
            var keyGeo = new THREE.BufferGeometry();
            keyGeo.setAttribute('position', new THREE.BufferAttribute(keyPos, 3));
            var keyMat = new THREE.PointsMaterial({
                size: 0.3,
                map: glowTexture,
                color: 0x38BDF8,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            var keyRing = new THREE.Points(keyGeo, keyMat);
            scene.add(keyRing);

            // Mouse tracking in contact section
            var contactMouse = { x: 0, y: 0 };
            section.addEventListener('mousemove', function (e) {
                var rect = section.getBoundingClientRect();
                contactMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                contactMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            });

            var clock = 0;

            function render() {
                clock += 0.01;

                knotMesh.rotation.x += 0.003 + contactMouse.y * 0.005;
                knotMesh.rotation.y += 0.006 + contactMouse.x * 0.005;

                keyRing.rotation.y -= 0.004;

                var pulseColor = 0.5 + Math.sin(clock * 2) * 0.3;
                knotMat.opacity = 0.5 + pulseColor * 0.25;

                renderer.render(scene, camera);
            }

            function onResize() {
                var w = section.clientWidth;
                var h = section.clientHeight;
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }
            onResize();
            window.addEventListener('resize', onResize);

            createLoop(section, render);
        }

        // ================================================================
        // BOOTSTRAP ALL 3D EXPERIENCES
        // ================================================================
        function boot() {
            initHeroNetwork();
            initHero3DDefenseCore();
            initSkillsRadar();
            initContactCryptKnot();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
        } else {
            boot();
        }
    });

})();
