# ACode — Multi-Agent Development Plan

**Project:** ACode (rebranded from Kilo Code → ACode, forked from `SFARPak/kilocode`)
**Repo:** `github.com/farhan/ACode` (local: `/Volumes/Farhan/Desktop/ACodeV2/ACode`)
**Branch convention:** `main` = stable, `V2` = active dev (current), `agent/<role>-<scope>` = agent work
**Working model:** Parallel contractor team. Each agent owns one scope, works in an isolated git worktree, opens a PR. I coordinate.

---

## Phase 0 — Foundation (in progress)
- [x] Fork repo locally (`kilocode_original/`)
- [x] Initial commit renaming project to ACode
- [ ] Sweep rebrand (kill `kilocode` / `kilo-code` / `KiloCode` references in user-facing paths where appropriate)
- [ ] Add NVIDIA provider with all 40+ models from `integrate.api.nvidia.com/v1/chat/completions`
- [ ] Add official Anthropic, OpenAI, Google, Mistral, Moonshot, StepFun, Stockmark, Upstage, Z-AI, Sarvam, ByteDance, Abacus, DeepSeek, Meta, Microsoft, Qwen provider polishing
- [ ] Kill all upstream `kilocode` traces in `.github`, `patches`, `bin`, `install`
- [ ] Replace `kilocode_change` marker with `acode_change`, update allowlist script
- [ ] Polished README, CONTRIBUTING, RELEASING, SECURITY for ACode
- [ ] Dev plan published at `github.com/farhan/ACode` main branch

## Phase 1 — Quality & Precision
- [ ] `bun run typecheck` clean across the monorepo
- [ ] `bun run lint` clean
- [ ] Targeted unit tests pass in `packages/opencode/` (provider layer)
- [ ] `bun run knip` clean in `packages/kilo-vscode/` (will rename to `packages/acode-vscode/`)
- [ ] CI workflows green; `script/check-workflows.ts` allowlist updated

## Phase 2 — Cost-Effectiveness
- [ ] Caching layer for identical requests (provider-agnostic)
- [ ] Token-usage telemetry dashboard
- [ ] Cheapest-model router for trivial tasks
- [ ] Cost guardrails / per-request budget caps

## Phase 3 — Release & Distribution
- [ ] Versioned release `v0.1.0-acode` with changelog
- [ ] VSIX build published to GitHub Releases
- [ ] JetBrains plugin aligned naming
- [ ] Website / docs site `docs.acode.dev` (or GitHub Pages)

---

## Microtasks for the current wave

Each agent's task is listed under its scope below. Each agent must **commit + push its branch + open a PR** before reporting done.

### Brand sweep agent
1. Inventory every user-facing string referencing `kilo`/`Kilo`/`kilocode`/`KiloCode` (README*, UI strings, package display names, settings labels, telemetry events, command palette entries).
2. Produce `BRAND_INVENTORY.md` listing every hit with: file path, line range, current string, recommended replacement.
3. Open a PR-shaped branch (`agent/rebrand-sweep`) with the inventory only — do **not** rename files yet. Renames happen in a second pass after review.

### NVIDIA provider agent
1. Find the `packages/opencode/src/provider/` layout and how existing providers (Anthropic, OpenAI) are wired.
2. Add `nvidia` provider following the same pattern: base URL `https://integrate.api.nvidia.com/v1`, OpenAI-compatible chat completions.
3. Ship **all 40+ models** from the pasted spec, grouped by namespace (`abacusai/*`, `bytedance/*`, `deepseek-ai/*`, `google/*`, `meta/*`, `microsoft/*`, `minimaxai/*`, `mistralai/*`, `moonshotai/*`, `nvidia/*`, `openai/*`, `qwen/*`, `sarvamai/*`, `stepfun-ai/*`, `stockmark/*`, `upstage/*`, `z-ai/*`).
4. Sampling defaults per model where the API requires them (`reasoning_effort`, `top_p`, `max_tokens`).
5. Open PR `agent/provider-nvidia`.

### Upstream-reference linter
1. `git grep -nE "kilocode_change|kilocode_cli|KiloOrg|kilo-code|SFARPak/kilocode"` across the tree, excluding `packages/opencode/src/kilocode/` and `*/kilocode/*` paths.
2. Categorize hits: docs, code comments, telemetry, install scripts, CI.
3. Open PR `agent/upstream-lint` with a report and the safe-to-fix edits already applied (small, mechanical text replacements only).

### Dev-plan publisher
1. This file (`.acode/ROADMAP.md`) is the canonical dev plan.
2. Add `.acode/AGENT_HANDOFF.md` with: rules of engagement, branch conventions, PR template, "what NOT to touch" list (do not touch upstream merge boundaries, do not edit `packages/opencode/src/opencode/*` shared files without `acode_change` markers, etc.).
3. Commit + push both files on `main` (or `V2` then merge to main after review).

---

## Coordination rules
- One agent = one branch = one PR. Never rebase another agent's branch.
- All branches off `V2`, not `main`. I'll merge `V2` → `main` after the wave lands.
- If two agents MUST edit the same file, the second agent waits. Ping me.
- Agents report: branch name, commit SHA, PR URL, summary of files changed, any blockers.

## Out of scope (today)
- Re-naming packages (`kilo-vscode` → `acode-vscode`) — that's a breaking change for the JetBrains/VSIX build pipeline; scheduled for Phase 3 with explicit versioning.
- Replacing upstream OpenCode fork internals — too risky, out of budget.
