---
name: glass-ui
description: "为前端组件、页面或整套 UI 升级为磨砂/液态玻璃视觉，沿用原组件语义、API、数据流与交互。支持 Web、Flutter、小程序，单组件改造与整套 UI 升级均适用；覆盖磨砂/液态玻璃、追光卡片、轻微 3D 倾斜、滑动选中胶囊、指定图片透镜、表单/导航/弹层。Use for frontend glass UI, glassmorphism, liquid-glass, cursor spotlights, refractive image lenses, selection pills, tilt cards, and whole-UI glass upgrades while preserving behavior."
---

# Glass UI

[简体中文](SKILL.md) | [English](docs/en/skill-guide.md)

把玻璃作为完整的前端 UI 视觉系统：材质、层次、状态、交互和可读性一起实现。既支持按需改造单个组件，也支持把已有页面或整套 UI 统一升级为玻璃风格。沿用项目的框架、设计语义、业务行为和品牌；组件的职责、对外接口、数据流和交互是必须保留的约束。

用户可以直接说“用 glass-ui 生成一个……”并描述组件、材质或交互要求；未指定的选项从项目推断，关键业务信息缺失时再澄清。组件不限于随附示例。Skill 指导 Agent 生成项目代码，生成后的组件独立运行。

## Agent 兼容性

本文件采用通用 Agent Skills 格式，不依赖特定模型厂商、工具名称或对话产品。支持原生 Skill 的 Agent 按自己的机制加载；其他 Agent 可直接读取本文件，并按需读取相对路径中的参考资料和代码。用户可以直接说“使用 Glass UI Skill”，调用语法由宿主决定。

`agents/openai.yaml` 只是可选的 Codex 界面元数据，其他 Agent 可以忽略。终端、文件编辑、浏览器检查分别使用当前环境提供的等效工具；缺少浏览器时报告尚未实测，不把文件检查称为交互验证。安装方式见 [INSTALL.md](INSTALL.md)，正常使用时无需执行安装流程。

按用户使用的语言交流。英文使用指南及配套参考资料见 [English guide](docs/en/skill-guide.md)，英文安装流程见 [INSTALL.en.md](INSTALL.en.md)；两种语言的数值约束、安装命令和验收范围保持一致。

## 工作方式

1. 确定请求范围是单个组件、一个页面还是整套 UI。检查项目框架、组件库、主题变量、布局入口和目标浏览器/设备；单组件请求只改所需范围。用户提供截图或参考图时，从中分离静止材质、运动形变与层叠关系，只取视觉要求，不照搬其中的业务文字与内容。
2. 整页或整套 UI 升级先读[设计决策](references/design-system.md)：盘点页面与共享组件、现有样式入口，并记录关键组件的职责、对外接口、状态和用户可见行为，建立改造前的回归基线。参考截图用于分析材质和层次，不照搬其中业务内容。
3. 为当前范围定义少量共享材质与状态 tokens，再应用到真实项目组件：轻玻璃用于小控件，磨砂用于内容容器，清透液态用于选中指示器，染色用于主操作或状态。单组件请求直接选定一种材质，不要求先建立 tokens 体系。沿用项目主题与品牌；没有既定主题的独立展示页才可从深色磨砂起步。参数见[材质与交互](references/materials-and-motion.md)。
4. 用户请求“设置导航胶囊 / settings navigation capsule / settings pill”或“侧栏抽屉 / sidebar drawer / glass drawer”时，先读[按需预设](references/presets.md)。其他组件按[组件配方](references/components.md)复用原结构、状态与无障碍 primitives；未列出的组件按自身语义组合，不要求固定参数表或预制包。轨道类组件需要装饰层时按结构放置，例如 `data-glass-tabs` 的直接子层 `data-glass-pill`；控制器遇到缺失的必需层会静默跳过，必须自己核对。
5. 按需读取[实现与选库](references/implementation.md)。整套 UI 升级使用项目现有主题与局部样式边界，避免全局重置或按 HTML 标签覆盖业务控件；单组件只取 `assets/demo/glass.css`、`glass.js` 中需要的片段。涉及折射或性能时查[渲染与性能](references/rendering-and-performance.md)，指定图片透镜使用 `image-lens.js`；原生/小程序查[平台适配](references/platform-adapters.md)。`assets/demo/index.html` 仅用于预览。
6. 按[验收清单](references/validation.md)验证视觉、真实交互与改造前后的行为一致性。报告实际验证过的浏览器、尚未验证的平台及降级效果，不把语法支持检测当作视觉证明。

