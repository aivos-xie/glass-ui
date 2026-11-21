# Glass UI · Skill guide

[English](skill-guide.md) | [简体中文](../../SKILL.md)

Treat glass as a complete frontend visual system: implement material, layering, states, interactions, and readability together. The skill supports a single component, a page, or a whole existing UI while preserving component semantics, public APIs, data flow, and behavior. A single-component request stays scoped to that component.

Users can ask, “Use glass-ui to generate a …” and describe the component, material, or interaction. Infer unspecified options from the project; clarify missing information when it affects business behavior. Components are not limited to the bundled examples. The skill guides the agent to generate project code; generated components run independently.

This is the English version of the shared [SKILL.md entrypoint](../../SKILL.md), not a separate skill.

## Agent compatibility

The entrypoint uses the general Agent Skills format and does not depend on a model vendor, tool name, or chat product. Hosts with native skills load it through their own mechanisms. Other agents can read it directly and load relative references and code as needed. Users can ask to use the Glass UI skill; invocation syntax depends on the host.

`agents/openai.yaml` is optional Codex interface metadata that other agents may ignore. Use the terminal, file editing, and browser tools available in the current environment. Without a browser, report that interactions have not been tested; file inspection is not interaction validation. See the [installation guide](../../INSTALL.en.md) when installing, not during ordinary design work.

Communicate in the user's language. The English and Chinese documentation must retain the same numeric constraints, installation commands, and validation scope.

## Workflow

1. Identify the requested scope: one component, one page, or the full UI. Inspect the project's stack, component library, theme entry points, and target browsers/devices; keep a single-component change local. When the user supplies screenshots or references, separate still material, motion deformation, and layering, and take only the visual requirements without copying their business text or content.
2. For a page or whole-UI upgrade, read [design decisions](design-system.md) first. Inventory routes, shared components, existing style boundaries, and a behavior baseline covering each component's purpose, public interface, states, and user-visible actions. Use screenshots to understand material and hierarchy, not to copy business content.
3. Define a small shared set of material and state tokens, then apply them to real project components. A single-component request can select one material directly; it does not require a token system. Preserve the project's theme and brand; use dark frost only for a standalone showcase without an established theme. See [materials and motion](materials-and-motion.md) for parameters and hierarchy.
4. For explicit “settings navigation capsule / settings pill / 设置导航胶囊” or “sidebar drawer / glass drawer / 侧栏抽屉” requests, first read the relevant [preset recipe](presets.md). For other components, follow [component recipes](components.md) and reuse their existing structure, state, and accessible primitives. Apply the same semantic approach to unlisted components. Track components need their decorative layer in place, such as a direct `data-glass-pill` child of `data-glass-tabs`; a missing required layer makes the controller skip silently, so verify it yourself.
5. Read [implementation](implementation.md) as needed. A whole-UI upgrade uses the host's theme and scoped style boundaries rather than broad tag selectors; a single component only takes the required parts of the dependency-free demo. Consult [rendering and performance](rendering-and-performance.md) for refraction or performance work, and use `image-lens.js` for known-image lenses; native/mini-program work uses [platform adapters](platform-adapters.md).
6. Check appearance, real interactions, and behavior parity using the [validation checklist](validation.md). Report tested browsers, untested platforms, fallback behavior, and any observed differences. Syntax support checks are not visual evidence.

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
- Glass changes presentation only. Preserve component purpose, DOM/accessibility roles, props/APIs, form values, events, routes, data flow, permissions, and existing state transitions. Do not replace, remove, or invent business features for visual consistency.

## Read on demand

- Page style, brand, and material hierarchy: [design decisions](design-system.md).
- Whole-UI upgrade inventory, shared tokens, and behavior invariants: [design decisions](design-system.md) and [implementation](implementation.md).
- Refraction routes, quality controls, and performance: [rendering and performance](rendering-and-performance.md).
- Flutter, Apple, Android, desktop, and mini programs: read only the relevant part of [platform adapters](platform-adapters.md).
- The five reference projects and adoption decisions: [research notes](research-notes.md); routine tasks need not load them.

## Resource scope

- `docs/presets/`: two runnable Web presets; other platforms retain native primitives and port materials.
- `assets/demo/`: offline component examples, design tokens, pointer and pill controllers, and optional SVG background displacement. No remote fonts, images, analytics, or build step.
- [Implementation reference](implementation.md): native, React, and Vue integration, with optional library choices. Before installing a third-party library, verify its current API, license, and target browser support. No third-party library is required.
- `scripts/check_assets.py`: checks resource completeness, local references, basic semantics, and Chinese/English structural alignment. It does not replace browser testing.
- `scripts/validate_browser.mjs`: optional Playwright/PNG checks reporting actual engines, screenshots, and passed/failed/skipped checks. WebKit engine tests are not Safari or physical iPhone certification.
- `assets/adapters/`: baseline Flutter and mini-program containers, not complete native apps, video engines, or an untested promise of universal refraction.

Implement only the components and effects needed for the task. Preserve licenses for added third-party resources. Reference screenshots do not grant permission to copy or publish them. Upload, deploy, or modify a remote repository only when the user separately requests it.
