# Implementation and library selection

[English](implementation.md) | [简体中文](../../references/implementation.md)

## Included native baseline

Keep `assets/demo/index.html`, `glass.css`, `glass.js`, `demo.css`, `demo.js`, and `lens-map.js` in the same directory to open the demo directly. Production integration normally takes only `glass.css` and `glass.js`, adding `lens-map.js` when refraction enhancement is needed. The two demo files handle showcase layout and controls. The global objects are `GlassUI` and `GlassLens`; no bundler or network dependency is required.

```html
<link rel="stylesheet" href="glass.css">
<div data-glass-card>
  <article class="glass" data-glass-face>
    <span class="glass__light" aria-hidden="true"></span>
    <span class="glass__edge" aria-hidden="true"></span>
    <div class="glass__content">Your content</div>
  </article>
</div>
<script src="glass.js"></script>
<script>
  const disposeGlass = GlassUI.mount(document);
  // Call disposeGlass() when unmounting; do not mount the same node twice.
</script>
```

See `data-glass-tabs` in the demo for pill markup: one `[data-glass-pill]`, multiple `[role=tab]` buttons, and `[role=tabpanel]` elements linked through `aria-controls`. The controller emits `glass:change` with `id` and `index` in `event.detail`. It supports ArrowLeft/Right and Home/End, using Up/Down in vertical mode. Clicking a tab shows its associated panel. For real routing, use links and aria-current instead of copying tablist semantics unchanged.

`GlassUI.mount(root)` returns a cleanup function that removes listeners and observers and cancels RAF. Set `data-glass-motion="off"` to disable motion manually; system reduced-motion preferences apply automatically. `GlassUI.math.tiltAt` and `normalAngle` are pure calculation entrypoints for testing.

Optionally set `data-refraction="true"` on `[data-glass-tabs]` and load `lens-map.js` before mounting. The demo disables enhancement by default; users can explicitly enable it on the materials page. A separate SVG background in the same page's grid-lens experiment demonstrates displacement against the base version. Confirm SVG backdrop behavior on arbitrary page backgrounds through screenshots in target browsers.

## Additional integration capabilities

- Vertical tabs: set `aria-orientation="vertical"` for springs, stretch, and alignment along the vertical axis. Up/Down and Home/End skip disabled items. Horizontal RTL uses the corresponding arrow semantics. Do not disguise routes or radio controls as tabs merely to get a pill.
- Known images: load `image-lens.js` after `glass.js` and call `GlassImage.mount(container)`. See [rendering and performance](rendering-and-performance.md) for markup and source requirements. Dispose each instance independently; this route never captures arbitrary DOM.
- Quality/readability: set `data-glass-quality="full|balanced|static"` and `data-glass-transparency="reduced"` on a common ancestor. The vertical bars denote alternatives; use one actual value. The baseline reacts to attribute and system preference changes.
- Platform examples: `assets/adapters/flutter/glass_surface.dart` and `assets/adapters/miniprogram/glass-view/`. See [platform adapters](platform-adapters.md) for integration and validation limits.

For page styling, consult [design decisions](design-system.md). More blur or repeated highlights alone do not create useful hierarchy.

## React, Vue, and Svelte

- Let the framework own checked, selected, and panel state. Extract the native controller's algorithms into a hook, composable, or action; do not let both a DOM controller and the framework write the same state.
- Measure after effect/mounted and disconnect observers, media query listeners, and RAF during cleanup/unmounted. Do not access window/document during SSR. Keep the static selected item visible before hydration.
- Scope CSS variables to each instance. Use stable framework IDs for filters; multiple instances must not reuse a fixed ID.
- Do not update component state on every pointermove. Store values in refs and write decorative layer variables per frame. An existing animation library may replace the internal spring while retaining angle limits and continuous retargeting.
- In Tailwind projects, put shared tokens in the theme layer. Keep complex mask/backdrop styles in component CSS rather than long, hard-to-maintain strings of arbitrary values.

## Choosing libraries

This table identifies candidates; it is **not a latest-version or compatibility guarantee**. Before installing, read the repository or official documentation and license, then run a minimal target-browser check. Do not add dependencies without a reason.

| Need | Candidate and official entrypoint | Considerations |
| --- | --- | --- |
| Spotlight cards | [Magic UI Magic Card](https://magicui.design/docs/components/magic-card) | Provides lighting and edges; do not describe it as an optical refraction library |
| React glass containers | [rdev/liquid-glass-react](https://github.com/rdev/liquid-glass-react) | Documents displacement, blur, and aberration; the repository notes limited displacement in Safari/Firefox, which must be rechecked when integrating |
| React glass surfaces and icons | [React Bits](https://reactbits.dev/components/glass-surface) | Inspect current source, dependencies, license, and variants; do not assume every component shares one API |
| Glass navigation components | [Glisse](https://glisse.kelvinzhang.ca/) | Verify that TabBar/SegmentedControl meets sizing, keyboard, and existing architecture requirements |
| Shared layout and springs | [Motion](https://motion.dev/docs/react-layout-animations) | Handles motion, not glass material or directional extension automatically; keep layoutId unique within its group |
| Native refraction scenes | [liquidGL](https://github.com/naughtyduk/liquidGL) | Check the current backend, snapshot cost, dynamic content handling, and resource limits |
| Thick 3D glass | [Drei MeshTransmissionMaterial](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material) | For Three.js/R3F scenes; not a filter for an entire DOM page |

## Sources and validation

These official reference links were collected on November 21, 2026. Browsers and libraries evolve; do not freeze a claim of the “latest version” in the skill.

- [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter): processes the image behind an element and needs a translucent surface for the effect to be visible.
- [MDN feDisplacementMap](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap): RG displacement mapping, whose midpoint is affected by color space.
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): responds to system motion preferences.
- [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): focus, selection, and panel associations.

If blur is unavailable, increase surface alpha. If SVG backdrop has no visible effect, disable `data-refraction` and retain blur, edges, and shadows. Do not fake a text layer or copy user content to pretend arbitrary backgrounds are correctly refracted.
