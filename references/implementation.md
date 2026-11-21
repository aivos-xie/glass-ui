# 实现与选库

[简体中文](implementation.md) | [English](../docs/en/implementation.md)

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
