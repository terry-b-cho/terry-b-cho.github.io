// DOM Elements
const elements = {
    preloader: document.querySelector('[data-preloader]'),
    preloaderCircle: document.querySelector('.preloader-circle'),
    preloaderText: document.querySelector('.preloader-text'),
    header: document.querySelector('[data-header]'),
    navToggleBtn: document.querySelector('[data-nav-toggle-btn]'),
    navbar: document.querySelector('[data-navbar]'),
    overlay: document.querySelector('[data-overlay]'),
    neuralNetwork: document.getElementById('neuralNetwork'),
    scrollIndicator: document.querySelector('[data-scroll-indicator]')
};

let lastScrollY = window.scrollY;
let isNeuralNetworkVisible = true;

// Preloader
const initPreloader = () => {
    window.addEventListener('load', () => {
        setTimeout(() => {
            elements.preloader.classList.add('loaded');
            document.body.classList.add('loaded');
        }, 1000);
    });
};

// Navigation
const initNavigation = () => {
    const closeNav = () => {
        elements.navbar.classList.remove('active');
        elements.navToggleBtn.classList.remove('active');
        elements.overlay.classList.remove('active');
        document.body.classList.remove('nav-active');
        elements.navToggleBtn.setAttribute('aria-expanded', false);
        elements.navbar.setAttribute('aria-hidden', true);
        releaseFocusTrap();
    };
    const toggleNav = () => {
        const expanded = !elements.navbar.classList.contains('active');
        if (expanded) {
            elements.navbar.classList.add('active');
            elements.navToggleBtn.classList.add('active');
            elements.overlay.classList.add('active');
            document.body.classList.add('nav-active');
        } else {
            closeNav();
        }
        // Accessibility: ARIA
        elements.navToggleBtn.setAttribute('aria-expanded', expanded);
        elements.navbar.setAttribute('aria-hidden', !expanded);
        // Focus trap
        if (expanded) {
            trapFocus(elements.navbar);
        } else {
            releaseFocusTrap();
        }
    };
    elements.navToggleBtn.addEventListener('click', toggleNav);
    elements.overlay.addEventListener('click', closeNav);
    // Close button
    const closeBtn = document.querySelector('[data-nav-close-btn]');
    if (closeBtn) closeBtn.addEventListener('click', closeNav);
    // Close on link click (mobile) and smooth scroll
    document.querySelectorAll('.navbar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    closeNav();
                    setTimeout(() => {
                        const headerOffset = document.querySelector('.header').offsetHeight || 0;
                        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - headerOffset;
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }, 350); // Wait for menu to close
                }
            } else if (window.innerWidth < 768) {
                closeNav();
            }
        });
    });
    // Swipe-to-close gesture (mobile)
    let touchStartX = null;
    elements.navbar.addEventListener('touchstart', e => {
        if (!elements.navbar.classList.contains('active')) return;
        touchStartX = e.touches[0].clientX;
    });
    elements.navbar.addEventListener('touchmove', e => {
        if (touchStartX === null) return;
        const touchEndX = e.touches[0].clientX;
        if (touchStartX - touchEndX > 60) {
            closeNav();
            touchStartX = null;
        }
    });
    elements.navbar.addEventListener('touchend', () => {
        touchStartX = null;
    });
    // Sticky Header
    const headerSticky = () => {
        if (window.scrollY > 100) {
            elements.header.classList.add('sticky');
        } else {
            elements.header.classList.remove('sticky');
        }
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            elements.header.classList.add('hide');
        } else {
            elements.header.classList.remove('hide');
        }
        lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', headerSticky);
};

// Focus Trap for Mobile Nav
let lastFocusedElement = null;
function trapFocus(container) {
    lastFocusedElement = document.activeElement;
    const focusable = container.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    function handleTrap(e) {
        if (e.key === 'Tab') {
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        } else if (e.key === 'Escape') {
            elements.navToggleBtn.click();
        }
    }
    container.addEventListener('keydown', handleTrap);
    container._focusTrapHandler = handleTrap;
}
function releaseFocusTrap() {
    const container = elements.navbar;
    if (container && container._focusTrapHandler) {
        container.removeEventListener('keydown', container._focusTrapHandler);
        delete container._focusTrapHandler;
    }
    if (lastFocusedElement) lastFocusedElement.focus();
}

