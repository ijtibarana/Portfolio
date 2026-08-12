/* =========================================================
   Ijtiba Rana — Portfolio interactions
   Vanilla JS, no dependencies. Perf + a11y conscious.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var isMobile = window.matchMedia('(max-width: 860px)').matches;

  /* ---------------- Nav ---------------- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.burger');
  var mobile = document.querySelector('.mobile');
  var progress = document.querySelector('.progress');
  var waFloat = document.querySelector('.wa-float');

  function onScroll() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 24);
    if (waFloat) waFloat.classList.toggle('show', y > 600);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () { onScroll(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  function closeMenu() {
    if (!mobile) return;
    mobile.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      var open = mobile.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) { var f = mobile.querySelector('a'); if (f) f.focus(); }
    });
    mobile.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobile.classList.contains('open')) { closeMenu(); burger.focus(); }
    });
  }

  /* ---------------- Scroll spy ---------------- */
  var links = [].slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------- Reveal on scroll ---------------- */
  var rv = [].slice.call(document.querySelectorAll('[data-rv]'));
  if (!('IntersectionObserver' in window) || reduced) {
    rv.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.dash,.tech').forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io2.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.dash,.tech').forEach(function (el) { io2.observe(el); });
  }

  /* ---------------- 3D tilt (desktop, fine pointer) ---------------- */
  if (!reduced && !coarse) {
    var tilts = [].slice.call(document.querySelectorAll('[data-tilt]'));
    tilts.forEach(function (el) {
      var max = parseFloat(el.dataset.tilt) || 8;
      var raf = null, tx = 0, ty = 0;
      function apply() {
        el.style.transform = 'perspective(1100px) rotateX(' + ty + 'deg) rotateY(' + tx + 'deg) translateZ(0)';
        raf = null;
      }
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        tx = px * max * 2; ty = -py * max * 2;
        if (!raf) raf = requestAnimationFrame(apply);
        el.style.setProperty('--mx', ((px + 0.5) * 100) + '%');
        el.style.setProperty('--my', ((py + 0.5) * 100) + '%');
      });
      el.addEventListener('mouseleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        el.style.transform = '';
      });
    });

    /* portrait mouse-follow parallax */
    var portrait = document.querySelector('[data-portrait]');
    if (portrait) {
      var pr = null, rx = 0, ry = 0;
      window.addEventListener('mousemove', function (e) {
        var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        ry = ((e.clientX - cx) / cx) * 7;
        rx = -((e.clientY - cy) / cy) * 5;
        if (!pr) {
          pr = requestAnimationFrame(function () {
            portrait.style.transform = 'rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
            pr = null;
          });
        }
      }, { passive: true });
    }
  }

  /* ---------------- Particles (canvas, throttled) ---------------- */
  var canvas = document.getElementById('particles');
  if (canvas && !reduced) {
    var ctx = canvas.getContext('2d', { alpha: true });
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var COUNT = isMobile ? 26 : 62;
    var pts = [];
    var running = true;

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function init() {
      pts = [];
      for (var i = 0; i < COUNT; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.6 + 0.5,
          h: Math.random() > 0.5 ? '34,211,238' : '139,92,246',
          a: Math.random() * 0.45 + 0.18
        });
      }
    }
    var last = 0;
    function frame(t) {
      if (!running) return;
      if (t - last < 33) { requestAnimationFrame(frame); return; } // ~30fps cap
      last = t;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(' + p.h + ',' + p.a + ')';
        ctx.fill();
      }
      if (!isMobile) {
        for (var a = 0; a < pts.length; a++) {
          for (var b = a + 1; b < pts.length; b++) {
            var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
            var d2 = dx * dx + dy * dy;
            if (d2 < 16000) {
              ctx.beginPath();
              ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y);
              ctx.strokeStyle = 'rgba(120,150,255,' + (0.1 * (1 - d2 / 16000)) + ')';
              ctx.lineWidth = 0.6; ctx.stroke();
            }
          }
        }
      }
      requestAnimationFrame(frame);
    }
    resize(); init(); requestAnimationFrame(frame);
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); init(); }, 220);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) requestAnimationFrame(frame);
    });
  }

  /* ---------------- Live site embedding (lazy, on demand) ----------------
     Screenshots are the default (fast + always renders).
     Clicking "Load live site" swaps in a real iframe of the actual website,
     scaled down so the desktop layout is visible inside the browser frame.
  ------------------------------------------------------------------------ */
  function mountLive(btn) {
    var vp = btn.closest('.viewport');
    if (!vp || vp.dataset.mounted === '1') return;
    var url = btn.dataset.live;
    if (!url) return;
    vp.dataset.mounted = '1';

    var holder = document.createElement('div');
    holder.style.cssText = 'position:absolute;inset:0;overflow:hidden;background:#fff';

    var f = document.createElement('iframe');
    f.className = 'vp-scale';
    f.src = url;
    f.loading = 'lazy';
    f.title = 'Live website: ' + url;
    f.setAttribute('referrerpolicy', 'no-referrer');
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');

    function scale() {
      var w = vp.clientWidth, h = vp.clientHeight;
      var base = w < 620 ? 1100 : 1440;          // narrower base on small screens
      var s = w / base;
      f.style.width = base + 'px';
      f.style.height = Math.ceil(h / s) + 'px';
      f.style.transform = 'scale(' + s + ')';
    }
    holder.appendChild(f);
    vp.appendChild(holder);
    scale();
    window.addEventListener('resize', scale, { passive: true });

    // switch the badge to LIVE only once the frame actually loads
    var frame = vp.closest('.browser-in');
    var badge = frame ? frame.querySelector('.state') : null;
    var timer = setTimeout(function () { fail('Site refused to load in a frame'); }, 12000);
    var ok = false;
    f.addEventListener('load', function () {
      ok = true; clearTimeout(timer);
      if (badge) {
        badge.className = 'state live';
        badge.innerHTML = '<i></i>Live';
      }
      var note = vp.querySelector('.vp-note');
      if (note) note.textContent = 'Live embed of ' + url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      var ov = vp.querySelector('.vp-load');
      if (ov) ov.remove();
    });
    function fail(msg) {
      if (ok) return;
      holder.remove();
      vp.dataset.mounted = '';
      var note = vp.querySelector('.vp-note');
      if (note) note.textContent = msg + ' — showing captured preview.';
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-live]');
    if (b) { e.preventDefault(); mountLive(b); }
  });

  /* ---------------- Tech filter ---------------- */
  var catBtns = [].slice.call(document.querySelectorAll('.tech-cat button'));
  var techs = [].slice.call(document.querySelectorAll('.tech'));
  catBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var c = btn.dataset.cat;
      catBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      techs.forEach(function (t) {
        var show = c === 'all' || t.dataset.cat === c;
        t.style.display = show ? '' : 'none';
      });
    });
  });

  /* ---------------- AI console demo loop ---------------- */
  var body = document.querySelector('.console-body');
  if (body && !reduced) {
    var script = [
      { who: 'user', txt: 'Hi — do you build WhatsApp automation?' },
      { who: 'bot', txt: 'Yes. I build AI agents for WhatsApp, Instagram and Messenger that qualify leads and reply 24/7.' },
      { who: 'user', txt: 'We get ~40 enquiries a day and miss most at night.' },
      { who: 'bot', txt: 'An agent can capture those, ask qualifying questions, then hand hot leads to your team with full context.' },
      { who: 'user', txt: 'Can it push leads into our CRM?' },
      { who: 'bot', txt: 'Absolutely — via API or webhook, with follow-up sequences built in. Want to map your workflow?' }
    ];
    var idx = 0;
    var timers = [];
    function clearAll() { timers.forEach(clearTimeout); timers = []; }
    function add(m) {
      var d = document.createElement('div');
      d.className = 'msg ' + m.who;
      d.innerHTML = '<span class="av" aria-hidden="true">' + (m.who === 'bot' ? 'AI' : 'YOU') + '</span>' +
        '<span class="bub">' + m.txt + '</span>';
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }
    function typing() {
      var d = document.createElement('div');
      d.className = 'msg bot t';
      d.innerHTML = '<span class="av" aria-hidden="true">AI</span><span class="bub typing"><i></i><i></i><i></i></span>';
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
      return d;
    }
    function next() {
      if (idx >= script.length) {
        timers.push(setTimeout(function () {
          body.innerHTML = ''; idx = 0; next();
        }, 4200));
        return;
      }
      var m = script[idx++];
      if (m.who === 'bot') {
        var t = typing();
        timers.push(setTimeout(function () {
          t.remove(); add(m);
          timers.push(setTimeout(next, 1900));
        }, 1250));
      } else {
        add(m);
        timers.push(setTimeout(next, 1500));
      }
    }
    var started = false;
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting && !started) { started = true; next(); }
        else if (!en[0].isIntersecting && started) { /* keep running, cheap */ }
      }, { threshold: 0.25 });
      cio.observe(body);
    } else { next(); }
  }

  /* ---------------- Year ---------------- */
  var y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();

})();
