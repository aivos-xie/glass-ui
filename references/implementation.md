# 实现与选库

[简体中文](implementation.md) | [English](../docs/en/implementation.md)

## 按需生成到项目

根据用户指定的组件与现有技术栈，在项目实际使用的组件目录创建或修改源文件，沿用命名、导出、props、事件和数据流约定。只有影响行为的关键业务信息缺失时才澄清，其余从项目上下文和用户要求选取合理默认值。

按[组件配方](components.md)选所需材质与行为，再读取对应基础代码。单个组件只提取需要的 tokens、样式与控制器逻辑；已有产品优先使用项目主题和局部样式，避免把样板的全局 reset、展示页布局或示例业务内容整体带入。生成后接入一个实际使用位置，处理挂载、清理及适用状态。

## 整套 UI 升级的接入

整套升级先确认入口布局、页面与共享组件的所有者，再选现有主题根节点作为玻璃 tokens 的作用范围。尽量映射项目已有 CSS variables、design tokens 和组件 variants；新增 tokens 只表达跨组件共享的材质角色，例如 page scene、surface levels、rim、shadow、focus 与 motion。颜色主题和材质强度分开管理，让原来的浅色/深色切换继续生效。

按宿主架构接入而不接管业务状态：CSS Modules / scoped styles 使用本地类名，CSS-in-JS 沿用主题 provider，utility CSS 映射到现有 config 或组件 class。避免无范围的 `button`、`input`、`*` 选择器，以及修改框架生成 DOM 的脆弱查询。新增 wrapper 只承载定位或装饰，不复制 props、事件或数据状态；玻璃层设为 `pointer-events: none` 并从无障碍树隐藏。批量迁移时分组件类别并运行原有测试，方便定位回归。

两套坐标系不要合并：角色 token 决定跨组件共享范围，材质档位决定数值区间。起点可直接映射到随附变量，避免在项目里另造第三套命名：

| 角色 token | 对应材质档位 | `assets/demo/glass.css` 中的起点 |
| --- | --- | --- |
| page scene | 页面底景（浅色 / 深色） | `--g-bg`、`--g-solid` |
| surface light / regular / thick | 轻玻璃 / 磨砂 / 厚磨砂 | `--g-surface`、`--g-subtle`、`--g-blur` |
| rim | 边缘窄高光与描边 | `--g-border`、`--g-outline`、`--g-highlight` |
| shadow | 厚度与层次 | `--g-shadow` |
| focus | 焦点环 | `--g-focus` |
| tint | 染色、主操作与选中 | `--g-accent`、`--g-accent-rgb`、`--g-glow` |
| motion | 胶囊与追光时序 | `glass.js` 中的弹簧参数 |

`GlassUI.mount()` 挂载卡片效果和演示 tabs 控制器。tabs 控制器会写入 `aria-selected`、`tabIndex` 和关联面板显隐，并处理点击与键盘，不能当作纯装饰接管已有导航。已有导航使用 `GlassUI.mountSelectionPill(track, { vertical: true })`，返回 `{ select, dispose }`；宿主提交选中状态后调用 `select(selectedElement)`，无选中项时传 `null`，卸载时调用 `dispose()`。该接口只移动胶囊，不管理路由、ARIA 或焦点。横向传 `vertical: false`。两种接口不要挂载在同一轨道。完整接入见[按需预设](presets.md)。这些接口不提供表单提交、对话框管理或任意组件生成；业务由项目组件或原生控件负责。`GlassCard` 等名称仅可用作实际创建并导出的项目组件名，不能当作本 Skill 已提供的包导出。

自然语言中的“倾斜 2°”“关闭追光”等是生成要求。现有卡片控制器没有对应的 prop 或 `data-max-tilt` 接口；需要时修改生成的实例逻辑，并验证总倾角上限与偏好回退。不要编造可传入的参数。生成结果直接随项目运行，运行时无需调用 Skill。

## 随附原生基线

`assets/demo/index.html`、`glass.css`、`glass.js`、`demo.css`、`demo.js` 和 `lens-map.js` 同目录可直接打开。生产接入通常只取 `glass.css`、`glass.js`，需要折射增强再取 `lens-map.js`；demo 两文件只负责展示页排版和操作。全局对象为 `GlassUI` / `GlassLens`，没有 bundler 和网络依赖。

```html
<link rel="stylesheet" href="glass.css">
<div data-glass-card>
  <article class="glass" data-glass-face>
    <span class="glass__light" aria-hidden="true"></span>
    <span class="glass__edge" aria-hidden="true"></span>
    <div class="glass__content">自己的内容</div>
  </article>
</div>
<script src="glass.js"></script>
<script>
  const disposeGlass = GlassUI.mount(document);
  // 组件被卸载时调用 disposeGlass()，不要重复挂载同一个节点。
</script>
```

胶囊 markup 见 demo 中 `data-glass-tabs`：一个 `[data-glass-pill]`，多个 `[role=tab]` 按钮及通过 `aria-controls` 关联的 `[role=tabpanel]`。控制器触发 `glass:change`，`event.detail` 含 `id` 与 `index`。支持 ArrowLeft/Right、Home/End，vertical 设置时使用 Up/Down。tab 点击负责显示关联 panel；真实路由请改用链接及 aria-current，不原样照搬 tablist。

