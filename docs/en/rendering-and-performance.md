# Rendering routes, image lenses, and performance

[English](rendering-and-performance.md) | [简体中文](../../references/rendering-and-performance.md)

## Select by background source

| Scene | Route | Boundary |
| --- | --- | --- |
| Ordinary cards and reading surfaces | CSS tint, blur, edge, and shadow | Base material, not a claim of physical refraction |
| An owned static picture, illustration, or grid | Separate SVG image layer with edge displacement; included `image-lens.js` | Samples the specified image, not arbitrary DOM behind it |
| Navigation pills over arbitrary scrolling DOM | CSS baseline with optional SVG backdrop | `CSS.supports` checks syntax only; verify screenshots in target browsers |
| Video, Canvas, or 3D scenes | Texture/shader within the project's rendering pipeline | Additional implementation, CORS, and performance checks; the baseline contains no video/WebGL engine |
| Native UI or mini programs | Select capabilities using [platform adapters](platform-adapters.md) | Web selectors, filters, and browser guarantees do not transfer directly |

Enhancements process decorative backgrounds only. Never put `filter: url(...)` on an ancestor containing controls or foreground text. Do not clone forms, interactive DOM, user content, or entire pages to imitate backdrop refraction. An explicitly selected decorative image may be reused while real controls keep unique semantics and focus locations.

## Reusable known-image lens

Load `glass.css`, `lens-map.js`, `glass.js`, and `image-lens.js` in that order. Use a container with real dimensions, an original `<img data-glass-source>`, and an empty `<div data-glass-lens aria-hidden="true">`. See the [runnable example](../../assets/demo/index.html).

```js
const lens = GlassImage.mount(container);
lens.setEnabled(true);       // Subject to quality, motion, and transparency preferences
lens.setPosition(0.5, 0.5); // Normalized coordinates over the movable range
lens.refresh();             // Optional refresh after external layout changes
// Call lens.dispose() when unmounting
```

The source uses `object-fit: cover; object-position: center`. Keep padding and borders off the container and lens; use inset shadows or a separate decorative layer for edges. The module aligns the image copy to measured dimensions, observes resizing, and reuses the displacement map while moving. The demo provides a native range as a keyboard/touch alternative; the decorative lens does not intercept input. Use local files or resource URLs the browser can access. The module does not download, capture, or bypass source restrictions.

This route uses an ordinary SVG image filter, separately from experimental SVG backdrop filtering. Validation of one does not prove the other works.

## Quality and readability switches

Set these on a component or shared ancestor; `full` is the default. Native form semantics and business state remain intact.

| Setting | Effect |
| --- | --- |
| `data-glass-quality="full"` | Existing material and motion; refraction may be explicitly enabled |
| `data-glass-quality="balanced"` | Card blur capped at 10px, no refraction; base interactions remain |
| `data-glass-quality="static"` | Solid surfaces; no blur, tilt, springs, or displacement |
| `data-glass-transparency="reduced"` | Solid surfaces and no refraction; independent of motion preference |
| `data-glass-motion="off"` | No motion or displacement; static glass remains |

CSS and controllers respond to `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast: more`, and `forced-colors`. Explicit controls remain usable where a media query is unsupported. `GlassUI.observePreferences(element, callback)` returns `current()` and `dispose()`; current values include `reduced`, `fine`, `quality`, `solid`, and `enhanced`. Dispose observers when unmounting framework components.

## Performance and troubleshooting

- Check whether blur changes the actual background before paying for it. Static pictures may use preprocessed assets; do not require large generated backgrounds.
- Limit glass to useful regions. Prefer stable fills for dense lists, full-screen surfaces, and repeated nesting. Measure budgets on target devices rather than claiming a universal safe layer count.
- Regenerate displacement maps only for size changes; movement changes position only. The included generator limits maps to 600×240. Do not capture pages, create canvases, or rerender component trees every frame.
- Batch layout reads before writes. Use `will-change` briefly on moving elements, stop RAF at rest, and clean listeners, observers, filters, and RAF on disposal.
- Isolate corner clipping, filter input bounds, RG midpoint, sRGB, instance IDs, image decoding, and compositing from transform/opacity. Do not import another project's UA patches without a minimal reproduction.
- Compare base/enhanced screenshots at the same position, using pixel differences and edge detail. A color change or successfully assigned property is not proof of refraction. Use the [browser validator](../../scripts/validate_browser.mjs); see [validation](validation.md).
