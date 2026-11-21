# 组件配方

按现有组件语义接入材质；复杂下拉、组合框、日历和可编辑表格优先沿用项目 primitives，再加玻璃皮肤。不因为改外观丢失原来的键盘和表单行为。

| 组件 | 材质和交互 | 必须覆盖的行为 |
| --- | --- | --- |
| 普通/主/图标按钮 | 轻玻璃或染色；hover 局部高光，active 轻压缩 | 原生 button，明确 type；图标按钮可访问名称；禁用不可激活；loading 保留名称和布局并标 busy |
| 单选、复选 | 轻玻璃容器，选中使用图形与描边 | input + label；原生 name/value/checked；Space、箭头遵循原生语义；焦点可见 |
| 开关 | 玻璃轨道和清透滑块 | checkbox `role="switch"` 或原生语义；可见标签；checked 由真实状态驱动；不依赖动画传达开/关 |
| 分段选择 | 单共享胶囊，方向延伸与小回弹 | 它是 radio group 时用原生 radio；tablist 时同步 panel、aria-selected 与 roving tabindex；导航时使用链接和 aria-current，不滥用 tab 语义 |
| 输入、搜索、文本域 | 轻磨砂，focus ring，错误描边 | label 不是 placeholder；必填/错误关联说明；保留选择、复制、自动填充、输入法和原生验证 |
| 下拉选择 | 原生 select + 玻璃外层或既有 combobox | 需要弹出搜索时用成熟 primitives；不要用只有 click 的 div 模仿 select |
| 滑块、进度 | 玻璃轨道，明确当前值，触屏足够大 | range 有 label/min/max/step；output 同步；progress 有名称和值；键盘增减可用 |
| 内容/统计卡片 | 磨砂；大卡可启用追光和 4° 倾斜 | 静态卡无多余 tab stop；内部链接按钮独立可用；整个可点击卡避免嵌套按钮 |
| 列表项、选项卡 | 低模糊；选中有标记 | hover 不等于选中；多选规则明确；长文字可换行；密集列表禁用逐项昂贵滤镜 |
| 导航、分页 | 玻璃轨道与共享指示器 | aria-current；真实路由或可用目标；支持不同文字宽度和滚动；多个组件 ID 不冲突 |
| 菜单、气泡 | 中等磨砂、锚点阴影 | 既有 popover/menu primitives 优先；键盘打开/关闭、外部点击、焦点恢复；不能被父 overflow 裁切 |
| 对话框、抽屉 | 磨砂面板配较弱遮罩 | 优先 dialog/showModal 或成熟 modal；标题、关闭、Esc、焦点约束和恢复；长内容可滚动 |
| 标签、徽标、通知 | 染色轻玻璃，静止为主 | 状态文字/图标；toast live region 存在后再写文本；不要只靠短暂动画通知失败 |
| 提示、加载 | 轻玻璃 tooltip；细小 spinner/progress | 提示能 hover 和 focus 打开；关键说明不只在 tooltip 中；减少动态时保留“加载中”文本 |

## 建议的状态矩阵

对当前组件覆盖适用项，不机械添加不存在的状态：

- 默认：表面、边界、标签可辨。
- hover：指针能力存在时的小幅光照，不影响布局。
- active：0.98–0.99 的短暂按压，不缩放输入内容。
- focus-visible：独立外侧描边，不用反射高光替代。
- selected/checked：稳定背景、图形标记/字重，aria 与真实状态同步。
- disabled：真实 disabled 或合适 aria-disabled 行为；可读但不可激活。
- loading：防重复提交，原操作名称保留，aria-busy；结束恢复正确状态。
- error/success：文字反馈与关联，颜色只是辅助。

## 组合原则

大面板模糊后，其内部选项多用低 blur 或纯透明边缘，避免灰白叠加。z-index 控制层次，弹层用 top layer/portal。半透明只能用于承载材质的背景，不能把整个组件连文字一起设 opacity。多行文本使用更稳定的磨砂底，必要时提高不透明度。小型密集数据区域优先清晰与操作密度。

参考展示页覆盖按钮、图标按钮、原生单/复选、开关、tabs、input/search/textarea/select/range、卡片、details 菜单、dialog/抽屉、tooltip、toast、badge、progress。生产复杂菜单的 ArrowUp/Down、Home/End、typeahead 等应交由对应 primitives；示例中的 details 是披露式操作面板，不声称是完整 ARIA menu。
