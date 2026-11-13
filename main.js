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
    const mark = () => {
      const current = spied.filter((s) => visible.has(s)).pop();
      navLinks.forEach((a) => {
        if (current && a.getAttribute('href') === '#' + current.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      mark();
    }, { rootMargin: '-45% 0px -50% 0px' });
    spied.forEach((s) => spy.observe(s));
  }

  /* ---------- the light: sun through a glazed window, with a prism's fan ---------- */
  const drawLight = (canvas) => {
    const box = canvas.parentElement.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const W = 440;
    const H = Math.max(140, Math.round((W * box.height) / box.width));
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    const c = {
      shade: token('--lit-shade', canvas), light: token('--lit', canvas), bloom: token('--bloom', canvas),
      s1: token('--spec-1', canvas), s2: token('--spec-2', canvas), s3: token('--spec-3', canvas), s4: token('--spec-4', canvas),
    };
    const contact = canvas.dataset.light === 'contact';
    const narrow = !contact && matchMedia('(max-width: 70rem)').matches;
    const u = contact ? H * 0.9 : Math.min(H, W * 0.5);
    const skew = contact ? 0.42 : -0.46;
    const cols = 3, rows = 2;
    const pw = u * 0.5, ph = u * 0.44, bar = u * 0.034;
    const total = cols * pw + (cols - 1) * bar;
    const ox = contact ? W * 0.5 - total * 0.2 : (W - total) / 2 + u * 0.36;
    const oy = contact ? H * 0.06 : narrow ? H * 0.4 : -u * 0.04;
    const at = (x, y) => [ox + x + skew * y, oy + y];
    const quad = (x, y, w, h) => {
      g.beginPath();
      [at(x, y), at(x + w, y), at(x + w, y + h), at(x, y + h)].forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.closePath();
    };
    const edge = (x, y0, y1, colour, alpha, width) => {
      g.beginPath();
      g.moveTo(...at(x, y0));
      g.lineTo(...at(x, y1));
      g.strokeStyle = colour; g.globalAlpha = alpha; g.lineWidth = width; g.stroke();
    };

    g.clearRect(0, 0, W, H);
    g.globalAlpha = 0.4;
    g.fillStyle = c.shade;
    g.fillRect(0, 0, W, H);

    // one soft bloom behind the desk, only where the ground is dark
    const bx = contact ? W * 0.3 : W * 0.5, by = contact ? H * 0.55 : narrow ? H * 0.6 : u * 0.52;
    const bloom = g.createRadialGradient(bx, by, 0, bx, by, u * 0.8);
    bloom.addColorStop(0, c.bloom);
    bloom.addColorStop(1, c.bloom.replace(/\/\s*[\d.]+\s*\)/, '/ 0)'));
    g.globalAlpha = 1;
    g.fillStyle = bloom;
    g.fillRect(0, 0, W, H);

    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const x = k * (pw + bar), y = r * (ph + bar);
        g.globalCompositeOperation = 'destination-out';
        g.globalAlpha = 1;
        quad(x, y, pw, ph); g.fill();
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 0.85;
        g.fillStyle = c.light;
        quad(x, y, pw, ph); g.fill();
        // the pane's edges split warm and cool
        edge(x + u * 0.005, y, y + ph, c.s1, 0.26, u * 0.009);
        edge(x + u * 0.015, y, y + ph, c.s2, 0.22, u * 0.009);
        edge(x + pw - u * 0.015, y, y + ph, c.s3, 0.22, u * 0.009);
        edge(x + pw - u * 0.005, y, y + ph, c.s4, 0.24, u * 0.009);
      }
    }

    // the prism's fan, crossing the patch at a low angle
    const fx = contact ? W * 0.04 : W * 1.0, fy = contact ? H * 0.2 : oy;
    const tx = contact ? W * 0.62 : W * 0.5, ty = contact ? H * 1.05 : oy + u * 1.02;
    const dx = tx - fx, dy = ty - fy, len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;
    const band = (offset0, offset1, w0, w1, colour, alpha) => {
      g.beginPath();
      g.moveTo(fx + nx * offset0, fy + ny * offset0);
      g.lineTo(fx + nx * (offset0 + w0), fy + ny * (offset0 + w0));
      g.lineTo(tx + nx * (offset1 + w1), ty + ny * (offset1 + w1));
      g.lineTo(tx + nx * offset1, ty + ny * offset1);
      g.closePath();
      g.fillStyle = colour; g.globalAlpha = alpha; g.fill();
    };
    const w0 = u * 0.006, w1 = u * 0.03;
    [c.s1, c.s2, c.s3, c.s4].forEach((colour, i) => band(i * w0, i * w1, w0, w1, colour, 0.36));
    band(-w0, -w1 * 0.6, w0, w1 * 0.6, c.light, 0.95);

    // the light fades to paper where the type sits
    const fade = g.createLinearGradient(0, 0, 0, H);
    const keys = contact ? [[0.03, 0], [0.42, 1], [0.58, 1], [0.97, 0]] : narrow ? [[0.26, 0], [0.52, 1], [0.8, 1], [0.99, 0]] : [[0, 1], [0.42, 1], [0.99, 0]];
    const smooth = (p) => p * p * (3 - 2 * p);
    const alphaAt = (y) => {
      if (y <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) {
        if (y <= keys[i][0]) return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * smooth((y - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
      }
      return keys[keys.length - 1][1];
    };
    for (let i = 0; i <= 24; i++) fade.addColorStop(i / 24, c.light.replace(')', ' / ' + alphaAt(i / 24).toFixed(3) + ')'));
    g.globalCompositeOperation = 'destination-in';
    g.globalAlpha = 1;
    g.fillStyle = fade;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
  };

  const lights = $$('.light canvas');
  const paintLights = () => lights.forEach(drawLight);
  if (lights.length) {
    paintLights();
    let raf = 0;
    addEventListener('resize', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paintLights); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintLights);
  }

  /* ---------- the stage: a robot working through tasks ---------- */
  const stage = $('.stage');
  if (stage) {
    const svg = $('.stage__wires', stage);
    const robot = $('.robot', stage);
    const head = $('.robot__head', stage);
    const say = $('.robot__say', stage);
    const screen = $('.screen', stage);
    const taskIcon = $('.screen__task use', stage);
    const taskName = $('.screen__task span', stage);
    const steps = $$('.screen__steps li', stage);
    const out = $('.screen__out', stage);
    const ins = Object.fromEntries($$('[data-in]', stage).map((n) => [n.dataset.in, n]));
    const outs = Object.fromEntries($$('[data-out]', stage).map((n) => [n.dataset.out, n]));
    const toggleBtn = $('[data-loop-toggle]', stage);
    const heroLight = $('.hero .light');
    const NS = 'http://www.w3.org/2000/svg';

    const tasks = [
      { from: 'discord', icon: 'message-square', name: 'Support-Ticket', steps: ['Anliegen erkannt', 'Antwort geschrieben', 'Ticket geschlossen'], out: 'Dein Zugang ist wieder frei. Melde dich einfach neu an.', to: 'reply', result: 'Ticket gelöst' },
      { from: 'form', icon: 'file-text', name: 'Projektanfrage', steps: ['Angaben geprüft', 'Kontakt angelegt', 'Rückruf geplant'], out: 'Neuer Kontakt: Beispiel GmbH, Thema Onlineshop.', to: 'data', result: 'Kontakt angelegt' },
      { from: 'mail', icon: 'mail', name: 'Terminanfrage', steps: ['Kalender geprüft', 'Termin eingetragen', 'Bestätigung gesendet'], out: 'Passt: Dienstag um 10 Uhr ist für dich reserviert.', to: 'calendar', result: 'Termin eingetragen' },
      { from: 'discord', icon: 'message-square', name: 'Neuer Kunde', steps: ['Daten geprüft', 'Konto angelegt', 'Begrüßung gesendet'], out: 'Willkommen! Dein Zugang ist eingerichtet.', to: 'reply', result: 'Mitglied begrüßt' },
      { from: 'mail', icon: 'mail', name: 'Rechnung anfordern', steps: ['Kunde erkannt', 'Rechnung erstellt', 'Beleg abgelegt'], out: 'Rechnung für Beispiel GmbH erstellt und abgelegt.', to: 'data', result: 'Rechnung abgelegt' },
    ];

    // wires, drawn from where the pieces really are
    const wires = { in: {}, out: {} };
    const parcel = $('.parcel', stage);
    const makeWire = () => {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', 'wire');
      svg.appendChild(p);
      return p;
    };
    Object.keys(ins).forEach((k) => (wires.in[k] = makeWire()));
    Object.keys(outs).forEach((k) => (wires.out[k] = makeWire()));

    const layout = () => {
      const s = stage.getBoundingClientRect();
      if (!s.width) return;
      svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
      const rel = (el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left - s.left, r: r.right - s.left, t: r.top - s.top, b: r.bottom - s.top, cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2 };
      };
      const h = rel(head), rb = rel(robot), sc = rel(screen);
      const curveX = (a, b) => { const m = (b[0] - a[0]) * 0.5; return `M${a[0]} ${a[1]}C${a[0] + m} ${a[1]} ${b[0] - m} ${b[1]} ${b[0]} ${b[1]}`; };
      const curveY = (a, b) => { const m = (b[1] - a[1]) * 0.5; return `M${a[0]} ${a[1]}C${a[0]} ${a[1] + m} ${b[0]} ${b[1] - m} ${b[0]} ${b[1]}`; };
      Object.entries(ins).forEach(([k, n], i) => {
        const r = rel(n);
        const side = r.b > rb.t;
        wires.in[k].setAttribute('d', side ? curveX([r.r, r.cy], [h.l - 6, h.cy + (i - 1) * 16]) : curveY([r.cx, r.b], [rb.cx + (i - 1) * 8, rb.t - 4]));
      });
      Object.entries(outs).forEach(([k, n], i) => {
        const r = rel(n);
        const side = r.t < sc.b;
        wires.out[k].setAttribute('d', side ? curveX([sc.r, sc.cy + (i - 1) * 44], [r.l, r.cy]) : curveY([sc.cx + (i - 1) * 56, sc.b], [r.cx, r.t]));
      });
    };

    // one clock for the whole loop, so a pause holds everything at once
    const clock = { now: 0, last: 0, running: false, jobs: [] };
    const frame = (t) => {
      const dt = Math.min(50, t - (clock.last || t));
      clock.last = t;
      if (clock.running) {
        clock.now += dt;
        clock.jobs = clock.jobs.filter((job) => {
          const p = Math.min(1, (clock.now - job.start) / job.dur);
          if (job.step) job.step(p);
          if (p < 1) return true;
          job.done();
          return false;
        });
      }
      requestAnimationFrame(frame);
    };
    const tween = (dur, step) => new Promise((done) => clock.jobs.push({ start: clock.now, dur: Math.max(1, dur), step, done }));
    const wait = (ms) => tween(ms);
    const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

    const flash = (el, cls, ms) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); return wait(ms).then(() => el.classList.remove(cls)); };
    const look = (x, y) => { robot.style.setProperty('--look-x', x + 'px'); robot.style.setProperty('--look-y', y + 'px'); };
    // two parcels, so a result can leave while the next task is already on its way in
    const parcelOut = parcel.cloneNode(true);
    parcel.after(parcelOut);
    const travel = async (el, wire, ms, icon, text) => {
      const len = wire.getTotalLength();
      $('use', el).setAttribute('href', '#i-' + icon);
      $('span', el).textContent = text;
      const w = el.offsetWidth, h = el.offsetHeight;
      const place = (p) => {
        const pt = wire.getPointAtLength(len * ease(p));
        el.style.transform = `translate(${pt.x - w / 2}px, ${pt.y - h / 2}px)`;
      };
      place(0);
      wire.classList.add('is-live');
      el.classList.add('is-on');
      await tween(ms, place);
      el.classList.remove('is-on');
      wire.classList.remove('is-live');
    };
    const type = (el, text, ms) => tween(ms, (p) => { el.textContent = text.slice(0, Math.round(text.length * p)); });
    const note = (node, text) => { $('.node__note', node).textContent = text; };

    // a task comes in
    const inbound = async (task) => {
      const source = ins[task.from];
      note(source, task.name);
      source.classList.add('is-active');
      await travel(parcel, wires.in[task.from], 760, task.icon, task.name);
      source.classList.remove('is-active');
      flash(robot, 'is-pulse', 420);
    };

    // the robot works it on screen
    const work = async (task) => {
      taskIcon.setAttribute('href', '#i-' + task.icon);
      taskName.textContent = task.name;
      steps.forEach((li, i) => { li.dataset.s = 'todo'; li.lastElementChild.textContent = task.steps[i]; });
      out.textContent = '';
      say.textContent = 'arbeitet';
      robot.classList.remove('is-happy');
      robot.classList.add('is-typing');
      for (let i = 0; i < steps.length; i++) {
        look(9, (i - 1) * 5);
        steps[i].dataset.s = 'run';
        if (i === 1) await type(out, task.out, 640); else await wait(400);
        steps[i].dataset.s = 'done';
        flash(robot, 'is-blink', 130);
        await wait(90);
      }
      robot.classList.remove('is-typing');
    };

    // done: the result goes out
    const outbound = async (task) => {
      const target = outs[task.to];
      say.textContent = 'erledigt';
      robot.classList.add('is-happy');
      target.classList.add('is-active');
      await travel(parcelOut, wires.out[task.to], 760, 'check', task.result);
      note(target, task.result);
      await wait(380);
      target.classList.remove('is-active');
    };

    const state = { seen: false, held: false, shown: !document.hidden };
    const sync = () => {
      clock.running = state.seen && state.shown && !state.held && !reduced.matches;
      stage.classList.toggle('is-running', clock.running);
      if (heroLight) heroLight.classList.toggle('is-still', !clock.running);
      $('use', toggleBtn).setAttribute('href', state.held ? '#i-play' : '#i-pause');
      $('span', toggleBtn).textContent = state.held ? 'Weiter' : 'Pause';
    };
    toggleBtn.addEventListener('click', () => { state.held = !state.held; sync(); });
    document.addEventListener('visibilitychange', () => { state.shown = !document.hidden; sync(); });
    new IntersectionObserver(([e]) => { state.seen = e.isIntersecting; sync(); }, { threshold: 0.2 }).observe(stage);
    reduced.addEventListener('change', sync);

    const start = async () => {
      layout();
      stage.classList.add('is-built');
      if ('ResizeObserver' in window) new ResizeObserver(layout).observe(stage);
      addEventListener('resize', layout);
      if (reduced.matches) return;
      requestAnimationFrame(frame);
      look(0, 0);
      say.textContent = 'wartet';
      await wait(700);
      await inbound(tasks[0]);
      for (let i = 0; ; i++) {
        await work(tasks[i % tasks.length]);
        // traffic: the result leaves while the next task is already arriving
        await Promise.all([outbound(tasks[i % tasks.length]), wait(260).then(() => inbound(tasks[(i + 1) % tasks.length]))]);
      }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  }

  /* ---------- light and dark ---------- */
  const modeBtn = $('.nav__mode');
  if (modeBtn) {
    modeBtn.addEventListener('click', () => {
      const dark = document.documentElement.dataset.mode !== 'dark';
      if (dark) document.documentElement.dataset.mode = 'dark'; else delete document.documentElement.dataset.mode;
      try { localStorage.setItem('lnw-mode', dark ? 'dark' : 'light'); } catch (err) { /* private mode: the choice lasts for this visit */ }
      paintLights();
    });
  }

  /* ---------- reveals and the statement that fills in on scroll ---------- */
  const reveals = $$('[data-reveal]');
  if (reveals.length) {
    if (reduced.matches || !('IntersectionObserver' in window)) reveals.forEach((el) => el.classList.add('is-in'));
    else {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }), { rootMargin: '0px 0px -12% 0px' });
      reveals.forEach((el) => io.observe(el));
    }
  }

  const scrub = $('[data-scrub]');
  if (scrub && !reduced.matches) {
    const words = scrub.textContent.trim().split(/\s+/);
    scrub.setAttribute('aria-label', words.join(' '));
    scrub.innerHTML = words.map((w) => `<span aria-hidden="true">${w}</span>`).join(' ');
    const spans = $$('span', scrub);
    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = scrub.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.88 - r.top) / (innerHeight * 0.5)));
      spans.forEach((sp, i) => sp.style.setProperty('--o', (0.18 + 0.82 * Math.min(1, Math.max(0, p * (spans.length + 2) - i))).toFixed(3)));
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener('resize', paint);
    paint();
  }

  $$('.tile').forEach((tile) => tile.addEventListener('pointermove', (e) => {
    const r = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', e.clientX - r.left + 'px');
    tile.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  /* ---------- playable pieces: once on view, again on hover or tap ---------- */
  const playables = $$('[data-play]');
  const run = (el) => {
    if (el.dataset.busy) return;
    el.dataset.busy = '1';
    el.classList.remove('is-playing');
    void el.offsetWidth;
    el.classList.add('is-playing');
    setTimeout(() => delete el.dataset.busy, Number(el.dataset.play) || 2500);
  };
  if (playables.length) {
    if (reduced.matches || !('IntersectionObserver' in window)) {
      playables.forEach((el) => el.classList.add('is-playing'));
    } else {
      const seen = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        run(e.target);
        seen.unobserve(e.target);
      }), { threshold: 0.4 });
      playables.forEach((el) => seen.observe(el));
    }
    $$('.tile[data-play]').forEach((tile) => {
      tile.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && tile.classList.contains('is-playing')) run(tile); });
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
})();
