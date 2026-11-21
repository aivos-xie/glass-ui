/* Glass UI controllers. No framework, no dependencies; call cleanup on unmount. */
(function (global) {
  'use strict';
  const mounted = new WeakMap();
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const rad = Math.PI / 180;
  const normalAngle = (x, y) => Math.acos(clamp(Math.cos(x * rad) * Math.cos(y * rad), -1, 1)) / rad;
  function tiltAt(u, v, max = 4) {
    max = clamp(max, 0, 4);
    let x = -clamp(v, -1, 1) * max, y = clamp(u, -1, 1) * max;
    const length = Math.hypot(x, y);
    if (length > max) { x *= max / length; y *= max / length; }
    const angle = normalAngle(x, y);
    if (angle > max && angle > 0) { x *= max / angle; y *= max / angle; }
    return { x, y };
  }
  function watchMotion(element, callback) {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const transparency = matchMedia('(prefers-reduced-transparency: reduce)');
    const contrast = matchMedia('(prefers-contrast: more)');
    const forced = matchMedia('(forced-colors: active)');
    const current = () => {
      const quality = element.closest('[data-glass-quality]')?.getAttribute('data-glass-quality') || 'full';
      const solid = transparency.matches || contrast.matches || forced.matches || quality === 'static' ||
        !!element.closest('[data-glass-transparency="reduced"], [data-no-blur]');
      return { reduced: media.matches || quality === 'static' || !!element.closest('[data-glass-motion="off"]'),
        fine: fine.matches, quality, solid, enhanced: quality === 'full' && !solid };
    };
    const notify = () => callback(current());
    const queries = [media, fine, transparency, contrast, forced];
    queries.forEach(query => query.addEventListener('change', notify));
    const observer = new MutationObserver(notify);
    // Observe ancestors only, so per-frame style changes on descendants never trigger this observer.
    for (let node = element; node; node = node.parentElement) observer.observe(node, { attributes: true,
      attributeFilter: ['data-glass-motion', 'data-glass-quality', 'data-glass-transparency', 'data-no-blur'] });
    return { current, dispose() { queries.forEach(query => query.removeEventListener('change', notify)); observer.disconnect(); } };
  }
  function card(host) {
    const face = host.querySelector('[data-glass-face]');
    if (!face) return () => {};
    const abort = new AbortController(), on = { signal: abort.signal, passive: true };
    let raf = 0, last = 0, disposed = false, hovered = false, active = false, pendingPoint = null;
    let x = 0, y = 0, lit = 0, tx = 0, ty = 0, tlit = 0;
    function write() {
      face.style.setProperty('--g-rx', `${x.toFixed(4)}deg`);
      face.style.setProperty('--g-ry', `${y.toFixed(4)}deg`);
      face.style.setProperty('--g-lit', lit.toFixed(4));
    }
    function reset(immediate = false) {
      hovered = false; pendingPoint = null; tx = ty = tlit = 0;
      if (immediate) { x = y = lit = 0; cancelAnimationFrame(raf); raf = 0; last = 0; face.style.willChange = ''; write(); }
      else kick();
    }
    const motion = watchMotion(host, ({ reduced, fine }) => { active = !reduced && fine; if (!active) reset(true); });
    active = !motion.current().reduced && motion.current().fine;
    function tick(time) {
      if (disposed) return;
      raf = 0;
      const dt = Math.min(last ? time - last : 16.67, 100); last = time;
      if (pendingPoint && active) {
        const rect = host.getBoundingClientRect();
        if (rect.width && rect.height) {
          const px = clamp(pendingPoint.x - rect.left, 0, rect.width), py = clamp(pendingPoint.y - rect.top, 0, rect.height);
          const t = tiltAt(px / rect.width * 2 - 1, py / rect.height * 2 - 1);
          tx = t.x; ty = t.y; tlit = 1;
          face.style.setProperty('--g-mx', `${px}px`); face.style.setProperty('--g-my', `${py}px`);
        }
        pendingPoint = null;
      }
      const alpha = 1 - Math.exp(-dt / (hovered ? 70 : 100));
      x += (tx - x) * alpha; y += (ty - y) * alpha; lit += (tlit - lit) * alpha;
      // Convex smoothing normally stays in the limit; clamp round-off as well.
      const a = normalAngle(x, y); if (a > 4) { x *= 4 / a; y *= 4 / a; }
      const settling = Math.abs(x - tx) + Math.abs(y - ty) + Math.abs(lit - tlit) > .002;
      if (!settling) { x = tx; y = ty; lit = tlit; }
      write();
      if (settling || pendingPoint) raf = requestAnimationFrame(tick);
      else { last = 0; face.style.willChange = ''; }
    }
    function kick() { if (!raf && !disposed) { face.style.willChange = 'transform'; raf = requestAnimationFrame(tick); } }
    host.addEventListener('pointermove', event => {
      if (!active || event.pointerType === 'touch') return;
      hovered = true; pendingPoint = { x: event.clientX, y: event.clientY }; kick();
    }, on);
    host.addEventListener('pointerleave', () => reset(), on);
    host.addEventListener('pointercancel', () => reset(), on);
    global.addEventListener('blur', () => reset(), on);
    document.addEventListener('visibilitychange', () => { if (document.hidden) reset(true); }, on);
    return () => { disposed = true; abort.abort(); motion.dispose(); cancelAnimationFrame(raf); face.style.willChange = ''; x = y = lit = 0; write(); };
  }
  // The host owns selection, navigation, keyboard behavior, and panels.
  function mountSelectionPill(track, { vertical = false } = {}) {
    const pill = track.querySelector(':scope > [data-glass-pill]');
    if (!pill) return { select() {}, setPressed() {}, dispose() {} };
    pill.setAttribute('aria-hidden', 'true');
    pill.dataset.glassPillAxis = vertical ? 'vertical' : 'horizontal';
    pill.style.visibility = 'hidden';
    let l = 0, r = 0, vl = 0, vr = 0, naturalWidth = 0, widthVelocity = 0, targetL = 0, targetR = 0, targetY = 0, targetH = 0;
    let direction = 1, raf = 0, last = 0, ready = false, disposed = false, held = false, reduced = false, enhanced = true;
    let selected = null;
    const lens = global.GlassLens?.attach(pill);
    function measure(snap = false) {
      if (disposed) return;
      if (!selected || !track.contains(selected) || !selected.isConnected) {
        pill.style.visibility = 'hidden'; ready = false;
        cancelAnimationFrame(raf); raf = 0; last = 0; return;
      }
      const a = track.getBoundingClientRect(), b = selected.getBoundingClientRect();
      if (!a.width || !a.height || !b.width || !b.height) {
        pill.style.visibility = 'hidden'; ready = false;
        cancelAnimationFrame(raf); raf = 0; last = 0; return;
      }
      pill.style.visibility = '';
      targetL = vertical ? b.top - a.top - track.clientTop + track.scrollTop : b.left - a.left - track.clientLeft + track.scrollLeft;
      targetR = targetL + (vertical ? b.height : b.width);
      targetY = vertical ? b.left - a.left - track.clientLeft + track.scrollLeft : b.top - a.top - track.clientTop + track.scrollTop;
      targetH = vertical ? b.width : b.height;
      direction = (targetL + targetR) / 2 >= (l + r) / 2 ? 1 : -1;
      if (snap || reduced || !ready) {
        l = targetL; r = targetR; naturalWidth = targetR - targetL; vl = vr = widthVelocity = 0; ready = true;
        cancelAnimationFrame(raf); raf = 0; last = 0; paint(); resizeLens();
      } else kick();
    }
    function paint() {
      const speed = Math.abs(vl + vr) / 2;
      pill.style.setProperty('--g-pill-x', `${l.toFixed(3)}px`);
      pill.style.setProperty('--g-pill-w', `${Math.max(r - l, 1).toFixed(3)}px`);
      pill.style.setProperty('--g-pill-y', reduced ? '1' : String(held ? 1.035 : 1 - Math.min(speed / 17000, .035)));
      pill.style.top = vertical ? '0px' : `${targetY}px`;
      pill.style.left = vertical ? `${targetY}px` : '0px';
      pill.style.width = vertical ? `${targetH}px` : 'var(--g-pill-w)';
      pill.style.height = vertical ? 'var(--g-pill-w)' : `${targetH}px`;
    }
    function resizeLens() { lens?.resize(vertical ? targetH : r - l, vertical ? r - l : targetH); }
    function tick(time) {
      raf = 0; if (disposed) return;
      let remaining = Math.min(last ? (time - last) / 1000 : 1 / 60, .1); last = time;
      // Small fixed maximum steps keep spring stable across refresh rates and long frames.
      while (remaining > 0) {
        const dt = Math.min(remaining, 1 / 120); remaining -= dt;
        widthVelocity += ((targetR - targetL - naturalWidth) * 240 - widthVelocity * 28) * dt;
        naturalWidth += widthVelocity * dt;
        const moveSpeed = Math.abs((vl + vr) / 2);
        const extra = Math.min(moveSpeed * .006, (targetR - targetL) * .12);
        const leftGoal = targetL - (direction < 0 ? extra : 0), rightGoal = targetR + (direction > 0 ? extra : 0);
        const kl = direction < 0 ? 290 : 190, kr = direction > 0 ? 290 : 190;
        vl += ((leftGoal - l) * kl - vl * (direction < 0 ? 27 : 23)) * dt;
        vr += ((rightGoal - r) * kr - vr * (direction > 0 ? 27 : 23)) * dt;
        l += vl * dt; r += vr * dt;
        // Preserve leading-edge stretch without elongating across the entire jump.
        const minW = naturalWidth * .88, maxW = naturalWidth * 1.12;
        if (r - l > maxW) { if (direction > 0) { l = r - maxW; vl = Math.max(vl, vr); } else { r = l + maxW; vr = Math.min(vr, vl); } }
        if (r - l < minW) { const center = (l + r) / 2; l = center - minW / 2; r = center + minW / 2; }
      }
      const moving = Math.abs(l - targetL) + Math.abs(r - targetR) + Math.abs(naturalWidth - (targetR - targetL)) > .04 || Math.abs(vl) + Math.abs(vr) + Math.abs(widthVelocity) > .4;
      if (!moving) { l = targetL; r = targetR; naturalWidth = r - l; vl = vr = widthVelocity = 0; last = 0; resizeLens(); }
      paint(); if (moving) raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf && !disposed) raf = requestAnimationFrame(tick); }
    function select(element) {
      if (disposed) return;
      if (element && (element === pill || !track.contains(element))) throw new TypeError('Selection target must be an item inside its track.');
      if (selected !== element) {
        if (selected) observer.unobserve(selected);
        selected = element || null;
        if (selected) observer.observe(selected);
      }
      measure();
    }
    function setPressed(value) {
      if (disposed) return;
      held = !reduced && !!value;
      if (ready) paint();
    }
    const motion = watchMotion(track, value => {
      reduced = value.reduced; enhanced = value.enhanced;
      if (reduced) held = false;
      lens?.setEnabled(track.dataset.refraction === 'true' && !reduced && enhanced);
      measure(true);
    });
    reduced = motion.current().reduced; enhanced = motion.current().enhanced;
    const observer = new ResizeObserver(() => measure());
    observer.observe(track);
    const attributeObserver = new MutationObserver(() => {
      lens?.setEnabled(track.dataset.refraction === 'true' && !reduced && enhanced);
      measure(true);
    });
    attributeObserver.observe(track, { attributes: true, attributeFilter: ['data-refraction'] });
    lens?.setEnabled(track.dataset.refraction === 'true' && !reduced && enhanced);
    const fonts = () => measure(true);
    document.fonts?.addEventListener('loadingdone', fonts);
    return { select, setPressed, dispose() {
      if (disposed) return;
      disposed = true; motion.dispose(); observer.disconnect(); attributeObserver.disconnect();
      document.fonts?.removeEventListener('loadingdone', fonts); cancelAnimationFrame(raf); lens?.dispose();
    } };
  }
  function tabs(track) {
    const items = [...track.querySelectorAll('[role="tab"]')].filter(el => el.closest('[data-glass-tabs]') === track);
    if (!track.querySelector('[data-glass-pill]')) {
      console.warn('[glass-ui] [data-glass-tabs] requires a direct [data-glass-pill] child; tabs controller skipped.');
      return () => {};
    }
    if (!items.length) return () => {};
    const abort = new AbortController(), on = { signal: abort.signal };
    const vertical = track.getAttribute('aria-orientation') === 'vertical';
    const decoration = mountSelectionPill(track, { vertical });
    let selected = Math.max(0, items.findIndex(el => el.getAttribute('aria-selected') === 'true'));
    function syncSemantics() {
      items.forEach((item, index) => {
        const yes = index === selected;
        item.setAttribute('aria-selected', String(yes)); item.tabIndex = yes ? 0 : -1;
        const panel = document.getElementById(item.getAttribute('aria-controls'));
        if (panel) panel.hidden = !yes;
      });
    }
    function select(index, focus = false) {
      if (items[index]?.disabled) return;
      const changed = selected !== index; selected = index;
      syncSemantics(); decoration.select(items[selected]);
      if (focus) items[index].focus({ preventScroll: true });
      if (changed) track.dispatchEvent(new CustomEvent('glass:change', { bubbles: true, detail: { index, id: items[index].id } }));
    }
    syncSemantics(); decoration.select(items[selected]);
    const itemObserver = new ResizeObserver(() => decoration.select(items[selected]));
    items.forEach(item => itemObserver.observe(item));
    items.forEach((item, index) => {
      item.addEventListener('click', () => select(index), on);
      item.addEventListener('pointerdown', () => decoration.setPressed(true), on);
    });
    const release = () => decoration.setPressed(false);
    global.addEventListener('pointerup', release, on); global.addEventListener('pointercancel', release, on); global.addEventListener('blur', release, on);
    track.addEventListener('keydown', event => {
      const allowed = vertical ? ['ArrowUp', 'ArrowDown', 'Home', 'End'] : ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!allowed.includes(event.key)) return;
      event.preventDefault();
      const enabled = items.map((el,i) => el.disabled ? -1 : i).filter(i => i >= 0);
      if (!enabled.length) return;
      const dir = getComputedStyle(track).direction === 'rtl' && !vertical ? -1 : 1;
      const step = (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) * dir;
      const index = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1) : enabled[(enabled.indexOf(selected) + step + enabled.length) % enabled.length];
      select(index, true);
    }, on);
    return () => { abort.abort(); itemObserver.disconnect(); decoration.dispose(); };
  }
  function mount(root = document) {
    const cleanups = [];
    const all = selector => [...(root.matches?.(selector) ? [root] : []), ...root.querySelectorAll(selector)];
    for (const [selector, controller] of [['[data-glass-card]', card], ['[data-glass-tabs]', tabs]]) {
      all(selector).forEach(element => {
        if (mounted.has(element)) return;
        const dispose = controller(element); mounted.set(element, dispose);
        cleanups.push(() => { dispose(); mounted.delete(element); });
      });
    }
    return () => cleanups.splice(0).forEach(dispose => dispose());
  }
  global.GlassUI = Object.freeze({ mount, mountSelectionPill, observePreferences: watchMotion, math: Object.freeze({ tiltAt, normalAngle }) });
})(window);
