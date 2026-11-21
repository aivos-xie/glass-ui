/* Optional edge displacement. CSS backdrop support must be visually verified. */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  let nextId = 0;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const node = (name, attrs) => {
    const element = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([key, value]) => element.setAttribute(key, String(value)));
    return element;
  };
  function displacementMap(width, height, radius = height / 2) {
    width = Math.max(2, Math.round(width)); height = Math.max(2, Math.round(height));
    // Limit work for large panels. The filter scales the map to the actual bounds.
    const ratio = Math.min(1, 600 / width, 240 / height);
    const w = Math.max(2, Math.round(width * ratio)), h = Math.max(2, Math.round(height * ratio));
    const r = Math.min(radius * ratio, w / 2, h / 2), band = Math.max(5, Math.min(h * .28, 22));
    const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d'), image = ctx.createImageData(w, h);
    const distance = (x, y) => {
      const qx = Math.abs(x - w / 2) - (w / 2 - r), qy = Math.abs(y - h / 2) - (h / 2 - r);
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4, d = distance(x + .5, y + .5);
      let vx = 0, vy = 0;
      if (d <= 1 && d > -band) {
        const nx = distance(x + 1, y + .5) - distance(x, y + .5), ny = distance(x + .5, y + 1) - distance(x + .5, y);
        const len = Math.hypot(nx, ny) || 1;
        const strength = Math.pow(Math.cos(clamp(-d / band, 0, 1) * Math.PI / 2), 2) * .46;
        vx = nx / len * strength; vy = ny / len * strength;
      }
      // Sample inward at the outer edge, producing local magnification.
      image.data[p] = Math.round((.5 - vx) * 255);
      image.data[p + 1] = Math.round((.5 - vy) * 255);
      image.data[p + 2] = 128; image.data[p + 3] = 255;
    }
    ctx.putImageData(image, 0, 0); return canvas.toDataURL('image/png');
  }
  function createFilter() {
    const id = `glass-lens-${++nextId}`;
    const svg = node('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' });
    svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none;overflow:hidden';
    const defs = node('defs'), filter = node('filter', { id, x: 0, y: 0, width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' });
    const map = node('feImage', { x: 0, y: 0, width: '100%', height: '100%', preserveAspectRatio: 'none', result: 'edge-map' });
    const displacement = node('feDisplacementMap', { in: 'SourceGraphic', in2: 'edge-map', scale: 20, xChannelSelector: 'R', yChannelSelector: 'G' });
    filter.append(map, displacement); defs.append(filter); svg.append(defs); document.body.append(svg);
    let dimensions = '';
    return {
      id,
      region(width, height) {
        filter.setAttribute('filterUnits', 'userSpaceOnUse');
        filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
        // Extra input bounds let the curved edge sample beyond the visible lens.
        filter.setAttribute('x', -32); filter.setAttribute('y', -32);
        filter.setAttribute('width', width + 64); filter.setAttribute('height', height + 64);
        map.setAttribute('width', width); map.setAttribute('height', height);
      },
      update(width, height) {
        const key = `${Math.round(width)}:${Math.round(height)}`;
        if (width < 1 || height < 1 || key === dimensions) return;
        dimensions = key;
        map.setAttribute('href', displacementMap(width, height));
        displacement.setAttribute('scale', String(Math.min(24, height * .3)));
      },
      dispose() { svg.remove(); }
    };
  }
  function attach(element) {
    let filter, enabled = false, lastWidth = 0, lastHeight = 0;
    return {
      resize(width, height) { lastWidth = width; lastHeight = height; if (enabled) filter.update(width, height); },
      setEnabled(value) {
        enabled = !!value;
        if (enabled) {
          filter ||= createFilter();
          const bounds = element.getBoundingClientRect();
          filter.update(lastWidth || bounds.width, lastHeight || bounds.height);
          element.style.setProperty('--g-lens-filter', `url(#${filter.id})`);
        } else element.style.removeProperty('--g-lens-filter');
      },
      dispose() { filter?.dispose(); element.style.removeProperty('--g-lens-filter'); }
    };
  }
  global.GlassLens = Object.freeze({ attach, createFilter, displacementMap });
})(window);
