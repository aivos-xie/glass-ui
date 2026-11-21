# Glass UI 安装说明 · 给执行安装任务的 Agent

[简体中文](INSTALL.md) | [English](INSTALL.en.md)

将完整的 Glass UI Skill 安装到你当前宿主能读取的位置，然后验证入口与资源。核心格式是 `SKILL.md` 加相对路径资源，不依赖任何特定厂商。本文只负责安装；安装后的玻璃设计任务从 [SKILL.md](SKILL.md) 或其 [英文指南](docs/en/skill-guide.md) 开始。

## 一句话入口

> 请从 https://github.com/aivos-xie/glass-ui 安装 Glass UI Skill，先阅读 INSTALL.md，按你当前 Agent 的方式安装或接入并验证，完成后告诉我安装位置。

## 选择当前环境

1. 从当前宿主和它的配置确定 Agent 身份，不根据机器上同时存在的其他 Agent 目录猜测。用户已指定目标或路径时，沿用用户选择。
2. 默认安装到当前 Agent 的用户级 Skill 目录；用户要求“这个项目”时安装到项目级目录。安装器不支持该宿主的用户级目录时，使用该宿主支持的项目级目录并说明范围。
3. 检查同名目录。内容相同则验证后结束；有用户修改时先保留修改或备份到 Skill 扫描目录之外，再执行已授权的更新。不要盲目覆盖。
4. 只为当前或用户点名的 Agent 安装。`--agent '*'` 和 `--all` 会扩大安装范围，只有用户明确要求时才使用。

## 首选：Skills CLI

已有 Node.js **22.20.0+** 和 Git 时，使用经过本仓库验证的版本：

```bash
npx --yes skills@1.9.0 add aivos-xie/glass-ui --skill glass-ui --agent <agent-id> --global --copy --yes
```

执行前把 `<agent-id>` 替换为真实标识，不能照抄占位符。常见标识如下；其他标识和目录以 [安装器支持表](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) 或宿主当前文档为准。

| 当前宿主 | `agent-id` |
| --- | --- |
| Codex | `codex` |
| Claude Code | `claude-code` |
| Cursor | `cursor` |
| Gemini CLI | `gemini-cli` |
| GitHub Copilot | `github-copilot` |
| OpenCode | `opencode` |
| Cline | `cline` |
| Windsurf | `windsurf` |

`--copy` 采用完整文件复制，避免依赖符号链接权限。项目安装时去掉 `--global`，并从项目根目录执行。安装器会选择宿主目录，不要在同一机器上为全部 Agent 创建目录。

私有仓库与公开仓库使用相同命令。私有仓库需要已有 Git 凭据、GitHub CLI 登录或 SSH 权限；遵循当前认证流程，不把令牌放进命令、源文件、日志或对话。若读取仓库网页失败，可通过已认证 Git 克隆后读取本文。认证失败时准确报告缺少访问权限，不能报告安装成功。

仓库已克隆或用户给了本地包时，可把仓库参数换成该目录的绝对路径，其他参数保持一致。不必为使用这个 Skill 强制安装新的运行时；没有合适 CLI 时走下面的路径。

## 无需 CLI 的安装路径

### 宿主支持原生 Skill

从宿主文档或现有配置确定它实际读取的 Skill 目录，再通过已有 Git、下载/解压工具或本地文件操作，将仓库完整复制为其中的 `glass-ui` 子目录。入口必须是 `<安装目录>/glass-ui/SKILL.md`；不能多套一层仓库目录，也不能只复制 `SKILL.md`。

保留完整目录及所有本地文档链接，包括 `SKILL.md`、中英文 README 和安装说明、`references/`、`docs/`、`assets/` 和 `scripts/`。`agents/openai.yaml` 是可选元数据，缺少它不会阻止其他宿主使用本 Skill。

不要假定 `.codex/skills`、`.claude/skills` 或 `.agents/skills` 对所有产品都生效；优先使用该宿主的原生位置及加载规则。

### 宿主只支持项目指令

将完整资源目录保存到项目的 `.agent-resources/skills/glass-ui/`。这是资源存放位置，不是假定宿主会自动扫描的目录。

在宿主实际会读取的项目指令文件中，追加或更新下面这一小段入口；保留文件中所有无关内容，不把整个 Skill 展开写入项目指令。若标记已存在，原位更新，不重复追加。

```markdown
<!-- glass-ui:start -->
遇到玻璃 UI、磨砂卡片、液态导航或追光组件任务时，先读取
`.agent-resources/skills/glass-ui/SKILL.md` 或英文指南
`.agent-resources/skills/glass-ui/docs/en/skill-guide.md`，再按需读取
当前任务需要的引用资源；其他任务无需加载。
<!-- glass-ui:end -->
```

指令文件可以是该宿主明确支持的 `AGENTS.md`、`CLAUDE.md`、`GEMINI.md` 或规则文件，选择当前宿主实际读取的一个，不要同时改动所有文件。文件内的路径必须相对于实际指令文件可解析；如果规则文件位于子目录，调整路径。

### 自定义 Agent 或只有聊天能力的环境

能读取文件的自定义 Agent 可直接把 `SKILL.md` 或 [英文指南](docs/en/skill-guide.md) 作为按需加载的指令，并给它访问相邻资源的能力。只有聊天、没有持久文件或配置权限的环境只能在当前会话读取和使用 Skill；向用户说明这个限制，不声称已经永久安装，也不创建无法被宿主发现的目录冒充成功。

## 安装后必须验证

- 确认实际安装路径存在，`SKILL.md` 的名称为 `glass-ui`，引用的中英文文档、演示资源和脚本均存在。
- 有 Python 3 时运行安装目录中的 `scripts/check_assets.py`。没有 Python 时检查相同的文件与相对引用，并说明没有运行脚本。
- 走原生 CLI 时执行 `npx --yes skills@1.9.0 list --agent <agent-id> --global --json`，项目安装则去掉 `--global`；同时直接读取已安装文件，不只相信退出码。
- 原生宿主支持枚举/重载 Skill 时，用其机制确认可发现。需要新会话或重载时明确说明；不把安装器目录识别当成真实宿主已加载。
- 走项目指令接入时，验证入口文件确实由该宿主读取，并且路径可解析。

最后报告：Agent 名称、安装路径、全局或项目范围、原生或项目指令接入方式、已执行的验证及仍需用户完成的加载动作。安装结束不自动修改用户业务代码。

## 依据

- [Agent Skills 格式](https://agentskills.io/specification)
- [Skills CLI 安装与私有仓库认证](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-add)
- [Skills CLI 支持的 Agent](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)

安装器参数和运行要求以本仓库实测的 `skills@1.9.0` 为准；宿主会演进，不把本文件中的示例当成所有未来版本的目录保证。
