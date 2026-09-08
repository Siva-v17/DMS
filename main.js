/* ============================================================
   STACKLY VAULT — shared interactions
   GSAP + ScrollTrigger (gsap.com/Webflow-style motion patterns)
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);

/* ---------- tiny text splitter (no paid plugin dependency) ---------- */
function splitWords(el){
  const text = el.textContent.trim();
  el.innerHTML = '';
  const words = text.split(/\s+/);
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'split-word';
    span.style.display = 'inline-block';
    span.textContent = w + (i < words.length - 1 ? '\u00A0' : '');
    el.appendChild(span);
  });
  return el.querySelectorAll('.split-word');
}

function splitChars(el){
  const text = el.textContent.trim();
  el.innerHTML = '';
  [...text].forEach(ch => {
    const span = document.createElement('span');
    span.className = 'split-char';
    span.style.display = 'inline-block';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    el.appendChild(span);
  });
  return el.querySelectorAll('.split-char');
}

/* ============================================================
   PRELOADER
   ============================================================ */
function initPreloader(cb){
  const pre = document.getElementById('preloader');
  if (!pre) { cb && cb(); return; }
  const fill = pre.querySelector('.pl-fill');
  const pct = pre.querySelector('.pl-pct');
  const state = { v: 0 };
  gsap.to(state, {
    v: 100, duration: 1.4, ease: 'power2.inOut',
    onUpdate(){
      const val = Math.round(state.v);
      if (fill) fill.style.height = val + '%';
      if (pct) pct.textContent = val + '%';
    },
    onComplete(){
      gsap.to(pre, {
        yPercent: -100, duration: .7, ease: 'power3.inOut', delay:.15,
        onComplete(){ pre.style.display = 'none'; cb && cb(); }
      });
    }
  });
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor(){
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let mx=0,my=0, rx=0, ry=0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; gsap.set(dot,{x:mx,y:my}); });
  gsap.ticker.add(() => {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    gsap.set(ring, { x: rx, y: ry });
  });
  document.querySelectorAll('a, button, .magnetic, input, textarea, select, [data-cursor-lg]').forEach(el=>{
    el.addEventListener('mouseenter', ()=> gsap.to(ring,{width:54,height:54,opacity:.6,duration:.25}));
    el.addEventListener('mouseleave', ()=> gsap.to(ring,{width:34,height:34,opacity:1,duration:.25}));
  });
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
function initMagnetic(){
  document.querySelectorAll('.magnetic').forEach(el=>{
    el.addEventListener('mousemove', e=>{
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width/2;
      const y = e.clientY - r.top - r.height/2;
      gsap.to(el, { x:x*0.28, y:y*0.35, duration:.4, ease:'power2.out' });
    });
    el.addEventListener('mouseleave', ()=> gsap.to(el, { x:0, y:0, duration:.5, ease:'elastic.out(1,0.4)' }));
  });
}

/* ============================================================
   BACKGROUND CANVAS FIELD — drifting document-grid dots
   ============================================================ */
