# 在线展示站

[简体中文](website.md) | [English](en/website.md)

访问 [Glass UI](https://aivos-xie.github.io/glass-ui/) 体验可操作的玻璃组件。页面使用本 Skill 的材质与交互控制器，采用静态 HTML、CSS 和 JavaScript，无构建步骤、远程字体或分析脚本。

通过顶部导航和分类标签进入组件、材质与交互区域。组件搜索可定位对应样例；页面语言、深浅主题、动态效果和材质均可切换。代码示例提供复制操作，复制所需组件时同时保留其样式和行为资源。菜单可复制当前配置或下载真实的 JSON 文件。

站点默认使用深色磨砂主题。静态彩色背景覆盖整页，卡片、导航胶囊与按钮可以透出背景层次；导航选中项使用较轻的透明填充和定向边缘高光。右上角太阳按钮可切回浅色，设置抽屉与主题按钮保持同步。实色表面、无模糊与系统增加对比度等设置保留可读回退。

[追光与 3D 卡片专属演示](https://aivos-xie.github.io/glass-ui/#spotlight-demo)提供更清晰的磨砂背景对照。将鼠标移入卡片，内部柔和径向光斑随指针移动，只有靠近指针的边框局部提亮；合成倾角最高 4°，移出后平滑复原。页面提示当前交互是否启用；系统减少动态、触屏和降低画质等设置会按其偏好回退，不强制开启悬停动效。

发布来源为 `main` 分支的 `/docs`，`docs/index.html` 是网站入口，`.nojekyll` 让 GitHub Pages 直接发布静态文件。修改展示站后检查英文和中文布局、键盘操作、表单与弹层、减少动态和无模糊回退；确认资源在 `/glass-ui/` 项目路径下正常加载，再发布。

`assets/demo/` 是保持独立的基础离线样板，`docs/` 的网站在它之上增加语言切换和站点功能。两者共用的玻璃控制器应保持一致。指定图片折射只处理随附背景，并不保证任意网页内容都能折射。

2026-11-21 的[站点检查](website-validation.json)共 19 项通过；[离线样板核心交互检查](browser-validation.json)在 Edge、Firefox、Playwright WebKit 各通过 22 项，共 66 项，无跳过。[website-core-validation.json](website-core-validation.json)仅保留历史站点核心检查，不代表本轮离线结果。检查覆盖 390、768、1440px 中英文布局、键盘、减少动态、强制颜色与配置导出；不代表真机认证、完整无障碍审计或性能认证。

[追光卡片检查](card-hover-validation.json)在 Edge、Firefox、Playwright WebKit 各通过 19 项，共 57 项。以真实鼠标移动分别验证内部光斑与局部边框像素变化、四角总倾角 ≤4°、连续复原与中英文回退行为。

在仓库根目录安装可选测试依赖 `playwright` 与 `pngjs`，按 Playwright 文档安装所选浏览器，再运行：

```bash
node scripts/validate_browser.mjs --browser edge,firefox,webkit --require-all true --output offline-core-results
node scripts/validate_website.mjs --site docs --browser edge --output website-results
node scripts/validate_card_hover.mjs --site docs --browser edge --output card-hover-edge-results
node scripts/validate_card_hover.mjs --site docs --browser firefox --output card-hover-firefox-results
node scripts/validate_card_hover.mjs --site docs --browser webkit --output card-hover-webkit-results
```

第一条命令默认检查 `assets/demo/`，覆盖离线核心 66 项。站点检查覆盖 19 项；后三条卡片命令分别覆盖 19 项，合计 57 项。站点和卡片命令也支持 `--url https://aivos-xie.github.io/glass-ui/` 检查线上站点。卡片检查逐项对照真实鼠标轨迹、光斑与边框像素、总倾角限幅、退出复原、可点击操作和偏好回退；使用 `--browser firefox` 或 `--browser webkit` 可分别检查其他引擎。`edge` 需要已安装的 Microsoft Edge；其他环境可改为 `chromium` 并安装相应浏览器。

[材质检查](material-validation.json)共 7 项通过，记录普通玻璃样式与实色、静态、无模糊、强制颜色回退；其中的补充回归还记录了 Edge 352 项组合检查，确认强制颜色与多种实色设置同时启用时保留系统颜色。Edge 另通过 CDP 模拟系统减少透明度；所测 Firefox 与 WebKit 未暴露该媒体特性，不能据此宣称其系统偏好分支已认证。
