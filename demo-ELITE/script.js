/* ============================================================
   THE WHITE ROOT — Shared JS for all pages
   ============================================================ */
(function(){
    'use strict';

    // -------- Nav scroll state + back-to-top
    const nav = document.getElementById('nav');
    const backTop = document.getElementById('backTop');
    const isInnerPage = nav && nav.classList.contains('always-solid');

    const onScroll = () => {
        if(nav && !isInnerPage){
            if(window.scrollY > 60) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        }
        if(backTop){
            if(window.scrollY > 600) backTop.classList.add('visible');
            else backTop.classList.remove('visible');
        }
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();

    // -------- Mobile drawer
    const burger = document.querySelector('.nav-burger');
    const drawer = document.querySelector('.nav-drawer');
    if(burger && drawer){
        burger.addEventListener('click', () => drawer.classList.toggle('open'));
        drawer.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => drawer.classList.remove('open'));
        });
    }

    // -------- Back to top click
    if(backTop){
        backTop.addEventListener('click', () => {
            window.scrollTo({top:0, behavior:'smooth'});
        });
    }

    // -------- Reveal-on-scroll
    const reveals = document.querySelectorAll('.reveal, .reveal-scale, .reveal-left, .reveal-right');
    if('IntersectionObserver' in window){
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, {threshold:.1, rootMargin:'0px 0px -50px 0px'});
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('is-visible'));
    }

    // -------- Smooth scroll for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e){
            const href = this.getAttribute('href');
            if(href.length < 2) return;
            const target = document.querySelector(href);
            if(!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 60;
            window.scrollTo({top, behavior:'smooth'});
        });
    });

    // -------- Gallery filter + lightbox (gallery.html only)
    const galleryFilters = document.querySelectorAll('.gallery-filter');
    const galleryTiles = document.querySelectorAll('.gallery-tile');
    if(galleryFilters.length){
        galleryFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                galleryFilters.forEach(b => b.classList.toggle('active', b === btn));
                galleryTiles.forEach(tile => {
                    const tags = tile.dataset.tags || '';
                    if(filter === 'all' || tags.split(' ').includes(filter)){
                        tile.classList.remove('hidden');
                    } else {
                        tile.classList.add('hidden');
                    }
                });
            });
        });
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    if(lightbox && lightboxImg){
        galleryTiles.forEach(tile => {
            tile.addEventListener('click', () => {
                const img = tile.querySelector('img');
                if(!img) return;
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt || '';
                lightbox.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });
        const close = () => {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        };
        lightboxClose && lightboxClose.addEventListener('click', close);
        lightbox.addEventListener('click', (e) => {
            if(e.target === lightbox) close();
        });
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape' && lightbox.classList.contains('open')) close();
        });
    }

    // -------- Contact form → WhatsApp (contact.html only)
    const contactForm = document.getElementById('contactForm');
    if(contactForm){
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(contactForm);
            const name = data.get('name') || '';
            const phone = data.get('phone') || '';
            const subject = data.get('subject') || 'General enquiry';
            const message = data.get('message') || '';

            const text = `Hi! I'd like to get in touch with The White Root.

*Name:* ${name}
*Phone:* ${phone}
*Subject:* ${subject}

${message}`;

            const url = 'https://wa.me/919879866689?text=' + encodeURIComponent(text);
            window.open(url, '_blank');
        });
    }
})();
