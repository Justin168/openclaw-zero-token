import {
  buildHuggingfaceModelDefinition,
  HUGGINGFACE_BASE_URL,
  HUGGINGFACE_MODEL_CATALOG,
} from "../agents/huggingface-models.js";
import {
  buildDeepseekWebProvider,
  buildDoubaoWebProvider,
  buildManusApiProvider,
  buildQianfanProvider,
  buildQwenWebProvider,
  buildXiaomiProvider,
  DEEPSEEK_WEB_DEFAULT_MODEL_ID,
  MANUS_API_DEFAULT_MODEL_REF,
  QIANFAN_DEFAULT_MODEL_ID,
  XIAOMI_DEFAULT_MODEL_ID,
} from "../agents/models-config.providers.js";
import {
  buildSyntheticModelDefinition,
  SYNTHETIC_BASE_URL,
  SYNTHETIC_DEFAULT_MODEL_REF,
  SYNTHETIC_MODEL_CATALOG,
} from "../agents/synthetic-models.js";
import {
  buildTogetherModelDefinition,
  TOGETHER_BASE_URL,
  TOGETHER_MODEL_CATALOG,
} from "../agents/together-models.js";
import {
  buildVeniceModelDefinition,
  VENICE_BASE_URL,
  VENICE_DEFAULT_MODEL_REF,
  VENICE_MODEL_CATALOG,
} from "../agents/venice-models.js";
import type { OpenClawConfig } from "../config/config.js";
import type { ModelApi } from "../config/types.models.js";
import {
  HUGGINGFACE_DEFAULT_MODEL_REF,
  OPENROUTER_DEFAULT_MODEL_REF,
  TOGETHER_DEFAULT_MODEL_REF,
  XIAOMI_DEFAULT_MODEL_REF,
  ZAI_DEFAULT_MODEL_REF,
  XAI_DEFAULT_MODEL_REF,
  DEEPSEEK_WEB_DEFAULT_MODEL_REF,
} from "./onboard-auth.credentials.js";
export {
  applyCloudflareAiGatewayConfig,
  applyCloudflareAiGatewayProviderConfig,
  applyVercelAiGatewayConfig,
  applyVercelAiGatewayProviderConfig,
} from "./onboard-auth.config-gateways.js";
export {
  applyLitellmConfig,
  applyLitellmProviderConfig,
  LITELLM_BASE_URL,
  LITELLM_DEFAULT_MODEL_ID,
} from "./onboard-auth.config-litellm.js";
import {
  applyAgentDefaultModelPrimary,
  applyOnboardAuthAgentModelsAndProviders,
  applyProviderConfigWithDefaultModel,
  applyProviderConfigWithDefaultModels,
  applyProviderConfigWithModelCatalog,
} from "./onboard-auth.config-shared.js";
import {
  buildZaiModelDefinition,
  buildMoonshotModelDefinition,
  buildXaiModelDefinition,
  QIANFAN_BASE_URL,
  QIANFAN_DEFAULT_MODEL_REF,
  KIMI_CODING_MODEL_REF,
  MOONSHOT_BASE_URL,
  MOONSHOT_CN_BASE_URL,
  MOONSHOT_DEFAULT_MODEL_ID,
  MOONSHOT_DEFAULT_MODEL_REF,
  ZAI_DEFAULT_MODEL_ID,
  resolveZaiBaseUrl,
  XAI_BASE_URL,
  XAI_DEFAULT_MODEL_ID,
  SILICONFLOW_GLOBAL_BASE_URL,
  SILICONFLOW_CN_BASE_URL,
  SILICONFLOW_DEFAULT_MODEL_ID,
  SILICONFLOW_GLOBAL_DEFAULT_MODEL_REF,
  SILICONFLOW_CN_DEFAULT_MODEL_REF,
  buildSiliconFlowModelDefinition,
} from "./onboard-auth.models.js";

