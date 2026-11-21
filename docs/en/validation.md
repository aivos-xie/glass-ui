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

## Visible material checks

- Inspect the brightest, darkest, and most complex parts of the real scene. Normal mode should still reveal background colors or layers, with directional fine edges and clear text. If it looks like a white block, check the backdrop, fill, and stacked blur before increasing glow.
- Actually scroll to lower content, change showcase panels, and vary content height. Confirm that the backdrop still covers the target. A first-screen screenshot is insufficient, and continuous background animation must not be necessary to recognize the material.
- Compare the track, selected pill, and nested buttons. Their thickness should differ, and foreground content must not deform with filtering or pill motion. Theme changes synchronize button icons, labels, `aria-pressed`, and related settings.
- Compare normal mode with explicit solid, static, no-blur, and system-preference fallbacks. Gradients and strong filters must not override solid fills; forced colors retain system colors. The base material must remain usable in engines that do not recognize `prefers-reduced-transparency`. Test the positive `reduce` branch where supported and record system preferences that could not be tested.

## Refraction checks

Compare base and enhanced screenshots at the same position, size, and static grid/text background. Look for an almost unchanged center, curved edges, and undistorted content. A color change alone does not prove refraction.

The included refraction experiment uses a known local SVG background to make displacement visible in a controlled scene. It does not prove that arbitrary DOM backgrounds can refract. Separately validate the actual rendering of `backdrop-filter: url(...)` for page pills. Even when `CSS.supports` succeeds, the browser may retain only blur.

## Troubleshooting

| Symptom | Check first |
| --- | --- |
| Glass looks like a white block or gray plastic | Flat or missing backdrop, excessive stacked fill/blur, or edge highlights without direction |
| Glass works at the top but lower cards look solid | Decoration only covers a fixed hero height, or a panel change leaves the target without a backdrop |
| The selected pill resembles a white button | Track and pill fills/blur are equally dense; reduce pill fill while retaining fine highlights and label contrast |
| An engine shows no base material at all | A negated query for an unknown media feature blocks base styling; separate baseline styles and positive preference fallbacks |
| Hover near edges jitters | Measurement uses a transforming face; measure the fixed host instead |
| Pill jumps during rapid changes | Animation state was recreated or a new target discarded current velocity |
| Page becomes slower over time | Permanent RAF loop, repeated mount, uncleared observers, or large filters updated every frame |
| Text becomes liquid | Filter is on a content ancestor; move it to a separate background layer |
| Displacement shifts everything to one side | RG midpoint/sRGB mismatch, wrong map size, or incorrect filter units |
| Overlay is clipped | Ancestor overflow or masks; use the top layer or a portal |

In the delivery note, identify implemented components, base versus enhanced behavior, tested platforms, and untested items. Do not claim that all browsers behave identically without validation.

## Reproducible browser validation

`scripts/validate_browser.mjs` uses optional Playwright and pngjs dependencies. It serves the sample on a temporary local port and writes per-engine checks and screenshots. These are development dependencies, not runtime requirements for the skill or webpage.

```bash
# Use an isolated development directory or existing project dependencies.
npm install --no-save playwright pngjs
npx playwright install chromium firefox webkit
node /absolute/path/to/glass-ui/scripts/validate_browser.mjs --browser chromium,firefox,webkit --output ./glass-results --require-all true
```

Use `--module-dir` to select an existing Node project; `--browser edge` uses installed Microsoft Edge. Replace example paths with real paths. Missing browsers are recorded as skipped; `--require-all true` makes skips fail the command. Never report skipped checks as passes. Playwright WebKit on Windows is an engine automation check, not macOS Safari or physical iPhone validation.

Regression checks cover vertical/RTL tabs, disabled-item skipping, known-image refraction pixel changes, displacement-map reuse during movement, quality levels, transparency/contrast preferences, existing forms/focus, and disposal. Actual counts and browser versions are in `report.json`. A known-background test cannot prove arbitrary-DOM backdrop support.

This release's [browser report](../browser-validation.json) records 66 passing checks. Increased contrast is validated in a new context because runtime preference emulation in the tested Firefox build did not update existing MediaQueryList objects. Runtime reduced motion is tested separately. Do not add production UA patches for this automation limitation. The [adapter report](../adapter-validation.json) separately records Flutter tests and the untested mini-program runtime.

Analyze the Flutter adapter inside the target Flutter project and run widget tests for native child controls, reduced transparency, high contrast, and zero blur. For mini programs, check JSON/WXML/JS, then validate enhanced mode against the target base library and physical devices. Source checks are not a claim of device success.
