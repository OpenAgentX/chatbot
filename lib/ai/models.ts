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
    id: "xai/grok-4.1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    provider: "xai",
    description: "Fast non-reasoning model with tool use",
    gatewayOrder: ["xai"],
  },
];

function isOpenAICompatibleProviderEnabled() {
  return Boolean(process.env.OPENAI_COMPATIBLE_API_KEY);
}

function inferModelProvider(modelId: string) {
  return modelId.includes("/") ? modelId.split("/")[0] : "openai";
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function inferModelCapabilities(modelId: string): ModelCapabilities {
  const normalized = modelId.toLowerCase();

  const reasoning =
    normalized.startsWith("o1") ||
    normalized.startsWith("o3") ||
    normalized.startsWith("o4") ||
    normalized.includes("gpt-5") ||
    normalized.includes("reason") ||
    normalized.includes("r1");

  const vision =
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

function parseOpenAICompatibleModels(): ChatModel[] {
  const raw = process.env.OPENAI_COMPATIBLE_MODELS?.trim();

  if (!raw) {
    return chatModels;
  }

  const parsed = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [idPart, namePart] = entry.split("|").map((part) => part.trim());
      const id = idPart;

      return {
        id,
        name: namePart || id,
        provider: inferModelProvider(id),
        description: "Configured via OPENAI_COMPATIBLE_MODELS",
      } satisfies ChatModel;
    });

  return parsed.length > 0 ? parsed : chatModels;
}

function parseFallbackModelsFromEnv(): ChatModel[] {
  const explicitModels = parseOpenAICompatibleModels();

  if (explicitModels !== chatModels) {
    return explicitModels;
  }

  const ids = [
    process.env.OPENAI_COMPATIBLE_DEFAULT_MODEL?.trim(),
    process.env.OPENAI_COMPATIBLE_TITLE_MODEL?.trim(),
  ].filter((value): value is string => Boolean(value));

  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length > 0) {
    return uniqueIds.map((id) => ({
      id,
      name: id,
      provider: inferModelProvider(id),
      description: "Configured via environment variables",
    }));
  }

  return chatModels;
}

type OpenAICompatibleModelResponse = {
  id: string;
  owned_by?: string;
};

async function fetchOpenAICompatibleModelsFromApi(): Promise<ChatModel[] | null> {
  const baseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL?.trim();
  const apiKey = process.env.OPENAI_COMPATIBLE_API_KEY?.trim();

  if (!baseUrl || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const models = Array.isArray(json?.data) ? json.data : [];

    const parsed = models
      .map((model: OpenAICompatibleModelResponse) => {
        if (!model?.id) {
          return null;
        }

        return {
          id: model.id,
          name: model.id,
          provider:
            inferModelProvider(model.id) ||
            model.owned_by?.toLowerCase() ||
            "openai",
          description: "Discovered from OpenAI-compatible /models endpoint",
        } satisfies ChatModel;
      })
      .filter((model: ChatModel | null): model is ChatModel => Boolean(model));

    return parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export async function getConfiguredChatModels(): Promise<ChatModel[]> {
  if (!isOpenAICompatibleProviderEnabled()) {
    return chatModels;
  }

  return (await fetchOpenAICompatibleModelsFromApi()) ?? parseFallbackModelsFromEnv();
}

export async function getConfiguredDefaultChatModel(): Promise<string> {
  if (!isOpenAICompatibleProviderEnabled()) {
    return DEFAULT_CHAT_MODEL;
  }

  const models = await getConfiguredChatModels();

  return (
    process.env.OPENAI_COMPATIBLE_DEFAULT_MODEL?.trim() ||
    models[0]?.id ||
    DEFAULT_CHAT_MODEL
  );
}

export async function getConfiguredTitleModelId(): Promise<string> {
  if (!isOpenAICompatibleProviderEnabled()) {
    return titleModel.id;
  }

  return (
    process.env.OPENAI_COMPATIBLE_TITLE_MODEL?.trim() ||
    (await getConfiguredDefaultChatModel())
  );
}

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  if (isOpenAICompatibleProviderEnabled()) {
    const models = await getConfiguredChatModels();

    return Object.fromEntries(
      models.map((model) => [
        model.id,
        inferModelCapabilities(model.id),
      ])
    );
  }

  const results = await Promise.all(
    chatModels.map(async (model) => {
      try {
        const res = await fetch(
          `https://ai-gateway.vercel.sh/v1/models/${model.id}/endpoints`,
          { next: { revalidate: 86_400 } }
        );
        if (!res.ok) {
          return [model.id, { tools: false, vision: false, reasoning: false }];
        }

        const json = await res.json();
        const endpoints = json.data?.endpoints ?? [];
        const params = new Set(
          endpoints.flatMap(
            (e: { supported_parameters?: string[] }) =>
              e.supported_parameters ?? []
          )
        );
        const inputModalities = new Set(
          json.data?.architecture?.input_modalities ?? []
        );

        return [
          model.id,
          {
            tools: params.has("tools"),
            vision: inputModalities.has("image"),
            reasoning: params.has("reasoning"),
          },
        ];
      } catch {
        return [model.id, { tools: false, vision: false, reasoning: false }];
      }
    })
  );

  return Object.fromEntries(results);
}

export const isDemo = process.env.IS_DEMO === "1";

type GatewayModel = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
};

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  if (isOpenAICompatibleProviderEnabled()) {
    const models = await getConfiguredChatModels();

    return models.map((model) => ({
      ...model,
      capabilities: inferModelCapabilities(model.id),
    }));
  }

  try {
    const res = await fetch("https://ai-gateway.vercel.sh/v1/models", {
      next: { revalidate: 86_400 },
    });
    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return (json.data ?? [])
      .filter((m: GatewayModel) => m.type === "language")
      .map((m: GatewayModel) => ({
        id: m.id,
        name: m.name,
        provider: m.id.split("/")[0],
        description: "",
        capabilities: {
          tools: m.tags?.includes("tool-use") ?? false,
          vision: m.tags?.includes("vision") ?? false,
          reasoning: m.tags?.includes("reasoning") ?? false,
        },
      }));
  } catch {
    return [];
  }
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export async function getAllowedModelIds() {
  return new Set((await getConfiguredChatModels()).map((m) => m.id));
}

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