export function applyZaiProviderConfig(
  cfg: OpenClawConfig,
  params?: { endpoint?: string; modelId?: string },
): OpenClawConfig {
  const modelId = params?.modelId?.trim() || ZAI_DEFAULT_MODEL_ID;
  const modelRef = `zai/${modelId}`;

  const models = { ...cfg.agents?.defaults?.models };
  models[modelRef] = {
    ...models[modelRef],
    alias: models[modelRef]?.alias ?? "GLM",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.zai;
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];

  const defaultModels = [
    buildZaiModelDefinition({ id: "glm-5" }),
    buildZaiModelDefinition({ id: "glm-4.7" }),
    buildZaiModelDefinition({ id: "glm-4.7-flash" }),
    buildZaiModelDefinition({ id: "glm-4.7-flashx" }),
  ];

  const mergedModels = [...existingModels];
  const seen = new Set(existingModels.map((m) => m.id));
  for (const model of defaultModels) {
    if (!seen.has(model.id)) {
      mergedModels.push(model);
      seen.add(model.id);
    }
  }

  const { apiKey: existingApiKey, ...existingProviderRest } = (existingProvider ?? {}) as Record<
    string,
    unknown
  > as { apiKey?: string };
  const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : undefined;
  const normalizedApiKey = resolvedApiKey?.trim();

  const baseUrl = params?.endpoint
    ? resolveZaiBaseUrl(params.endpoint)
    : (typeof existingProvider?.baseUrl === "string" ? existingProvider.baseUrl : "") ||
      resolveZaiBaseUrl();

  providers.zai = {
    ...existingProviderRest,
    baseUrl,
    api: "openai-completions",
    ...(normalizedApiKey ? { apiKey: normalizedApiKey } : {}),
    models: mergedModels.length > 0 ? mergedModels : defaultModels,
  };

  return applyOnboardAuthAgentModelsAndProviders(cfg, { agentModels: models, providers });
}

export function applyZaiConfig(
  cfg: OpenClawConfig,
  params?: { endpoint?: string; modelId?: string },
): OpenClawConfig {
  const modelId = params?.modelId?.trim() || ZAI_DEFAULT_MODEL_ID;
  const modelRef = modelId === ZAI_DEFAULT_MODEL_ID ? ZAI_DEFAULT_MODEL_REF : `zai/${modelId}`;
  const next = applyZaiProviderConfig(cfg, params);
  return applyAgentDefaultModelPrimary(next, modelRef);
}

export function applyOpenrouterProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[OPENROUTER_DEFAULT_MODEL_REF] = {
    ...models[OPENROUTER_DEFAULT_MODEL_REF],
    alias: models[OPENROUTER_DEFAULT_MODEL_REF]?.alias ?? "OpenRouter",
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
  };
}

export function applyOpenrouterConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyOpenrouterProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, OPENROUTER_DEFAULT_MODEL_REF);
}

export function applyMoonshotProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_BASE_URL);
}

export function applyMoonshotProviderConfigCn(cfg: OpenClawConfig): OpenClawConfig {
  return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_CN_BASE_URL);
}

function applyMoonshotProviderConfigWithBaseUrl(
  cfg: OpenClawConfig,
  baseUrl: string,
): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[MOONSHOT_DEFAULT_MODEL_REF] = {
    ...models[MOONSHOT_DEFAULT_MODEL_REF],
    alias: models[MOONSHOT_DEFAULT_MODEL_REF]?.alias ?? "Kimi",
  };

  const defaultModel = buildMoonshotModelDefinition();

  return applyProviderConfigWithDefaultModel(cfg, {
    agentModels: models,
    providerId: "moonshot",
    api: "openai-completions",
    baseUrl,
    defaultModel,
    defaultModelId: MOONSHOT_DEFAULT_MODEL_ID,
  });
}

export function applyMoonshotConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyMoonshotProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, MOONSHOT_DEFAULT_MODEL_REF);
}

