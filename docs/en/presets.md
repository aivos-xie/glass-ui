# On-demand component presets

[English](presets.md) · [简体中文](../../references/presets.md)

For requests for a “settings navigation capsule / settings pill / 设置导航胶囊” or a “sidebar drawer / glass drawer / 侧栏抽屉,” read the relevant recipe and inspect the existing project. Extract the pieces the project needs. The generated code runs independently.

The bundled samples open offline in a Web browser with no build step. On Flutter, mini programs, and other platforms, use the native controls and adapt the material and interaction rules. [Run both Web presets](../presets/index.html) · [Platform adapters](platform-adapters.md)

## Settings navigation capsule

> Use the glass-ui settings navigation capsule preset on this settings page. Apply dark frost and fine silver edges, preserving selection and keyboard behavior.

Start with a charcoal frosted track, a fine silver rim, and a separate selection pill. Use the project colors when a theme already exists. Horizontal and vertical layouts share the animation. The pill follows the selected item, while long labels can wrap and text and icons keep their size.

Extract the track, items, and one direct child marked `[data-glass-pill]`. Mark that layer `aria-hidden="true"` and keep pointer input on the items. Take the `[data-glass-settings]` rules at the start of the scoped stylesheet, or add the required geometry and material to the existing track. [Settings sample](../presets/index.html#settings-preset) · [Styles](../presets/presets.css) · [Integration code](../presets/presets.js)

- **When building new navigation**, use links and `aria-current` for page navigation, tabs for associated panels, or radios for a form choice. The offline demo shows horizontal and vertical tabs with selection, keyboard controls, and panels. [Horizontal and vertical tabs](../../assets/demo/index.html#navigation-demo)
- **When adapting existing navigation**, keep routing, selection, focus, and keyboard behavior with the host. Mount `GlassUI.mountSelectionPill(track, { vertical: true })`, or pass `vertical: false` for horizontal layouts. Call `select(selectedElement)` after the DOM reflects the committed selection. Pass `null` when there is no selection and call `dispose()` on unmount. If the host replaces an item, pass the new element. Mount only this visual controller on the existing track. [Shared controller](../../assets/demo/glass.js)

Check two-line Chinese labels, both orientations, keyboard selection, visible focus, rapid reversals, and alignment after resize. With reduced motion, the pill snaps into place. The selection remains visible without blur and in forced colors.

## Sidebar drawer

> Use the glass-ui sidebar drawer preset on this details sidebar. Apply dark frost and let the original button reopen it after collapse.

Separate the drawer from the backdrop with a local frosted surface, a fine bright rim, and a shadow. The decoration is a direct child marked `[data-glass-drawer-surface]` inside `[data-glass-drawer]`. Extract that layer and its styles, then use the project's radius, positioning, and text colors. [Drawer sample](../presets/index.html#drawer-preset) · [Styles](../presets/presets.css) · [Integration code](../presets/presets.js)

- **When building a drawer**, prefer the project's drawer or dialog component. The standalone modal uses native `<dialog>`, `showModal()`, and `method="dialog"`, with a close button, Escape handling, and focus restoration. A nonmodal sidebar leaves the rest of the page available.
- **When adapting an existing drawer**, keep opening, positioning, size, dragging, scrolling, and focus with the host. The host panel provides the decoration's containing block and radius. Apply `pointer-events: none` to the decoration and keep scrolling on the content layer. Place the opener in a layer that stays visible after collapse, such as a stable sibling outside a clipping rail that shrinks to zero. When the host recreates the opener, bind disclosure and focus to the replacement.

Open the drawer, close it, and reopen from the original control. Repeat on a narrow viewport and check scrolling and the close button. For modal drawers, check Escape and focus restoration. Disable the slide with reduced motion and retain a solid surface with a visible boundary when blur is unavailable or forced colors are active.
