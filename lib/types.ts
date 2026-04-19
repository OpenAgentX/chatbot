import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { ArtifactKind } from "@/components/chat/artifact";
import type { apexChart } from "./ai/tools/apex-chart";
import type { apexResearch } from "./ai/tools/apex-research";
import type { apexScholar } from "./ai/tools/apex-scholar";
import type { createDocument } from "./ai/tools/create-document";
import type { getWeather } from "./ai/tools/get-weather";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { updateDocument } from "./ai/tools/update-document";
import type { Suggestion } from "./db/schema";

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type AgentProcessEvent = {
  runId: string;
  agent: string;
  seq: number;
  status: "thinking" | "tool_call" | "tool_result" | "completed";
  title: string;
  detail: string;
};

type apexResearchTool = InferUITool<ReturnType<typeof apexResearch>>;
type apexScholarTool = InferUITool<ReturnType<typeof apexScholar>>;
type apexChartTool = InferUITool<ReturnType<typeof apexChart>>;
type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;

export type ChatTools = {
  apexResearch: apexResearchTool;
  apexScholar: apexScholarTool;
  apexChart: apexChartTool;
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  reportDelta: string;
  pptDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  agentEvent: AgentProcessEvent;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
  "chat-title": string;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