function initGridField(container){
  const canvas = container.querySelector('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, dots = [];
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize(){
    w = container.clientWidth; h = container.clientHeight;
    canvas.width = w * DPR; canvas.height = h * DPR;
    canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    const cols = Math.ceil(w / 46) + 2;
    const rows = Math.ceil(h / 46) + 2;
    dots = [];
    for (let y=0; y<rows; y++){
      for (let x=0; x<cols; x++){
        dots.push({
          x: x*46, y: y*46,
          baseY: y*46,
          phase: Math.random()*Math.PI*2,
          speed: 0.4 + Math.random()*0.6,
          r: Math.random() < 0.06 ? 2.4 : 1.2
        });
      }
    }
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function draw(){
    t += 0.012;
    ctx.clearRect(0,0,w,h);
    dots.forEach(d=>{
      const yy = d.baseY + Math.sin(t*d.speed + d.phase) * 8;
      const alpha = 0.10 + (Math.sin(t*d.speed + d.phase) + 1) * 0.06;
      ctx.beginPath();
      ctx.fillStyle = `rgba(79,70,229,${alpha})`;
      ctx.arc(d.x, yy, d.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ============================================================
   NAV: scroll state + mobile toggle
   ============================================================ */
function initNav(){
  const nav = document.querySelector('.site-nav');
  if (nav){
    ScrollTrigger.create({
      start: 40, end: 99999,
      onUpdate: self => nav.classList.toggle('scrolled', self.scroll() > 40)
    });
  }
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links){
    toggle.addEventListener('click', ()=>{
      const open = links.classList.toggle('mobile-open');
      if (open){
        links.style.cssText = 'display:flex;flex-direction:column;position:fixed;top:86px;left:20px;right:20px;background:#FFFFFF;border:1px solid rgba(30,27,60,.12);border-radius:18px;padding:14px;gap:4px;z-index:999;box-shadow:0 20px 45px -20px rgba(30,27,60,.28);';
      } else {
        links.removeAttribute('style');
      }
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', ()=>{
      links.classList.remove('mobile-open'); links.removeAttribute('style');
    }));
  }
}

/* ============================================================
   HERO ENTRANCE — redaction bar reveal (single orchestrated moment)
   ============================================================ */
function playHeroEntrance(){
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const lines = hero.querySelectorAll('.redact-line');
  const tl = gsap.timeline({ defaults:{ ease:'power4.out' } });

  lines.forEach((line, i) => {
    const chars = splitWords(line);
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;inset:0;background:#4F46E5;transform-origin:left;z-index:2;';
    line.style.position='relative';
    line.appendChild(bar);
    gsap.set(chars, { opacity:0, y: 26 });
    tl.to(bar, { scaleX:1, duration:0, ease:'none' }, i*0.12)
      .to(bar, { scaleX:0, transformOrigin:'right', duration:.6 }, i*0.12 + 0.35)
      .to(chars, { opacity:1, y:0, duration:.7, stagger:0.03 }, i*0.12 + 0.32);
    gsap.set(bar, { scaleX:1 });
  });

  tl.from('.doc-tape', { opacity:0, y:14, duration:.6 }, 0)
    .from('.hero-copy p.lead', { opacity:0, y:18, duration:.7 }, 0.5)
    .from('.hero-actions > *', { opacity:0, y:16, duration:.6, stagger:.1 }, 0.65)
    .from('.hero-proof', { opacity:0, y:16, duration:.6 }, 0.8)
    .from('.doc-card.c3', { opacity:0, x:40, rotate:8, duration:.9 }, 0.3)
    .from('.doc-card.c1', { opacity:0, y:50, duration:.9 }, 0.42)
    .from('.doc-card.c2', { opacity:0, y:40, x:-20, duration:.9 }, 0.54)
    .from('.float-chip', { opacity:0, scale:.7, stagger:.12, duration:.6, ease:'back.out(2)' }, 0.9);

  gsap.to('.doc-card.c1', { y: -14, duration: 3.2, repeat:-1, yoyo:true, ease:'sine.inOut', delay:1.6 });
  gsap.to('.doc-card.c2', { y: 10, duration: 3.8, repeat:-1, yoyo:true, ease:'sine.inOut', delay:1.8 });
  gsap.to('.doc-card.c3', { y: -10, rotate:2, duration:4.2, repeat:-1, yoyo:true, ease:'sine.inOut', delay:2 });
  gsap.to('.float-chip.fc1', { y:-12, duration:2.6, repeat:-1, yoyo:true, ease:'sine.inOut' });
  gsap.to('.float-chip.fc2', { y:10, duration:3, repeat:-1, yoyo:true, ease:'sine.inOut' });
}

/* ============================================================
   PAGE HEADER ENTRANCE (non-home pages)
   ============================================================ */
function playPageHeaderEntrance(){
  const head = document.querySelector('.page-hero');
  if (!head) return;
  const title = head.querySelector('h1');
  if (!title) return;
  const words = splitWords(title);
  const bar = document.createElement('div');
  bar.style.cssText = 'position:absolute;inset:0;background:#4F46E5;transform-origin:left;z-index:2;';
  title.style.position='relative';
  title.appendChild(bar);
  gsap.set(words, { opacity:0, y:24 });
  gsap.timeline({ defaults:{ ease:'power4.out' } })
    .to(bar, { scaleX:0, transformOrigin:'right', duration:.65, delay:.15 })
    .to(words, { opacity:1, y:0, stagger:.03, duration:.7 }, 0.42)
    .from('.page-hero .eyebrow', { opacity:0, y:12, duration:.5 }, 0)
    .from('.page-hero p.lead', { opacity:0, y:16, duration:.6 }, 0.6)
    .from('.page-hero .breadcrumb', { opacity:0, duration:.5 }, 0);
}

/* ============================================================
   SCROLL REVEALS
   ============================================================ */
function initScrollReveals(){
  gsap.utils.toArray('.reveal').forEach((el, i) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 86%',
      onEnter: () => el.classList.add('in-view'),
      once:true
    });
  });

  gsap.utils.toArray('.stagger-group').forEach(group => {
    const items = group.children;
    gsap.from(items, {
      opacity:0, y:30, duration:.7, stagger:0.09, ease:'power3.out',
      scrollTrigger: { trigger: group, start:'top 85%' }
    });
  });

  gsap.utils.toArray('.reveal-img').forEach(box => {
    const curtain = box.querySelector('.curtain');
    const img = box.querySelector('img');
    if (!curtain) return;
    gsap.timeline({ scrollTrigger:{ trigger: box, start:'top 82%' } })
      .to(curtain, { scaleX:0, transformOrigin:'right', duration:.9, ease:'power4.inOut' })
      .to(img, { scale:1, duration:1.2, ease:'power3.out' }, 0.05);
  });

  gsap.utils.toArray('[data-parallax]').forEach(el=>{
    const amt = parseFloat(el.getAttribute('data-parallax')) || 40;
    gsap.to(el, {
      y: amt, ease:'none',
      scrollTrigger: { trigger: el.closest('section') || el, start:'top bottom', end:'bottom top', scrub: 0.6 }
    });
  });

  gsap.utils.toArray('.section-head h2, .cta-band h2').forEach(h => {
    if (h.closest('.hero') || h.closest('.page-hero')) return;
    const words = splitWords(h);
    gsap.from(words, {
      opacity:0, y:22, stagger:0.025, duration:.7, ease:'power3.out',
      scrollTrigger: { trigger: h, start:'top 88%' }
    });
  });
}

/* ============================================================
   COUNTERS
   ============================================================ */
function initCounters(){
  gsap.utils.toArray('[data-count]').forEach(el=>{
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    const suffix = el.getAttribute('data-suffix') || '';
    const state = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start:'top 90%', once:true,
      onEnter(){
        gsap.to(state, {
          v: target, duration: 1.8, ease:'power2.out',
          onUpdate(){ el.textContent = state.v.toFixed(decimals) + suffix; }
        });
      }
    });
  });
}

