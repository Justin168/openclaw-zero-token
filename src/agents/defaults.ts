import { loadAuthProfileStore, listProfilesForProvider } from "./auth-profiles.js";
import { resolveOpenClawAgentDir } from "./agent-paths.js";

export const DEFAULT_CONTEXT_TOKENS = 200_000;

export const PROVIDER_DEFAULTS: Record<string, { provider: string; model: string }> = {
  "deepseek-web": { provider: "deepseek-web", model: "deepseek-chat" },
  "doubao-web": { provider: "doubao-web", model: "doubao-seed-2.0" },
  "claude-web": { provider: "claude-web", model: "claude-sonnet-4-6" },
};

const FALLBACK_PROVIDER = "deepseek-web";
const FALLBACK_MODEL = "deepseek-chat";

export function detectDefaultProvider(): string {
  try {
    const agentDir = resolveOpenClawAgentDir();
    const store = loadAuthProfileStore(agentDir, { allowKeychainPrompt: false });
    
    const priorityOrder = ["doubao-web", "deepseek-web", "claude-web"];
    
    for (const provider of priorityOrder) {
      const profiles = listProfilesForProvider(store, provider);
      if (profiles.length > 0) {
        return provider;
      }
    }
  } catch {
    // Ignore errors and fall back
  }
  
  return FALLBACK_PROVIDER;
}

export function detectDefaultModel(): string {
  const provider = detectDefaultProvider();
  return PROVIDER_DEFAULTS[provider]?.model ?? FALLBACK_MODEL;
}

export function getDefaultProviderAndModel(): { provider: string; model: string } {
  const provider = detectDefaultProvider();
  return {
    provider,
    model: PROVIDER_DEFAULTS[provider]?.model ?? FALLBACK_MODEL,
  };
}

export const DEFAULT_PROVIDER = FALLBACK_PROVIDER;
export const DEFAULT_MODEL = FALLBACK_MODEL;
