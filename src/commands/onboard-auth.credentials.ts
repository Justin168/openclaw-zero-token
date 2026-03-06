import type { OAuthCredentials } from "@mariozechner/pi-ai";
import { resolveOpenClawAgentDir } from "../agents/agent-paths.js";
import { upsertAuthProfile } from "../agents/auth-profiles.js";
export { CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF } from "../agents/cloudflare-ai-gateway.js";
export { XAI_DEFAULT_MODEL_REF } from "./onboard-auth.models.js";

const resolveAuthAgentDir = (agentDir?: string) => agentDir ?? resolveOpenClawAgentDir();

export async function writeOAuthCredentials(
  provider: string,
  creds: OAuthCredentials,
  agentDir?: string,
): Promise<void> {
  const email =
    typeof creds.email === "string" && creds.email.trim() ? creds.email.trim() : "default";
  upsertAuthProfile({
    profileId: `${provider}:${email}`,
    credential: {
      type: "oauth",
      provider,
      ...creds,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setAnthropicApiKey(key: string, agentDir?: string) {
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId: "anthropic:default",
    credential: {
      type: "api_key",
      provider: "anthropic",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setGeminiApiKey(key: string, agentDir?: string) {
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId: "google:default",
    credential: {
      type: "api_key",
      provider: "google",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setMinimaxApiKey(
  key: string,
  agentDir?: string,
  profileId: string = "minimax:default",
) {
  const provider = profileId.split(":")[0] ?? "minimax";
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId,
    credential: {
      type: "api_key",
      provider,
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setMoonshotApiKey(key: string, agentDir?: string) {
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId: "moonshot:default",
    credential: {
      type: "api_key",
      provider: "moonshot",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setKimiCodingApiKey(key: string, agentDir?: string) {
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId: "kimi-coding:default",
    credential: {
      type: "api_key",
      provider: "kimi-coding",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setSyntheticApiKey(key: string, agentDir?: string) {
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId: "synthetic:default",
    credential: {
      type: "api_key",
      provider: "synthetic",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setVeniceApiKey(key: string, agentDir?: string) {
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId: "venice:default",
    credential: {
      type: "api_key",
      provider: "venice",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export const ZAI_DEFAULT_MODEL_REF = "zai/glm-5";
export const XIAOMI_DEFAULT_MODEL_REF = "xiaomi/mimo-v2-flash";
export const OPENROUTER_DEFAULT_MODEL_REF = "openrouter/auto";
export const HUGGINGFACE_DEFAULT_MODEL_REF = "huggingface/deepseek-ai/DeepSeek-R1";
export const TOGETHER_DEFAULT_MODEL_REF = "together/moonshotai/Kimi-K2.5";
export const LITELLM_DEFAULT_MODEL_REF = "litellm/claude-opus-4-6";
export const VERCEL_AI_GATEWAY_DEFAULT_MODEL_REF = "vercel-ai-gateway/anthropic/claude-opus-4.6";

export async function setZaiApiKey(key: string, agentDir?: string) {
  // Write to resolved agent dir so gateway finds credentials on startup.
  upsertAuthProfile({
    profileId: "zai:default",
    credential: {
      type: "api_key",
      provider: "zai",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setXiaomiApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "xiaomi:default",
    credential: {
      type: "api_key",
      provider: "xiaomi",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setOpenrouterApiKey(key: string, agentDir?: string) {
  // Never persist the literal "undefined" (e.g. when prompt returns undefined and caller used String(key)).
  const safeKey = key === "undefined" ? "" : key;
  upsertAuthProfile({
    profileId: "openrouter:default",
    credential: {
      type: "api_key",
      provider: "openrouter",
      key: safeKey,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setCloudflareAiGatewayConfig(
  accountId: string,
  gatewayId: string,
  apiKey: string,
  agentDir?: string,
) {
  const normalizedAccountId = accountId.trim();
  const normalizedGatewayId = gatewayId.trim();
  const normalizedKey = apiKey.trim();
  upsertAuthProfile({
    profileId: "cloudflare-ai-gateway:default",
    credential: {
      type: "api_key",
      provider: "cloudflare-ai-gateway",
      key: normalizedKey,
      metadata: {
        accountId: normalizedAccountId,
        gatewayId: normalizedGatewayId,
      },
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setLitellmApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "litellm:default",
    credential: {
      type: "api_key",
      provider: "litellm",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setVercelAiGatewayApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "vercel-ai-gateway:default",
    credential: {
      type: "api_key",
      provider: "vercel-ai-gateway",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setOpencodeZenApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "opencode:default",
    credential: {
      type: "api_key",
      provider: "opencode",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setTogetherApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "together:default",
    credential: {
      type: "api_key",
      provider: "together",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setHuggingfaceApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "huggingface:default",
    credential: {
      type: "api_key",
      provider: "huggingface",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export function setQianfanApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "qianfan:default",
    credential: {
      type: "api_key",
      provider: "qianfan",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export function setXaiApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "xai:default",
    credential: {
      type: "api_key",
      provider: "xai",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export {
  SILICONFLOW_GLOBAL_DEFAULT_MODEL_REF,
  SILICONFLOW_CN_DEFAULT_MODEL_REF,
  DEEPSEEK_WEB_DEFAULT_MODEL_REF,
} from "./onboard-auth.models.js";

export const CLAUDE_WEB_DEFAULT_MODEL_REF = "claude-web/claude-sonnet-4-6";
export const GLM_INTL_WEB_DEFAULT_MODEL_REF = "glm-intl-web/glm-4-plus";

export async function setSiliconFlowGlobalApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "siliconflow:default",
    credential: {
      type: "api_key",
      provider: "siliconflow",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setSiliconFlowCnApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "siliconflow-cn:default",
    credential: {
      type: "api_key",
      provider: "siliconflow-cn",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setDeepseekWebCookie(
  options: { cookie: string; bearer?: string; userAgent?: string },
  agentDir?: string,
) {
  const key = JSON.stringify(options);
  upsertAuthProfile({
    profileId: "deepseek-web:default",
    credential: {
      type: "api_key",
      provider: "deepseek-web",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setDoubaoWebCookie(
  options: { cookie: string; bearer?: string; userAgent?: string },
  agentDir?: string,
) {
  let key: string;
  
  // 支持两种格式：
  // 1. 旧的格式: {cookie: "{\"sessionid\":\"...\",\"ttwid\":\"...\"}"}
  // 2. 新的格式: {cookie: "{\"sessionid\":\"...\",\"ttwid\":\"...\",\"fp\":\"...\",...}"}
  
  try {
    // 尝试解析cookie字符串
    const parsedCookie = JSON.parse(options.cookie);
    
    // 检查是否是DoubaoAuth对象格式
    if (typeof parsedCookie === 'object' && parsedCookie !== null && parsedCookie.sessionid) {
      // 已经是DoubaoAuth对象格式，直接使用
      key = JSON.stringify(parsedCookie);
    } else {
      // 可能是其他格式，包装成DoubaoAuth对象
      key = JSON.stringify({
        sessionid: options.cookie, // 当作sessionid字符串
        userAgent: options.userAgent || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });
    }
  } catch {
    // 如果不是JSON，则当作简单的sessionid字符串
    key = JSON.stringify({
      sessionid: options.cookie,
      userAgent: options.userAgent || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
  }
  
  upsertAuthProfile({
    profileId: "doubao-web:default",
    credential: {
      type: "api_key",
      provider: "doubao-web",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setClaudeWebCookie(
  options: { sessionKey: string; cookie?: string; userAgent?: string; organizationId?: string },
  agentDir?: string,
) {
  const key = JSON.stringify(options);
  upsertAuthProfile({
    profileId: "claude-web:default",
    credential: {
      type: "api_key",
      provider: "claude-web",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setChatGPTWebCookie(
  options: { cookie: string },
  agentDir?: string,
) {
  upsertAuthProfile({
    profileId: "chatgpt-web:default",
    credential: {
      type: "api_key",
      provider: "chatgpt-web",
      key: options.cookie,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setQwenWebCookie(
  options: { cookie: string },
  agentDir?: string,
) {
  upsertAuthProfile({
    profileId: "qwen-web:default",
    credential: {
      type: "api_key",
      provider: "qwen-web",
      key: options.cookie,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setQwenCNWebCredentials(
  options: { cookie: string; xsrfToken: string; userAgent?: string; ut?: string },
  agentDir?: string,
) {
  const credentialData = JSON.stringify({
    cookie: options.cookie,
    xsrfToken: options.xsrfToken,
    userAgent: options.userAgent,
    ut: options.ut,
  });
  upsertAuthProfile({
    profileId: "qwen-cn-web:default",
    credential: {
      type: "api_key",
      provider: "qwen-cn-web",
      key: credentialData,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setKimiWebCookie(
  options: { cookie: string },
  agentDir?: string,
) {
  upsertAuthProfile({
    profileId: "kimi-web:default",
    credential: {
      type: "api_key",
      provider: "kimi-web",
      key: options.cookie,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setGeminiWebCookie(
  options: { cookie: string },
  agentDir?: string,
) {
  upsertAuthProfile({
    profileId: "gemini-web:default",
    credential: {
      type: "api_key",
      provider: "gemini-web",
      key: options.cookie,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setGrokWebCookie(
  options: { cookie: string },
  agentDir?: string,
) {
  upsertAuthProfile({
    profileId: "grok-web:default",
    credential: {
      type: "api_key",
      provider: "grok-web",
      key: options.cookie,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setZWebCookie(
  options: { cookie: string },
  agentDir?: string,
) {
  upsertAuthProfile({
    profileId: "glm-web:default",
    credential: {
      type: "api_key",
      provider: "glm-web",
      key: options.cookie,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setManusApiKey(key: string, agentDir?: string) {
  upsertAuthProfile({
    profileId: "manus-api:default",
    credential: {
      type: "api_key",
      provider: "manus-api",
      key,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

export async function setGlmIntlWebCookie(
  options: { cookie: string },
  agentDir?: string,
) {
  upsertAuthProfile({
    profileId: "glm-intl-web:default",
    credential: {
      type: "api_key",
      provider: "glm-intl-web",
      key: options.cookie,
    },
    agentDir: resolveAuthAgentDir(agentDir),
  });
}

