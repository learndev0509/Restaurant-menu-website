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
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        // Skip if user clicked a tab (let the click handler manage active state)
        if (isScrollingFromClick) {
            return;
        }
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                categoryTabs.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.getAttribute('href') === '#' + sectionId) {
                        tab.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    menuSections.forEach(section => {
        observer.observe(section);
    });

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
