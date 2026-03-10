document.addEventListener('DOMContentLoaded', function() {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const menuSections = document.querySelectorAll('.menu-section');
    const ingredientsBtns = document.querySelectorAll('.ingredients-btn');
    const header = document.querySelector('.header');

    // Dynamically set header height CSS variable based on actual height
    function updateHeaderHeight() {
        if (header) {
            const actualHeight = header.offsetHeight;
            document.documentElement.style.setProperty('--header-height', actualHeight + 'px');
        }
    }
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

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
                
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Update active tab immediately
                categoryTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Re-enable observer after scroll completes
                scrollTimeout = setTimeout(() => {
                    isScrollingFromClick = false;
                }, 1000);
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

    // Toggle ingredients panel (allows multiple panels open for comparison)
    ingredientsBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const card = this.closest('.menu-card');
            const panel = card.querySelector('.ingredients-panel');
            
            // Toggle current panel (no longer closes other panels)
            panel.classList.toggle('show');
            this.classList.toggle('active');
        });
    });
});
