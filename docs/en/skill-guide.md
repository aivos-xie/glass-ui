# Glass UI · Skill guide

[English](skill-guide.md) | [简体中文](../../SKILL.md)

Treat glass as a complete component design language: implement material, layering, states, interactions, and readability together. Preserve the project's framework, design semantics, business behavior, and brand. A request for one component should change only the necessary scope.

Users can ask, “Use glass-ui to generate a …” and describe the component, material, or interaction. Infer unspecified options from the project; clarify missing information when it affects business behavior. Components are not limited to the bundled examples. The skill guides the agent to generate project code; generated components run independently.

This is the English version of the shared [SKILL.md entrypoint](../../SKILL.md), not a separate skill.

## Agent compatibility

The entrypoint uses the general Agent Skills format and does not depend on a model vendor, tool name, or chat product. Hosts with native skills load it through their own mechanisms. Other agents can read it directly and load relative references and code as needed. Users can ask to use the Glass UI skill; invocation syntax depends on the host.

`agents/openai.yaml` is optional Codex interface metadata that other agents may ignore. Use the terminal, file editing, and browser tools available in the current environment. Without a browser, report that interactions have not been tested; file inspection is not interaction validation. See the [installation guide](../../INSTALL.en.md) when installing, not during ordinary design work.

Communicate in the user's language. The English and Chinese documentation must retain the same numeric constraints, installation commands, and validation scope.

## Workflow

1. Inspect the platform, components, style variables, animation libraries, and target browsers/devices. For screenshots, distinguish material, motion, and layering without copying business text. For broad redesigns, use [design decisions](design-system.md) to separate content, structure, and floating controls.
2. Select materials for the current request: light glass for small controls, frosted glass for content containers, clear liquid glass for selection indicators, and tinted glass for primary actions or states. For a standalone showcase, or an explicit request for pronounced glass without an established theme, dark frost is a useful starting point. Preserve existing project themes and brands. See [materials and motion](materials-and-motion.md) for parameters and hierarchy.
3. For explicit “settings navigation capsule / settings pill / 设置导航胶囊” or “sidebar drawer / glass drawer / 侧栏抽屉” requests, or matching scenarios, first read the relevant [preset recipe](presets.md). For other components, follow the [component recipes](components.md) to generate or adapt real components in the current project. Reuse existing structure, state, and accessible primitives, combining only needed materials and behaviors. Use the same process for unlisted components, without requiring a fixed parameter form or a prebuilt component package.
4. Read [implementation](implementation.md) as needed. Take only relevant parts of the dependency-free `assets/demo/glass.css` and `glass.js` baseline; a single component does not need the entire demo. Consult [rendering and performance](rendering-and-performance.md) for refraction or performance work. Known-image lenses use `image-lens.js`; native/mini-program work uses [platform adapters](platform-adapters.md). `assets/demo/index.html` is only a preview.
5. Check appearance and real interactions using the [validation checklist](validation.md). Report browsers actually tested, untested platforms, and fallback behavior. Syntax support checks are not visual evidence.

## Required effects

Select effects for the current task. The interaction constraints below apply to the corresponding enabled capabilities; do not automatically animate static components.

- Normal glass mode reveals background layers, fine directional highlights, and separation in depth. The background must remain behind the target after scrolling. Avoid turning glass into a solid white or gray block, except in solid and high-contrast fallbacks.
- Cards with spotlight enabled have a soft radial light inside their rounded clipping area. A separate border layer brightens only near the pointer. Decorative light layers do not intercept clicks.
- When tilt is enabled, a fixed outer card host measures pointer position and an inner face tilts. The maximum **total tilt is 4°**, including at the corners. Reset smoothly on pointer exit, cancellation, or window blur. Do not enable tilt on small controls by default.
- Each option group uses one shared glass pill. During a change, the leading edge extends in the travel direction, the trailing edge follows, and the pill settles with a small bounce. Retargeting midway preserves its current shape and velocity. Text and icons never stretch with the pill.
- Pills have a fine highlight, a thickness shadow, and a readable selected state. Clear liquid glass may increase edge refraction during a press or movement and reduce it at rest. With reduced motion enabled, align immediately and accurately.
- Transparency, blur, and refraction are different capabilities. Ordinary CSS blur is not physical refraction. Enhancements affect only the background, never foreground text. If an enhancement fails, retain the complete base material.
- Provide clear feedback for applicable default, hover, pressed, keyboard focus, selected, disabled, loading, and error states. Touch interaction must not depend on hover, and color alone must not convey state.
- Avoid repeated strong blur on nested glass layers. Check light, dark, and complex backgrounds. Provide usable fallbacks for reduced motion, forced colors, missing blur, and missing enhanced refraction.
- Respect reduced-transparency and increased-contrast preferences. Use `data-glass-quality` for full/balanced/static and `data-glass-transparency="reduced"` for solid surfaces. Browser and device names do not replace rendering checks.

## Read on demand

- Page style, brand, and material hierarchy: [design decisions](design-system.md).
- Refraction routes, quality controls, and performance: [rendering and performance](rendering-and-performance.md).
- Flutter, Apple, Android, desktop, and mini programs: read only the relevant part of [platform adapters](platform-adapters.md).
- The five reference projects and adoption decisions: [research notes](research-notes.md); routine tasks need not load them.

## Resource scope

- `docs/presets/`: two runnable Web presets; other platforms retain native primitives and port materials.
- `assets/demo/`: offline component examples, design tokens, pointer and pill controllers, and optional SVG background displacement. No remote fonts, images, analytics, or build step.
- [Implementation reference](implementation.md): native, React, and Vue integration, with optional library choices. Before installing a third-party library, verify its current API, license, and target browser support. No third-party library is required.
- `scripts/check_assets.py`: checks resource completeness, local references, and basic semantics. It does not replace browser testing.
- `scripts/validate_browser.mjs`: optional Playwright/PNG checks reporting actual engines, screenshots, and passed/failed/skipped checks. WebKit engine tests are not Safari or physical iPhone certification.
- `assets/adapters/`: baseline Flutter and mini-program containers, not complete native apps, video engines, or an untested promise of universal refraction.

Implement only the components and effects needed for the task. Preserve licenses for added third-party resources. Reference screenshots do not grant permission to copy or publish them. Upload, deploy, or modify a remote repository only when the user separately requests it.
