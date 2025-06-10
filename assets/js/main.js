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

// Neural Network Animation
const initNeuralNetworkTransition = () => {
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const publicationsSection = document.getElementById('publications');
        
        if (publicationsSection) {
            const publicationsOffset = publicationsSection.offsetTop;
            const windowHeight = window.innerHeight;
            
            if (scrollPosition > publicationsOffset - windowHeight * 0.5) {
                if (isNeuralNetworkVisible) {
                    elements.neuralNetwork.style.opacity = '0';
                    setTimeout(() => {
                        elements.neuralNetwork.style.display = 'none';
                        const dnaAnimation = document.getElementById('dnaAnimation');
                        dnaAnimation.style.display = 'block';
                        setTimeout(() => {
                            dnaAnimation.style.opacity = '1';
                        }, 50);
                    }, 800);
                    isNeuralNetworkVisible = false;
                }
            } else {
                if (!isNeuralNetworkVisible) {
                    const dnaAnimation = document.getElementById('dnaAnimation');
                    dnaAnimation.style.opacity = '0';
                    setTimeout(() => {
                        dnaAnimation.style.display = 'none';
                        elements.neuralNetwork.style.display = 'block';
                        setTimeout(() => {
                            elements.neuralNetwork.style.opacity = '1';
                        }, 50);
                    }, 800);
                    isNeuralNetworkVisible = true;
                }
            }
        }
    };

    window.addEventListener('scroll', handleScroll);
};

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

// Logo Carousel Responsiveness & Seamless Infinite Scroll
function setupLogoCarousel() {
    const carousel = document.getElementById('logoCarousel');
    if (!carousel) return;
    const track = carousel.querySelector('.logo-track');
    if (!track) return;
    // Remove any previous clones
    carousel.querySelectorAll('.logo-track.clone').forEach(clone => clone.remove());
    // Duplicate the track for seamless scroll
    const clone = track.cloneNode(true);
    clone.classList.add('clone');
    carousel.appendChild(clone);
    // Set width for both tracks
    const totalWidth = Array.from(track.children).reduce((acc, el) => acc + el.offsetWidth, 0) + (track.children.length - 1) * parseInt(getComputedStyle(track).gap || 0);
    track.style.width = totalWidth + 'px';
    clone.style.width = totalWidth + 'px';
}
window.addEventListener('load', setupLogoCarousel);
window.addEventListener('resize', setupLogoCarousel);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavigation();
    initSmoothScroll();
    initNeuralNetworkTransition();
    initScrollIndicator();

    // Add animation classes to elements
    document.querySelectorAll('.hero-title, .hero-subtitle, .hero-location, .hero-description').forEach(element => {
        element.classList.add('animate-on-scroll');
    });

    // Initialize neural network animation
    if (typeof initNeuralNetwork === 'function') {
        initNeuralNetwork();
    }
}); 