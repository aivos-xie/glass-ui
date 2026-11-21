# Glass UI installation guide for agents

[English](INSTALL.en.md) | [简体中文](INSTALL.md)

Install the complete Glass UI skill where your current host can read it, then verify its entrypoint and resources. The package consists of `SKILL.md` and relative resources, without vendor-specific requirements. This document covers installation; start design work with [SKILL.md](SKILL.md) or its [English guide](docs/en/skill-guide.md).

## One-message installation prompt

> Install the Glass UI skill from https://github.com/aivos-xie/glass-ui, read INSTALL.en.md first, choose the installation or instruction integration supported by your current agent, verify it, and report the installation path.

## Select the current environment

1. Identify the current agent from its host and configuration. Do not infer its identity from unrelated agent directories on the same machine. Honor a destination or host already specified by the user.
2. Default to the current agent's user-level skill directory. If the user requested this project only, use the project-level directory. If the installer cannot provide a user-level location for that host, use its supported project location and report that scope.
3. Inspect an existing directory with the same name. If its contents already match, verify it and finish. Preserve user changes or back them up outside skill discovery directories before an authorized update; do not overwrite blindly.
4. Install only for the current agent or agents explicitly named by the user. `--agent '*'` and `--all` expand the installation scope and should be used only when requested.

## Preferred path: Skills CLI

With Node.js **22.20.0+** and Git already available, use the tested installer version:

```bash
npx --yes skills@1.9.0 add aivos-xie/glass-ui --skill glass-ui --agent <agent-id> --global --copy --yes
```

Replace `<agent-id>` before running the command. Do not execute the placeholder literally. For other identifiers and directory mappings, consult the [installer's supported agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md) or the host's current documentation.

| Current host | `agent-id` |
| --- | --- |
| Codex | `codex` |
| Claude Code | `claude-code` |
| Cursor | `cursor` |
| Gemini CLI | `gemini-cli` |
| GitHub Copilot | `github-copilot` |
| OpenCode | `opencode` |
| Cline | `cline` |
| Windsurf | `windsurf` |

`--copy` copies the complete files without relying on symlink permissions. For project installation, omit `--global` and run from the project root. Let the installer choose the host's directory; do not create directories for every agent on the machine.

The command is the same for private and public repositories. A private repository requires existing Git credentials, GitHub CLI authentication, or SSH access. Follow the current authentication flow without putting tokens in commands, source files, logs, or chat. If the repository web page cannot be read, clone it using authenticated Git and read this document locally. Report an access failure accurately rather than claiming installation succeeded.

If a clone or local package is already available, replace the repository argument with that directory's absolute path. Do not force the installation of a new runtime just to use this skill; use the following path when the CLI is unavailable.

## Installation without the CLI

### Hosts with native skills

Use the host's documentation or configuration to locate its real skill directory. With available Git, download/extraction, or local file tools, copy the complete repository into a `glass-ui` subdirectory. Its entrypoint must be `<skills-directory>/glass-ui/SKILL.md`, without another nested repository directory. Do not copy only the entrypoint.

Keep the directory intact, including both languages of the README and installation guide, `SKILL.md`, `references/`, `docs/`, `assets/`, and `scripts/`, so local links remain valid. `agents/openai.yaml` is optional metadata; other hosts can use the skill without it.

Do not assume `.codex/skills`, `.claude/skills`, or `.agents/skills` works for every product. Use the location and loading rules of the actual host.

### Hosts with project instructions only

Store the complete resources at `.agent-resources/skills/glass-ui/` inside the project. This is a resource location, not a claim that the host scans it automatically.

Add or update a small entry in a project instruction file that this host actually reads. Preserve all unrelated content. Do not expand the entire skill into the instruction file. If the marker already exists, update that block instead of appending a duplicate.

```markdown
<!-- glass-ui:start -->
For glass UI, frosted card, liquid navigation, or pointer-lit component work,
first read `.agent-resources/skills/glass-ui/SKILL.md` or its English guide at
`.agent-resources/skills/glass-ui/docs/en/skill-guide.md`, then load only the
referenced resources needed for the task. Other tasks need not load it.
<!-- glass-ui:end -->
```

Use a file the host explicitly supports, such as `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, or a host-specific rule file. Select the one used by the current host rather than modifying all of them. Make resource paths resolve from the actual instruction file; adjust them if that file is in a subdirectory.

### Custom agents and chat-only environments

A custom agent with file access can load `SKILL.md` or the [English guide](docs/en/skill-guide.md) as task instructions and read adjacent resources as needed. An environment with no persistent files or configuration access can only use the instructions for its current conversation. Explain that limit rather than claiming a permanent installation or creating a directory the host cannot discover.

## Verify after installation

- Confirm the real installation path exists, the skill name is `glass-ui`, and all referenced documentation, demo assets, and scripts are present.
- If Python 3 is available, run `scripts/check_assets.py` from the installed package. Otherwise inspect the same resources and local links and report that the script was not run.
- For the native CLI path, run `npx --yes skills@1.9.0 list --agent <agent-id> --global --json`; omit `--global` for a project installation. Also read the installed files directly rather than relying only on the exit status.
- Use native skill discovery or reload mechanisms when available. Report if a new session or reload is needed; a directory recognized by the installer does not prove that a running host has loaded it.
- For project instruction integration, verify that the host reads that instruction file and that the resource paths resolve.

Report the agent, installation path, user or project scope, native skill or project-instruction integration, completed checks, and any remaining loading action. Do not change the user's application code as part of installation.

## References

- [Agent Skills format](https://agentskills.io/specification)
- [Skills CLI installation and private repository authentication](https://github.com/vercel-labs/skills/blob/main/docs/commands.md#skills-add)
- [Supported agents](https://github.com/vercel-labs/skills/blob/main/docs/agents.md)

Installer flags and runtime requirements refer to the tested `skills@1.9.0`. Hosts evolve; example paths are not guarantees for every future release.
