# 验收

[简体中文](validation.md) | [English](../docs/en/validation.md)

## 最少验证

1. 有 skill-creator 的环境中，原始 SKILL.md 通过其 quick_validate.py；`python scripts/check_assets.py` 通过。
2. 在目标浏览器打开 demo，查看无控制台错误、无资源请求失败；如声称支持某个平台，要实际测试或明确未验证。
3. 以鼠标扫过卡片中心、四角、边缘，确认内部柔光裁切、边缘局部提亮、倾角 ≤4°、离开平滑回零。卡片含按钮时仍能点击。
4. 连续点击不同宽度 tab；动画中逆向切换；确认胶囊从当前形状延续，停稳贴合目标（误差≤1px），文本不拉伸。窗口 resize、字体尺寸变化后重新对齐。
5. 键盘 Tab、Space、箭头、Home/End，检查表单与 tabs。dialog/抽屉测试 Esc、焦点约束和关闭后恢复；菜单点击外部收起。
6. 验证主题、材质、选项、输入/错误、滑块值、加载、通知、弹层真实可用，无占位按钮和失效链接。
7. 390px 窄屏、200% 缩放、深浅主题、长标签；页面无横向溢出，点击目标一般至少 44px，至少不低于适用无障碍标准要求。
8. reduced motion：无倾斜、延伸、回弹、脉动，选中仍正确；运行中改变偏好同样有效。forced colors：实边框/焦点/选中状态可见。
9. 禁用 blur 和折射增强，内容仍可读可操作。文本与实际背景对比检查；普通文字以至少 4.5:1、大字 3:1、必要控件边界 3:1 为目标，不把未测量的半透明颜色当作已合规。
10. RAF 在静止时停止；卸载 controller 后不继续响应或动画；多个实例互不干扰。仅 resize 时生成位移贴图，避免逐帧生成 canvas。

## 折射专项

基础与增强截图使用同一位置、同一静态网格/文字背景、同一尺寸。检查中央近似保持、边缘弯曲、内容不变形；不能只看玻璃色彩变了就算折射成功。

随附“折射实验”使用已知的本地 SVG 背景以便直观看到位移，属于受控素材。它不证明网页任意 DOM 背景都能折射。网页胶囊增强另行验证 backdrop-filter: url(...) 的实际绘制。CSS.supports 通过仍可能只保留 blur。

## 调试定位

| 症状 | 优先排查 |
| --- | --- |
| 玻璃像灰白塑料 | 背景太平，嵌套 blur/alpha 过强，边缘高光不分方向 |
| 边缘 hover 抖动 | 测量了正在 transform 的 face，改测固定 host |
| 胶囊快速切换跳跃 | 重建了动画初始状态，或新目标抹掉当前速度 |
| 页面越用越卡 | RAF 永久运行、重复 mount、observer 未清理、大面积逐帧滤镜 |
| 文字跟着液化 | filter 放在内容祖先，改为独立背景层 |
| 位移整体偏到一侧 | RG 中点 / sRGB 不一致、尺寸错配、filter units 错误 |
| 弹层被裁切 | 父容器 overflow/mask，改用 top layer 或 portal |

交付说明写清：已实现的组件、基础与增强的区别、验证平台、未验证项。不要给出未经验证的“所有浏览器完全一致”。

## 可重复运行的浏览器验证

`scripts/validate_browser.mjs` 使用可选的 Playwright 和 pngjs，在本地临时端口提供样板页面，逐引擎输出测试与截图。依赖仅用于开发验证，不是 Skill 或网页的运行依赖。

```bash
# 在独立开发目录安装，或使用项目已有依赖。
npm install --no-save playwright pngjs
npx playwright install chromium firefox webkit
node /absolute/path/to/glass-ui/scripts/validate_browser.mjs --browser chromium,firefox,webkit --output ./glass-results --require-all true
```

`--module-dir` 可指定已有 Node 项目目录；`--browser edge` 使用本机 Microsoft Edge。路径用你自己的实际目录，不要把示例占位路径直接运行。脚本记录缺失浏览器为 skipped；`--require-all true` 会使跳过也返回失败。不要把 skipped 写成通过。Windows 上的 Playwright WebKit 只是该引擎的自动化测试，不是 macOS Safari 或 iPhone 真机测试。

回归覆盖纵向/RTL tabs、禁用项跳过、已知图片折射像素差、图片移动时位移图复用、质量档位、透明与对比偏好、原有表单/焦点及清理行为。实际通过数量与浏览器版本以输出的 `report.json` 为准；测试用已知背景不能证明任意 DOM backdrop 有效。

本次发布的[浏览器报告](../docs/browser-validation.json)记录 66 项通过。增加对比度在新建上下文中验证，因为测试所用 Firefox 的运行中偏好模拟没有更新既有 MediaQueryList；运行中减少动态效果另外验证。不要为这一自动化限制加入生产环境 UA 补丁。[平台样板报告](../docs/adapter-validation.json)单独记录 Flutter 测试与小程序尚未运行的范围。

Flutter 样板应在目标 Flutter 工程中先 analyze，再运行含原生子控件、减少透明度、高对比与零 blur 的 widget tests。小程序至少检查 JSON/WXML/JS，再在目标基础库和真实设备验证 enhanced 模式；源文件检查不等于小程序真机成功。
