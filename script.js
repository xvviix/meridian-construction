/* ============================================
   MERIDIAN — Construction Group
   Interactive Script
   ============================================ */

(function () {
    'use strict';

    // --- Utility ---
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
    const lerp = (a, b, t) => a + (b - a) * t;

    // --- Preloader ---
    const preloader = $('#preloader');
    function hidePreloader() {
        if (!preloader) return;
        preloader.classList.add('preloader--hidden');
        document.body.style.overflow = '';
        // Trigger initial reveals
        setTimeout(() => initRevealAnimations(), 200);
    }

    window.addEventListener('load', () => {
        setTimeout(hidePreloader, 1800);
    });

    // Fallback
    setTimeout(hidePreloader, 4000);

    // --- Custom Cursor ---
    const cursor = $('#cursor');
    const cursorFollower = $('#cursor-follower');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;
    let cursorVisible = false;

    if (cursor && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!cursorVisible) {
                cursorVisible = true;
                cursor.style.opacity = '1';
                cursorFollower.style.opacity = '1';
            }
        });

        document.addEventListener('mouseleave', () => {
            cursorVisible = false;
            cursor.style.opacity = '0';
            cursorFollower.style.opacity = '0';
        });

        // Hover states
        $$('[data-hover]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor--hover');
                cursorFollower.classList.add('cursor-follower--hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor--hover');
                cursorFollower.classList.remove('cursor-follower--hover');
            });
        });

        // Cursor animation loop
        function animateCursor() {
            cursorX = lerp(cursorX, mouseX, 0.2);
            cursorY = lerp(cursorY, mouseY, 0.2);
            followerX = lerp(followerX, mouseX, 0.08);
            followerY = lerp(followerY, mouseY, 0.08);

            cursor.style.transform = `translate(${cursorX - 4}px, ${cursorY - 4}px)`;
            cursorFollower.style.transform = `translate(${followerX - 16}px, ${followerY - 16}px)`;

            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // --- Navigation ---
    const nav = $('#nav');
    const hamburger = $('#hamburger');
    const mobileMenu = $('#mobileMenu');
    let lastScrollY = 0;

    // Scroll behavior
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 80) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
        lastScrollY = scrollY;
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });

    // Mobile menu
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('nav__hamburger--active');
            mobileMenu.classList.toggle('mobile-menu--active');
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close on link click
        $$('.mobile-menu__link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('nav__hamburger--active');
                mobileMenu.classList.remove('mobile-menu--active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Smooth Scroll ---
    $$('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = $(href);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Reveal on Scroll ---
    function initRevealAnimations() {
        const reveals = $$('.reveal');
        if (!reveals.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal--visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    // --- Counter Animation ---
    function initCounters() {
        const statNumbers = $$('.stat__number');
        if (!statNumbers.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => observer.observe(el));
    }

    function animateCounter(el) {
        const target = parseInt(el.dataset.count, 10);
        const decimal = el.dataset.decimal ? parseInt(el.dataset.decimal, 10) : 0;
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = eased * target;

            if (decimal) {
                el.textContent = current.toFixed(decimal);
            } else {
                el.textContent = Math.floor(current);
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (decimal) {
                    el.textContent = target.toFixed(decimal);
                } else {
                    el.textContent = target;
                }
            }
        }

        requestAnimationFrame(update);
    }

    // --- Contact Form ---
    const contactForm = $('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simple validation
            const inputs = $$('input[required], textarea[required], select[required]', contactForm);
            let valid = true;
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.style.borderBottomColor = 'rgba(220, 80, 60, 0.5)';
                    setTimeout(() => {
                        input.style.borderBottomColor = '';
                    }, 2000);
                }
            });

            if (!valid) return;

            const btn = contactForm.querySelector('.btn');
            const originalText = btn.querySelector('span').textContent;
            const originalHTML = btn.innerHTML;

            contactForm.classList.add('contact__form--success');
            btn.querySelector('span').textContent = 'Message Sent ✓';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                contactForm.classList.remove('contact__form--success');
                btn.innerHTML = originalHTML;
                btn.style.pointerEvents = '';
                contactForm.reset();
            }, 3000);
        });
    }

    // --- Parallax Subtle Hero ---
    const hero = $('#hero');
    if (hero) {
        const heroContent = hero.querySelector('.hero__content');
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    if (scrollY < window.innerHeight) {
                        const offset = scrollY * 0.3;
                        const opacity = 1 - (scrollY / (window.innerHeight * 0.8));
                        if (heroContent) {
                            heroContent.style.transform = `translateY(${offset}px)`;
                            heroContent.style.opacity = Math.max(0, opacity);
                        }
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // --- Hero Title Reveal Animation ---
    function initHeroTitleAnimation() {
        const lines = $$('.hero__title-line span');
        if (!lines.length) return;

        setTimeout(() => {
            lines.forEach((line, i) => {
                line.style.opacity = '0';
                line.style.transform = 'translateY(100%)';
                line.style.transition = `all 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12 + 0.3}s`;

                requestAnimationFrame(() => {
                    line.style.opacity = '1';
                    line.style.transform = 'translateY(0)';
                });
            });
        }, 1800);
    }

    // --- Horizontal Scroll Line Animation ---
    function initHorizontalLine() {
        const line = $('.hero__line-accent');
        if (!line) return;

        setTimeout(() => {
            line.style.width = '0';
            line.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 2s';
            requestAnimationFrame(() => {
                line.style.width = '40px';
            });
        }, 0);
    }

    // --- Magnetic Button Effect ---
    function initMagneticButtons() {
        if (window.matchMedia('(max-width: 768px)').matches) return;

        $$('.btn--primary').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(() => btn.style.transition = '', 400);
            });
        });
    }

    // --- Active Navigation Highlight ---
    function initActiveNavHighlight() {
        const sections = $$('section[id]');
        const navLinks = $$('.nav__link');
        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        if (link.getAttribute('href') === `#${id}`) {
                            link.style.color = 'var(--color-light)';
                        } else {
                            link.style.color = '';
                        }
                    });
                }
            });
        }, { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' });

        sections.forEach(section => observer.observe(section));
    }

    // --- Smooth Reveal for Project Card Content ---
    function initProjectCardReveals() {
        $$('.project-card').forEach(card => {
            const content = card.querySelector('.project-card__content');
            if (!content) return;

            card.addEventListener('mouseenter', () => {
                content.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            });
        });
    }

    // --- Service Card Tilt Effect ---
    function initTiltEffect() {
        if (window.matchMedia('(max-width: 768px)').matches) return;

        $$('.service-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -3;
                const rotateY = ((x - centerX) / centerX) * 3;

                card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(() => {
                    card.style.transition = '';
                }, 500);
            });
        });
    }

    // --- Stats Background Text Parallax ---
    function initBgTextParallax() {
        const bgText = $('.stats__bg-text');
        if (!bgText) return;

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const rect = bgText.parentElement.getBoundingClientRect();
                    const progress = -rect.top / window.innerHeight;
                    bgText.style.transform = `translate(-50%, calc(-50% + ${progress * 60}px))`;
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // --- Initialize Everything ---
    function init() {
        document.body.style.overflow = 'hidden';
        initRevealAnimations();
        initCounters();
        initHeroTitleAnimation();
        initHorizontalLine();
        initTiltEffect();
        initBgTextParallax();
        initMagneticButtons();
        initActiveNavHighlight();
        initProjectCardReveals();
    }

    // DOM Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
