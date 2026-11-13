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

  /* ---------- the aura: prism fans on a fixed canvas; the scroll turns it ---------- */
  const aura = $('.aura canvas');
  if (aura) {
    const paint = () => {
      const W = 520, H = Math.round((520 * innerHeight) / innerWidth);
      aura.width = W; aura.height = H;
      const g = aura.getContext('2d');
      const spec = ['--spec-1', '--spec-2', '--spec-3', '--spec-4'].map((n) => token(n));
      const white = token('--color-ink');
      const u = Math.min(W, H);
      const fan = (fx, fy, tx, ty, w0, w1, alpha) => {
        const dx = tx - fx, dy = ty - fy, len = Math.hypot(dx, dy);
        const nx = -dy / len, ny = dx / len;
        const band = (o0, o1, a0, a1, colour, al) => {
          g.beginPath();
          g.moveTo(fx + nx * o0, fy + ny * o0);
          g.lineTo(fx + nx * (o0 + a0), fy + ny * (o0 + a0));
          g.lineTo(tx + nx * (o1 + a1), ty + ny * (o1 + a1));
          g.lineTo(tx + nx * o1, ty + ny * o1);
          g.closePath();
          g.fillStyle = colour; g.globalAlpha = al; g.fill();
        };
        spec.forEach((colour, i) => band(i * w0, i * w1, w0, w1, colour, alpha));
        band(-w0 * 0.6, -w1 * 0.4, w0 * 0.6, w1 * 0.4, white, alpha * 0.9);
      };
      g.clearRect(0, 0, W, H);
      g.globalCompositeOperation = 'lighter';
      fan(W * 1.02, H * 0.02, W * 0.36, H * 0.98, u * 0.012, u * 0.07, 0.4);
      fan(W * 0.62, -H * 0.05, W * 0.08, H * 0.62, u * 0.006, u * 0.035, 0.22);
      fan(W * 0.98, H * 0.55, W * 0.6, H * 1.1, u * 0.008, u * 0.05, 0.24);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
    };
    paint();
    let raf = 0;
    addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); });
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
    let last = -1, lastDone = 0, idle = 0;
    const look = (x, y) => { robot.style.setProperty('--look-x', x + 'px'); robot.style.setProperty('--look-y', y + 'px'); };
    const flash = (cls, ms) => { robot.classList.remove(cls); void robot.offsetWidth; robot.classList.add(cls); setTimeout(() => robot.classList.remove(cls), ms); };
    const update = (p) => {
      const done = starts.filter((a) => p >= a + 0.1).length;
      const working = p > starts[0] - 0.03 && done < total;
      count.textContent = `${done} von ${total}`;
      say.textContent = done === total ? 'alles erledigt' : working ? `${done} von ${total} erledigt` : 'wartet';
      robot.classList.toggle('is-happy', done === total);
      if (working) {
        look(-9, -4);
        robot.classList.add('is-typing');
        clearTimeout(idle);
        idle = setTimeout(() => robot.classList.remove('is-typing'), 180);
      } else {
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
