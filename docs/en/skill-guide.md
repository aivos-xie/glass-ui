# Glass UI · Skill guide

[English](skill-guide.md) | [简体中文](../../SKILL.md)

Treat glass as a complete component design language: implement material, layering, states, interactions, and readability together. Preserve the project's framework, design semantics, business behavior, and brand. A request for one component should change only the necessary scope.

This is the English version of the shared [SKILL.md entrypoint](../../SKILL.md), not a separate skill.

## Agent compatibility

The entrypoint uses the general Agent Skills format and does not depend on a model vendor, tool name, or chat product. Hosts with native skills load it through their own mechanisms. Other agents can read it directly and load relative references and code as needed. Users can ask to use the Glass UI skill; invocation syntax depends on the host.

`agents/openai.yaml` is optional Codex interface metadata that other agents may ignore. Use the terminal, file editing, and browser tools available in the current environment. Without a browser, report that interactions have not been tested; file inspection is not interaction validation. See the [installation guide](../../INSTALL.en.md) when installing, not during ordinary design work.

Communicate in the user's language. The English and Chinese documentation must retain the same numeric constraints, installation commands, and validation scope.

## Workflow

1. Inspect the project's components, style variables, animation libraries, and target browsers. For reference screenshots, distinguish static material, motion deformation, and layering; do not copy their business text.
2. Select materials for the current request: light glass for small controls, frosted glass for content containers, clear liquid glass for selection indicators, and tinted glass for primary actions or states. Add prism edges only when useful. See [materials and motion](materials-and-motion.md) for constraints.
3. Implement states according to component semantics. Consult the [component recipes](components.md), retaining native form behavior or the project's existing accessible primitives.
4. Use `assets/demo/glass.css` and `glass.js` as adaptable references. They are a dependency-free baseline, not a requirement to embed the entire showcase in the application. Open `assets/demo/index.html` directly for a preview. For initial integration, see [implementation and library selection](implementation.md).
5. Check appearance and real interactions using the [validation checklist](validation.md). Report browsers actually tested, untested platforms, and fallback behavior. Syntax support checks are not visual evidence.

## Required effects

- Cards have a soft radial spotlight inside their rounded clipping area. A separate border layer brightens only near the pointer. Decorative light layers do not intercept clicks.
- A fixed outer card host measures pointer position; an inner face tilts. The maximum **total tilt is 4°**, including at the corners. Reset smoothly on pointer exit, cancellation, or window blur. Do not enable tilt on small controls by default.
- Each option group uses one shared glass pill. During a change, the leading edge extends in the travel direction, the trailing edge follows, and the pill settles with a small bounce. Retargeting midway preserves its current shape and velocity. Text and icons never stretch with the pill.
- Pills have a fine highlight, a thickness shadow, and a readable selected state. Clear liquid glass may increase edge refraction during a press or movement and reduce it at rest. With reduced motion enabled, align immediately and accurately.
- Transparency, blur, and refraction are different capabilities. Ordinary CSS blur is not physical refraction. Enhancements affect only the background, never foreground text. If an enhancement fails, retain the complete base material.
- Provide clear feedback for applicable default, hover, pressed, keyboard focus, selected, disabled, loading, and error states. Touch interaction must not depend on hover, and color alone must not convey state.
- Avoid repeated strong blur on nested glass layers. Check light, dark, and complex backgrounds. Provide usable fallbacks for reduced motion, forced colors, missing blur, and missing enhanced refraction.

## Resource scope

- `assets/demo/`: offline component examples, design tokens, pointer and pill controllers, and optional SVG background displacement. No remote fonts, images, analytics, or build step.
- [Implementation reference](implementation.md): native, React, and Vue integration, with optional library choices. Before installing a third-party library, verify its current API, license, and target browser support. No third-party library is required.
- `scripts/check_assets.py`: checks resource completeness, local references, and basic semantics. It does not replace browser testing.

Implement only the components and effects needed for the task. Preserve licenses for added third-party resources. Reference screenshots do not grant permission to copy or publish them. Upload, deploy, or modify a remote repository only when the user separately requests it.
