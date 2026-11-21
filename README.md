# Glass UI · 通用玻璃界面 Skill

[简体中文](README.md) | [English](README.en.md)

给能读取 Markdown 和项目文件的 AI Agent 使用的玻璃 UI 设计规则与组件样板。核心指令不依赖 Codex、Claude 或任何厂商专用工具，采用 [Agent Skills 开放格式](https://agentskills.io/specification)。

## 给 Agent 一句话就能安装

复制下面这句话，发给你正在使用的 Agent：

> 请从 https://github.com/aivos-xie/glass-ui 安装 Glass UI Skill，先阅读 INSTALL.md，按你当前 Agent 的方式安装或接入并验证，完成后告诉我安装位置。

Agent 会根据 [安装说明](INSTALL.md) 选择自己的安装位置。支持原生 Skill 的产品使用原生发现机制；没有原生 Skill 的产品可使用本地指令文件接入。只有聊天、没有文件或工具权限的产品可以阅读内容用于当前会话，但不能宣称已经持久安装。

仓库的可见性和 GitHub 访问权限仍然适用：私有仓库需要已有访问权限，公开仓库可直接读取。

## 支持哪些 Agent

| 环境 | 接入方式 |
| --- | --- |
| Codex、Claude Code、Cursor、Gemini CLI、GitHub Copilot、OpenCode、Cline、Windsurf 等 | 使用 Skills CLI 选择对应 Agent，安装完整资源目录 |
| 其他支持 Agent Skills / `SKILL.md` 的 Agent | 放进该产品文档指定的 Skill 目录 |
| 没有原生 Skill、但支持项目指令的 Agent | 保存完整目录，再在项目指令中添加一条按需读取入口 |
| 自定义 Agent / API 工作流 | 读取 `SKILL.md` 作为任务指令，按需提供其引用文件 |

支持程度取决于宿主的文件读取、代码编辑、终端和浏览器能力；“安装成功”与“在每个产品里完成交互实测”分别记录。

## 终端安装

下面使用已经验证过的 `skills@1.9.0`；它需要 Node.js 22.20.0 或更新版本及 Git。它们是安装器的要求，Glass UI 本身没有这些运行依赖。

```bash
# Claude Code 示例；把 claude-code 换成当前 Agent 的标识。
npx --yes skills@1.9.0 add aivos-xie/glass-ui --skill glass-ui --agent claude-code --global --copy --yes
```

常用标识：`codex`、`claude-code`、`cursor`、`gemini-cli`、`github-copilot`、`opencode`、`cline`、`windsurf`。完整列表和当前目录映射由 [Skills CLI](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) 维护。

若用户只要求当前项目可用，去掉 `--global`，在项目根目录执行。一次安装给多个指定 Agent，可写成 `--agent claude-code cursor`。无 Node.js 或不在支持列表中的环境，使用 [无需 CLI 的安装路径](INSTALL.md#无需-cli-的安装路径)。

## 使用

安装后可以直接说：

> 使用 Glass UI Skill 为当前页面加入磨砂玻璃卡片、追光边框和滑动选中胶囊，保留现有业务行为。

支持显式 Skill 命令的 Agent 也可以使用自己的原生语法，例如 Codex 的 `$glass-ui`。单个开关、表单、按钮或导航的请求只实现对应组件，无需引入整套展示页。

## 交互效果

![浅色组件展示](docs/preview.png)

- **玻璃卡片**：柔和追光、局部边框高光、最高 4° 的整体倾斜和离开复原。
- **选中胶囊**：沿切换方向拉伸、到位弹性回弹、连续快速切换，前景文字不被拉伸。
- **组件体系**：磨砂、清透液态、染色、棱镜边缘；覆盖按钮、选项、表单、导航、菜单和弹层。
- **可用性**：键盘、触屏、减少动态效果、强制颜色和无模糊回退。

直接打开 [离线演示](assets/demo/index.html)，无需构建，也没有远程字体、图片或脚本。

![深色组件展示](docs/preview-dark.png)

另有 [移动端截图](docs/preview-mobile.png)。

## 多语言文档

中英文文档覆盖项目说明、安装步骤、Skill 使用指南、材质与交互、组件配方、框架接入和验收要求。演示界面的文案目前为中文，本次多语言支持覆盖说明文档。

| 内容 | 简体中文 | English |
| --- | --- | --- |
| 安装 | [安装说明](INSTALL.md) | [Installation guide](INSTALL.en.md) |
| Skill 使用 | [Skill 入口](SKILL.md) | [Skill guide](docs/en/skill-guide.md) |
| 材质与交互 | [参考说明](references/materials-and-motion.md) | [Materials and motion](docs/en/materials-and-motion.md) |
| 组件 | [组件配方](references/components.md) | [Component recipes](docs/en/components.md) |
| 框架接入 | [实现与选库](references/implementation.md) | [Implementation](docs/en/implementation.md) |
| 验收 | [验收清单](references/validation.md) | [Validation](docs/en/validation.md) |

## 文件结构

```text
SKILL.md                     所有 Agent 共用的核心指令
README.md / README.en.md      中英文项目说明
INSTALL.md / INSTALL.en.md    给执行安装任务的 Agent 阅读
agents/openai.yaml           可选 Codex 元数据，其他 Agent 可忽略
references/                  材质、组件配方、实现与验收规则
docs/en/                     英文使用指南与技术参考
assets/demo/                 无依赖 HTML / CSS / JavaScript 样板
scripts/check_assets.py      资源、引用和基础语义检查
docs/                        演示截图与验证记录
```

## 验证

[界面验证记录](docs/validation.json) 包含 2026 年 11 月 21 日通过的 20 项检查，覆盖倾角、快速切换、键盘与焦点、表单、弹层、窄屏布局及控制器清理。浏览器实测为 Microsoft Edge / Chromium；Safari 和 Firefox 尚未实测。

跨 Agent 的安装验证单独见 [安装验证记录](docs/installation-validation.json)，不把目录安装检查当成各产品的运行验证。

资源检查使用 Python 3 标准库：

```bash
python scripts/check_assets.py
```

接入项目时按需参考 [实现说明](references/implementation.md)，并针对项目实际框架、背景、浏览器与交互重新验证。
