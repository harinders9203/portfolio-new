/* ===================================================================
   HARINDER SINGH — PURPLE TEAM PORTFOLIO
   JavaScript · Interactions & Animations
   =================================================================== */

(function () {
    'use strict';

    // ===== TYPING EFFECT =====
    const typedTextEl = document.getElementById('typedText');
    const phrases = [
        'Purple Team Cybersecurity Engineer',
        'Penetration Tester & Malware Analyst',
        'Bridging Red Team × Blue Team',
        'Building Unbreakable Defenses',
        'Jr. Cybersecurity Engineer @ Techcadd'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typeEffect() {
        const current = phrases[phraseIndex];
        if (isDeleting) {
            typedTextEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typedTextEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === current.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before next phrase
        }

        setTimeout(typeEffect, typingSpeed);
    }

    if (typedTextEl) {
        setTimeout(typeEffect, 1000);
    }

    // ===== NAVBAR SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');
    const toTop = document.getElementById('toTop');

    window.addEventListener('scroll', function () {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Scroll to top button
        if (scrollY > 500) {
            toTop.classList.add('visible');
        } else {
            toTop.classList.remove('visible');
        }
    });

    // ===== MOBILE MENU TOGGLE =====
    window.toggleMenu = function () {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    };

    // Close menu on link click
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            const hamburger = document.getElementById('hamburger');
            const navLinks = document.getElementById('navLinks');
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ===== COUNTER ANIMATION =====
    function animateCounters() {
        document.querySelectorAll('.stat-number').forEach(function (counter) {
            if (counter.dataset.animated) return;
            const target = parseInt(counter.dataset.count, 10);
            const duration = 1500;
            const step = target / (duration / 30);
            let current = 0;

            function update() {
                current += step;
                if (current >= target) {
                    counter.textContent = target;
                    counter.dataset.animated = 'true';
                } else {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(update);
                }
            }
            update();
        });
    }

    // ===== SKILL BAR ANIMATION =====
    function animateSkillBars() {
        document.querySelectorAll('.skill-bar-fill').forEach(function (bar) {
            if (bar.classList.contains('animated')) return;
            const rect = bar.getBoundingClientRect();
            if (rect.top < window.innerHeight - 50) {
                bar.style.width = bar.dataset.width + '%';
                bar.classList.add('animated');
            }
        });
    }

    // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger counter animation when hero stats are visible
                if (entry.target.closest && entry.target.closest('.hero-stats')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe all animate-on-scroll elements
    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        observer.observe(el);
    });

    // Observe hero section for counters
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const heroObserver = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                setTimeout(animateCounters, 500);
                heroObserver.disconnect();
            }
        }, { threshold: 0.3 });
        heroObserver.observe(heroSection);
    }

    // ===== ABOUT TERMINAL TYPEWRITER =====
    // The terminal replays from the first command whenever the section is viewed.
    (function initAboutTerminal() {
        const terminalBody = document.getElementById('aboutTerminalBody');
        const aboutSection = document.getElementById('about');
        if (!terminalBody || !aboutSection) return;

        const sourceLines = Array.from(terminalBody.children).map(function (line) {
            return line.cloneNode(true);
        });
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const typeDelay = reducedMotionQuery.matches ? 0 : 24;
        const commandDelay = reducedMotionQuery.matches ? 0 : 45;
        const lineDelay = reducedMotionQuery.matches ? 0 : 280;
        const restartDelay = 5 * 60 * 1000;

        let isVisible = false;
        let runId = 0;
        let restartTimer = null;

        function wait(ms, currentRun) {
            return new Promise(function (resolve) {
                window.setTimeout(function () {
                    resolve(currentRun === runId && isVisible);
                }, ms);
            });
        }

        function typeText(target, text, delay, currentRun) {
            return new Promise(function (resolve) {
                let index = 0;

                function nextCharacter() {
                    if (currentRun !== runId || !isVisible) {
                        resolve(false);
                        return;
                    }
                    target.textContent = text.slice(0, index);
                    if (index >= text.length) {
                        resolve(true);
                        return;
                    }
                    index += 1;
                    window.setTimeout(nextCharacter, delay);
                }

                nextCharacter();
            });
        }

        function createPrompt(command) {
            const line = document.createElement('p');
            line.innerHTML = '<span class="prompt">$</span> <span class="cmd"></span>';
            const commandTarget = line.querySelector('.cmd');
            commandTarget.setAttribute('aria-label', command);
            return { line: line, target: commandTarget };
        }

        function createOutput() {
            const line = document.createElement('p');
            line.className = 'output';
            const target = document.createElement('span');
            line.appendChild(target);
            return { line: line, target: target };
        }

        function createFinalPrompt() {
            const line = document.createElement('p');
            line.innerHTML = '<span class="prompt">$</span> <span class="cursor-blink">_</span>';
            return line;
        }

        function getCommand(line) {
            const command = line.querySelector('.cmd');
            return command ? command.textContent.trim() : '';
        }

        async function playCycle(currentRun) {
            terminalBody.innerHTML = '';

            for (let lineIndex = 0; lineIndex < sourceLines.length - 1; lineIndex += 1) {
                const sourceLine = sourceLines[lineIndex];
                const command = getCommand(sourceLine);

                if (command) {
                    const prompt = createPrompt(command);
                    terminalBody.appendChild(prompt.line);
                    if (!await typeText(prompt.target, command, commandDelay, currentRun)) return;
                    if (!await wait(lineDelay, currentRun)) return;
                    continue;
                }

                if (sourceLine.classList.contains('output-list')) {
                    const list = document.createElement('p');
                    list.className = 'output output-list';
                    terminalBody.appendChild(list);

                    const rows = sourceLine.querySelectorAll(':scope > span');
                    for (const row of rows) {
                        const typedRow = document.createElement('span');
                        const icon = row.querySelector('i');
                        if (icon) typedRow.appendChild(icon.cloneNode(true));
                        const textTarget = document.createElement('span');
                        typedRow.appendChild(textTarget);
                        list.appendChild(typedRow);
                        const rowText = row.textContent.trim();
                        if (!await typeText(textTarget, rowText, typeDelay, currentRun)) return;
                        if (!await wait(lineDelay, currentRun)) return;
                    }
                    continue;
                }

                if (sourceLine.classList.contains('output')) {
                    const output = createOutput();
                    terminalBody.appendChild(output.line);
                    if (!await typeText(output.target, sourceLine.textContent.trim(), typeDelay, currentRun)) return;
                    if (!await wait(lineDelay, currentRun)) return;
                }
            }

            if (currentRun !== runId || !isVisible) return;
            terminalBody.appendChild(createFinalPrompt());
            restartTimer = window.setTimeout(function () {
                if (isVisible) startCycle();
            }, restartDelay);
        }

        function startCycle() {
            window.clearTimeout(restartTimer);
            runId += 1;
            playCycle(runId);
        }

        function stopCycle() {
            window.clearTimeout(restartTimer);
            runId += 1;
            terminalBody.innerHTML = '';
        }

        const terminalObserver = new IntersectionObserver(function (entries) {
            const nowVisible = entries[0].isIntersecting;
            if (nowVisible === isVisible) return;
            isVisible = nowVisible;
            if (nowVisible) startCycle();
            else stopCycle();
        }, { threshold: 0.35 });
        terminalObserver.observe(aboutSection);

        // Older browsers without IntersectionObserver still get the animation.
        if (!('IntersectionObserver' in window)) {
            isVisible = true;
            startCycle();
        }
    }());

    // ===== SKILL BARS ON SCROLL =====
    window.addEventListener('scroll', animateSkillBars);
    // Initial check
    setTimeout(animateSkillBars, 500);

    // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Skip scroll-to-top
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ===== ACTIVE NAV LINK HIGHLIGHT =====
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(function (section) {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(function (link) {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active-link');
            }
        });
    });

    // Add active link style
    const style = document.createElement('style');
    style.textContent = '.nav-links a.active-link { color: var(--neon-purple) !important; background: var(--purple-soft) !important; }';
    document.head.appendChild(style);

    // ===== PRELOAD COMPLETE =====
    window.addEventListener('load', function () {
        document.body.classList.add('loaded');
    });

})();
