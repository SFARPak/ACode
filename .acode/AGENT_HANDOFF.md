# ACode — Agent Handoff (rules of engagement)

You are an agent working on the **ACode** monorepo (fork of Kilo Code, rebranded).
Project root: `/Volumes/Farhan/Desktop/ACodeV2/ACode`
Roadmap: `.acode/ROADMAP.md` — read it before doing anything.

---

## Your identity
- You are a contractor. You own one scope, one branch, one PR.
- The user is **Farhan Ali Shah**. Audit-grade precision matters more than speed.
- I (the orchestrating agent) coordinate. If you hit a scope conflict, stop and report — do not race another agent.

## Working directory rules
- **Always work in a fresh git worktree**, off `V2`. Never edit files in the main checkout.
- Create the worktree: `git worktree add ../acode-<your-branch> -b agent/<your-branch> V2`
- Run all commands from inside that worktree directory. Never `cd ..` back to the main one.

## Commit & push rules
- Commit messages: `acode(<scope>): <imperative summary>` — e.g. `acode(rebrand): inventoried kilo references`.
- One logical change per commit. One PR per scope.
- Push: `git push -u origin agent/<your-branch>`
- Open PR with: `gh pr create --base V2 --head agent/<your-branch> --title "..." --body "..." --label agent-wave-N`.

## Code rules
- Do **NOT** rename these (out of scope for now, breaking for build pipeline):
  - `packages/kilo-vscode/` → directory rename
  - `packages/kilo-jetbrains/` → directory rename
  - Any `kilocode` directory under `packages/opencode/src/` (Kilo's local fork-contrib layer is intentional)
- DO rename in **content** where it appears in `README*`, UI strings, CLI command names, settings labels, telemetry events, install scripts, CI workflow names.
- DO add `acode_change` markers in shared `packages/opencode/src/opencode/*` files where you change shared upstream code.
- DO update `script/check-workflows.ts` allowlist if you add or remove any `.github/workflows/*.yml`.
- DO update `packages/kilo-docs/source-links.md` if you change any URL (run `bun run script/extract-source-links.ts`).

## "Do not touch" list
- `packages/opencode/src/opencode/` — shared upstream code; changes require an `acode_change` marker and must be minimal.
- `bun.lock` — only touch if you actually changed a dependency in `package.json`.
- `node_modules/`, `dist/`, `.turbo/`, `packages/*/build/` — never commit, never edit.

## Quality gates before reporting done
- From the worktree root, run **only the gates relevant to your scope**:
  - Added/edited TS in `packages/opencode/`: `bun run --cwd packages/opencode typecheck`
  - Added/edited TS in `packages/kilo-vscode/`: `bun run --cwd packages/kilo-vscode typecheck`
  - Lint: `bun run lint` from root
- If a gate fails, FIX IT before reporting. If you cannot, report exactly which check failed and the error.

## Reporting back
At the end of your run, return this exact JSON in your final message:
```json
{
  "branch": "agent/...",
  "commit_sha": "<full SHA>",
  "pr_url": "https://github.com/farhan/ACode/pull/...",
  "files_changed": ["path1", "path2", ...],
  "lines_added": <int>,
  "lines_removed": <int>,
  "gates_run": ["typecheck", "lint"],
  "gates_passed": true/false,
  "blockers": [] or ["..."]
}
```
If anything is missing, explain in prose. Never fabricate SHAs or PR URLs.

---

## Useful entry points
- Providers live in `packages/opencode/src/provider/`. Look at how Anthropic / OpenAI are wired; mirror that. (`provider.ts`, `transform.ts`, etc.)
- README + AGENTS.md live at repo root.
- The full NVIDIA models list is in your task brief.
