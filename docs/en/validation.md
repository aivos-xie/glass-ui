# Validation

[English](validation.md) | [简体中文](../../references/validation.md)

## Minimum checks

1. Validate the original `SKILL.md` with skill-creator's `quick_validate.py` when available, and pass `python scripts/check_assets.py`.
2. Open the demo in target browsers and check for console errors and failed resource requests. Test a platform before claiming support, or identify it as untested.
3. Move the pointer across the card center, corners, and edges. Confirm clipped interior light, local edge highlights, total tilt ≤4°, and smooth reset on exit. Buttons inside cards must remain clickable.
4. Repeatedly select tabs of different widths and reverse direction during animation. The pill must continue from its current shape, settle against the target within ≤1px, and leave text unstretched. Realign after window resizing and font size changes.
5. Use Tab, Space, arrows, and Home/End to check forms and tabs. For dialogs/drawers, check Esc, focus containment, and focus restoration after closing. Menus close on outside click.
6. Verify real behavior for themes, materials, options, input/error states, slider values, loading, notifications, and overlays. No placeholder buttons or dead links.
7. Check a 390px narrow viewport, 200% zoom, light/dark themes, and long labels. Avoid horizontal page overflow. Targets should generally be at least 44px and must not fall below the applicable accessibility requirements.
8. Under reduced motion, disable tilt, extension, bounce, and pulsing while preserving correct selection. Changing the preference during use must also work. Under forced colors, borders, focus, and selection remain visible.
9. Disable blur and refraction enhancement: content must remain readable and operable. Measure contrast against the actual background. Target at least 4.5:1 for normal text, 3:1 for large text, and 3:1 for necessary control boundaries. Unmeasured translucent colors are not evidence of compliance.
10. Stop RAF when at rest. An unmounted controller must not keep reacting or animating, and multiple instances must remain independent. Generate displacement maps only on resize; avoid generating a canvas every frame.

## Refraction checks

Compare base and enhanced screenshots at the same position, size, and static grid/text background. Look for an almost unchanged center, curved edges, and undistorted content. A color change alone does not prove refraction.

The included refraction experiment uses a known local SVG background to make displacement visible in a controlled scene. It does not prove that arbitrary DOM backgrounds can refract. Separately validate the actual rendering of `backdrop-filter: url(...)` for page pills. Even when `CSS.supports` succeeds, the browser may retain only blur.

## Troubleshooting

| Symptom | Check first |
| --- | --- |
| Glass looks like gray-white plastic | Flat background, excessive stacked blur/alpha, or edge highlights without direction |
| Hover near edges jitters | Measurement uses a transforming face; measure the fixed host instead |
| Pill jumps during rapid changes | Animation state was recreated or a new target discarded current velocity |
| Page becomes slower over time | Permanent RAF loop, repeated mount, uncleared observers, or large filters updated every frame |
| Text becomes liquid | Filter is on a content ancestor; move it to a separate background layer |
| Displacement shifts everything to one side | RG midpoint/sRGB mismatch, wrong map size, or incorrect filter units |
| Overlay is clipped | Ancestor overflow or masks; use the top layer or a portal |

In the delivery note, identify implemented components, base versus enhanced behavior, tested platforms, and untested items. Do not claim that all browsers behave identically without validation.
