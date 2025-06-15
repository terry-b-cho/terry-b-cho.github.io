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

// --- Preloader Dismissal (robust, always works) ---
function hidePreloader() {
  var preloader = document.querySelector('.preloader');
  if (preloader) {
    preloader.classList.add('loaded');
    setTimeout(function() { preloader.style.display = 'none'; }, 600);
  }
}

// Use Promise.race to wait for either DOMContentLoaded or window.load, with a fallback timeout
Promise.race([
  new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      document.addEventListener('DOMContentLoaded', resolve);
      window.addEventListener('load', resolve);
    }
  }),
  new Promise(resolve => setTimeout(resolve, 3000))
]).then(hidePreloader);

// Navigation
const initNavigation = () => {
    const closeNav = () => {
        elements.overlay.classList.remove('active');
        elements.navbar.classList.remove('active');
        elements.navToggleBtn.classList.remove('active');
        document.body.classList.remove('nav-active');
        elements.navToggleBtn.setAttribute('aria-expanded', false);
        elements.navbar.setAttribute('aria-hidden', true);
        elements.overlay.style.pointerEvents = 'none';
        releaseFocusTrap();
        setTimeout(() => { elements.overlay.style.pointerEvents = ''; }, 400);
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
    // Prevent overlay click from propagating to navbar
    elements.navbar.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    // Close on link click (mobile) and smooth scroll
    document.querySelectorAll('.navbar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    closeNav();
                    requestAnimationFrame(() => {
                        const headerOffset = document.querySelector('.header').offsetHeight || 0;
                        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                        const offsetPosition = elementPosition - headerOffset;
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    });
                }
            } else {
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
    // Home logo scroll-to-top
    const homeLogo = document.querySelector('.nav-brand.home-logo-link');
    if (homeLogo) {
        homeLogo.addEventListener('click', function(e) {
            e.preventDefault();
            // Close nav if open (mobile)
            if (elements.navbar.classList.contains('active')) {
                elements.navbar.classList.remove('active');
                elements.navToggleBtn.classList.remove('active');
                elements.overlay.classList.remove('active');
                document.body.classList.remove('nav-active');
            }
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
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
        if (window.initDNAAnimation && window.initDNAAnimation !== initDNAAnimation) {
            window.initDNAAnimation();
        }
        dnaAnimationInitialized = true;
    }
}

// Initialize both animations on page load
document.addEventListener('DOMContentLoaded', () => {
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
function updateTransition() {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;
    const aboutRect = aboutSection.getBoundingClientRect();
    const aboutTop = aboutRect.top;
    const aboutBottom = aboutRect.bottom;
    const viewportHeight = window.innerHeight;
    let targetProgress;
    if (aboutTop > viewportHeight) {
        targetProgress = 0;
    } else if (aboutBottom < 0) {
        targetProgress = 1;
    } else {
        const totalDistance = aboutRect.height + viewportHeight;
        const scrolledDistance = viewportHeight - aboutTop;
        targetProgress = Math.min(1, Math.max(0, scrolledDistance / totalDistance));
    }
    const easeProgress = easeInOutCubic(targetProgress);
    neuralNetwork.style.opacity = 1 - easeProgress;
    neuralNetwork.style.filter = `blur(${easeProgress * 10}px)`;
    dnaAnimation.style.opacity = easeProgress;
    dnaAnimation.style.filter = `blur(${(1 - easeProgress) * 10}px)`;
}
window.addEventListener('scroll', updateTransition);
window.addEventListener('resize', updateTransition);
updateTransition();

// Easing function for smooth transitions
function easeInOutCubic(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

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

// --- Seamless Logo Carousel Duplication & Dynamic Animation Duration ---
(function() {
    const SPEED_PX_PER_SEC = 80; // Apple-level smoothness
    let lastSlideWidth = 0;
    let lastDuration = 0;
    let observer = null;

    function setupCarousel() {
        const carousel = document.querySelector('.logo-carousel');
        const slide = document.querySelector('.logo-slide');
        if (!carousel || !slide) return;

        // 1. Duplicate logos until slide is at least 2x carousel width
        const minWidth = carousel.offsetWidth * 2;
        let currentWidth = slide.scrollWidth;
        const logos = Array.from(slide.children);
        // Remove all clones (keep only the first set)
        while (slide.children.length > logos.length) {
            slide.removeChild(slide.lastChild);
        }
        // Duplicate as needed
        while (slide.scrollWidth < minWidth) {
            logos.forEach(logo => {
                slide.appendChild(logo.cloneNode(true));
            });
        }
        // 2. Set animation duration based on slide width
        const slideWidth = slide.scrollWidth / 2; // Only animate one set
        if (slideWidth !== lastSlideWidth) {
            lastSlideWidth = slideWidth;
            const duration = slideWidth / SPEED_PX_PER_SEC;
            lastDuration = duration;
            slide.style.animationDuration = duration + 's';
        }
    }

    // 3. Pause/resume animation on page visibility
    function handleVisibility() {
        const slide = document.querySelector('.logo-slide');
        if (!slide) return;
        if (document.hidden) {
            slide.style.animationPlayState = 'paused';
        } else {
            slide.style.animationPlayState = 'running';
        }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    // 4. Update on resize
    window.addEventListener('resize', setupCarousel);
    document.addEventListener('DOMContentLoaded', () => {
        setupCarousel();
        handleVisibility();
    });

    // 5. MutationObserver for dynamic logo changes (robustness)
    if (observer) observer.disconnect();
    observer = new MutationObserver(setupCarousel);
    document.addEventListener('DOMContentLoaded', () => {
        const slide = document.querySelector('.logo-slide');
        if (slide) observer.observe(slide, { childList: true });
    });
})();

// --- Hero Headshot 3D Flip Animation ---
(function() {
    
  const flipContainer = document.querySelector('.headshot-flip-container');
  if (!flipContainer) return;
  let isFlipping = false;
  let flipTimeout = null;

  function triggerFlip() {
    if (isFlipping) return;
    isFlipping = true;
    flipContainer.classList.add('flipped');
    flipTimeout = setTimeout(() => {
      flipContainer.classList.remove('flipped');
      isFlipping = false;
    }, 3500);
  }

  flipContainer.addEventListener('click', triggerFlip);
  flipContainer.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFlip();
    }
  });
})(); 