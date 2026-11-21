# 渲染路线、图片透镜与性能

[简体中文](rendering-and-performance.md) | [English](../docs/en/rendering-and-performance.md)

## 按背景来源选择路线

| 场景 | 路线 | 能力边界 |
| --- | --- | --- |
| 普通卡片、正文容器 | CSS 半透明底、blur、边缘与投影 | 基础材质，不声称真实折射 |
| 自己控制的静态图片、插画、网格 | 独立 SVG 图片层 + 边缘位移；随附 `image-lens.js` | 仅采样指定图片，不能感知背后的任意 DOM |
| 任意滚动 DOM 上的导航胶囊 | CSS 基础层 + 可选 SVG backdrop | `CSS.supports` 只能检测语法，必须目标浏览器截图确认 |
| 视频、Canvas、3D 场景 | 项目已有渲染管线中的纹理/shader | 需要额外实现、CORS 与性能验证；随附基线不提供视频/WebGL 引擎 |
| 原生界面或小程序 | 先按[平台适配](platform-adapters.md)选能力 | Web 的选择器、滤镜与浏览器保证不能直接移植 |

增强层只处理装饰性背景。不要把 `filter: url(...)` 加在包含控件和前景文字的祖先上；不要复制表单、交互 DOM、用户内容或整个页面来伪装背景折射。允许复用项目已明确指定的装饰图片，但要保留真实控件的唯一语义和焦点位置。

## 可复用的指定图片透镜

按顺序加载 `glass.css`、`lens-map.js`、`glass.js`、`image-lens.js`。结构为一个有实际尺寸的容器、一个原始 `<img data-glass-source>`、一个空的 `<div data-glass-lens aria-hidden="true">`；参见[可运行示例](../assets/demo/index.html)。

```js
const lens = GlassImage.mount(container);
lens.setEnabled(true);       // 受质量、减少动态及透明偏好限制
lens.setPosition(0.5, 0.5); // 容器中可移动范围的归一化坐标
lens.refresh();             // 外部布局变化后可主动刷新
// 卸载时调用 lens.dispose()
```

源图片须 `object-fit: cover; object-position: center`；容器和镜片不加内边距或边框，外观边缘用 inset shadow 或独立装饰层。模块按真实尺寸对齐图片副本，ResizeObserver 处理尺寸变化，移动时复用位移图。示例提供原生 range 作为键盘/触屏替代，装饰镜片不接收事件。源图变更须使用浏览器允许访问的本地文件或资源地址；不自动下载、截取或绕过来源限制。

此模块使用普通 SVG 图片滤镜，与实验性 SVG backdrop 是两个路径。通过一种路径的测试不能证明另一种路径有效。

## 质量与可读性开关

在组件或共同祖先上设置；默认 `full`。组件保留原生表单语义和业务状态。

| 设置 | 效果 |
| --- | --- |
| `data-glass-quality="full"` | 原有材质、动态；显式开启时可尝试折射 |
| `data-glass-quality="balanced"` | 卡片 blur 上限 10px，关闭折射；保留基础交互 |
| `data-glass-quality="static"` | 实色底、无 blur/倾斜/弹簧/位移 |
| `data-glass-transparency="reduced"` | 实色底并关闭折射；与动态偏好独立 |
| `data-glass-motion="off"` | 关闭动态和位移；保留静态玻璃底 |

CSS 和控制器响应 `prefers-reduced-motion`、`prefers-reduced-transparency`、`prefers-contrast: more`、`forced-colors`。不支持某项媒体查询时，显式开关仍可使用。`GlassUI.observePreferences(element, callback)` 返回 `current()` 与 `dispose()`；当前值包含 `reduced`、`fine`、`quality`、`solid`、`enhanced`。框架卸载时清理观察器。

## 性能与排错

- 先检查 blur 对实际背景是否可见，再决定是否付出成本。静态图片可直接使用预处理素材；不要强制生成大背景。
- 玻璃只占需要的区域。密集列表、全屏层和多重嵌套优先用稳定底色；性能预算由目标设备实测决定，不宣称一个固定层数适合所有平台。
- 位移图只在尺寸变化时更新；跟随移动仅改位置。已有生成器将图尺寸限制在 600×240 内。不要逐帧截图页面、创建 Canvas 或通过框架 state 重渲染整棵树。
- 先批量读布局再写样式。只有实际运动的元素短暂使用 `will-change`，静止停止 RAF，卸载清理 listeners、observers、滤镜和 RAF。
- 单独检查圆角裁切、滤镜输入范围、RG 中点、sRGB、实例 ID、图片解码和 transform/opacity 引起的合成层。不要不经最小复现就套用其他项目的浏览器 UA 补丁。
- 同一位置截图对比基础/增强，用像素差与边缘细节判断；颜色变了或属性设置成功都不是折射证明。可用[浏览器验证脚本](../scripts/validate_browser.mjs)，细节见[验收](validation.md)。

### 整套升级的规模预算

整套升级会把同屏玻璃表面从几个增加到几十个，先按区域统计实际生效的 blur 层数，再决定哪些保持材质、哪些改为描边或纯色。固定不动的导航与工具栏可以保留 blur；参与滚动的长列表项优先用稳定底色，避免滚动时逐帧重新采样。`backdrop-filter` 元素的祖先不要再叠 `transform`、`filter` 或 `opacity` 动画，否则容易产生额外合成层与掉帧。移动端把 `data-glass-quality="balanced"` 作为主要回退档，并在报告里写清实测设备、滚动帧率与降级选择；不要用桌面结果推断手机表现。
