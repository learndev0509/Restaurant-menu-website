/* =====================================================================
   SMOKE & SAFFRON — shared behaviour
   ===================================================================== */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();

  /* ---------- nav: scrolled state + mobile drawer ---------- */
  var nav = document.getElementById("nav");
  function onScroll(){ if(nav) nav.classList.toggle("scrolled", window.scrollY > 20); }
  onScroll(); window.addEventListener("scroll", onScroll, {passive:true});

  var burger = document.querySelector(".nav-burger");
  var drawer = document.getElementById("drawer");
  function toggleDrawer(open){
    if(!drawer||!nav) return;
    var willOpen = open===undefined ? !drawer.classList.contains("open") : open;
    drawer.classList.toggle("open", willOpen);
    nav.classList.toggle("open", willOpen);
    document.body.style.overflow = willOpen ? "hidden" : "";
  }
  if(burger) burger.addEventListener("click", function(){ toggleDrawer(); });
  if(drawer) drawer.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ toggleDrawer(false); }); });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ toggleDrawer(false); closeLightbox(); } });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if(reduce){ reveals.forEach(function(el){ el.classList.add("in"); }); }
  else{
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
    }, {threshold:0.12, rootMargin:"0px 0px -8% 0px"});
    reveals.forEach(function(el){ io.observe(el); });
  }

  /* ---------- count-up stats ---------- */
  function countUp(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dec = (target % 1 !== 0) ? 1 : 0;
    if(reduce){ el.textContent = target.toFixed(dec)+suffix; return; }
    var start = null, dur = 1600;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      el.textContent = (target*eased).toFixed(dec)+suffix;
      if(p<1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec)+suffix;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if(counters.length){
    var cio = new IntersectionObserver(function(es){
      es.forEach(function(en){ if(en.isIntersecting){ countUp(en.target); cio.unobserve(en.target); } });
    }, {threshold:0.6});
    counters.forEach(function(el){ cio.observe(el); });
  }

  /* ---------- marquee: duplicate track for seamless loop ---------- */
  var mt = document.querySelector(".marquee-track");
  if(mt && !reduce){ mt.innerHTML += mt.innerHTML; }

  /* ---------- live open / closed (11:00-15:00 & 19:00-23:59 daily) ---------- */
  function fmt(h){ var ap=h>=12?"PM":"AM"; var hh=h%12; if(hh===0)hh=12; return hh+" "+ap; }
  function statusNow(){
    var now=new Date(), m=now.getHours()*60+now.getMinutes();
    var w=[[660,900],[1140,1439]], open=false, closeAt=null, openAt=null;
    for(var i=0;i<w.length;i++){ if(m>=w[i][0]&&m<=w[i][1]){ open=true; closeAt=w[i][1]; break; } }
    if(!open){ for(var j=0;j<w.length;j++){ if(m<w[j][0]){ openAt=w[j][0]; break; } } if(openAt===null) openAt=w[0][0]; }
    var det = open ? (closeAt>=1439 ? "· till midnight" : "· till "+fmt(Math.floor(closeAt/60))) : "· opens "+fmt(Math.floor(openAt/60));
    return {open:open, label: open?"Open now":"Closed", det:det};
  }
  function paintStatus(){
    var s=statusNow();
    document.querySelectorAll(".status").forEach(function(el){
      el.classList.toggle("open", s.open); el.classList.toggle("closed", !s.open);
      var lab=el.querySelector(".lab"), det=el.querySelector(".det");
      if(lab) lab.textContent=s.label; if(det) det.textContent=s.det;
    });
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- gallery filter ---------- */
  var gfilter = document.querySelector(".gfilter");
  if(gfilter){
    gfilter.addEventListener("click", function(e){
      var b=e.target.closest("button"); if(!b) return;
      gfilter.querySelectorAll("button").forEach(function(x){ x.classList.remove("active"); });
      b.classList.add("active");
      var f=b.getAttribute("data-filter");
      document.querySelectorAll(".gcell").forEach(function(c){
        var show = f==="all" || c.getAttribute("data-cat")===f;
        c.classList.toggle("hide", !show);
      });
    });
  }

  /* ---------- lightbox ---------- */
  var lb=document.getElementById("lb"), lbImg=document.getElementById("lb-img");
  document.querySelectorAll(".gcell").forEach(function(c){
    c.addEventListener("click", function(){
      var img=c.querySelector("img"); if(!img||!lb||!lbImg) return;
      lbImg.src = img.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt || "";
      lb.classList.add("open"); document.body.style.overflow="hidden";
    });
  });
  function closeLightbox(){ if(lb){ lb.classList.remove("open"); document.body.style.overflow=""; } }
  if(lb){ lb.addEventListener("click", function(e){ if(e.target===lb || e.target.closest(".lb-close")) closeLightbox(); }); }

  /* ---------- contact form -> WhatsApp ---------- */
  var form = document.getElementById("contact-form");
  if(form){
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var g=function(n){ var el=form.querySelector('[name="'+n+'"]'); return el?el.value.trim():""; };
      var msg = "Hi Smoke & Saffron! \n"+
        "Name: "+(g("name")||"-")+"\n"+
        "Phone: "+(g("phone")||"-")+"\n"+
        "Regarding: "+(g("topic")||"-")+"\n"+
        "Message: "+(g("message")||"-");
      window.open("https://wa.me/919000000000?text="+encodeURIComponent(msg), "_blank", "noopener");
    });
  }

  /* ---------- ember particles (hero) ---------- */
  var canvas = document.getElementById("embers");
  if(canvas && !reduce){
    var ctx = canvas.getContext("2d"), W, H, parts=[], raf;
    var host = canvas.parentElement;
    function size(){ W=canvas.width=host.offsetWidth; H=canvas.height=host.offsetHeight; }
    function spawn(){
      return { x:Math.random()*W, y:H+Math.random()*40, r:Math.random()*1.8+0.5,
        vy:-(Math.random()*0.6+0.25), vx:(Math.random()-0.5)*0.3,
        life:0, max:Math.random()*260+160, hue:Math.random()<0.35?18:38 };
    }
    function init(){ size(); parts=[]; var n=Math.min(70, Math.floor(W/16)); for(var i=0;i<n;i++){ var p=spawn(); p.y=Math.random()*H; parts.push(p); } }
    function tick(){
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<parts.length;i++){
        var p=parts[i]; p.life++; p.y+=p.vy; p.x+=p.vx; p.vx+=(Math.random()-0.5)*0.02;
        var t=p.life/p.max, alpha=Math.sin(Math.PI*Math.min(t,1))*0.85;
        ctx.beginPath();
        var g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
        g.addColorStop(0,"hsla("+p.hue+",95%,62%,"+alpha+")");
        g.addColorStop(1,"hsla("+p.hue+",95%,55%,0)");
        ctx.fillStyle=g; ctx.arc(p.x,p.y,p.r*3,0,6.283); ctx.fill();
        if(p.life>=p.max || p.y< -10){ parts[i]=spawn(); }
      }
      raf=requestAnimationFrame(tick);
    }
    init(); tick();
    var rt; window.addEventListener("resize", function(){ clearTimeout(rt); rt=setTimeout(init,200); });
    document.addEventListener("visibilitychange", function(){
      if(document.hidden){ cancelAnimationFrame(raf); } else { tick(); }
    });
  }
})();