export function applyMoonshotConfigCn(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyMoonshotProviderConfigCn(cfg);
  return applyAgentDefaultModelPrimary(next, MOONSHOT_DEFAULT_MODEL_REF);
}

export function applyKimiCodeProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[KIMI_CODING_MODEL_REF] = {
    ...models[KIMI_CODING_MODEL_REF],
    alias: models[KIMI_CODING_MODEL_REF]?.alias ?? "Kimi K2.5",
  };

  return {
    ...cfg,
    agents: {
      ...cfg.agents,
      defaults: {
        ...cfg.agents?.defaults,
        models,
      },
    },
  };
}

export function applyKimiCodeConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyKimiCodeProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, KIMI_CODING_MODEL_REF);
}

export function applySyntheticProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[SYNTHETIC_DEFAULT_MODEL_REF] = {
    ...models[SYNTHETIC_DEFAULT_MODEL_REF],
    alias: models[SYNTHETIC_DEFAULT_MODEL_REF]?.alias ?? "MiniMax M2.1",
  };

  const providers = { ...cfg.models?.providers };
  const existingProvider = providers.synthetic;
  const existingModels = Array.isArray(existingProvider?.models) ? existingProvider.models : [];
  const syntheticModels = SYNTHETIC_MODEL_CATALOG.map(buildSyntheticModelDefinition);
  const mergedModels = [
    ...existingModels,
    ...syntheticModels.filter(
      (model) => !existingModels.some((existing) => existing.id === model.id),
    ),
  ];
  const { apiKey: existingApiKey, ...existingProviderRest } = (existingProvider ?? {}) as Record<
    string,
    unknown
  > as { apiKey?: string };
  const resolvedApiKey = typeof existingApiKey === "string" ? existingApiKey : undefined;
  const normalizedApiKey = resolvedApiKey?.trim();
  providers.synthetic = {
    ...existingProviderRest,
    baseUrl: SYNTHETIC_BASE_URL,
    api: "anthropic-messages",
    ...(normalizedApiKey ? { apiKey: normalizedApiKey } : {}),
    models: mergedModels.length > 0 ? mergedModels : syntheticModels,
  };

  return applyOnboardAuthAgentModelsAndProviders(cfg, { agentModels: models, providers });
}

export function applySyntheticConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applySyntheticProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, SYNTHETIC_DEFAULT_MODEL_REF);
}

export function applyXiaomiProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[XIAOMI_DEFAULT_MODEL_REF] = {
    ...models[XIAOMI_DEFAULT_MODEL_REF],
    alias: models[XIAOMI_DEFAULT_MODEL_REF]?.alias ?? "Xiaomi",
  };
  const defaultProvider = buildXiaomiProvider();
  const resolvedApi = defaultProvider.api ?? "openai-completions";
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "xiaomi",
    api: resolvedApi,
    baseUrl: defaultProvider.baseUrl,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: XIAOMI_DEFAULT_MODEL_ID,
  });
}

export function applyXiaomiConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyXiaomiProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, XIAOMI_DEFAULT_MODEL_REF);
}

/**
 * Apply Venice provider configuration without changing the default model.
 * Registers Venice models and sets up the provider, but preserves existing model selection.
 */
export function applyVeniceProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[VENICE_DEFAULT_MODEL_REF] = {
    ...models[VENICE_DEFAULT_MODEL_REF],
    alias: models[VENICE_DEFAULT_MODEL_REF]?.alias ?? "Llama 3.3 70B",
  };

  const veniceModels = VENICE_MODEL_CATALOG.map(buildVeniceModelDefinition);
  return applyProviderConfigWithModelCatalog(cfg, {
    agentModels: models,
    providerId: "venice",
    api: "openai-completions",
    baseUrl: VENICE_BASE_URL,
    catalogModels: veniceModels,
  });
}