`GlassUI.mount(root)` 返回清理函数，移除 listeners、observers 并取消 RAF。支持 `data-glass-motion="off"` 手动关闭动态；系统减少动态也自动生效。`GlassUI.math.tiltAt` 和 `normalAngle` 是测试用的纯计算入口。

可选：在 `[data-glass-tabs]` 上设 `data-refraction="true"`，先加载 `lens-map.js` 再 mount。默认 demo 关闭增强，用户可在“材质”页显式启用；同页的网格透镜实验用单独背景 SVG 展示真实位移与基础版本的差异。网页任意背景的 SVG backdrop 支持必须在目标浏览器截图确认。

## 新增接入能力

- 纵向 tabs：使用 `aria-orientation="vertical"`，同一控制器沿纵轴执行弹簧、拉伸和定位；Up/Down、Home/End 跳过禁用项。横向 RTL 保留语义对应的方向键。路由和 radio 不因需要胶囊就伪装成 tabs。
- 指定图片：在 `glass.js` 后加载 `image-lens.js`，调用 `GlassImage.mount(container)`；完整结构与源图约束见[渲染与性能](rendering-and-performance.md)。每个实例独立清理；此路线不捕获任意 DOM。
- 质量/可读性：`data-glass-quality="full|balanced|static"` 与 `data-glass-transparency="reduced"` 可加到公共祖先。值中的竖线表示选项，实际属性只填其中一个。样板即时响应属性与系统偏好变化。
- 平台样板：`assets/adapters/flutter/glass_surface.dart` 和 `assets/adapters/miniprogram/glass-view/`；接入与验证边界见[平台适配](platform-adapters.md)。

整页风格先看[设计决策](design-system.md)，不要仅通过加大 blur 或四处重复高光来制造层级。

## React / Vue / Svelte

- 让框架管理 checked、selected 和 panel 状态；把原生控制器算法提取为 hook/composable/action，不让 DOM controller 与框架同时写同一状态。
- effect/mounted 后测量，cleanup/unmounted 断开 observer、media query listeners 和 RAF。SSR 渲染不访问 window/document；hydration 前静态选中项可见。
- CSS variables 使用实例作用域；滤镜 ID 用框架稳定 ID，多个实例不能复用固定 ID。
- 不为每次 pointermove 更新组件 state；存 ref，逐帧写装饰层变量。现有动画库可直接替换内部 spring，保留角度上限与中途重定向行为。
- Tailwind 项目把公共 tokens 放主题层；复杂 mask/backdrop 样式留组件 CSS，避免长串不可维护的任意值。

## 选库路线

本表用于定位候选，**不是最新版本或兼容性保证**。实际安装前读仓库/官方文档和许可证；先做目标浏览器最小验证，再选择实现。不无理由新增依赖。

| 需求 | 候选与官方入口 | 注意点 |
| --- | --- | --- |
| 追光卡片 | [Magic UI Magic Card](https://magicui.design/docs/components/magic-card) | 重点是光照与边缘，不把它描述成光学折射库 |
| React 玻璃容器 | [rdev/liquid-glass-react](https://github.com/rdev/liquid-glass-react) | 文档列出 displacement、blur、aberration 等；该仓库说明 Safari/Firefox 位移效果受限，接入时复核当前情况 |
| React 玻璃 surface/icons | [React Bits](https://reactbits.dev/components/glass-surface) | 检查当前组件源码、使用依赖、许可证和各变体，不假设所有组件 API 相同 |
| 成套玻璃导航 | [Glisse](https://glisse.kelvinzhang.ca/) | 先验证 TabBar/SegmentedControl 是否满足尺寸、键盘和现有架构要求 |
| 共享布局 / 弹簧 | [Motion](https://motion.dev/docs/react-layout-animations) | 解决运动，不自动赋予玻璃材质或方向性伸展；layoutId 在同一分组中唯一 |
| 原生折射场景 | [liquidGL](https://github.com/naughtyduk/liquidGL) | 确认当前后端、快照成本、动态内容处理与资源限制 |
| 立体厚玻璃 | [Drei MeshTransmissionMaterial](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material) | 在 Three.js/R3F 场景内使用；不是给整页 DOM 套滤镜 |

## 事实与验证来源

以下官方参考链接收录于 2026-11-21。浏览器/库会演进，避免在 skill 中固定“最新版本”。

- [MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)：处理元素后方图像，需要半透明表面才能看见。
- [MDN feDisplacementMap](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap)：RG 位移映射，颜色空间影响中点。
- [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)：响应系统动态偏好。
- [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)：焦点、选中与 panel 关联。

无法使用 blur 时提高 surface alpha。SVG backdrop 无实际效果时关闭 `data-refraction`，保留模糊、边缘和阴影；不要通过伪造文字层或复制用户内容来假装任意背景已经正确折射。
