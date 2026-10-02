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
