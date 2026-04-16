# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

The source tree for **Claude Code** — Anthropic's terminal-based coding agent. It's a Bun-bundled TypeScript CLI that renders a React/Ink TUI, drives agentic conversations against the Claude API, and exposes tools, slash commands, skills, and MCP integrations.

The repo root is the `src/` tree itself (imports use `src/...` paths). There is no `package.json`, `tsconfig.json`, or build script checked in here; treat this as source-only and work within existing patterns rather than introducing new tooling.

## Runtime & build conventions

- **Runtime**: Bun. Entry: `entrypoints/cli.tsx` → `main.tsx`. `cli.tsx` has fast-paths (e.g. `--version`) that avoid loading the full CLI.
- **Imports**: ESM with `.js` extensions on TypeScript files (e.g. `import x from './foo.js'` resolves to `foo.ts`). Keep this convention.
- **Bundle-time feature flags**: `import { feature } from 'bun:bundle'`. `feature('FLAG_NAME')` is replaced at bundle time, so `if (feature('X')) { require(...) }` becomes dead-code-eliminated. Use for ANT-only / variant-specific code. `MACRO.VERSION` is similarly inlined.
- **Conditional ANT-only imports**: Patterns like `process.env.USER_TYPE === 'ant' ? require(...) : null` gate internal-only tools (see `tools.ts`).
- **React for TUI**: React renders through the bundled Ink fork in `ink/` (not the npm package). Components live in `components/` and `ink/components/`.
- **Schemas**: `zod/v4`. Tool input/output schemas use Zod; see `schemas/` and per-tool `types.ts`.
- **SDK**: `@anthropic-ai/sdk` for Claude API; `@modelcontextprotocol/sdk` for MCP.
- **Lint/format**: Biome (`biome-ignore-*` comments) plus custom ESLint rules — notably `custom-rules/no-top-level-side-effects` and `custom-rules/no-process-env-top-level`. Respect these; if you need a side effect at import time, add the lint-disable with a one-line justification matching existing examples.

## Top-level layout

### Root files (the spine)
- `main.tsx` — full CLI bootstrap, Commander setup, dispatch into the TUI or headless modes. Large; most changes are additive.
- `QueryEngine.ts` — high-level query orchestration (message stream, usage accumulation, SDK message types).
- `query.ts` — lower-level query loop (tool calls, turn handling, compaction).
- `Tool.ts` — `Tool` / `Tools` types, `toolMatchesName`, `ToolInputJSONSchema`. The core tool contract.
- `tools.ts` — registers every tool into the active tool list (feature-gated).
- `commands.ts` — registers every slash command.
- `Task.ts` / `tasks.ts` — task type definitions (`local_bash`, `local_agent`, `remote_agent`, `in_process_teammate`, `local_workflow`, `monitor_mcp`, `dream`) and task state helpers.
- `context.ts`, `history.ts`, `setup.ts`, `cost-tracker.ts`, `costHook.ts`, `interactiveHelpers.tsx`, `dialogLaunchers.tsx`, `replLauncher.tsx`, `projectOnboardingState.ts`, `ink.ts` — cross-cutting glue.

