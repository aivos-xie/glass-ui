# Materials and motion

[English](materials-and-motion.md) | [简体中文](../../references/materials-and-motion.md)

## Layering

Back to front: a varied scene background → background processing layer → translucent tint → thickness and shadow → fine edge highlights → pointer spotlight → content and focus indicators. Background processing and content must be siblings; do not apply `filter` to a content ancestor. Set decorative layers to `pointer-events: none` and `aria-hidden="true"`.

Glass needs visible background detail. A transparent white card on solid white provides few material cues. Prefer the existing background; a showcase may use static, soft color shapes, but a business page does not need gradient spheres. Decoration must not overpower the information hierarchy.

## Starting presets

| Material | Use | Light surface alpha | Blur | Edges and refraction |
| --- | --- | --- | --- | --- |
| Light glass | Inputs, small buttons, option tracks | .45–.65 | 8–12px | Fine border; no displacement by default |
| Frosted | Panels, cards, menus | .48–.75 | 16–24px | Soft light and restrained inner highlights |
| Clear liquid | Shared pills, switch thumbs | .16–.35 | 3–8px | Edge thickness and optional local refraction |
| Tinted | Primary buttons, tags, selected states | .15–.30 brand color | 12–20px | Preserve text contrast and include a graphic state marker |
| Prism | Accent component edges | Same as clear liquid | Same as clear liquid | Very narrow colored edges, never a full rainbow surface |

Define surface, ink, muted, border, and shadow tokens separately for dark mode; do not just invert the background. These values are tuning starting points, not mandatory styling. Override the tokens in `assets/demo/glass.css` as needed.

Ribbed or embossed glass, water ripples, and 3D crystal are advanced presets. Add custom displacement maps or WebGL materials only when requested and explain the additional implementation needed. The included demo does not claim to provide these effects.

## Pointer-responsive cards

The fixed outer `[data-glass-card]` receives `pointermove` and supplies the measured rectangle. The inner `[data-glass-face]` transforms. Batch layout reads before writing CSS variables to avoid repeated layout work. Refresh measurements through ResizeObserver, scrolling, or the next valid event. Stop requestAnimationFrame (RAF) when the page is at rest.

Let the normalized position relative to the center be `u,v ∈ [-1,1]`, mapped to `rx=-v, ry=u`. Limit the combined angle, not just each axis. For a maximum `m=4π/180`, calculate `a=abs(rx*m), b=abs(ry*m)`, constrain the vector to radius `m`, then check the actual normal deviation with `acos(cos(a)*cos(b))`. The example controller applies an additional proportional correction so corners also remain within 4°.

Use time-based smoothing, `a = 1 - exp(-dt/τ)`, so refresh rate does not change the feel. Default tilt uses τ≈70ms; reset uses τ≈100ms and approaches rest within about 350ms. Clear the target on pointer exit, `pointercancel`, window blur, and page hiding. Reset immediately when `prefers-reduced-motion` changes. Do not enable pointer-following tilt for coarse pointers.

Start with a spotlight around 160px and alpha .08–.16. Mask border lighting to a 1px ring. A whole-card `box-shadow` is not a local edge spotlight. Without mask support, retain a normal fine border.

## Shared selection pill

Use one absolutely positioned pill, with buttons and text on a separate layer. Actual option widths and positions determine its resting target; do not hardcode equal widths. Work in track content coordinates, accounting for borders, padding, and horizontal scrolling.

The example uses separate springs for the left and right edges. Moving right makes the right edge slightly stiffer and the left edge softer; moving left reverses this. Limit velocity-dependent extension to about 12% of target width. Apply any small height compression only to the background. Calculate spring steps in seconds and cap large frame intervals to prevent jumps when resuming a background tab. The settling threshold limits position error to ≤.35px. Framework implementations may use an existing Motion spring.

Repeated clicks must not restart from the old option. New targets inherit both edges' current positions and velocities. Remeasure and align immediately after size changes; align directly under reduced motion. Dragging is optional and cannot replace click or keyboard interaction. The included baseline supports clicks, keyboard control, and pressed expansion; it does not implement drag-to-select.

## Refraction enhancement

Use `backdrop-filter: blur(...)` as the baseline. The example enhancement uses `backdrop-filter: url(#...) blur(...)`. SVG `feImage` supplies an RG displacement map generated from rounded-edge distance, and `feDisplacementMap` changes background sampling only near the edges.

- An RG midpoint around 128 represents zero displacement. Near curved edges, vary RG along the normal; keep the center almost neutral.
- Use `color-interpolation-filters="sRGB"` to match the generated map and prevent color-space conversion from shifting its neutral value.
- Update map dimensions to match actual component dimensions. Use unique instance IDs for multiple independent pills.
- SVG displacement is a visual approximation, not an optical simulation. CSS prism borders are not true RGB-channel dispersion. Use an appropriate shader or library for real dispersion and validate it separately.
- `CSS.supports` checks syntax only. Even after the user explicitly enables the enhancement, compare screenshots against a text and grid background. Fall back to the base layer if it does not work.
- Never apply an ordinary `filter: url(...)` to text nodes or button containers; that would deform the foreground as well.

Disable expansion, displacement, and spring bounce under reduced motion. Under `forced-colors`, use solid borders and selection markers in system colors. Without backdrop support, increase surface opacity and preserve the complete structure.

Keep the ordinary SVG known-image route separate from arbitrary-DOM backdrop filtering; see [rendering and performance](rendering-and-performance.md). Vertical pills use the same leading/trailing-edge logic on the vertical axis, without deforming foreground text. Increased contrast or reduced transparency uses a stable solid fill and disables displacement rather than merely slowing animation.