## 必须保持的效果

按当前任务选择需要的效果；以下交互约束适用于启用的对应能力，不为静态组件自动添加动效。

- 正常玻璃模式能看见背景层次、定向细高光和前后分离；滚动后目标组件仍有可透出的背景。避免把玻璃做成白色或灰色实心块；实色与高对比回退除外。
- 启用追光的卡片内部有柔和径向光斑，光斑被圆角裁切；独立边框层仅在光标附近提亮。光层不接收点击。
- 启用倾斜时，卡片使用固定外层测量指针位置，内层倾斜。整体倾角最高 **4°**，四角也不超限；移出、取消指针或窗口失焦后平滑复原。小控件不默认倾斜。
- 一个选项组只用一个共享玻璃胶囊。切换时前缘先沿运动方向延伸、尾缘随后追上，到位小幅回弹；中途改目标保留当前形状和速度。文字和图标不随胶囊拉伸。
- 胶囊有细高光、厚度阴影和可读的选中状态。清透液态可以在按压与移动时加强边缘折射，停稳后收敛。降低动态效果时立即准确定位。
- 透明、模糊、折射是不同能力。普通 CSS 模糊不是物理折射。增强层只处理背景，不扭曲前景文字；增强失败仍显示完整基础材质。
- 为默认、悬停、按下、键盘聚焦、选中、禁用、加载、错误等适用状态给出清晰反馈。触屏不依赖 hover，状态不只靠颜色。
- 避免嵌套玻璃层重复高强度模糊；浅色、深色和复杂背景均需检查。减少动态效果、强制颜色、无模糊和无增强折射各自有可用的回退。
- 尊重减少透明度与增加对比度偏好；可用 `data-glass-quality` 选择 full/balanced/static，以及 `data-glass-transparency="reduced"`。不以浏览器或设备名称代替实际绘制验证。
- 玻璃改造只改变呈现方式。保留组件语义、DOM/无障碍角色、props/API、表单值、事件、路由、数据流、权限和已有状态转换；不为视觉效果替换、删除或虚构业务功能。

## 按需参考

- 整页风格、品牌与材质层级：[设计决策](references/design-system.md)。
- 整套 UI 升级时的盘点、tokens 与行为不变量：[设计决策](references/design-system.md)和[实现与选库](references/implementation.md)。
- 选折射方案、质量开关、性能问题：[渲染与性能](references/rendering-and-performance.md)。
- Flutter、Apple、Android、桌面和小程序：[平台适配](references/platform-adapters.md)，只读目标平台部分。
- 查看借鉴的五个项目与取舍：[参考记录](references/research-notes.md)，不必在每次任务加载。

## 资源边界

- `docs/presets/`：两个可运行 Web 预设；其他平台保留原生组件并迁移材质。
- `assets/demo/`：可离线运行的组件样板、设计 tokens、指针与胶囊控制器、可选 SVG 背景位移增强。没有远程字体、图片、分析或构建步骤。
- `references/implementation.md`：原生 / React / Vue 接入方式与按需选库。安装第三方库前核实当前 API、许可证和目标浏览器；不把任何第三方库设为必需依赖。
- `scripts/check_assets.py`：检查 skill 资源完整性、本地引用、基础语义与中英结构对齐；不替代浏览器实测。
- `scripts/validate_browser.mjs`：可选 Playwright/PNG 验证；输出实际运行的引擎、截图、通过/失败/跳过项。WebKit 引擎测试不等于 Safari 或 iPhone 真机认证。
- `assets/adapters/`：Flutter 和小程序基础容器；不包含完整原生应用、视频引擎或未经验证的跨平台折射承诺。

仅实施当前任务需要的组件和效果。新增第三方资源需保留许可证；用户参考截图不默认复制或发布。只有用户另行要求时才上传、部署或修改远程仓库。