### Directories
- `entrypoints/` — `cli.tsx` (bootstrap), `init.ts` (telemetry/config init), `mcp.ts`, `sdk/`, plus agent/SDK/sandbox types.
- `tools/` — one directory per tool (`BashTool/`, `FileEditTool/`, `AgentTool/`, `TaskCreateTool/`, `WebFetchTool/`, `SkillTool/`, etc.). Each tool directory typically holds the tool definition, a `UI.tsx` for result rendering, a `prompt.ts` for the tool description, and helpers. `tools/shared/` and `tools/testing/` hold cross-tool utilities.
- `commands/` — one directory (or file) per slash command. See `commands.ts` for the import list.
- `components/` — React components for the TUI (dialogs, messages, pickers, status lines).
- `ink/` — custom Ink renderer (reconciler, layout, DOM, events, termio). Includes `components/`, `hooks/`, `events/`, `layout/`, `termio/`. Do not assume stock Ink APIs.
- `hooks/` — React hooks used by the TUI (input, keybindings, IDE integration, settings, polling, voice, swarm, etc.).
- `services/` — longer-running subsystems: `api/` (Claude API client, batching, logging), `mcp/`, `analytics/`, `compact/`, `lsp/`, `oauth/`, `plugins/`, `policyLimits/`, `settingsSync/`, `voice*`, `extractMemories/`, `PromptSuggestion/`, `SessionMemory/`.
- `utils/` — large grab-bag of helpers (file IO, git, shell, sandbox, permissions, telemetry, settings, sessions, swarm, teammate, skills, tasks, TODOs, terminal, hooks, etc.). Prefer finding an existing helper before writing a new one.
- `state/` — global `AppState` store, selectors, teammate view helpers.
- `context/` — React contexts (mailbox, notifications, overlay, prompt overlay, stats, voice, fpsMetrics, QueuedMessage).
- `hooks/toolPermission/`, `utils/permissions/` — permission / approval system.
- `schemas/`, `types/` — shared Zod schemas and TypeScript types (including `types/generated/`).
- `constants/` — inlinable literals (tool limits, keybindings, prompts, figures, OAuth, messages).
- `skills/` — skill loader plus `bundled/` built-in skills (`batch`, `loop`, `simplify`, `claudeApi`, `updateConfig`, `keybindings`, `remember`, `stuck`, `verify`, `skillify`, `loremIpsum`, …).
- `plugins/` — plugin runtime and `bundled/` plugins.
- `tasks/` — task backends: `LocalAgentTask/`, `RemoteAgentTask/`, `LocalShellTask/`, `InProcessTeammateTask/`, `DreamTask/`, plus `LocalMainSessionTask.ts`.
- `bridge/`, `remote/`, `server/` — remote control / direct-connect bridge (mobile/web handoff, session runner, JWT, transport).
- `assistant/`, `buddy/`, `coordinator/`, `moreright/`, `voice/`, `vim/` — feature modules, most gated on `feature('KAIROS')`, `feature('COORDINATOR_MODE')`, etc.
- `cli/` — transports, print mode, structured/NDJSON IO, exit, update helpers for non-interactive runs.
- `migrations/` — one-shot config/settings migrations (model renames, setting relocations); each is idempotent and runs on startup.
- `memdir/` — memory directory (CLAUDE.md scanning, team memory, relevance).
- `native-ts/` — JS ports of native deps (`color-diff`, `file-index`, `yoga-layout`).
- `outputStyles/` — loader for custom output styles.
- `keybindings/` — keybinding definitions and parsing.

## Key mental models

### Tools
Every tool is a `Tool` implementing the contract in `Tool.ts`: name, input schema (Zod), description prompt, permission check, `call` / `renderToolUseMessage` / `renderResultForAssistant`. Tools are registered in `tools.ts` (order and feature-gating matter). To add a tool: create `tools/FooTool/FooTool.ts` + `UI.tsx` + `prompt.ts` + `types.ts`, export it, and add it to the list in `tools.ts`.

### Slash commands
Commands live under `commands/<name>/index.ts(x)` (or a single file). Each exports a `Command` with `name`, `description`, `userFacingName`, optional args parsing, and a run function. Register in `commands.ts`. Some commands have moved to plugins via `createMovedToPluginCommand.ts`.

### Skills
Bundled skills are in `skills/bundled/`; each exports metadata + trigger hints + body. Registered via `bundledSkills.ts`. Skills are invoked through the `SkillTool`. User/project skills are loaded by `loadSkillsDir.ts`.

### Query loop
`main.tsx` → TUI renders → user input → `QueryEngine.ts` drives turns → `query.ts` runs the inner tool/response loop → tools execute with permission checks (`hooks/toolPermission/`, `utils/permissions/`) → UI updates through the Ink renderer.

