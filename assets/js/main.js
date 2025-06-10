document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
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

    window.addEventListener('scroll', () => {
        const publicationsSection = document.getElementById('publications');
        const neuralNetwork = document.getElementById('neuralNetwork');
        const dnaAnimation = document.getElementById('dnaAnimation');

        if (isElementInViewport(publicationsSection)) {
            neuralNetwork.style.opacity = 0;
            setTimeout(() => { neuralNetwork.style.display = 'none'; }, 800);
            dnaAnimation.style.display = 'block';
            setTimeout(() => { dnaAnimation.style.opacity = 1; }, 10);
            if (!dnaInitialized) {
                if (window.initDNAAnimation) window.initDNAAnimation();
                dnaInitialized = true;
            }
        } else {
            neuralNetwork.style.display = 'block';
            setTimeout(() => { neuralNetwork.style.opacity = 1; }, 10);
            dnaAnimation.style.opacity = 0;
            setTimeout(() => { dnaAnimation.style.display = 'none'; }, 800);
        }
    });
}); 