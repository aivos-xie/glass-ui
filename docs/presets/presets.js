/* The settings page owns route state; the pill receives the committed link. */
(() => {
  const track = document.querySelector('[data-glass-settings]');
  const links = [...track.querySelectorAll('[data-glass-setting]')];
  const panels = [...document.querySelectorAll('[data-settings-view]')];
  const visual = GlassUI.mountSelectionPill(track, { vertical: track.dataset.glassSettings === 'vertical' });

  function commitSettingsRoute() {
    const target = links.find(link => link.hash === location.hash);
    const current = location.hash ? track.querySelector('[aria-current="page"]') : null;
    const selected = target || current || links[0];
    for (const link of links) {
      if (link === selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    for (const panel of panels) panel.hidden = selected.hash !== `#${panel.id}`;
    visual.select(selected);
  }

  // Keep the current selection while visiting the two preview anchors.
  addEventListener('hashchange', commitSettingsRoute);
  commitSettingsRoute();
})();

/* Standalone drawer. An existing project can keep its own open/close handlers. */
(() => {
  const opener = document.querySelector('[data-drawer-open]');
  const drawer = document.querySelector('#preset-drawer');
  opener.addEventListener('click', () => {
    if (!drawer.open) drawer.showModal();
  });
  drawer.addEventListener('close', () => {
    if (!drawer.open && opener.isConnected) opener.focus({ preventScroll: true });
  });
})();
