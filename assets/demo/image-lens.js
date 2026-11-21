/* Opt-in refraction of one known image. Never snapshots or clones live DOM. */
(function (global) {
  'use strict';
  const instances = new WeakMap();
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = value => Math.min(1, Math.max(0, Number.isFinite(Number(value)) ? Number(value) : .5));
  function mount(container) {
    if (instances.has(container)) return instances.get(container);
    const source = container.querySelector('[data-glass-source]');
    const frame = container.querySelector('[data-glass-lens]');
    if (!source || !frame || !global.GlassLens || !global.GlassUI) throw new Error('GlassImage requires an image, lens frame, GlassLens and GlassUI.');
    const svg = document.createElementNS(NS, 'svg'), image = document.createElementNS(NS, 'image');
    svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    svg.setAttribute('preserveAspectRatio', 'none'); image.setAttribute('preserveAspectRatio', 'none');
    svg.append(image); frame.append(svg); frame.setAttribute('aria-hidden', 'true');
    const abort = new AbortController(), on = { signal: abort.signal, passive: true };
    let x = .5, y = .5, requested = false, active = false, disposed = false, raf = 0, filter;
    let width = 0, height = 0, lensWidth = 0, lensHeight = 0, pending;
    const oldLeft = frame.style.left, oldTop = frame.style.top;
    function update() {
      if (disposed || !source.naturalWidth) return;
      const box = container.getBoundingClientRect(), picture = source.getBoundingClientRect(), lens = frame.getBoundingClientRect();
      if (!box.width || !box.height || !lens.width || !lens.height) return;
      width = box.width; height = box.height; lensWidth = lens.width; lensHeight = lens.height;
      const left = Math.max(0, width - lensWidth) * x, top = Math.max(0, height - lensHeight) * y;
      // The source uses object-fit: cover with a centered object-position.
      const scale = Math.max(picture.width / source.naturalWidth, picture.height / source.naturalHeight);
      const paintedWidth = source.naturalWidth * scale, paintedHeight = source.naturalHeight * scale;
      frame.style.left = `${left}px`; frame.style.top = `${top}px`;
      svg.setAttribute('viewBox', `0 0 ${lensWidth} ${lensHeight}`);
      image.setAttribute('x', String(picture.left - box.left + (picture.width - paintedWidth) / 2 - left));
      image.setAttribute('y', String(picture.top - box.top + (picture.height - paintedHeight) / 2 - top));
      image.setAttribute('width', String(paintedWidth)); image.setAttribute('height', String(paintedHeight));
      const href = source.currentSrc || source.src;
      if (image.getAttribute('href') !== href) image.setAttribute('href', href);
      if (active) {
        filter ||= global.GlassLens.createFilter();
        filter.region(lensWidth, lensHeight); filter.update(lensWidth, lensHeight);
        image.setAttribute('filter', `url(#${filter.id})`);
      } else image.removeAttribute('filter');
    }
    const preferences = global.GlassUI.observePreferences(container, value => { active = requested && !value.reduced && value.enhanced; update(); });
    function setEnabled(value) {
      requested = !!value;
      const state = preferences.current(); active = requested && !state.reduced && state.enhanced; update();
    }
    function setPosition(horizontal, vertical = y) { x = clamp(horizontal); y = clamp(vertical); update(); }
    container.addEventListener('pointermove', event => {
      const state = preferences.current();
      if (state.reduced || !state.fine || event.pointerType === 'touch') return;
      pending = { x: event.clientX, y: event.clientY };
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; if (disposed || !pending) return;
        const box = container.getBoundingClientRect();
        setPosition((pending.x - box.left - lensWidth / 2) / Math.max(1, width - lensWidth),
          (pending.y - box.top - lensHeight / 2) / Math.max(1, height - lensHeight));
        pending = null;
      });
    }, on);
    const cancel = () => { pending = null; cancelAnimationFrame(raf); raf = 0; };
    container.addEventListener('pointercancel', cancel, on);
    global.addEventListener('blur', cancel, on);
    source.addEventListener('load', update, on);
    const resize = new ResizeObserver(update); resize.observe(container); resize.observe(source); resize.observe(frame);
    const attributes = new MutationObserver(update); attributes.observe(source, { attributes: true, attributeFilter: ['src', 'srcset', 'sizes'] });
    update();
    const api = Object.freeze({ setEnabled, setPosition, refresh: update,
      getState: () => ({ enabled: active, requested, x, y, width, height, lensWidth, lensHeight }),
      dispose() {
        if (disposed) return;
        disposed = true; cancel(); abort.abort(); resize.disconnect(); attributes.disconnect(); preferences.dispose(); filter?.dispose();
        svg.remove(); frame.style.left = oldLeft; frame.style.top = oldTop; instances.delete(container);
      } });
    instances.set(container, api); return api;
  }
  global.GlassImage = Object.freeze({ mount });
})(window);
