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
      const big = Math.max(W, H);
      const rnd = rand(20261113);
      const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2; // roughly -1..1, dense in the middle
      g.clearRect(0, 0, W, H);

      // nebulae: clouds built from many faint puffs, each in one low-key hue
      const cloud = (cx, cy, spread, colour, strength, puffs) => {
        g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < puffs; i++) {
          const x = cx + gauss() * spread * 1.5, y = cy + gauss() * spread * 0.8;
          glow(g, x, y, spread * (0.25 + rnd() * 0.5), colour, strength * (0.4 + rnd() * 0.6));
        }
        g.globalCompositeOperation = 'source-over';
      };
      cloud(W * 0.18, H * 0.24, big * 0.22, spec[3], 0.03, 46);
      cloud(W * 0.3, H * 0.18, big * 0.12, spec[2], 0.016, 26);
      cloud(W * 0.78, H * 0.12, big * 0.16, spec[0], 0.02, 34);
      cloud(W * 0.6, H * 0.5, big * 0.18, spec[2], 0.014, 30);
      cloud(W * 0.08, H * 0.82, big * 0.16, spec[3], 0.018, 28);

      // the band of the galaxy: dust and a great many faint stars along one diagonal
      const ax = -W * 0.05, ay = H * 0.86, bx = W * 1.05, by = H * 0.04;
      const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
      g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 70; i++) {
        const t = rnd(), o = gauss() * big * 0.05;
        glow(g, ax + dx * t + nx * o, ay + dy * t + ny * o, big * (0.05 + rnd() * 0.07), i % 5 === 0 ? spec[3] : ink, 0.012 + rnd() * 0.012);
      }
      g.globalCompositeOperation = 'source-over';
      const band = Math.round((W * H) / 900);
      for (let i = 0; i < band; i++) {
        const t = rnd(), o = gauss() * big * 0.085;
        g.globalAlpha = 0.12 + rnd() * 0.4;
        g.fillStyle = rnd() > 0.9 ? spec[Math.floor(rnd() * 4)] : ink;
        g.beginPath(); g.arc(ax + dx * t + nx * o, ay + dy * t + ny * o, 0.25 + rnd() * 0.5, 0, Math.PI * 2); g.fill();
      }

      // the nearer stars, everywhere
      const count = Math.round((W * H) / 2600);
      for (let i = 0; i < count; i++) {
        const x = rnd() * W, y = rnd() * H, bright = rnd() > 0.93;
        const r = bright ? 0.9 + rnd() * 0.9 : 0.35 + rnd() * 0.55;
        g.globalAlpha = bright ? 0.75 + rnd() * 0.25 : 0.25 + rnd() * 0.5;
        g.fillStyle = rnd() > 0.82 ? spec[Math.floor(rnd() * 4)] : ink;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        if (bright && rnd() > 0.5) { g.globalAlpha = 1; glow(g, x, y, r * 7, ink, 0.2); }
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
      ring.addColorStop(at(0.95), alpha(spec[2], 0.08));
      ring.addColorStop(at(0.992), alpha(ink, 0.5));
      ring.addColorStop(at(1.006), alpha(spec[1], 0.16));
      ring.addColorStop(at(1.02), alpha(spec[0], 0.14));
      ring.addColorStop(at(1.05), alpha(spec[3], 0.22));
      ring.addColorStop(at(1.12), alpha(spec[3], 0.1));
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

  /* ---------- the path: the step in view decides the robot's prop and pose ---------- */
  const pathAct = $('#ablauf');
  const pathBox = pathAct && $('.path', pathAct);
  if (pathBox) {
    const items = $$('.path__step', pathBox);
    let shown = -1;
    const tick = () => {
      const p = parseFloat(pathAct.style.getPropertyValue('--sc-p')) || 0;
      const step = Math.max(0, Math.min(items.length - 1, Math.floor((p - 0.02) / 0.235)));
      if (step !== shown) {
        shown = step;
        pathBox.dataset.step = String(step);
        items.forEach((li, i) => li.classList.toggle('is-active', i === step));
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
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

  /* ---------- text that fills in as it scrolls up the screen: grey first, then white ---------- */
  const scrubs = $$('[data-scrub]');
  const flows = $$('[data-flow]');
  if ((scrubs.length || flows.length) && !reduced.matches) {
    const groups = scrubs.map((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.setAttribute('aria-label', words.join(' '));
      el.innerHTML = words.map((w) => `<span aria-hidden="true">${w}</span>`).join(' ');
      return { el, spans: $$('span', el) };
    });
    let ticking = false;
    const paintText = () => {
      ticking = false;
      const vh = innerHeight;
      groups.forEach(({ el, spans }) => {
        const p = Math.min(1, Math.max(0, (vh * 0.92 - el.getBoundingClientRect().top) / (vh * 0.55)));
        spans.forEach((sp, i) => sp.style.setProperty('--o', (0.16 + 0.84 * Math.min(1, Math.max(0, p * (spans.length + 2) - i))).toFixed(3)));
      });
      flows.forEach((el) => {
        const p = Math.min(1, Math.max(0, (vh * 0.98 - el.getBoundingClientRect().top) / (vh * 0.4)));
        el.style.setProperty('--o', (0.16 + 0.84 * p).toFixed(3));
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paintText); } }, { passive: true });
    addEventListener('resize', paintText);
    paintText();
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
      tile.addEventListener('click', () => run(tile));
    });
  }

  /* ---------- the switcher: tabs you can click, and that move on by themselves ---------- */
  $$('[data-switch]').forEach((root) => {
    const tabs = $$('[role="tab"]', root);
    const list = $('[role="tablist"]', root);
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

    // every few seconds the next audience comes up; it waits while someone reads or uses the tabs
    if (!reduced.matches && 'IntersectionObserver' in window) {
      const every = 4500;
      const state = { seen: false, held: false, stopped: false };
      let timer = 0;
      const sync = () => {
        clearInterval(timer);
        const on = state.seen && !state.held && !state.stopped;
        list.classList.toggle('is-auto', on);
        if (!on) return;
        timer = setInterval(() => {
          const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
          select(tabs[(i + 1) % tabs.length]);
        }, every);
      };
      new IntersectionObserver(([e]) => { state.seen = e.isIntersecting; sync(); }, { threshold: 0.4 }).observe(root);
      root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { state.held = true; sync(); } });
      root.addEventListener('pointerleave', () => { state.held = false; sync(); });
      root.addEventListener('focusin', () => { state.held = true; sync(); });
      root.addEventListener('focusout', () => { state.held = false; sync(); });
      tabs.forEach((t) => t.addEventListener('click', (e) => { if (e.isTrusted) { state.stopped = true; sync(); } }));
    }
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

  /* ---------- a wheel that glides: the page eases toward where the wheel asked it to go ---------- */
  if (!reduced.matches && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const root = document.documentElement;
    let target = scrollY, current = scrollY, gliding = false;
    const limit = () => root.scrollHeight - innerHeight;
    const glide = () => {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.4) { current = target; gliding = false; }
      scrollTo({ top: current, behavior: 'instant' });
      if (gliding) requestAnimationFrame(glide);
    };
    addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // leave elements alone that scroll on their own
      for (let n = e.target; n && n !== document.body; n = n.parentElement) {
        const o = getComputedStyle(n).overflowY;
        if ((o === 'auto' || o === 'scroll') && n.scrollHeight > n.clientHeight) return;
      }
      e.preventDefault();
      if (!gliding) { target = current = scrollY; }
      const step = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      target = Math.min(limit(), Math.max(0, target + step));
      if (!gliding) { gliding = true; requestAnimationFrame(glide); }
    }, { passive: false });
    // keys, the scrollbar and anchor links move the page themselves: follow them, do not fight them
    addEventListener('scroll', () => { if (!gliding) { target = current = scrollY; } }, { passive: true });
    addEventListener('pointerdown', () => { gliding = false; target = current = scrollY; }, { passive: true });
    addEventListener('keydown', () => { gliding = false; }, { passive: true });
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', () => { gliding = false; }));
  }

  /* ---------- the scroll engine ---------- */
  if (window.ScrollCraft) window.ScrollCraft.mount(document.body);
})();