// Smooth Scroll
const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (elements.navbar.classList.contains('active')) {
                    elements.navbar.classList.remove('active');
                    elements.navToggleBtn.classList.remove('active');
                    elements.overlay.classList.remove('active');
                    document.body.classList.remove('nav-active');
                }
            }
        });
    });
};

// Initialize animations
let neuralNetworkInitialized = false;
let dnaAnimationInitialized = false;

// Initialize neural network animation
function initNeuralNetwork() {
    if (!neuralNetworkInitialized) {
        // Prevent infinite recursion: only call window.initNeuralNetwork if it's not this function
        if (window.initNeuralNetwork && window.initNeuralNetwork !== initNeuralNetwork) {
            window.initNeuralNetwork();
        }
        neuralNetworkInitialized = true;
    }
}

// Initialize DNA animation
function initDNAAnimation() {
    if (!dnaAnimationInitialized) {
        window.initDNAAnimation();
        dnaAnimationInitialized = true;
    }
}

// Initialize both animations on page load
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavigation();
    initSmoothScroll();
    initNeuralNetwork();
    initDNAAnimation();

    // Add animation classes to elements
    document.querySelectorAll('.hero-title, .hero-subtitle, .hero-location, .hero-description').forEach(element => {
        element.classList.add('animate-on-scroll');
    });
});

// Smooth transition between neural network and DNA animations
let scrollDirection = 0;
let transitionProgress = 0;
const transitionSpeed = 0.05;
const neuralNetwork = document.getElementById('neuralNetwork');
const dnaAnimation = document.getElementById('dnaAnimation');

function updateTransition() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    const aboutRect = aboutSection.getBoundingClientRect();
    const aboutTop = aboutRect.top;
    const aboutBottom = aboutRect.bottom;
    const viewportHeight = window.innerHeight;

    // Calculate transition progress based on scroll position
    let targetProgress;
    if (aboutTop > viewportHeight) {
        // Above About section - show neural network
        targetProgress = 0;
    } else if (aboutBottom < 0) {
        // Below About section - show DNA
        targetProgress = 1;
    } else {
        // During transition - calculate progress
        const totalDistance = aboutRect.height + viewportHeight;
        const scrolledDistance = viewportHeight - aboutTop;
        targetProgress = Math.min(1, Math.max(0, scrolledDistance / totalDistance));
    }

    // Smoothly interpolate to target progress
    const progressDiff = targetProgress - transitionProgress;
    if (Math.abs(progressDiff) > 0.001) {
        transitionProgress += progressDiff * transitionSpeed;
    }

    // Apply transitions with easing
    const easeProgress = easeInOutCubic(transitionProgress);
    neuralNetwork.style.opacity = 1 - easeProgress;
    neuralNetwork.style.filter = `blur(${easeProgress * 10}px)`;
    dnaAnimation.style.opacity = easeProgress;
    dnaAnimation.style.filter = `blur(${(1 - easeProgress) * 10}px)`;

    requestAnimationFrame(updateTransition);
}

// Easing function for smooth transitions
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Start transition animation
updateTransition();

// Scroll Indicator
const initScrollIndicator = () => {
    const handleScroll = () => {
        if (window.scrollY > 100) {
            elements.scrollIndicator.classList.add('hidden');
        } else {
            elements.scrollIndicator.classList.remove('hidden');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
};

// Logo Carousel: Clone .logo-slide for seamless infinite scroll
function setupLogoCarousel() {
    const carousel = document.querySelector('.logo-carousel');
    if (!carousel) return;
    const slide = carousel.querySelector('.logo-slide');
    if (!slide) return;
    // Remove any previous clones
    carousel.querySelectorAll('.logo-slide.clone').forEach(clone => clone.remove());
    // Clone the slide for seamless animation
    const clone = slide.cloneNode(true);
    clone.classList.add('clone');
    carousel.appendChild(clone);
}
window.addEventListener('load', setupLogoCarousel);
window.addEventListener('resize', setupLogoCarousel); 