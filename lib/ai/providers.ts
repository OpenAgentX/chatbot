import { customProvider, gateway } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { isTestEnvironment } from "../constants";
import type { ChatModel } from "./models";
import { getConfiguredTitleModelId } from "./models";

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

function isOpenAICompatibleProviderEnabled() {
  return Boolean(process.env.OPENAI_COMPATIBLE_API_KEY);
}

const openAICompatibleProvider =
  !isTestEnvironment && isOpenAICompatibleProviderEnabled()
    ? createOpenAI({
        apiKey: process.env.OPENAI_COMPATIBLE_API_KEY,
        baseURL: process.env.OPENAI_COMPATIBLE_BASE_URL,
      })
    : null;

export function getProviderOptions(modelConfig?: ChatModel) {
  return {
    ...(isOpenAICompatibleProviderEnabled()
      ? {}
      : modelConfig?.gatewayOrder && {
          gateway: { order: modelConfig.gatewayOrder },
        }),
    ...(modelConfig?.reasoningEffort && {
      openai: { reasoningEffort: modelConfig.reasoningEffort },
    }),
  };
}

export async function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  if (openAICompatibleProvider) {
    return openAICompatibleProvider.chat(modelId);
  }

  return gateway.languageModel(modelId);
}

export async function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }

  if (openAICompatibleProvider) {
    return openAICompatibleProvider.chat(await getConfiguredTitleModelId());
  }

  return gateway.languageModel(await getConfiguredTitleModelId());
}
