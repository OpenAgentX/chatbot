export const DEFAULT_CHAT_MODEL = "moonshotai/kimi-k2-0905";

export const titleModel = {
  id: "mistral/mistral-small",
  name: "Mistral Small",
  provider: "mistral",
  description: "Fast model for title generation",
  gatewayOrder: ["mistral"],
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    id: "deepseek/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "deepseek",
    description: "Fast and capable model with tool use",
    gatewayOrder: ["bedrock", "deepinfra"],
  },
  {
    id: "mistral/codestral",
    name: "Codestral",
    provider: "mistral",
    description: "Code-focused model with tool use",
    gatewayOrder: ["mistral"],
  },
  {
    id: "mistral/mistral-small",
    name: "Mistral Small",
    provider: "mistral",
    description: "Fast vision model with tool use",
    gatewayOrder: ["mistral"],
  },
  {
    id: "moonshotai/kimi-k2-0905",
    name: "Kimi K2 0905",
    provider: "moonshotai",
    description: "Fast model with tool use",
    gatewayOrder: ["baseten", "fireworks"],
  },
  {
    id: "moonshotai/kimi-k2.5",
    name: "Kimi K2.5",
    provider: "moonshotai",
    description: "Moonshot AI flagship model",
    gatewayOrder: ["fireworks", "bedrock"],
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    provider: "openai",
    description: "Compact reasoning model",
    gatewayOrder: ["groq", "bedrock"],
    reasoningEffort: "low",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    provider: "openai",
    description: "Open-source 120B parameter model",
    gatewayOrder: ["fireworks", "bedrock"],
    reasoningEffort: "low",
  },
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    provider: "google",
    description: "Fast multimodal Gemini model with tool use",
    gatewayOrder: ["google"],
  },
  {
    id: "google/gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    provider: "google",
    description: "Low-latency Gemini model for lightweight tasks",
    gatewayOrder: ["google"],
  },
  {
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    provider: "xai",
    description: "Fast non-reasoning model with tool use",
    gatewayOrder: ["xai"],
  },
];

export function inferModelProvider(modelId: string) {
  const normalized = modelId.toLowerCase();

  if (
    normalized.startsWith("google/") ||
    normalized.startsWith("gemini-") ||
    normalized.startsWith("gemma-") ||
    normalized === "aqa" ||
    normalized.startsWith("deep-research-pro-preview")
  ) {
    return "google";
  }

  return modelId.includes("/") ? modelId.split("/")[0] : "openai";
}

export function inferModelCapabilities(modelId: string): ModelCapabilities {
  const normalized = modelId.toLowerCase();

  const reasoning =
    normalized.startsWith("o1") ||
    normalized.startsWith("o3") ||
    normalized.startsWith("o4") ||
    normalized.includes("gemini-2.5") ||
    normalized.includes("gemini-3") ||
    normalized.includes("gemini-pro") ||
    normalized.includes("gpt-5") ||
    normalized.includes("reason") ||
    normalized.includes("r1");

  const vision =
    normalized.includes("gemini") ||
    normalized.includes("gpt-4o") ||
    normalized.includes("gpt-4.1") ||
    normalized.includes("vision") ||
    normalized.includes("vl") ||
    normalized.includes("omni");

  return {
    tools: true,
    vision,
    reasoning,
  };
}

export const isDemo = process.env.IS_DEMO === "1";

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
