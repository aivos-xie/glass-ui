# Design decisions and material hierarchy

[English](design-system.md) | [简体中文](../../references/design-system.md)

Use this reference for page redesigns, complex compositions, or requests for a stronger liquid-glass identity. A single control does not require a complete design proposal first.

## Decide what the material communicates

Extract the project's brand colors, typography, spacing, corners, component behavior, and supported platforms. Preserve those constraints when selecting materials. Do not replace fonts, icons, or information architecture without a request. Use reference screenshots to understand visual relationships.

| Page layer | Default treatment | When glass helps |
| --- | --- | --- |
| Content: prose, tables, charts, photographs | Preserve clarity and true colors | Explicitly requested, with a stable readable surface |
| Structure: sections, layout, containers | Spacing, typography, and fine boundaries | A container needs to retain background context, not just decoration |
| Controls: navigation, search, toolbars, overlays | Good candidates for a shared glass material | Floating over content, retaining context, or showing a temporary state |

Each glass region should have a reason, such as navigation over scrolling content or a selected indicator separated from its track. Making every card transparent is not required for consistency; this principle must not override an explicit request for glass cards.

## Material strength is separate from color theme

Choose a light, regular, or thick functional strength before selecting frosted, clear, tinted, or narrow prism-edge styling.

- Light: small controls and selection indicators; low blur, fine edges, shallow shadow. Transparency is constrained by label readability.
- Regular: toolbars, information cards, navigation; stable tint and soft depth. Keep the project's existing corner language.
- Thick: menus, dialogs, and text-heavy overlays; increase opacity and separation rather than relying on more blur for readability.

Use a small consistent set of strengths per view. Separate nested layers with borders, solids, or transparent fills rather than blurring each layer independently. See [materials and motion](materials-and-motion.md) for starting values and `assets/demo/glass.css` for actual tokens.

## Brand, typography, and states

Use brand color primarily for the main action, selection, and focus. Preserve semantic danger and success colors. System-inspired glass does not require copying Apple's icons, layouts, or wording. Do not reduce text contrast or font size merely to look light. Check Chinese, English, two-line labels, and 200% zoom. Pill motion must never deform labels.

Measure contrast on the brightest, darkest, and most complex background regions and during scrolling. First increase surface opacity, adjust text color, or simplify the background. Shadows and glows are not evidence of legibility. Content regions rarely need refraction; control refraction should remain concentrated near the edge.

## Record useful decisions at delivery

Scale the explanation to the task: material purpose, tokens, rendering route, fallback, and test environment. If the user requested implementation, inspect what is necessary and proceed without imposing an extra approval stage. Material changes do not authorize deleting, merging, or rearranging unrelated features.
