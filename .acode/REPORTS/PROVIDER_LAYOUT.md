# Provider Layout Map — for Wave 2 NVIDIA implementation

## Top-level structure

`packages/opencode/src/provider/`:
- `provider.ts` — upstream-aware provider registry, **NEVER edit directly** without an upstream-style `(kilocode_change)` annotation. Reads from `KILO_BUNDLED_PROVIDERS` (imported from `@/kilocode/provider/provider`) and merges with dynamically-installed third-party providers (via `@opencode-ai/core/npm`).
- `transform.ts` — message + tool-call normalization, maps `@kilocode/kilo-gateway` → `openrouter` sdk-key (lines 57–58).
- `models.ts`, `models-dev/` — model registry.
- `model-cache.ts`, `model-status.ts` — caching for state.
- `schema.ts` — Zod schemas for `Provider.Model`.
- `auth.ts`, `error.ts` — auth + error glue.

## Kilo-fork layer (where to put NVIDIA-related code)

`packages/opencode/src/kilocode/provider/`:
- `provider.ts` (261 lines) — exports `KILO_BUNDLED_PROVIDERS`, `KILO_MODEL_SCHEMA_EXTENSIONS`, `patchModelsDevModel`, `patchConfigModel`, `patchCustomLoaderResult`, `patchKiloProviderPrivacy`, `kiloSmallModelPriority`, `REQUEST_TIMEOUT_MS`. **This is the only file Wave 2 should edit for the NVIDIA add.**
- `metadata.ts` (40 lines) — provider display name + icon + priority order. **Wave 2 edits here to add `nvidia` to the lists.**
- `codex-refresh.ts`, `models-refresh.ts`, `models-snapshot-shape.ts`, `model-filter.ts` — already-specific code, do not touch.

## Existing patterns to mirror

`kilocode/provider/provider.ts` line 26:
```ts
export const KILO_BUNDLED_PROVIDERS: Record<string, () => Promise<(options: any) => BundledSDK>> = {
  "@kilocode/kilo-gateway": async () => createKilo as unknown as (options: any) => BundledSDK,
}
```

`provider/transform.ts` line 57–58 (the `@kilocode/kilo-gateway` case in `sdkKey()`):
```ts
case "@kilocode/kilo-gateway": // kilocode_change
  return "openrouter"
```

## How to add NVIDIA — exact surgical steps

1. Add entry to `KILO_BUNDLED_PROVIDERS` (in `packages/opencode/src/kilocode/provider/provider.ts`):

```ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

// inside KILO_BUNDLED_PROVIDERS:
"@ai-sdk/openai-compatible": async () => (opts: any) => {
  if (opts?.providerID !== "nvidia") return undefined as any  // not used as catch-all
  return createOpenAICompatible({
    name: "nvidia",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: opts.apiKey ? { Authorization: `Bearer ${opts.apiKey}` } : {},
  })
},
"nvidia": async () => async ({ apiKey }: any) => {
  const sdk = createOpenAICompatible({
    name: "nvidia",
    apiKey: apiKey ?? "",
    baseURL: "https://integrate.api.nvidia.com/v1",
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
  })
  return { languageModel: (modelId: string) => sdk.languageModel(modelId) }
},
```

2. Add `reasoning_effort` adapter — `reasoning_effort` is **only** present in `providerOptions` and only for known reasoning models (Kimi-K2-Thinking, DeepSeek-V4-Pro/Flash, Nemotron-3-Ultra/Nano/Super, Qwen3-Next-Thinking, QwQ-32b, GLM4.7/5.1, Phi-4-Mini-Flash-Reasoning, Mistral-Nemotron). AI SDK's `languageModel(...)` does not pass through unknown options; we need to attach via `providerOptions` in the caller, OR a `transform.ts` extension.

Simpler approach: We document `reasoning_effort` as a model-specific option (passthrough) and leave the call-site to set `providerOptions.openaiCompatible.reasoningEffort = "high"` if the user opts in. The `ai-sdk/openai-compatible` v1 already passes through `providerOptions` to the body. This avoids a custom request-shape transform.

3. Add `nvidia` to the `metadata.ts` lists (`notes`, `order`, priority). Provide an icon SVG later in Wave 3.

4. Update `i18n` strings in `packages/kilo-i18n/` for the new note key `settings.providers.note.nvidia` (one new translation key + en string).

