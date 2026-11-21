# 按需组件预设

[简体中文](presets.md) · [English](../docs/en/presets.md)

遇到“设置导航胶囊 / settings navigation capsule / settings pill”或“侧栏抽屉 / sidebar drawer / glass drawer”，先读对应配方，再检查项目现有结构和状态。Agent 从样板提取所需代码并接入当前项目，生成结果独立运行。

随附样板可在 Web 浏览器离线打开，无需构建。Flutter、小程序等平台沿用原生组件，按对应平台迁移材质与状态要求。 [运行两个 Web 预设](../docs/presets/index.html) · [平台适配](platform-adapters.md)

## 设置导航胶囊

> 用 glass-ui 的「设置导航胶囊」预设改造当前设置页。用深色磨砂、细银边，保留原来的选中状态和键盘操作。

默认用暗灰磨砂轨道、细银色上沿和独立的选中胶囊。有既定主题时沿用项目颜色。横向和纵向共用动画，胶囊跟随选中项，长标签可换行，文字与图标保留原本的尺寸。

从样板提取轨道、选项和一个直接子层 `[data-glass-pill]`。装饰层使用 `aria-hidden="true"`，且不拦截输入。取局部样式开头与 `[data-glass-settings]` 有关的规则，或沿用已有轨道样式，仅补齐定位和材质。 [设置样板](../docs/presets/index.html#settings-preset) · [样式](../docs/presets/presets.css) · [接线](../docs/presets/presets.js)

- **新建导航**时，页面跳转使用链接和 `aria-current`，同页 tabs 关联面板，表单单选用 radio。离线演示有横向和纵向 tabs，可参考其选中、键盘与面板接线。 [横纵 tabs](../assets/demo/index.html#navigation-demo)
- **改造已有导航**时，由宿主管理路由、选中、焦点和键盘。调用 `GlassUI.mountSelectionPill(track, { vertical: true })`，横向传 `vertical: false`。DOM 更新后调用 `select(selectedElement)`。没有选中项时传 `null`，卸载时调用 `dispose()`。元素被替换时传入新元素。已有导航只挂载这个视觉控制器。 [共享控制器](../assets/demo/glass.js)

验收两行中文、横纵对齐、键盘切换、可见焦点、快速反向切换和缩放后对齐。减少动态效果时胶囊直接到位。无模糊和强制颜色下仍能识别选中状态。

## 侧栏抽屉

> 用 glass-ui 的「侧栏抽屉」预设改造详情侧栏。用深色磨砂，收起后仍能从原入口再次打开。

用局部磨砂、细亮边和阴影区分抽屉与背景。样板的玻璃是 `[data-glass-drawer]` 下的直接子层 `[data-glass-drawer-surface]`。提取该装饰层和局部样式后，沿用项目的圆角、定位和文本颜色。 [抽屉样板](../docs/presets/index.html#drawer-preset) · [样式](../docs/presets/presets.css) · [接线](../docs/presets/presets.js)

- **新建抽屉**时，优先用项目现成的抽屉或对话框。独立模态样板用原生 `<dialog>`、`showModal()` 和 `method="dialog"`，包含关闭按钮、Esc 与焦点恢复。非模态侧栏保留页面其他区域的操作。
- **改造已有抽屉**时，由宿主管理开合、定位、尺寸、拖拽、滚动与焦点。宿主面板给装饰层提供定位范围和圆角，装饰层设 `pointer-events: none`，滚动仍由内容层处理。把打开按钮放在收起后依然可见的布局层，例如零宽裁切容器外的稳定兄弟元素。入口被重建时让新按钮接管开合和焦点逻辑。

验收展开、收起、从原入口再次展开，以及窄窗内滚动和关闭。模态抽屉还要检查 Esc 和关闭后的焦点恢复。减少动态效果时取消滑动，无模糊或强制颜色时保留实色面板和清晰边界。
