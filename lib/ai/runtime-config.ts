import "server-only";

import {
  type ChatModel,
  chatModels,
  DEFAULT_CHAT_MODEL,
  inferModelCapabilities,
  inferModelProvider,
  isDemo,
  type ModelCapabilities,
  titleModel,
} from "@/lib/ai/models";
import { getModelProviderConfig } from "@/lib/db/queries";
import type { ModelProvider } from "@/lib/db/schema";

type GatewayModel = {
  id: string;
  name: string;
  type?: string;
  tags?: string[];
};

export type GatewayModelWithCapabilities = ChatModel & {
  capabilities: ModelCapabilities;
};

type OpenAICompatibleModelResponse = {
  id: string;
  owned_by?: string;
};

type GoogleModelResponse = {
  name?: string;
  baseModelId?: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
};

export type ResolvedModelProviderConfig = {
  provider: ModelProvider;
  baseUrl: string | null;
  apiKey: string | null;
  defaultModel: string | null;
  titleModel: string | null;
  customModels: string | null;
};

function normalizeOptionalString(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function mergeChatModels(...groups: ChatModel[][]): ChatModel[] {
  const merged = new Map<string, ChatModel>();

  for (const group of groups) {
    for (const model of group) {
      if (!merged.has(model.id)) {
        merged.set(model.id, model);
      }
    }
  }

  return [...merged.values()];
}

function parseCustomModels(
  raw: string | null,
  provider: ModelProvider
): ChatModel[] {
  if (!raw) {
    return [];
  }

  return raw
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [idPart, namePart] = entry.split("|").map((part) => part.trim());
      const id = idPart;

      if (!id) {
        return null;
      }

      return {
        id,
        name: namePart || id,
        provider: provider === "google" ? "google" : inferModelProvider(id),
        description: "Configured in the admin console",
      } satisfies ChatModel;
    })
    .filter((model: ChatModel | null): model is ChatModel => Boolean(model));
}

function getConfiguredModelPlaceholders(
  config: ResolvedModelProviderConfig
): ChatModel[] {
  return [...new Set([config.defaultModel, config.titleModel])]
    .filter((modelId): modelId is string => Boolean(modelId))
    .map((modelId) => ({
      id: modelId,
      name: modelId,
      provider:
        config.provider === "google" ? "google" : inferModelProvider(modelId),
      description: "Configured in the admin console",
    }));
}

function pickConfiguredModelId(
  preferredId: string | null,
  models: ChatModel[],
  fallbackId: string
) {
  if (preferredId && models.some((model) => model.id === preferredId)) {
    return preferredId;
  }

  return models[0]?.id || fallbackId;
}

