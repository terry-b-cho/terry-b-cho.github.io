// DOM Elements
const elements = {
    preloader: document.querySelector('[data-preloader]'),
    preloaderCircle: document.querySelector('.preloader-circle'),
    preloaderText: document.querySelector('.preloader-text'),
    header: document.querySelector('[data-header]'),
    navToggleBtn: document.querySelector('[data-nav-toggle-btn]'),
    navbar: document.querySelector('[data-navbar]'),
    overlay: document.querySelector('[data-overlay]'),
    neuralNetwork: document.getElementById('neuralNetwork')
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initNavigation();
    initSmoothScroll();
    initNeuralNetworkTransition();

    // Add animation classes to elements
    document.querySelectorAll('.hero-title, .hero-subtitle, .hero-location, .hero-description').forEach(element => {
        element.classList.add('animate-on-scroll');
    });

    // Initialize neural network animation
    if (typeof initNeuralNetwork === 'function') {
        initNeuralNetwork();
    }
}); 