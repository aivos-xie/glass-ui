# Online showcase

[English](website.md) | [简体中文](../website.md)

Visit [Glass UI](https://aivos-xie.github.io/glass-ui/) to try the working glass components. The site uses this skill's materials and interaction controllers with static HTML, CSS, and JavaScript. It needs no build step, remote fonts, or analytics scripts.

The header links and category tabs open component, material, and interaction examples. Component search locates the relevant example. Switch the language, light/dark theme, motion preference, and material. Code examples include a copy action; preserve the required styles and behavior resources when reusing a component. The menu can copy current settings or download an actual JSON file.

The dedicated [spotlight and 3D card demo](https://aivos-xie.github.io/glass-ui/#spotlight-demo) provides a clearer background for observing the frost. Move the mouse inside the card: a soft radial light follows the pointer, and only the nearby border segment brightens. The combined tilt stays at or below 4°, then smoothly returns to rest on exit. The status explains whether interaction is active. System reduced motion, touch input, and lower quality settings keep their appropriate fallbacks instead of forcing hover animation.

The publishing source is `/docs` on the `main` branch. `docs/index.html` is the entry point, and `.nojekyll` enables direct static publishing through GitHub Pages. Before publishing a change, check Chinese and English layouts, keyboard operation, forms and overlays, reduced motion, and no-blur fallbacks. Verify that resources load beneath the `/glass-ui/` project path.

`assets/demo/` remains the standalone baseline sample. The site in `docs/` adds language switching and website features. Shared glass controllers should remain consistent between both copies. Known-image refraction only processes the included background; it does not guarantee refraction of arbitrary webpage content.

The 2026-11-21 [showcase checks](../website-validation.json) passed all 19 tests. The [core checks](../website-core-validation.json) passed 22 tests each in Edge, Firefox, and Playwright WebKit: 66 total, with no skips. Coverage includes Chinese/English layouts at 390, 768, and 1440px, keyboard operation, reduced motion, forced colors, and configuration export. These are not physical-device certification, a complete accessibility audit, or performance certification.

The new [spotlight card checks](../card-hover-validation.json) passed 19 tests each in Edge, Firefox, and Playwright WebKit: 57 total. Real pointer motion verifies interior-light and local-border pixel changes, a combined corner tilt of at most 4°, gradual reset, and bilingual fallback behavior.

Install the optional test dependencies `playwright` and `pngjs` at the repository root, install selected browsers according to Playwright documentation, then run:

```bash
node scripts/validate_website.mjs --site docs --browser edge --output website-results
node scripts/validate_card_hover.mjs --site docs --browser edge --output card-hover-results
node scripts/validate_browser.mjs --site docs --browser edge,firefox,webkit --require-all true --output website-core-results
```

The first two commands also accept `--url https://aivos-xie.github.io/glass-ui/` to test the live site. The card checks use real pointer motion and compare interior-light and border pixels, combined tilt limits, exit reset, working actions, and preference fallbacks. Use `--browser firefox` or `--browser webkit` to test those engines separately. `edge` requires an installed Microsoft Edge browser; other environments can use `chromium` with its browser installed.