async function fetchOpenAICompatibleModelsFromApi(
  config: ResolvedModelProviderConfig
): Promise<ChatModel[] | null> {
  if (!config.baseUrl || !config.apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${normalizeBaseUrl(config.baseUrl)}/models`, {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
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
          description: "Discovered from the provider /models endpoint",
        } satisfies ChatModel;
      })
      .filter((model: ChatModel | null): model is ChatModel => Boolean(model));

    return parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

async function fetchGoogleModelsFromApi(
  config: ResolvedModelProviderConfig
): Promise<ChatModel[] | null> {
  if (!config.apiKey) {
    return null;
  }

  const baseUrl = normalizeBaseUrl(
    config.baseUrl || "https://generativelanguage.googleapis.com/v1beta"
  );

  try {
    const url = new URL(`${baseUrl}/models`);
    url.searchParams.set("key", config.apiKey);
    url.searchParams.set("pageSize", "1000");

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const json = await response.json();
    const models = Array.isArray(json?.models) ? json.models : [];

    const parsed = models
      .filter((model: GoogleModelResponse) =>
        model.supportedGenerationMethods?.includes("generateContent")
      )
      .map((model: GoogleModelResponse) => {
        const id =
          model.baseModelId ||
          model.name?.replace(/^models\//, "") ||
          model.displayName;

        if (!id) {
          return null;
        }

        return {
          id,
          name: model.displayName || id,
          provider: "google",
          description:
            model.description || "Discovered from the Google models API",
        } satisfies ChatModel;
      })
      .filter((model: ChatModel | null): model is ChatModel => Boolean(model));

    return parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export async function getResolvedModelProviderConfig(): Promise<ResolvedModelProviderConfig> {
  const config = await getModelProviderConfig();

  return {
    provider: config?.provider ?? "gateway",
    baseUrl: normalizeOptionalString(config?.baseUrl),
    apiKey: normalizeOptionalString(config?.apiKey),
    defaultModel: normalizeOptionalString(config?.defaultModel),
    titleModel: normalizeOptionalString(config?.titleModel),
    customModels: normalizeOptionalString(config?.customModels),
  };
}

export async function getConfiguredChatModels(): Promise<ChatModel[]> {
  const config = await getResolvedModelProviderConfig();
  const customModels = parseCustomModels(config.customModels, config.provider);
  const configuredModels = getConfiguredModelPlaceholders(config);

  if (config.provider === "openai-compatible") {
    return mergeChatModels(
      (await fetchOpenAICompatibleModelsFromApi(config)) ??
        (customModels.length > 0 ? customModels : chatModels),
      customModels,
      configuredModels
    );
  }

  if (config.provider === "google") {
    const googleFallback = mergeChatModels(
      chatModels.filter((model) => model.provider === "google"),
      customModels,
      configuredModels
    );

    return mergeChatModels(
      (await fetchGoogleModelsFromApi(config)) ?? googleFallback,
      customModels,
      configuredModels
    );
  }

  return mergeChatModels(
    customModels.length > 0 ? customModels : chatModels,
    configuredModels
  );
}

export async function getConfiguredDefaultChatModel(): Promise<string> {
  const [config, models] = await Promise.all([
    getResolvedModelProviderConfig(),
    getConfiguredChatModels(),
  ]);

  return pickConfiguredModelId(config.defaultModel, models, DEFAULT_CHAT_MODEL);
}

export async function getConfiguredTitleModelId(): Promise<string> {
  const [config, models, defaultModelId] = await Promise.all([
    getResolvedModelProviderConfig(),
    getConfiguredChatModels(),
    getConfiguredDefaultChatModel(),
  ]);

  return pickConfiguredModelId(
    config.titleModel,
    models,
    defaultModelId || titleModel.id
  );
}

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  const config = await getResolvedModelProviderConfig();

  if (config.provider !== "gateway") {
    const models = await getConfiguredChatModels();

    return Object.fromEntries(
      models.map((model) => [model.id, inferModelCapabilities(model.id)])
    );
  }

  const customModels = parseCustomModels(config.customModels, config.provider);

  if (customModels.length > 0) {
    return Object.fromEntries(
      customModels.map((model) => [model.id, inferModelCapabilities(model.id)])
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
            (endpoint: { supported_parameters?: string[] }) =>
              endpoint.supported_parameters ?? []
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

export async function getAllGatewayModels(): Promise<
  GatewayModelWithCapabilities[]
> {
  const config = await getResolvedModelProviderConfig();

  if (config.provider !== "gateway") {
    const models = await getConfiguredChatModels();

    return models.map((model) => ({
      ...model,
      capabilities: inferModelCapabilities(model.id),
    }));
  }

  const customModels = parseCustomModels(config.customModels, config.provider);

  if (customModels.length > 0) {
    return customModels.map((model) => ({
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
      .filter((model: GatewayModel) => model.type === "language")
      .map((model: GatewayModel) => ({
        id: model.id,
        name: model.name,
        provider: model.id.split("/")[0],
        description: "",
        capabilities: {
          tools: model.tags?.includes("tool-use") ?? false,
          vision: model.tags?.includes("vision") ?? false,
          reasoning: model.tags?.includes("reasoning") ?? false,
        },
      }));
  } catch {
    return [];
  }
}

export async function getAllowedModelIds() {
  return new Set((await getConfiguredChatModels()).map((model) => model.id));
}

export async function shouldExposeAllGatewayModels() {
  const config = await getResolvedModelProviderConfig();
  return isDemo && config.provider === "gateway" && !config.customModels;
}