/* ============================================================
   MARQUEE
   ============================================================ */
function initMarquee(){
  document.querySelectorAll('.marquee-track').forEach(track=>{
    track.innerHTML += track.innerHTML;
    gsap.to(track, { xPercent: -50, duration: 26, ease:'none', repeat:-1 });
  });
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFaq(){
  document.querySelectorAll('.faq-item').forEach(item=>{
    const answer = item.querySelector('.faq-a');
    item.addEventListener('click', ()=>{
      const isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item').forEach(other=>{
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen){
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ============================================================
   INIT ALL (call from each page)
   ============================================================ */
function stacklyInit(opts = {}){
  document.querySelectorAll('.grid-field').forEach(initGridField);
  initCursor();
  initNav();
  initMagnetic();
  initFaq();
  initMarquee();

  initPreloader(()=>{
    if (opts.hero) playHeroEntrance();
    if (opts.pageHeader) playPageHeaderEntrance();
    initScrollReveals();
    initCounters();
    ScrollTrigger.refresh();
    if (typeof opts.after === 'function') opts.after();
  });
}

/* ============================================================
   DASHBOARD SIDEBAR (shared by admin/user dashboards)
   ============================================================ */
function initDashSidebar(){
  const sidebar = document.querySelector('.dash-sidebar');
  const openBtn = document.querySelector('.sidebar-open');
  const closeBtn = document.querySelector('.sidebar-close');
  const scrim = document.querySelector('.dash-scrim');
  function open(){ sidebar.classList.add('open'); scrim && scrim.classList.add('show'); }
  function close(){ sidebar.classList.remove('open'); scrim && scrim.classList.remove('show'); }
  openBtn && openBtn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  scrim && scrim.addEventListener('click', close);
}

function initDashViews(storageKey){
  const links = document.querySelectorAll('[data-view]');
  const views = document.querySelectorAll('.dash-view');
  function show(name){
    views.forEach(v => v.classList.toggle('active', v.dataset.view === name));
    links.forEach(l => l.classList.toggle('active', l.dataset.view === name));
    try{ localStorage.setItem(storageKey, name); }catch(e){}
    const sidebar = document.querySelector('.dash-sidebar');
    const scrim = document.querySelector('.dash-scrim');
    if (window.innerWidth <= 1024 && sidebar){ sidebar.classList.remove('open'); scrim && scrim.classList.remove('show'); }
  }
  links.forEach(l => l.addEventListener('click', e=>{ e.preventDefault(); show(l.dataset.view); }));
  let last = 'overview';
  try{ last = localStorage.getItem(storageKey) || 'overview'; }catch(e){}
  show(last);
}

function loadSessionUser(){
  let user = null;
  try{ user = JSON.parse(localStorage.getItem('stackly_user')); }catch(e){}
  if (!user){
    user = { name:'Alex Morgan', email:'alex.morgan@stacklyvault.com', role:'Member' };
  }
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
  document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);
  document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = user.role || 'Member');
  document.querySelectorAll('[data-user-first]').forEach(el => el.textContent = (user.name||'').split(' ')[0]);
  return user;
}

/* ============================================================
   TOASTS — shared popup/notification helper
   stacklyToast(title, message, { type: 'success'|'error', duration: ms })
   ============================================================ */
function stacklyToast(title, message, opts = {}){
  const type = opts.type || 'success';
  const duration = opts.duration || 4200;

  let host = document.getElementById('stacklyToasts');
  if (!host){
    host = document.createElement('div');
    host.id = 'stacklyToasts';
    document.body.appendChild(host);
  }

  const el = document.createElement('div');
  el.className = 'stackly-toast' + (type === 'error' ? ' error' : '');
  el.innerHTML =
    '<span class="toast-icon">' + (type === 'error' ? '!' : '\u2713') + '</span>' +
    '<div class="toast-body">' +
      '<div class="toast-title"></div>' +
      (message ? '<div class="toast-msg"></div>' : '') +
    '</div>' +
    '<button type="button" class="toast-close" aria-label="Dismiss">&times;</button>';
  el.querySelector('.toast-title').textContent = title;
  if (message) el.querySelector('.toast-msg').textContent = message;

  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));

  function dismiss(){
    el.classList.remove('show');
    setTimeout(() => el.remove(), 350);
  }
  el.querySelector('.toast-close').addEventListener('click', dismiss);
  const timer = setTimeout(dismiss, duration);
  el.addEventListener('mouseenter', () => clearTimeout(timer));

  return el;
}