/**
 * Apply Venice provider configuration AND set Venice as the default model.
 * Use this when Venice is the primary provider choice during onboarding.
 */
export function applyVeniceConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyVeniceProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, VENICE_DEFAULT_MODEL_REF);
}

/**
 * Apply Together provider configuration without changing the default model.
 * Registers Together models and sets up the provider, but preserves existing model selection.
 */
export function applyTogetherProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[TOGETHER_DEFAULT_MODEL_REF] = {
    ...models[TOGETHER_DEFAULT_MODEL_REF],
    alias: models[TOGETHER_DEFAULT_MODEL_REF]?.alias ?? "Together AI",
  };

  const togetherModels = TOGETHER_MODEL_CATALOG.map(buildTogetherModelDefinition);
  return applyProviderConfigWithModelCatalog(cfg, {
    agentModels: models,
    providerId: "together",
    api: "openai-completions",
    baseUrl: TOGETHER_BASE_URL,
    catalogModels: togetherModels,
  });
}

/**
 * Apply Together provider configuration AND set Together as the default model.
 * Use this when Together is the primary provider choice during onboarding.
 */
export function applyTogetherConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyTogetherProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, TOGETHER_DEFAULT_MODEL_REF);
}

/**
 * Apply Hugging Face (Inference Providers) provider configuration without changing the default model.
 */
export function applyHuggingfaceProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[HUGGINGFACE_DEFAULT_MODEL_REF] = {
    ...models[HUGGINGFACE_DEFAULT_MODEL_REF],
    alias: models[HUGGINGFACE_DEFAULT_MODEL_REF]?.alias ?? "Hugging Face",
  };

  const hfModels = HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
  return applyProviderConfigWithModelCatalog(cfg, {
    agentModels: models,
    providerId: "huggingface",
    api: "openai-completions",
    baseUrl: HUGGINGFACE_BASE_URL,
    catalogModels: hfModels,
  });
}

/**
 * Apply Hugging Face provider configuration AND set Hugging Face as the default model.
 */
export function applyHuggingfaceConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyHuggingfaceProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, HUGGINGFACE_DEFAULT_MODEL_REF);
}

export function applyXaiProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[XAI_DEFAULT_MODEL_REF] = {
    ...models[XAI_DEFAULT_MODEL_REF],
    alias: models[XAI_DEFAULT_MODEL_REF]?.alias ?? "Grok",
  };

  const defaultModel = buildXaiModelDefinition();

  return applyProviderConfigWithDefaultModel(cfg, {
    agentModels: models,
    providerId: "xai",
    api: "openai-completions",
    baseUrl: XAI_BASE_URL,
    defaultModel,
    defaultModelId: XAI_DEFAULT_MODEL_ID,
  });
}

export function applyXaiConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyXaiProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, XAI_DEFAULT_MODEL_REF);
}

const MANUS_API_BASE_URL = "https://api.manus.ai";

export function applyManusApiProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const provider = buildManusApiProvider();
  const models = { ...cfg.agents?.defaults?.models };
  models[MANUS_API_DEFAULT_MODEL_REF] = {
    ...models[MANUS_API_DEFAULT_MODEL_REF],
    alias: models[MANUS_API_DEFAULT_MODEL_REF]?.alias ?? "Manus 1.6",
  };

  return applyProviderConfigWithModelCatalog(cfg, {
    agentModels: models,
    providerId: "manus-api",
    api: "manus-api",
    baseUrl: MANUS_API_BASE_URL,
    catalogModels: provider.models ?? [],
  });
}

export function applyManusApiConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyManusApiProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, MANUS_API_DEFAULT_MODEL_REF);
}

