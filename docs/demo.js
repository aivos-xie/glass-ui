(function () {
  'use strict';
  const root = document.documentElement;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const dispose = GlassUI.mount(document);
  const reducedMedia = matchMedia('(prefers-reduced-motion: reduce)');
  const imageLens = GlassImage.mount($('#lens-experiment'));
  let toastTimer, savingTimer;
  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    toastTimer = setTimeout(() => { $('#toast').textContent = ''; }, 3500);
  }
  function theme(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    $('#theme-toggle').setAttribute('aria-pressed', String(dark));
    $('#theme-toggle').setAttribute('aria-label', dark ? '切换浅色主题' : '切换深色主题');
    $('#theme-toggle use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
    $('#drawer-theme').checked = dark;
  }
  function motion(enabled) {
    root.dataset.glassMotion = enabled ? 'on' : 'off';
    $('#motion-toggle').checked = $('#drawer-motion').checked = enabled;
    $('#motion-status').textContent = !enabled || reducedMedia.matches ? '减少动态已生效：关闭倾斜、回弹和位移。' : '动态效果已开启。系统减少动态偏好同样生效。';
    refreshLens();
  }
  function updateProgress(value) {
    $('#range-value').textContent = `${value}%`;
    $('#focus-value').textContent = `${value}%`;
    $('#focus-progress').value = value;
    $('#focus-progress').textContent = `${value}%`;
  }
  function material(value) {
    root.dataset.material = value; root.style.removeProperty('--g-blur');
    const blur = { frosted: 18, clear: 6, tinted: 16, prism: 9 }[value];
    $('#blur-range').value = blur; $('#blur-value').textContent = `${blur}px`;
    $$('[name="material"]').forEach(input => { input.checked = input.value === value; });
  }
  $('#theme-toggle').addEventListener('click', () => theme(root.dataset.theme !== 'dark'));
  $('#drawer-theme').addEventListener('change', event => theme(event.target.checked));
  $('#motion-toggle').addEventListener('change', event => motion(event.target.checked));
  $('#drawer-motion').addEventListener('change', event => motion(event.target.checked));
  reducedMedia.addEventListener('change', () => motion($('#motion-toggle').checked));
  $('#notify-check').addEventListener('change', event => { $('#drawer-notify').checked = event.target.checked; });
  $('#drawer-notify').addEventListener('change', event => { $('#notify-check').checked = event.target.checked; });
  $('#focus-switch').addEventListener('change', event => toast(event.target.checked ? '专注模式已开启。' : '专注模式已关闭。'));
  $$('[name="density"]').forEach(input => input.addEventListener('change', () => { root.dataset.density = input.value; }));
  $$('[data-toast]').forEach(button => button.addEventListener('click', () => {
    toast(button.dataset.toast); button.closest('details')?.removeAttribute('open');
  }));
  $('#favorite-button').addEventListener('click', event => {
    const button = event.currentTarget, selected = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', selected ? '取消收藏此组件' : '收藏此组件');
    toast(selected ? '组件已加入收藏。' : '已取消收藏。');
  });
  $('#save-button').addEventListener('click', event => {
    const button = event.currentTarget;
    if (button.disabled) return;
    button.style.minWidth = `${button.getBoundingClientRect().width}px`;
    button.disabled = true; button.setAttribute('aria-busy', 'true');
    savingTimer = setTimeout(() => {
      button.disabled = false; button.removeAttribute('aria-busy'); button.style.minWidth = '';
      $('#saved-state').textContent = '✓ 已保存'; toast('更改已保存。');
    }, 1100);
  });
  $('#demo-form').addEventListener('submit', event => {
    event.preventDefault();
    const input = $('#name-input'), value = input.value.trim();
    input.setAttribute('aria-invalid', String(!value));
    $('#name-error').textContent = value ? '' : '请先填写项目名称。';
    if (!value) { $('#form-result').textContent = ''; input.focus(); return; }
    $('#form-result').textContent = `已创建「${value}」`;
    toast(`「${value}」已创建。`);
  });
  $('#name-input').addEventListener('input', event => {
    if (event.target.value.trim()) { event.target.removeAttribute('aria-invalid'); $('#name-error').textContent = ''; }
  });
  $('#progress-range').addEventListener('input', event => updateProgress(event.target.value));
  $('#search-input').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase(), result = $('#search-results');
    const components = ['按钮 / 图标按钮 / 加载与禁用', '选项 / 单选 / 复选框 / 开关 / 标签', '表单 / 输入 / 搜索 / 下拉 / 滑块', '卡片 / 统计 / 追光 / 倾斜', '弹层 / 对话框 / 抽屉 / 通知 / 提示 / 菜单', '导航 / 标签页 / 胶囊'];
    result.hidden = !query;
    const matches = components.filter(text => text.toLowerCase().includes(query));
    result.textContent = matches.length ? `找到 ${matches.length} 类组件：${matches.join('；')}` : '暂未找到匹配组件。试试“按钮”“卡片”或“开关”。';
  });
  const dialogOpeners = new WeakMap();
  $$('[data-dialog]').forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialog);
    dialogOpeners.set(dialog, button); dialog.returnValue = ''; dialog.showModal();
  }));
  $$('dialog').forEach(dialog => dialog.addEventListener('close', () => {
    const opener = dialogOpeners.get(dialog);
    if (opener?.isConnected && !opener.disabled) opener.focus({ preventScroll: true });
    dialogOpeners.delete(dialog);
  }));
  $('#preview-dialog').addEventListener('close', event => {
    if (event.target.returnValue === 'save') toast($('#dialog-note').value.trim() ? '灵感已记下。' : '为下一次灵感留好位置。');
  });
  document.addEventListener('click', event => {
    $$('details[open]').forEach(details => { if (!details.contains(event.target)) details.open = false; });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      $$('details[open]').forEach(details => { details.open = false; details.querySelector('summary')?.focus(); });
      $$('.g-tooltip-wrap').forEach(wrap => wrap.setAttribute('data-dismissed', ''));
    }
  });
  $$('.g-tooltip-wrap').forEach(wrap => {
    wrap.addEventListener('pointerenter', () => wrap.removeAttribute('data-dismissed'));
    wrap.addEventListener('focusin', () => wrap.removeAttribute('data-dismissed'));
    wrap.addEventListener('pointerleave', () => wrap.removeAttribute('data-dismissed'));
    wrap.addEventListener('focusout', () => wrap.removeAttribute('data-dismissed'));
  });
  $$('[name="material"]').forEach(input => input.addEventListener('change', () => material(input.value)));
  $('#blur-range').addEventListener('input', event => { root.style.setProperty('--g-blur', `${event.target.value}px`); $('#blur-value').textContent = `${event.target.value}px`; });
  $('#glow-range').addEventListener('input', event => { root.style.setProperty('--g-glow', event.target.value / 100); $('#glow-value').textContent = `${event.target.value}%`; });
  $('#fallback-toggle').addEventListener('change', event => { root.toggleAttribute('data-no-blur', event.target.checked); });
  $('#quality-select').addEventListener('change', event => { root.dataset.glassQuality = event.target.value; refreshLens(); });
  $('#transparency-toggle').addEventListener('change', event => { root.dataset.glassTransparency = event.target.checked ? 'reduced' : 'auto'; refreshLens(); });
  $('#lens-position').addEventListener('input', event => {
    imageLens.setPosition(Number(event.target.value) / 100, .5);
    $('#lens-position-value').textContent = `${event.target.value}%`;
  });
  $('#reset-style').addEventListener('click', () => {
    material('frosted'); root.style.removeProperty('--g-glow'); $('#glow-range').value = 13; $('#glow-value').textContent = '13%';
  });
  function refreshLens() {
    const requested = $('#refraction-toggle').checked;
    const prefs = demoPreferences.current();
    const enabled = requested && !prefs.reduced && prefs.enhanced;
    $$('[data-glass-tabs]').forEach(track => { track.dataset.refraction = String(enabled); });
    imageLens.setEnabled(requested);
    $('#lens-status').textContent = requested && !enabled ? '当前质量或可读性设置已暂停折射位移。' : enabled ? '增强已开启。观察透镜边缘的网格弯曲与文字变化。' : '增强已关闭。上方为已知 SVG 背景的对照实验。';
  }
  $('#refraction-toggle').addEventListener('change', refreshLens);
  const demoPreferences = GlassUI.observePreferences(root, refreshLens);
  motion(true);
  // Controller cleanup for behavioral validation; the standalone demo owns its page listeners.
  globalThis.GlassDemo = { imageLens, dispose() { dispose(); imageLens.dispose(); demoPreferences.dispose(); clearTimeout(toastTimer); clearTimeout(savingTimer); } };
})();
