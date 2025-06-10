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
    const toggleNav = () => {
        elements.navbar.classList.toggle('active');
        elements.navToggleBtn.classList.toggle('active');
        elements.overlay.classList.toggle('active');
        document.body.classList.toggle('nav-active');
        // Accessibility: ARIA
        const expanded = elements.navbar.classList.contains('active');
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
    elements.overlay.addEventListener('click', toggleNav);

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

// Logo Carousel Responsiveness
function setLogoCarouselWidth() {
    const carousel = document.getElementById('logoCarousel');
    if (!carousel) return;
    const tracks = carousel.querySelectorAll('.logo-track');
    if (tracks.length < 2) return;
    // Set the width of each track to fit its children
    tracks.forEach(track => {
        let totalWidth = 0;
        track.childNodes.forEach(child => {
            if (child.nodeType === 1) {
                totalWidth += child.offsetWidth;
            }
        });
        track.style.width = totalWidth + 'px';
    });
}

window.addEventListener('load', setLogoCarouselWidth);
window.addEventListener('resize', setLogoCarouselWidth);

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