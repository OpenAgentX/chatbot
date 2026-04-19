import type { UIMessageStreamWriter } from "ai";
import type { AgentProcessEvent } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

export function createAgentRunId() {
  return generateUUID();
}

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function writeAgentEvent(
  dataStream: UIMessageStreamWriter<any>,
  event: AgentProcessEvent
) {
  dataStream.write({
    type: "data-agentEvent",
    data: event,
    transient: true,
  });
}
