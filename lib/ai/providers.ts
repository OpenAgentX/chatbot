import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createGateway, customProvider, gateway } from "ai";
import { isTestEnvironment } from "../constants";
import type { ChatModel } from "./models";
import {
  getConfiguredTitleModelId,
  getResolvedModelProviderConfig,
} from "./runtime-config";

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

function normalizeOptionalValue(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function isMoonshotBaseUrl(baseUrl: string | undefined) {
  if (!baseUrl) {
    return false;
  }

  try {
    return new URL(baseUrl).hostname.endsWith("moonshot.cn");
  } catch {
    return false;
  }
}

function isMoonshotThinkingModel(modelId: string) {
  const normalized = modelId.toLowerCase();

  return (
    normalized === "kimi-k2.5" ||
    normalized.startsWith("kimi-k2.5-") ||
    normalized.startsWith("kimi-k2-")
  );
}

function createMoonshotCompatibleFetch(baseUrl: string | undefined) {
  if (!isMoonshotBaseUrl(baseUrl)) {
    return undefined;
  }

  return (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (
      !requestUrl.endsWith("/chat/completions") ||
      typeof init?.body !== "string"
    ) {
      return fetch(input, init);
    }

    try {
      const body = JSON.parse(init.body) as {
        model?: string;
        thinking?: unknown;
      };

      if (body.model && isMoonshotThinkingModel(body.model)) {
        body.thinking = { type: "disabled" };

        return fetch(input, {
          ...init,
          body: JSON.stringify(body),
        });
      }
    } catch {
      return fetch(input, init);
    }

    return fetch(input, init);
  };
}

function isGoogleModelId(modelId: string) {
  const normalized = modelId.toLowerCase();

  return (
    normalized.startsWith("google/") ||
    normalized.startsWith("gemini-") ||
    normalized.startsWith("gemma-") ||
    normalized === "aqa" ||
    normalized.startsWith("deep-research-pro-preview")
  );
}

function toGoogleModelId(modelId: string) {
  return modelId.startsWith("google/")
    ? modelId.slice("google/".length)
    : modelId;
}

async function getRuntimeProviders() {
  const config = await getResolvedModelProviderConfig();
  const normalizedBaseUrl = normalizeOptionalValue(config.baseUrl);
  const normalizedApiKey = normalizeOptionalValue(config.apiKey);

  const gatewayProvider =
    config.provider === "gateway"
      ? normalizedApiKey || normalizedBaseUrl
        ? createGateway({
            apiKey: normalizedApiKey,
            baseURL: normalizedBaseUrl,
          })
        : gateway
      : null;

  const openAICompatibleProvider =
    config.provider === "openai-compatible"
      ? createOpenAI({
          apiKey: normalizedApiKey,
          baseURL: normalizedBaseUrl,
          fetch: createMoonshotCompatibleFetch(normalizedBaseUrl),
        })
      : null;

  const googleProvider =
    config.provider === "google"
      ? createGoogleGenerativeAI({
          apiKey: normalizedApiKey,
          baseURL: normalizedBaseUrl,
        })
      : null;

  return { config, gatewayProvider, googleProvider, openAICompatibleProvider };
}

export async function getProviderOptions(modelConfig?: ChatModel) {
  const { config } = await getRuntimeProviders();

  return {
    ...(config.provider === "gateway" &&
      modelConfig?.gatewayOrder && {
        gateway: { order: modelConfig.gatewayOrder },
      }),
    ...(config.provider !== "openai-compatible" &&
      modelConfig?.reasoningEffort && {
        openai: { reasoningEffort: modelConfig.reasoningEffort },
      }),
  };
}

export async function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  const { gatewayProvider, googleProvider, openAICompatibleProvider } =
    await getRuntimeProviders();

  if (googleProvider && isGoogleModelId(modelId)) {
    return googleProvider.chat(toGoogleModelId(modelId));
  }

  if (openAICompatibleProvider) {
    return openAICompatibleProvider.chat(modelId);
  }

  return (gatewayProvider ?? gateway).languageModel(modelId);
}

export async function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  const titleModelId = await getConfiguredTitleModelId();
  const { gatewayProvider, googleProvider, openAICompatibleProvider } =
    await getRuntimeProviders();

  if (googleProvider && isGoogleModelId(titleModelId)) {
    return googleProvider.chat(toGoogleModelId(titleModelId));
  }

  if (openAICompatibleProvider) {
    return openAICompatibleProvider.chat(titleModelId);
  }

  return (gatewayProvider ?? gateway).languageModel(titleModelId);
}