export function applyAuthProfileConfig(
  cfg: OpenClawConfig,
  params: {
    profileId: string;
    provider: string;
    mode: "api_key" | "oauth" | "token";
    email?: string;
    preferProfileFirst?: boolean;
  },
): OpenClawConfig {
  const profiles = {
    ...cfg.auth?.profiles,
    [params.profileId]: {
      provider: params.provider,
      mode: params.mode,
      ...(params.email ? { email: params.email } : {}),
    },
  };

  // Only maintain `auth.order` when the user explicitly configured it.
  // Default behavior: no explicit order -> resolveAuthProfileOrder can round-robin by lastUsed.
  const existingProviderOrder = cfg.auth?.order?.[params.provider];
  const preferProfileFirst = params.preferProfileFirst ?? true;
  const reorderedProviderOrder =
    existingProviderOrder && preferProfileFirst
      ? [
          params.profileId,
          ...existingProviderOrder.filter((profileId) => profileId !== params.profileId),
        ]
      : existingProviderOrder;
  const order =
    existingProviderOrder !== undefined
      ? {
          ...cfg.auth?.order,
          [params.provider]: reorderedProviderOrder?.includes(params.profileId)
            ? reorderedProviderOrder
            : [...(reorderedProviderOrder ?? []), params.profileId],
        }
      : cfg.auth?.order;
  return {
    ...cfg,
    auth: {
      ...cfg.auth,
      profiles,
      ...(order ? { order } : {}),
    },
  };
}

export function applyQianfanProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[QIANFAN_DEFAULT_MODEL_REF] = {
    ...models[QIANFAN_DEFAULT_MODEL_REF],
    alias: models[QIANFAN_DEFAULT_MODEL_REF]?.alias ?? "QIANFAN",
  };
  const defaultProvider = buildQianfanProvider();
  const existingProvider = cfg.models?.providers?.qianfan as
    | {
        baseUrl?: unknown;
        api?: unknown;
      }
    | undefined;
  const existingBaseUrl =
    typeof existingProvider?.baseUrl === "string" ? existingProvider.baseUrl.trim() : "";
  const resolvedBaseUrl = existingBaseUrl || QIANFAN_BASE_URL;
  const resolvedApi =
    typeof existingProvider?.api === "string"
      ? (existingProvider.api as ModelApi)
      : "openai-completions";

  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "qianfan",
    api: resolvedApi,
    baseUrl: resolvedBaseUrl,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: QIANFAN_DEFAULT_MODEL_ID,
  });
}

export function applyQianfanConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applyQianfanProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, QIANFAN_DEFAULT_MODEL_REF);
}

export function applySiliconFlowGlobalProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[SILICONFLOW_GLOBAL_DEFAULT_MODEL_REF] = {
    ...models[SILICONFLOW_GLOBAL_DEFAULT_MODEL_REF],
    alias: models[SILICONFLOW_GLOBAL_DEFAULT_MODEL_REF]?.alias ?? "DeepSeek V3 (Intl)",
  };

  const defaultModel = buildSiliconFlowModelDefinition({
    id: SILICONFLOW_DEFAULT_MODEL_ID,
  });

  return applyProviderConfigWithDefaultModel(cfg, {
    agentModels: models,
    providerId: "siliconflow",
    api: "openai-completions",
    baseUrl: SILICONFLOW_GLOBAL_BASE_URL,
    defaultModel,
    defaultModelId: SILICONFLOW_DEFAULT_MODEL_ID,
  });
}

export function applySiliconFlowCnProviderConfig(cfg: OpenClawConfig): OpenClawConfig {
  const models = { ...cfg.agents?.defaults?.models };
  models[SILICONFLOW_CN_DEFAULT_MODEL_REF] = {
    ...models[SILICONFLOW_CN_DEFAULT_MODEL_REF],
    alias: models[SILICONFLOW_CN_DEFAULT_MODEL_REF]?.alias ?? "DeepSeek V3 (CN)",
  };

  const defaultModel = buildSiliconFlowModelDefinition({
    id: SILICONFLOW_DEFAULT_MODEL_ID,
  });

  return applyProviderConfigWithDefaultModel(cfg, {
    agentModels: models,
    providerId: "siliconflow-cn",
    api: "openai-completions",
    baseUrl: SILICONFLOW_CN_BASE_URL,
    defaultModel,
    defaultModelId: SILICONFLOW_DEFAULT_MODEL_ID,
  });
}

export function applySiliconFlowGlobalConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applySiliconFlowGlobalProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, SILICONFLOW_GLOBAL_DEFAULT_MODEL_REF);
}

export function applySiliconFlowCnConfig(cfg: OpenClawConfig): OpenClawConfig {
  const next = applySiliconFlowCnProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, SILICONFLOW_CN_DEFAULT_MODEL_REF);
}

export async function applyDeepseekWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[DEEPSEEK_WEB_DEFAULT_MODEL_REF] = {
    ...models[DEEPSEEK_WEB_DEFAULT_MODEL_REF],
    alias: models[DEEPSEEK_WEB_DEFAULT_MODEL_REF]?.alias ?? "DeepSeek Browser",
  };
  const defaultProvider = await buildDeepseekWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "deepseek-web",
    api: "deepseek-web",
    baseUrl: defaultProvider.baseUrl,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: DEEPSEEK_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyDeepseekWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyDeepseekWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, DEEPSEEK_WEB_DEFAULT_MODEL_REF);
}

export async function applyDoubaoWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models["doubao-web/doubao-seed-2.0"] = {
    ...models["doubao-web/doubao-seed-2.0"],
    alias: models["doubao-web/doubao-seed-2.0"]?.alias ?? "Doubao Browser",
  };
  const defaultProvider = await buildDoubaoWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "doubao-web",
    api: "doubao-web",
    baseUrl: defaultProvider.baseUrl,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: "doubao-seed-2.0",
  });
}

export async function applyDoubaoWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyDoubaoWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, "doubao-web/doubao-seed-2.0");
}

export const CLAUDE_WEB_BASE_URL = "https://claude.ai";
export const CLAUDE_WEB_DEFAULT_MODEL_ID = "claude-sonnet-4-6";
export const CLAUDE_WEB_DEFAULT_MODEL_REF = `claude-web/${CLAUDE_WEB_DEFAULT_MODEL_ID}`;

export async function applyClaudeWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[CLAUDE_WEB_DEFAULT_MODEL_REF] = {
    ...models[CLAUDE_WEB_DEFAULT_MODEL_REF],
    alias: models[CLAUDE_WEB_DEFAULT_MODEL_REF]?.alias ?? "Claude Web",
  };
  const { buildClaudeWebProvider } = await import("../agents/models-config.providers.js");
  const defaultProvider = await buildClaudeWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "claude-web",
    api: "claude-web",
    baseUrl: defaultProvider.baseUrl,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: CLAUDE_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyClaudeWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyClaudeWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, CLAUDE_WEB_DEFAULT_MODEL_REF);
}

const QWEN_WEB_DEFAULT_MODEL_ID = "qwen3.5-plus";
const QWEN_WEB_DEFAULT_MODEL_REF = `qwen-web/${QWEN_WEB_DEFAULT_MODEL_ID}`;

export async function applyQwenWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[QWEN_WEB_DEFAULT_MODEL_REF] = {
    ...models[QWEN_WEB_DEFAULT_MODEL_REF],
    alias: models[QWEN_WEB_DEFAULT_MODEL_REF]?.alias ?? "Qwen Browser",
  };
  const defaultProvider = await buildQwenWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "qwen-web",
    api: "qwen-web",
    baseUrl: defaultProvider.baseUrl,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: QWEN_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyQwenWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyQwenWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, QWEN_WEB_DEFAULT_MODEL_REF);
}

