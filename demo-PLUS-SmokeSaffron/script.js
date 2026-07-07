/* Smoke & Saffron — PLUS tier */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  document.addEventListener('DOMContentLoaded', function () {
    const cards    = [...document.querySelectorAll('.card')];
    const sections = [...document.querySelectorAll('.section')];
    const tabs     = [...document.querySelectorAll('.tab')];
    const tabsWrap = document.querySelector('.tabs');
    const searchBtn= document.querySelector('.search-btn');
    const searchWrap=document.querySelector('.search-wrap');
    const search   = document.querySelector('.search');
    const searchClear=document.querySelector('.search-clear');
    const vegOnly  = document.getElementById('vegOnly');
    const header   = document.querySelector('.header');
    const catnav   = document.querySelector('.catnav');
    const menu     = document.querySelector('.menu');

    /* search index (name + description) */
    cards.forEach(c => {
      const name=c.querySelector('h3')?.textContent||'';
      const desc=c.querySelector('.desc')?.textContent||'';
      c.dataset.search=(name+' '+desc).toLowerCase();
    });

    /* image fallback */
    const FB='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#f0e6da"/><text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="#b9a68f" text-anchor="middle" dominant-baseline="middle">Smoke &amp; Saffron</text></svg>');
    document.querySelectorAll('.card-img img').forEach(img=>img.addEventListener('error',function h(){img.removeEventListener('error',h);img.src=FB;}));

    /* filters */
    function apply(){
      const q=(search.value||'').trim().toLowerCase();
      const veg=vegOnly.checked;
      cards.forEach(c=>{
        const mQ=!q||c.dataset.search.includes(q);
        const mV=!veg||c.dataset.diet==='veg';
        c.classList.toggle('hidden',!(mQ&&mV));
      });
      sections.forEach(s=>s.classList.toggle('empty',s.querySelectorAll('.card:not(.hidden)').length===0));
      const any=cards.some(c=>!c.classList.contains('hidden'));
      let nr=document.querySelector('.no-results');
      if(!any){ if(!nr){nr=document.createElement('p');nr.className='no-results';nr.textContent='No dishes match. Try another word or turn off "Veg only".';menu.prepend(nr);} }
      else if(nr) nr.remove();
    }
    search.addEventListener('input',apply);
    vegOnly.addEventListener('change',apply);

    /* search toggle */
    searchBtn.addEventListener('click',()=>{
      const open=!searchWrap.classList.contains('open');
      searchWrap.classList.toggle('open',open);
      searchBtn.setAttribute('aria-expanded',open?'true':'false');
      if(open) setTimeout(()=>search.focus(),100); else {search.value='';apply();}
    });
    searchClear.addEventListener('click',()=>{search.value='';apply();searchWrap.classList.remove('open');});

    /* category scroll + scroll-spy */
    function offset(){return (header?.offsetHeight||0)+(catnav?.offsetHeight||0)+8;}
    let lock=false,t;
    tabs.forEach(tab=>tab.addEventListener('click',function(e){
      e.preventDefault();
      const sec=document.getElementById(this.getAttribute('href').slice(1)); if(!sec)return;
      lock=true;clearTimeout(t);
      tabs.forEach(x=>x.classList.remove('active'));this.classList.add('active');
      window.scrollTo({top:Math.max(0,sec.getBoundingClientRect().top+scrollY-offset()),behavior:'smooth'});
      t=setTimeout(()=>lock=false,700);
    }));
    let raf;
    function spy(){
      if(lock||raf)return;
      raf=requestAnimationFrame(()=>{raf=null;
        const probe=offset()+6;let id=null;
        sections.forEach(s=>{if(s.classList.contains('empty'))return;const r=s.getBoundingClientRect();if(r.top<=probe&&r.bottom>probe)id=s.id;});
        if(id){const cur=document.querySelector('.tab.active');if(!cur||cur.getAttribute('href')!=='#'+id){tabs.forEach(x=>x.classList.remove('active'));const a=tabs.find(x=>x.getAttribute('href')==='#'+id);if(a){a.classList.add('active');const l=a.offsetLeft-tabsWrap.offsetWidth/2+a.offsetWidth/2;tabsWrap.scrollTo({left:Math.max(0,l),behavior:'smooth'});}}}
      });
    }
    window.addEventListener('scroll',spy,{passive:true});spy();
  });
})();
