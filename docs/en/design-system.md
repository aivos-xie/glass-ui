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

## Upgrade a whole UI

When a user asks to unify an existing product or component library, establish scope and a behavior baseline before changing styles. Inventory the main routes, page shells, shared components, theme entry points, component purposes, public interfaces, states, and key user actions. For a large product, sample representative page types and validate each shared pattern instead of inventing unique styles page by page.

Map existing colors, spacing, corners, and layers into a small set of glass tokens: scene, light/regular/thick surfaces, edges, shadows, focus, and motion. Attach them to the existing theme root or feature container, then apply them in layers: app shell, navigation/toolbars, forms/feedback, content components, and overlays. Shared components use consistent material rules while their original state remains the source of truth.

Keep component types and contracts unchanged: preserve labels and ARIA roles, props/APIs, event signatures, form values, routes, data reads/writes, validation, loading/error handling, and permission behavior. Prefer existing theme variables, variants, and scoped styles. Add wrappers only for independent decoration, and keep those layers non-interactive. Avoid global `button`, `input`, or similar rules that override business components; do not rearrange information architecture or remove infrequent features for visual consistency.

Classify structural changes into three cases. Allowed: adding purely decorative or positioning layers, and visual rearrangement that does not change the role tree, such as restyling a horizontal tab strip as a pill track or a sidebar as a drawer shell. Must be listed item by item and confirmed separately: changes to the role tree, focus order, event semantics, routes, or where data is read and written. Business features are never deleted, merged, or hidden. Before replacing a native primitive, confirm the project already has an equivalent accessible implementation, and replace only its appearance.

Upgrade incrementally and regress by shared pattern: compare default, selected, disabled, error, and loading states before extending each pattern across routes. Organize tokens and scoped styles using [implementation](implementation.md); record uncovered pages, behavior differences, and tested platforms with the [validation checklist](validation.md). A request for one component remains scoped and does not trigger a whole-UI upgrade.

## Material strength is separate from color theme

Choose a light, regular, or thick functional strength before selecting frosted, clear, tinted, or narrow prism-edge styling.

- Light: small controls and selection indicators; low blur, fine edges, shallow shadow. Transparency is constrained by label readability.
- Regular: toolbars, information cards, navigation; stable tint and soft depth. Keep the project's existing corner language.
- Thick: menus, dialogs, and text-heavy overlays; increase opacity and separation rather than relying on more blur for readability.

Use a small consistent set of strengths per view. Separate nested layers with borders, solids, or transparent fills rather than blurring each layer independently. See [materials and motion](materials-and-motion.md) for starting values and `assets/demo/glass.css` for actual tokens.

## Brand, typography, and states

Use brand color primarily for the main action, selection, and focus. Preserve semantic danger and success colors. System-inspired glass does not require copying Apple's icons, layouts, or wording. Do not reduce text contrast or font size merely to look light. Check Chinese, English, two-line labels, and 200% zoom. Pill motion must never deform labels.

Measure contrast on the brightest, darkest, and most complex background regions and during scrolling. First increase surface opacity, adjust text color, or simplify the background. Shadows and glows are not evidence of legibility. Content regions rarely need refraction; control refraction should remain concentrated near the edge.

## Make the glass material visible

For a standalone showcase or an explicit request for stronger glass without an established theme, start with a dark base and static background shapes in neighboring warm and cool colors. Preserve established brands and light business interfaces. Build material through transparent fills, fine highlights, and visible background detail rather than forcing the sample's dark theme.

Confirm that light or color variation actually exists behind the target before tuning alpha and blur. A long page can use a fixed static backdrop or a scene for each region. Recheck after adding content, changing panels, and actually scrolling so the backdrop does not end at the first screen. Keep decoration behind content, non-intercepting, and independent of continuous animation.

Separate the navigation track, selected pill, and foreground labels. Use light frost for the track, a thinner and clearer pill, and opaque text. A narrow directional highlight and restrained lower shadow convey thickness. Avoid equally dense white fills on the track, pill, and nested buttons. See [materials and motion](materials-and-motion.md) for starting values and fallbacks.

## Record useful decisions at delivery

Scale the explanation to the task: material purpose, tokens, rendering route, fallback, and test environment. If the user requested implementation, inspect what is necessary and proceed without imposing an extra approval stage. Material changes do not authorize deleting, merging, or rearranging unrelated features.