// Qwen CN Web (国内版 qianwen.com)
const QWEN_CN_WEB_DEFAULT_MODEL_ID = "Qwen3.5-Plus";
const QWEN_CN_WEB_DEFAULT_MODEL_REF = `qwen-cn-web/${QWEN_CN_WEB_DEFAULT_MODEL_ID}`;

export async function applyQwenCNWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[QWEN_CN_WEB_DEFAULT_MODEL_REF] = {
    ...models[QWEN_CN_WEB_DEFAULT_MODEL_REF],
    alias: models[QWEN_CN_WEB_DEFAULT_MODEL_REF]?.alias ?? "Qwen 3.5 Plus (国内版)",
  };
  const { buildQwenCNWebProvider } = await import("../agents/models-config.providers.js");
  const defaultProvider = await buildQwenCNWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "qwen-cn-web",
    api: "qwen-cn-web",
    baseUrl: defaultProvider.baseUrl,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: QWEN_CN_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyQwenCNWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyQwenCNWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, QWEN_CN_WEB_DEFAULT_MODEL_REF);
}

// Kimi Web
const KIMI_WEB_DEFAULT_MODEL_ID = "moonshot-v1-32k";
const KIMI_WEB_DEFAULT_MODEL_REF = `kimi-web/${KIMI_WEB_DEFAULT_MODEL_ID}`;
const KIMI_WEB_BASE_URL = "https://www.kimi.com";

export async function applyKimiWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[KIMI_WEB_DEFAULT_MODEL_REF] = {
    ...models[KIMI_WEB_DEFAULT_MODEL_REF],
    alias: models[KIMI_WEB_DEFAULT_MODEL_REF]?.alias ?? "Kimi 32K",
  };
  const { buildKimiWebProvider } = await import("../agents/models-config.providers.js");
  const defaultProvider = await buildKimiWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "kimi-web",
    api: "kimi-web",
    baseUrl: defaultProvider.baseUrl ?? KIMI_WEB_BASE_URL,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: KIMI_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyKimiWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyKimiWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, KIMI_WEB_DEFAULT_MODEL_REF);
}

// ChatGPT Web
const CHATGPT_WEB_DEFAULT_MODEL_ID = "gpt-4";
const CHATGPT_WEB_DEFAULT_MODEL_REF = `chatgpt-web/${CHATGPT_WEB_DEFAULT_MODEL_ID}`;
const CHATGPT_WEB_BASE_URL = "https://chatgpt.com";

export async function applyChatGPTWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[CHATGPT_WEB_DEFAULT_MODEL_REF] = {
    ...models[CHATGPT_WEB_DEFAULT_MODEL_REF],
    alias: models[CHATGPT_WEB_DEFAULT_MODEL_REF]?.alias ?? "GPT-4",
  };
  const { buildChatGPTWebProvider } = await import("../agents/models-config.providers.js");
  const defaultProvider = await buildChatGPTWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "chatgpt-web",
    api: "chatgpt-web",
    baseUrl: defaultProvider.baseUrl ?? CHATGPT_WEB_BASE_URL,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: CHATGPT_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyChatGPTWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyChatGPTWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, CHATGPT_WEB_DEFAULT_MODEL_REF);
}

// Gemini Web
const GEMINI_WEB_DEFAULT_MODEL_ID = "gemini-pro";
const GEMINI_WEB_DEFAULT_MODEL_REF = `gemini-web/${GEMINI_WEB_DEFAULT_MODEL_ID}`;
const GEMINI_WEB_BASE_URL = "https://gemini.google.com";

export async function applyGeminiWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[GEMINI_WEB_DEFAULT_MODEL_REF] = {
    ...models[GEMINI_WEB_DEFAULT_MODEL_REF],
    alias: models[GEMINI_WEB_DEFAULT_MODEL_REF]?.alias ?? "Gemini Pro",
  };
  const { buildGeminiWebProvider } = await import("../agents/models-config.providers.js");
  const defaultProvider = await buildGeminiWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "gemini-web",
    api: "gemini-web",
    baseUrl: defaultProvider.baseUrl ?? GEMINI_WEB_BASE_URL,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: GEMINI_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyGeminiWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyGeminiWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, GEMINI_WEB_DEFAULT_MODEL_REF);
}

