document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
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

                // Close mobile menu if open
                if (navbar.classList.contains('active')) {
                    toggleNav();
                }
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        observer.observe(section);
    });

    // Add visible class to sections
    document.addEventListener('scroll', () => {
        document.querySelectorAll('.section').forEach(section => {
            if (isElementInViewport(section)) {
                section.classList.add('visible');
            }
        });
    });

    // Helper function to check if element is in viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= window.innerHeight * 0.5 &&
            rect.bottom >= window.innerHeight * 0.2
        );
    }

    // Add CSS class for visible sections
    const style = document.createElement('style');
    style.textContent = `
        .section {
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .section.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    let dnaInitialized = false;
    let lastState = null;

    function showDNAAnimation() {
        const neuralNetwork = document.getElementById('neuralNetwork');
        const dnaAnimation = document.getElementById('dnaAnimation');
        if (lastState === 'dna') return;
        neuralNetwork.style.opacity = 0;
        setTimeout(() => { neuralNetwork.style.display = 'none'; }, 800);
        dnaAnimation.style.display = 'block';
        setTimeout(() => { dnaAnimation.style.opacity = 1; }, 10);
        if (!dnaInitialized) {
            if (window.initDNAAnimation) window.initDNAAnimation();
            dnaInitialized = true;
        }
        lastState = 'dna';
    }

    function showNeuralNetwork() {
        const neuralNetwork = document.getElementById('neuralNetwork');
        const dnaAnimation = document.getElementById('dnaAnimation');
        if (lastState === 'neural') return;
        neuralNetwork.style.display = 'block';
        setTimeout(() => { neuralNetwork.style.opacity = 1; }, 10);
        dnaAnimation.style.opacity = 0;
        setTimeout(() => { dnaAnimation.style.display = 'none'; }, 800);
        lastState = 'neural';
    }

    window.addEventListener('scroll', () => {
        const publicationsSection = document.getElementById('publications');
        if (isElementInViewport(publicationsSection)) {
            showDNAAnimation();
        } else {
            showNeuralNetwork();
        }
    });

    // Preloader
    const preloader = document.querySelector('[data-preloader]');
    const preloaderCircle = document.querySelector('.preloader-circle');
    const preloaderText = document.querySelector('.preloader-text');

    let lastScrollY = window.scrollY;

    const toggleNav = () => {
        navbar.classList.toggle('active');
        navToggleBtn.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('nav-active');
    };

    navToggleBtn.addEventListener('click', toggleNav);
    overlay.addEventListener('click', toggleNav);

    // Sticky Header
    const headerSticky = () => {
        if (window.scrollY > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }

        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            header.classList.add('hide');
        } else {
            header.classList.remove('hide');
        }

        lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', headerSticky);

    // Mobile Navigation
    const navTogglers = document.querySelectorAll("[data-nav-toggler]");
    const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");
    const navbar = document.querySelector("[data-navbar]");
    const overlay = document.querySelector("[data-overlay]");

    // Neural Network Animation
    const neuralNetwork = document.getElementById('neuralNetwork');
    let isNeuralNetworkVisible = true;

    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const publicationsSection = document.getElementById('publications');
        
        if (publicationsSection) {
            const publicationsOffset = publicationsSection.offsetTop;
            const windowHeight = window.innerHeight;
            
            if (scrollPosition > publicationsOffset - windowHeight * 0.5) {
                if (isNeuralNetworkVisible) {
                    neuralNetwork.style.opacity = '0';
                    setTimeout(() => {
                        neuralNetwork.style.display = 'none';
                        document.getElementById('dnaAnimation').style.display = 'block';
                        setTimeout(() => {
                            document.getElementById('dnaAnimation').style.opacity = '1';
                        }, 50);
                    }, 800);
                    isNeuralNetworkVisible = false;
                }
            } else {
                if (!isNeuralNetworkVisible) {
                    document.getElementById('dnaAnimation').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('dnaAnimation').style.display = 'none';
                        neuralNetwork.style.display = 'block';
                        setTimeout(() => {
                            neuralNetwork.style.opacity = '1';
                        }, 50);
                    }, 800);
                    isNeuralNetworkVisible = true;
                }
            }
        }
    };

    window.addEventListener('scroll', handleScroll);

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Add animation classes to elements
        document.querySelectorAll('.hero-title, .hero-subtitle, .hero-location, .hero-description').forEach(element => {
            element.classList.add('animate-on-scroll');
        });

        // Initialize neural network animation
        if (typeof initNeuralNetwork === 'function') {
            initNeuralNetwork();
        }
    });
}); 