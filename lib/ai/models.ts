const openAIBaseUrl =
  process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const openAIModelsApiUrl =
  process.env.OPENAI_MODELS_API_URL ??
  `${openAIBaseUrl.replace(/\/+$/, "")}/models`;
const openAIApiKey =
  process.env.OPENAI_API_KEY ?? process.env.AI_GATEWAY_API_KEY;

export const DEFAULT_CHAT_MODEL =
  process.env.NEXT_PUBLIC_DEFAULT_CHAT_MODEL ?? "gpt-4o-mini";
const DEFAULT_TITLE_MODEL =
  process.env.NEXT_PUBLIC_TITLE_MODEL ?? DEFAULT_CHAT_MODEL;

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
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

function inferProvider(modelId: string, ownedBy?: string): string {
  if (modelId.includes("/")) {
    return modelId.split("/")[0] ?? "openai";
  }

  if (ownedBy) {
    return ownedBy.toLowerCase();
  }

  return "openai";
}

function inferCapabilitiesByModelId(modelId: string): ModelCapabilities {
  const id = modelId.toLowerCase();
  const reasoning =
    /\bo\d\b|\bo\d-mini\b|reason|r1|gpt-5|gpt-oss/.test(id) ||
    id.includes("reasoning");
  const vision =
    id.includes("vision") ||
    id.includes("vl") ||
    id.includes("gpt-4o") ||
    id.includes("gpt-4.1") ||
    id.includes("gpt-5");

  return {
    tools: true,
    vision,
    reasoning,
  };
}

function inferReasoningEffort(modelId: string): ChatModel["reasoningEffort"] {
  return inferCapabilitiesByModelId(modelId).reasoning ? "low" : undefined;
}

function prettifyModelName(modelId: string): string {
  return (
    modelId
      .split("/")
      .pop()
      ?.replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) ?? modelId
  );
}

const fallbackModelIds = Array.from(
  new Set([DEFAULT_CHAT_MODEL, DEFAULT_TITLE_MODEL])
);

export const chatModels: ChatModel[] = fallbackModelIds.map((modelId) => ({
  id: modelId,
  name: prettifyModelName(modelId),
  provider: inferProvider(modelId),
  description: "Fallback model when model API is unavailable",
  reasoningEffort: inferReasoningEffort(modelId),
}));

export const titleModel = {
  id: DEFAULT_TITLE_MODEL,
  name: prettifyModelName(DEFAULT_TITLE_MODEL),
  provider: inferProvider(DEFAULT_TITLE_MODEL),
  description: "Fast model for title generation",
  reasoningEffort: inferReasoningEffort(DEFAULT_TITLE_MODEL),
};

type OpenAIModel = {
  id: string;
  object?: string;
  owned_by?: string;
};

function getOpenAIHeaders(): Record<string, string> {
  if (!openAIApiKey) {
    return {};
  }

  return {
    Authorization: `Bearer ${openAIApiKey}`,
  };
}

function toChatModel(model: OpenAIModel): ChatModel {
  return {
    id: model.id,
    name: prettifyModelName(model.id),
    provider: inferProvider(model.id, model.owned_by),
    description: "",
    reasoningEffort: inferReasoningEffort(model.id),
  };
}

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  const models = await getAllGatewayModels();

  return Object.fromEntries(
    models.map((model) => [model.id, model.capabilities] as const)
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

function addCapabilities(model: ChatModel): GatewayModelWithCapabilities {
  return {
    ...model,
    capabilities: inferCapabilitiesByModelId(model.id),
  };
}

function dedupeModelsById(models: ChatModel[]): ChatModel[] {
  const map = new Map<string, ChatModel>();
  for (const model of models) {
    if (!map.has(model.id)) {
      map.set(model.id, model);
    }
  }
  return [...map.values()];
}

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  try {
    const res = await fetch(openAIModelsApiUrl, {
      headers: getOpenAIHeaders(),
      next: { revalidate: 86_400 },
    });
    if (!res.ok) {
      return chatModels.map(addCapabilities);
    }

    const json = (await res.json()) as { data?: OpenAIModel[] };

    const dynamicModels = (json.data ?? [])
      .filter(
        (model): model is OpenAIModel =>
          typeof model.id === "string" &&
          model.id.length > 0 &&
          (model.object === undefined || model.object === "model")
      )
      .map(toChatModel)
      .sort((a, b) => a.id.localeCompare(b.id));

    return dedupeModelsById([...chatModels, ...dynamicModels]).map(
      addCapabilities
    );
  } catch {
    return chatModels.map(addCapabilities);
  }
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export function resolveChatModel(
  selectedModelId: string,
  availableModels: Array<{ id: string }>
): string {
  const modelIds = new Set(availableModels.map((model) => model.id));

  if (modelIds.has(selectedModelId)) {
    return selectedModelId;
  }

  if (modelIds.has(DEFAULT_CHAT_MODEL)) {
    return DEFAULT_CHAT_MODEL;
  }

  return availableModels[0]?.id ?? DEFAULT_CHAT_MODEL;
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