// Grok Web
const GROK_WEB_DEFAULT_MODEL_ID = "grok-2";
const GROK_WEB_DEFAULT_MODEL_REF = `grok-web/${GROK_WEB_DEFAULT_MODEL_ID}`;
const GROK_WEB_BASE_URL = "https://grok.com";

export async function applyGrokWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[GROK_WEB_DEFAULT_MODEL_REF] = {
    ...models[GROK_WEB_DEFAULT_MODEL_REF],
    alias: models[GROK_WEB_DEFAULT_MODEL_REF]?.alias ?? "Grok 2",
  };
  const { buildGrokWebProvider } = await import("../agents/models-config.providers.js");
  const defaultProvider = await buildGrokWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "grok-web",
    api: "grok-web",
    baseUrl: defaultProvider.baseUrl ?? GROK_WEB_BASE_URL,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: GROK_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyGrokWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyGrokWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, GROK_WEB_DEFAULT_MODEL_REF);
}

// GLM Web (ChatGLM / Zhipu)
const GLM_WEB_DEFAULT_MODEL_ID = "glm-4-plus";
const GLM_WEB_DEFAULT_MODEL_REF = `glm-web/${GLM_WEB_DEFAULT_MODEL_ID}`;
const GLM_WEB_BASE_URL = "https://chatglm.cn";

export async function applyGlmWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[GLM_WEB_DEFAULT_MODEL_REF] = {
    ...models[GLM_WEB_DEFAULT_MODEL_REF],
    alias: models[GLM_WEB_DEFAULT_MODEL_REF]?.alias ?? "GLM-4 Plus",
  };
  const { buildZWebProvider } = await import("../agents/models-config.providers.js");
  const defaultProvider = await buildZWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "glm-web",
    api: "glm-web",
    baseUrl: defaultProvider.baseUrl ?? GLM_WEB_BASE_URL,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: GLM_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyGlmWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyGlmWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, GLM_WEB_DEFAULT_MODEL_REF);
}

// GLM Intl Web (International - chat.z.ai)
const GLM_INTL_WEB_DEFAULT_MODEL_ID = "glm-4-plus";
const GLM_INTL_WEB_DEFAULT_MODEL_REF = `glm-intl-web/${GLM_INTL_WEB_DEFAULT_MODEL_ID}`;
const GLM_INTL_WEB_BASE_URL = "https://chat.z.ai";

export async function applyGlmIntlWebProviderConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const models = { ...cfg.agents?.defaults?.models };
  models[GLM_INTL_WEB_DEFAULT_MODEL_REF] = {
    ...models[GLM_INTL_WEB_DEFAULT_MODEL_REF],
    alias: models[GLM_INTL_WEB_DEFAULT_MODEL_REF]?.alias ?? "GLM-4 Plus (International)",
  };
  const { buildGlmIntlWebProvider } = await import("../agents/models-config.providers.js");
  const defaultProvider = await buildGlmIntlWebProvider();
  return applyProviderConfigWithDefaultModels(cfg, {
    agentModels: models,
    providerId: "glm-intl-web",
    api: "glm-intl-web",
    baseUrl: defaultProvider.baseUrl ?? GLM_INTL_WEB_BASE_URL,
    defaultModels: defaultProvider.models ?? [],
    defaultModelId: GLM_INTL_WEB_DEFAULT_MODEL_ID,
  });
}

export async function applyGlmIntlWebConfig(cfg: OpenClawConfig): Promise<OpenClawConfig> {
  const next = await applyGlmIntlWebProviderConfig(cfg);
  return applyAgentDefaultModelPrimary(next, GLM_INTL_WEB_DEFAULT_MODEL_REF);
}