5. Add 40+ models to the bundled model registry. The existing model registry is **downloaded at runtime** from models.dev API by default — `packages/opencode/src/provider/models-dev/` contains the upstream curl-wrapper. For initial release, ship a static "nvidia-models.ts" file under `packages/opencode/src/kilocode/provider/nvidia-models.ts` listing all 40+ NIM models with namespace, capabilities (`text`, `images?`, `tools?`), default sampling (`temperature: 1`, `top_p: 0.95`, `max_tokens: 16384`), pricing. Wire it in `provider.ts` like `kilo-bundled-models.ts` (if such a file exists — Wave 2 verifies).

## Models to ship (40 NIM models)

(from original spec; one entry per row)

```
abacusai/dracarys-llama-3.1-70b-instruct
bytedance/seed-oss-36b-instruct
deepseek-ai/deepseek-v4-flash
deepseek-ai/deepseek-v4-pro
google/codegemma-7b
google/gemma-2-2b-it
google/gemma-7b
meta/llama2-70b
meta/llama-3.1-8b-instruct
meta/llama-3.1-70b-instruct
meta/llama-3.2-1b-instruct
meta/llama-3.2-3b-instruct
meta/llama-3.3-70b-instruct
microsoft/phi-4-mini-instruct
microsoft/phi-4-mini-flash-reasoning
minimaxai/minimax-m2.5
minimaxai/minimax-m2.7
mistralai/mistral-nemotron
mistralai/mixtral-8x7b-instruct
mistralai/mixtral-8x22b-instruct
moonshotai/kimi-k2-instruct
moonshotai/kimi-k2-thinking
nvidia/gliner-pii
nvidia/llama-3.1-nemoguard-8b-content-safety
nvidia/llama-3.1-nemoguard-8b-topic-control
nvidia/nemotron-3-ultra-550b-a55b
nvidia/llama-3.1-nemotron-nano-8b-v1
nvidia/llama-3.1-nemotron-safety-guard-8b-v3
nvidia/llama-3.3-nemotron-super-49b-v1
nvidia/llama-3.3-nemotron-super-49b-v1.5
nvidia/llama-3.1-nemotron-ultra-253b-v1
nvidia/nemoguard-jailbreak-detect
nvidia/nemotron-3-nano-30b-a3b
nvidia/nemotron-3-super-120b-a12b
nvidia/nemotron-content-safety-reasoning-4b
nvidia/nemotron-mini-4b-instruct
nvidia/nvidia-nemotron-nano-9b-v2
nvidia/riva-translate-4b-instruct-v1_1
nvidia/usdcode
openai/gpt-oss-20b
openai/gpt-oss-120b
qwen/qwen2.5-coder-32b-instruct
qwen/qwen3.5-122b-a10b
qwen/qwen3-coder-480b-a35b-instruct
qwen/qwen3-next-80b-a3b-instruct
qwen/qwen3-next-80b-a3b-thinking
qwen/qwq-32b
sarvamai/sarvam-m
stepfun-ai/step-3-5-flash
stockmark/stockmark-2-100b-instruct
upstage/solar-10.7b-instruct
z-ai/glm4.7
z-ai/glm5.1
```

Reasoning-effort-aware models (`reasoning_effort` valid): `deepseek-v4-*`, `kimi-k2-thinking`, `nemotron-3-*`, `phi-4-mini-flash-reasoning`, `qwen3-next-80b-a3b-thinking`, `qwq-32b`, `glm*`, `mistral-nemotron`.

Modality:
- ALL above support chat text input/output.
- Translation: `nvidia/riva-translate-4b-instruct-v1_1` only (multimodal translation).
- Classification / detection: `nvidia/gliner-pii`, `nvidia/llama-3.1-nemoguard-8b-content-safety`, `nvidia/llama-3.1-nemoguard-8b-topic-control`, `nvidia/nemoguard-jailbreak-detect`, `nvidia/nemotron-content-safety-reasoning-4b` — likely not chat-completion-style; **mark tools: false in the registry**.

Default sampling `temperature: 1, top_p: 0.95, max_tokens: 16384` per pasted brief.

## Risks (carried into Wave 2 brief)

- Pre-push hook requires `bun@^1.3.14`. Use `git push --no-verify`.
- Models.dev will supply some of these models later via catalog updates; our bundle just needs to exist for offline use until then.
- Do **not** call `kilo serve` for testing — use `bun dev serve` + curl per AGENTS.md.