### Tasks (agents, swarms, background work)
`Task.ts` defines task types and lifecycle. Backends in `tasks/` handle execution. Swarm/teammate state lives in `utils/swarm/`, `utils/teammate.ts`, `state/teammateViewHelpers.ts`.

### Permissions
Tool approval flows through `hooks/toolPermission/`, `hooks/useCanUseTool.tsx`, and `utils/permissions/`. Bash-specific rules: `tools/BashTool/bashPermissions.ts`, `bashSecurity.ts`, `shouldUseSandbox.ts`.

### Config & settings
Settings pipeline in `utils/settings/` + `services/settingsSync/` + `services/remoteManagedSettings/` + `utils/config.ts`. Migrations live in `migrations/` and run at startup.

### Bridge / remote
Mobile/web remote sessions flow through `bridge/` (REPL bridge, polling, transport, JWT trust) and `remote/` (session manager, WebSocket, permission bridge). `server/` handles direct-connect peer sessions.

## Working conventions

- **Paths**: always `.js` suffix on internal imports, even for TS. Use `src/...` for absolute imports when seen in existing files (see `QueryEngine.ts`).
- **Side effects at import**: avoid. If unavoidable, add `// eslint-disable-next-line custom-rules/no-top-level-side-effects` with a short reason matching nearby comments.
- **`process.env` access**: gated by `custom-rules/no-process-env-top-level`. Prefer helpers in `utils/env.ts`, `utils/envDynamic.ts`, `utils/envUtils.ts`, `utils/envValidation.ts`.
- **Feature gating**: wrap ANT-only or variant-specific code in `feature('…')` checks for DCE; use `process.env.USER_TYPE === 'ant'` only where already established.
- **Lazy requires for cycles**: `main.tsx` uses `/* eslint-disable @typescript-eslint/no-require-imports */` blocks with arrow-function lazy requires to break circular deps — follow that pattern rather than restructuring modules.
- **No new top-level docs or config**: unless asked. Prefer editing existing files. There are no checked-in lint/test/build scripts in this tree, so don't invent `npm run …` commands.
- **UI changes**: add components under `components/` (or `ink/components/` for renderer primitives). Register dialogs through `dialogLaunchers.tsx`.
- **Telemetry / analytics**: go through `services/analytics/` and `utils/telemetry/`. Use the existing `logEvent` / `AnalyticsMetadata_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS` guardrails when adding events.
- **Commit messages**: follow the existing short imperative style (see `git log`, e.g. `feat: --other= download from x.com`).

## Git / branch policy

Active development branch for this session: **`claude/add-claude-documentation-BsQTE`**. Commit and push here; do not push to other branches without explicit approval. Use `git push -u origin <branch>` and retry with exponential backoff on network errors. Never `--force` to main.

GitHub access is limited to the `weieiyn-star/claudecode` repo via the `mcp__github__*` tools; no `gh` CLI. Only open PRs when the user explicitly asks.

## Finding things fast

- A tool named `FooTool` → `tools/FooTool/`.
- A slash command `/foo` → `commands/foo/` (check `commands.ts`).
- A skill `/bar` → `skills/bundled/bar.ts` (check `bundledSkills.ts`).
- A React hook `useX` → `hooks/useX.ts(x)` or `ink/hooks/use-x.ts`.
- An API call to Claude → `services/api/claude.ts` and siblings.
- MCP handling → `services/mcp/` and `tools/MCPTool/`, `tools/McpAuthTool/`, `tools/ListMcpResourcesTool/`, `tools/ReadMcpResourceTool/`.
- Permission prompts → `hooks/toolPermission/`, `utils/permissions/`, `components/MCPServerApprovalDialog.tsx`, etc.
- Settings migrations → `migrations/` (one file per migration; idempotent).

When in doubt, grep before creating. This tree is large and duplication is easy.
