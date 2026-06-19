document.addEventListener('DOMContentLoaded', function() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const menuSections = document.querySelectorAll('.menu-section');
    const menuCards = document.querySelectorAll('.menu-card');
    const ingredientsBtns = document.querySelectorAll('.ingredients-btn');
    const header = document.querySelector('.header');
    const categoryNav = document.querySelector('.category-nav');

    // Keep fixed header/nav heights synced with CSS variables
    function updateStickyHeights() {
        if (header) {
            document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
        }
        if (categoryNav) {
            document.documentElement.style.setProperty('--nav-height', categoryNav.offsetHeight + 'px');
        }
    }
    updateStickyHeights();
    window.addEventListener('resize', updateStickyHeights);

    // Track if user clicked a tab (to temporarily disable observer)
    let isScrollingFromClick = false;
    let scrollTimeout = null;

    // Smooth scroll to section when clicking category tab
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                isScrollingFromClick = true;
                clearTimeout(scrollTimeout);

                const offset = (header ? header.offsetHeight : 0) + (categoryNav ? categoryNav.offsetHeight : 0) + 8;
                const targetY = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({
                    top: Math.max(0, targetY),
                    behavior: 'smooth'
                });
                
                // Update active tab immediately
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Re-enable observer after scroll completes
                scrollTimeout = setTimeout(() => {
                    isScrollingFromClick = false;
                }, 900);
            }
        });
    });

    // Intersection Observer for active category highlighting
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40% 0px',
        threshold: 0
    };

    let pendingSectionId = null;
    let observerDebounceTimer = null;
    const DEBOUNCE_MS = 200;
    const tabsContainer = document.querySelector('.category-tabs');

    function scrollTabIntoView(tab) {
        if (!tabsContainer || !tab) return;
        const tabLeft = tab.offsetLeft;
        const tabWidth = tab.offsetWidth;
        const containerWidth = tabsContainer.offsetWidth;
        const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
        tabsContainer.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }

    function updateActiveTab(sectionId) {
        let activeTab = null;
        categoryTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('href') === '#' + sectionId) {
                tab.classList.add('active');
                activeTab = tab;
            }
        });
        if (activeTab) {
            scrollTabIntoView(activeTab);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        if (isScrollingFromClick) return;
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                pendingSectionId = entry.target.id;
                
                if (observerDebounceTimer) clearTimeout(observerDebounceTimer);
                observerDebounceTimer = setTimeout(() => {
                    if (pendingSectionId) {
                        updateActiveTab(pendingSectionId);
                        pendingSectionId = null;
                    }
                    observerDebounceTimer = null;
                }, DEBOUNCE_MS);
            }
        });
    }, observerOptions);

    menuSections.forEach(section => observer.observe(section));

    // Reveal animation for menu cards
    menuCards.forEach((card, index) => {
        card.classList.add('reveal-ready');
        card.style.setProperty('--stagger-index', (index % 4).toString());

        // Build flip UI: image on front, ingredients on back
        const imageContainer = card.querySelector('.card-image');
        const ingredientsPanel = card.querySelector('.ingredients-panel');
        if (!imageContainer || !ingredientsPanel) return;

        const flip = document.createElement('div');
        flip.className = 'card-media-flip';

        const front = document.createElement('div');
        front.className = 'card-media-face card-media-front';
        while (imageContainer.firstChild) {
            front.appendChild(imageContainer.firstChild);
        }

        const back = document.createElement('div');
        back.className = 'card-media-face card-media-back';
        back.innerHTML = ingredientsPanel.innerHTML;

        flip.appendChild(front);
        flip.appendChild(back);
        imageContainer.appendChild(flip);
        card.classList.add('flip-mode');
    });

    const cardObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12
    });

    menuCards.forEach(card => cardObserver.observe(card));

    // Flip card image area to ingredients and back
    ingredientsBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const card = this.closest('.menu-card');
            if (!card) return;

            const isFlipped = card.classList.toggle('flipped');
            this.classList.toggle('active');
            this.setAttribute('aria-pressed', isFlipped ? 'true' : 'false');
        });
    });
});
