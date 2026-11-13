(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const token = (name, el = document.documentElement) => getComputedStyle(el).getPropertyValue(name).trim();

  /* ---------- nav: menu and the current section ---------- */
  const toggle = $('.nav__toggle');
  const links = $('.nav__links');
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.nav__bar')) setOpen(false); });
  }

  const navLinks = $$('.nav__links a[href^="#"]');
  const spied = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if (spied.length && 'IntersectionObserver' in window) {
    const visible = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      const current = spied.filter((s) => visible.has(s)).pop();
      navLinks.forEach((a) => {
        if (current && a.getAttribute('href') === '#' + current.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spied.forEach((s) => spy.observe(s));
  }

  /* ---------- space: stars, a little colour in the dark, and one wide arc of light ---------- */
  const sky = $('.space__sky');
  const planet = $('.space__planet');
  if (sky) {
    const spec = ['--spec-1', '--spec-2', '--spec-3', '--spec-4'].map((n) => token(n));
    const ink = token('--color-ink'), paper = token('--color-paper');
    const alpha = (colour, a) => colour.replace(')', ' / ' + a + ')');
    const fit = (cv) => {
      const dpr = Math.min(1.5, devicePixelRatio || 1);
      const r = cv.getBoundingClientRect();
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      const g = cv.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { g, W: cv.clientWidth, H: cv.clientHeight };
    };
    // a small seeded generator, so the sky is the same on every visit
    const rand = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const glow = (g, x, y, r, colour, a) => {
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, alpha(colour, a)); grd.addColorStop(1, alpha(colour, 0));
      g.fillStyle = grd; g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const paintSky = () => {
      const { g, W, H } = fit(sky);
      g.clearRect(0, 0, W, H);
      // low-key colour in the dark: three wide hazes
      glow(g, W * 0.16, H * 0.2, Math.max(W, H) * 0.5, spec[3], 0.1);
      glow(g, W * 0.62, H * 0.42, Math.max(W, H) * 0.42, spec[2], 0.055);
      glow(g, W * 0.9, H * 0.08, Math.max(W, H) * 0.36, spec[0], 0.07);
      // stars
      const rnd = rand(20261113);
      const count = Math.round((W * H) / 2600);
      for (let i = 0; i < count; i++) {
        const x = rnd() * W, y = rnd() * H, big = rnd() > 0.93;
        const r = big ? 0.9 + rnd() * 0.9 : 0.35 + rnd() * 0.55;
        const tint = rnd() > 0.82 ? spec[Math.floor(rnd() * 4)] : ink;
        g.globalAlpha = big ? 0.75 + rnd() * 0.25 : 0.25 + rnd() * 0.5;
        g.fillStyle = tint;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
      g.globalAlpha = 1;
    };

    const paintPlanet = () => {
      if (!planet) return;
      const { g, W, H } = fit(planet);
      const vh = H / 1.5;
      g.clearRect(0, 0, W, H);
      const narrow = W < vh * 0.9;
      const R = narrow ? vh * 0.9 : Math.max(vh * 0.92, W * 0.46);
      const cx = narrow ? W * 0.72 : W * 0.88, cy = vh * 0.7 + R;
      const lightAngle = -Math.PI * 0.72; // the light comes from the upper left

      // the arc: the whole spectrum as light, strongest toward the upper left
      const halo = document.createElement('canvas');
      halo.width = planet.width; halo.height = planet.height;
      const h = halo.getContext('2d');
      h.setTransform(planet.width / W, 0, 0, planet.height / H, 0, 0);
      const ring = h.createRadialGradient(cx, cy, R * 0.84, cx, cy, R * 1.24);
      const at = (r) => (r - 0.84) / 0.4;
      ring.addColorStop(0, alpha(spec[2], 0));
      ring.addColorStop(at(0.95), alpha(spec[2], 0.1));
      ring.addColorStop(at(0.995), alpha(ink, 0.55));
      ring.addColorStop(at(1.012), alpha(spec[1], 0.42));
      ring.addColorStop(at(1.04), alpha(spec[0], 0.3));
      ring.addColorStop(at(1.085), alpha(spec[3], 0.2));
      ring.addColorStop(at(1.16), alpha(spec[3], 0.07));
      ring.addColorStop(1, alpha(spec[3], 0));
      h.fillStyle = ring; h.fillRect(0, 0, W, H);
      // keep it where the light falls
      const lx = cx + Math.cos(lightAngle) * R, ly = cy + Math.sin(lightAngle) * R;
      const fall = h.createRadialGradient(lx, ly, R * 0.15, lx, ly, R * 1.5);
      fall.addColorStop(0, alpha(ink, 1)); fall.addColorStop(0.55, alpha(ink, 0.5)); fall.addColorStop(1, alpha(ink, 0));
      h.globalCompositeOperation = 'destination-in';
      h.fillStyle = fall; h.fillRect(0, 0, W, H);

      // no solid body: only the light that bends around it, and a little less sky inside the arc
      const inside = g.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
      inside.addColorStop(0, alpha(paper, 0.7)); inside.addColorStop(1, alpha(paper, 0));
      g.fillStyle = inside; g.fillRect(0, 0, W, H);
      g.drawImage(halo, 0, 0, W, H);
    };

    const paintSpace = () => { paintSky(); paintPlanet(); };
    paintSpace();
    let raf = 0, lastW = innerWidth;
    addEventListener('resize', () => {
      if (innerWidth === lastW && matchMedia('(pointer: coarse)').matches) return; // a phone's address bar resizing is not a new sky
      lastW = innerWidth;
      cancelAnimationFrame(raf); raf = requestAnimationFrame(paintSpace);
    });

    // the pointer shifts the planes a little, the far one least
    if (!reduced.matches && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let tx = 0, ty = 0, x = 0, y = 0, running = false;
      const step = () => {
        x += (tx - x) * 0.06; y += (ty - y) * 0.06;
        document.documentElement.style.setProperty('--px', x.toFixed(3));
        document.documentElement.style.setProperty('--py', y.toFixed(3));
        if (Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002) requestAnimationFrame(step); else running = false;
      };
      addEventListener('pointermove', (e) => {
        tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1;
        if (!running) { running = true; requestAnimationFrame(step); }
      }, { passive: true });
    }
  }

  let pageTick = false;
  const pageProgress = () => {
    pageTick = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--page-p', max > 0 ? (scrollY / max).toFixed(4) : '0');
  };
  if (!reduced.matches) {
    addEventListener('scroll', () => { if (!pageTick) { pageTick = true; requestAnimationFrame(pageProgress); } }, { passive: true });
    pageProgress();
  }

  /* ---------- the desk: the act's own progress decides what the robot does ---------- */
  const desk = $('#top');
  const rig = desk && $('.rig', desk);
  if (rig) {
    const robot = $('.robot', rig);
    const say = $('.robot__say', rig);
    const count = $('.screen__count', rig);
    const starts = $$('.task', rig).map((t) => parseFloat(t.style.getPropertyValue('--a')));
    const total = starts.length;
    let last = -1, lastDone = 0, idle = 0, busy = false, busyTimer = 0;
    const look = (x, y) => { robot.style.setProperty('--look-x', x + 'px'); robot.style.setProperty('--look-y', y + 'px'); };
    const flash = (cls, ms) => { robot.classList.remove(cls); void robot.offsetWidth; robot.classList.add(cls); setTimeout(() => robot.classList.remove(cls), ms); };
    // with nothing to scroll yet, the robot is already at work: typing in bursts, eyes on its keys
    const idleWork = (on) => {
      if (on === busy) return;
      busy = on;
      clearInterval(busyTimer);
      if (!on || reduced.matches) return;
      let k = 0;
      const beat = () => {
        k++;
        const typing = k % 4 !== 0;
        robot.classList.toggle('is-typing', typing);
        look(typing ? [7, -5, 4][k % 3] : 0, typing ? [5, 4, 6][k % 3] : 0);
      };
      beat();
      busyTimer = setInterval(beat, 900);
    };
    const update = (p) => {
      const done = starts.filter((a) => p >= a + 0.1).length;
      const working = p > starts[0] - 0.03 && done < total;
      count.textContent = `${done} von ${total}`;
      say.textContent = done === total ? 'alles erledigt' : working ? `${done} von ${total} erledigt` : 'arbeitet';
      idleWork(!working && done < total);
      robot.classList.toggle('is-happy', done === total);
      if (working) {
        look(-9, -4);
        robot.classList.add('is-typing');
        clearTimeout(idle);
        idle = setTimeout(() => robot.classList.remove('is-typing'), 180);
      } else if (done === total) {
        look(0, 0);
        robot.classList.remove('is-typing');
      }
      if (done > lastDone) flash('is-pulse', 420);
      lastDone = done;
    };
    const frame = () => {
      const p = parseFloat(desk.style.getPropertyValue('--sc-p')) || 0;
      if (p !== last) { last = p; update(p); }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  // the second robot, at the close, looks around while it waits for an answer
  const greeter = $('.close__bot .robot');
  if (greeter && !reduced.matches) {
    const glances = [[0, 0], [-7, 2], [0, 0], [7, 2], [0, -3]];
    let g = 0;
    setInterval(() => {
      g = (g + 1) % glances.length;
      greeter.style.setProperty('--look-x', glances[g][0] + 'px');
      greeter.style.setProperty('--look-y', glances[g][1] + 'px');
    }, 1600);
  }

  // the robot blinks now and then, wherever it sits
  if (!reduced.matches) {
    setInterval(() => $$('.robot').forEach((r) => {
      if (r.classList.contains('is-happy')) return;
      r.classList.add('is-blink');
      setTimeout(() => r.classList.remove('is-blink'), 140);
    }), 4200);
  }

  /* ---------- the statement that fills in on scroll ---------- */
  const scrub = $('[data-scrub]');
  if (scrub && !reduced.matches) {
    const words = scrub.textContent.trim().split(/\s+/);
    scrub.setAttribute('aria-label', words.join(' '));
    scrub.innerHTML = words.map((w) => `<span aria-hidden="true">${w}</span>`).join(' ');
    const spans = $$('span', scrub);
    let ticking = false;
    const paintWords = () => {
      ticking = false;
      const r = scrub.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.9 - r.top) / (innerHeight * 0.55)));
      spans.forEach((sp, i) => sp.style.setProperty('--o', (0.16 + 0.84 * Math.min(1, Math.max(0, p * (spans.length + 2) - i))).toFixed(3)));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paintWords); } }, { passive: true });
    addEventListener('resize', paintWords);
    paintWords();
  }

  /* ---------- the service cards: play once in view, again on hover or tap ---------- */
  const run = (el) => {
    if (el.dataset.busy) return;
    el.dataset.busy = '1';
    el.classList.remove('is-playing');
    void el.offsetWidth;
    el.classList.add('is-playing');
    setTimeout(() => delete el.dataset.busy, Number(el.dataset.play) || 2500);
  };
  const playables = $$('[data-play]');
  if (playables.length) {
    if (reduced.matches || !('IntersectionObserver' in window)) {
      playables.forEach((el) => el.classList.add('is-playing'));
    } else {
      const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        run(e.target);
        seen.unobserve(e.target);
      }), { threshold: 0.75 });
      playables.forEach((el) => seen.observe(el));
    }
    $$('.tile[data-play]').forEach((tile) => {
      tile.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && tile.classList.contains('is-playing')) run(tile); });
      tile.addEventListener('pointermove', (e) => {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', e.clientX - r.left + 'px');
        tile.style.setProperty('--my', e.clientY - r.top + 'px');
      });
      const btn = $('.tile__play', tile);
      if (btn) btn.addEventListener('click', () => run(tile));
    });
  }

  /* ---------- the switcher ---------- */
  $$('[data-switch]').forEach((root) => {
    const tabs = $$('[role="tab"]', root);
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const move = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (move) { e.preventDefault(); select(tabs[(i + move + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
      });
    });
    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  });

  /* ---------- copy the address ---------- */
  $$('[data-copy]').forEach((btn) => {
    const label = $('span', btn);
    const text = label.textContent;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        label.textContent = 'Kopiert';
      } catch (err) {
        label.textContent = 'Bitte von Hand kopieren';
      }
      setTimeout(() => { label.textContent = text; }, 2200);
    });
  });

  /* ---------- the scroll engine ---------- */
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);
})();
