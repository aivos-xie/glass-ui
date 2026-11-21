# Component recipes

[English](components.md) | [简体中文](../../references/components.md)

Apply materials through existing component semantics. For complex dropdowns, comboboxes, calendars, and editable tables, prefer the project's established primitives and add glass styling. A visual change must preserve keyboard and form behavior.

## Generate on demand

The recipes below describe common semantics, not an allowlist of components. Compose glass capabilities around the structure and behavior of an unlisted component rather than maintaining a template for every component type.

1. Infer the component type, stack, content, state, and events from natural language and the project. Theme, material, spotlight, tilt, and similar options are optional; require neither a fixed JSON form nor every parameter. Clarify only when missing information affects data or action behavior.
2. Adapt an existing project component first. Otherwise create it in the current stack, reusing established primitives for complex interactions. Preserve the applicable brand, theme, and business logic; one component does not require an entire interface.
3. Read only relevant recipes, styles, and controller sections. Generate real component files, necessary exports, styles, event wiring, and unmount cleanup in the project, with usage matching those files. Use names such as `GlassCard` only after actually creating and exporting them; do not invent an importable component package.
4. Verify applicable states, keyboard/touch behavior, and preference fallbacks. Generated components do not call the skill or an agent at runtime. Instructions or unwired static styling do not establish a working interactive component.

## Common semantic recipes

| Component | Material and interaction | Required behavior |
| --- | --- | --- |
| Standard, primary, and icon buttons | Light or tinted glass; local hover highlight and a small press compression | Native button with an explicit type; accessible name for icon buttons; disabled buttons cannot activate; loading preserves name and layout and indicates busy state |
| Radio buttons and checkboxes | Light glass container; graphic and border for selection | Input and label; native name/value/checked; Space and arrows follow native semantics; visible focus |
| Switches | Glass track and clear thumb | Checkbox with `role="switch"` or native semantics; visible label; checked follows real state; animation is not the only on/off cue |
| Segmented controls | One shared pill, directional extension, and a small bounce | Use native radios for radio groups; synchronize panels, aria-selected, and roving tabindex for tablists; use links and aria-current for navigation rather than misusing tab semantics. A `data-glass-tabs` track requires one direct `data-glass-pill` child (`aria-hidden="true"`) for the controller to position; without it the pill and keyboard wiring are skipped silently |
| Inputs, search, and textareas | Light frost, focus ring, and error border | A label is not a placeholder; associate required/error descriptions; preserve selection, copying, autofill, input methods, and native validation |
| Selects | Native select with a glass wrapper or an existing combobox | Use established primitives for searchable popups; do not imitate a select with a click-only div |
| Sliders and progress | Glass track, clear value, and sufficiently large touch targets | Label/min/max/step for range; synchronized output; name and value for progress; keyboard adjustment works |
| Content and statistic cards | Frosted glass; large cards may use spotlights and 4° tilt | No extra tab stops on static cards; internal links and buttons remain usable; avoid nested buttons in whole-card click targets |
| List items and option cards | Low blur and an explicit selected marker | Hover is not selection; clear multi-select rules; long text wraps; avoid expensive per-item filters in dense lists |
| Navigation and pagination | Glass track and shared indicator | aria-current; real routes or usable destinations; support unequal label widths and scrolling; unique IDs across components |
| Menus and popovers | Moderate frost and an anchor shadow | Prefer existing popover/menu primitives; keyboard opening/closing, outside click, and focus restoration; no clipping by ancestor overflow |
| Dialogs and drawers | Frosted panel with a softer backdrop | Prefer dialog/showModal or an established modal; title, close control, Esc, focus containment and restoration; scrollable long content |
| Tags, badges, and notifications | Tinted light glass; mostly static | State text or icon; create the toast live region before writing text; do not communicate failure only through a brief animation |
| Tooltips and loading indicators | Light glass tooltip; small spinner or progress indicator | Tooltips open on hover and focus; essential instructions exist outside the tooltip; reduced motion retains loading text |
| Tables, trees, and calendars | Stable frosted container and low blur in dense regions | Retain each component's native semantics or existing primitives, sorting, selection, date rules, and appropriate keyboard behavior; distinguish empty, loading, and error states |
| Accordions, steps, and timelines | Grouped frost, light tracks, and a clear current item | Accordion buttons synchronize aria-expanded and the related region; steps distinguish current, complete, and unavailable; static timelines receive no unnecessary focus or interactions |

## Suggested state matrix

Cover applicable states for the current component; do not mechanically invent states it does not have.

- Default: distinguishable surface, boundary, and label.
- Hover: restrained lighting when a pointer is available, without layout changes.
- Active: brief 0.98–0.99 press scale, without scaling input content.
- Focus-visible: independent outer outline; reflected highlights are not a substitute.
- Selected/checked: stable background and graphic marker or font weight; ARIA matches real state.
- Disabled: actual disabled behavior or appropriate aria-disabled behavior; readable but not activatable.
- Loading: prevent duplicate submissions, preserve the original action name, and use aria-busy; restore the correct state when complete.
- Error/success: associated text feedback; color is supplementary.

## Composition

After blurring a large panel, use low blur or plain transparent edges for its inner options to avoid stacked gray-white surfaces. Use z-index for layering and a top layer or portal for overlays. Transparency belongs on material backgrounds, not on the entire component and its text. Give multiline text a steadier frosted surface and increase opacity when necessary. Prioritize clarity and interaction density in compact data areas.

The reference showcase includes buttons, icon buttons, native radios and checkboxes, switches, tabs, input/search/textarea/select/range, cards, details-based menus, dialog/drawer, tooltip, toast, badge, and progress. Production menu behavior such as ArrowUp/Down, Home/End, and typeahead should come from the corresponding primitives. The demo's details element is a disclosure action panel; it does not claim to be a complete ARIA menu.
