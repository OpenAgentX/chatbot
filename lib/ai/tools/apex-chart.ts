import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import {
  createAgentRunId,
  sleep,
  writeAgentEvent,
} from "./mock-agent-progress";

export const apexChart = ({
  dataStream,
}: {
  dataStream: UIMessageStreamWriter<any>;
}) =>
  tool({
    description:
      "Academic diagram generator. Use this when the user wants a research-method diagram or wants to turn method text plus a diagram description into a generated chart task. This tool returns simulated third-party agent output.",
    inputSchema: z.object({
      paperMethodText: z
        .string()
        .describe("Method section text or methodological summary"),
      diagramDescription: z
        .string()
        .describe("Description of the desired academic diagram"),
      diagramType: z
        .string()
        .optional()
        .describe("Optional type such as workflow, framework, pipeline"),
      style: z
        .string()
        .optional()
        .describe("Optional visual style or publication preference"),
    }),
    execute: async ({
      paperMethodText,
      diagramDescription,
      diagramType,
      style,
    }) => {
      const normalizedType = diagramType ?? "Method workflow";
      const taskId = `mock-chart-${Date.now()}`;
      const runId = createAgentRunId();

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Chart",
        seq: 1,
        status: "thinking",
        title: "Parsing method section",
        detail:
          "Extracting inputs, transformations, validation stages, and outputs from the provided method text.",
      });
      await sleep(180);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Chart",
        seq: 2,
        status: "tool_call",
        title: "Calling diagram planner",
        detail:
          "Simulating layout generation, node normalization, and export planning for the requested diagram.",
      });
      await sleep(220);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Chart",
        seq: 3,
        status: "tool_result",
        title: "Received diagram blueprint",
        detail:
          "Mock planner returned node groups, left-to-right layout advice, and publication export targets.",
      });
      await sleep(140);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Chart",
        seq: 4,
        status: "completed",
        title: "Creating generation task",
        detail: `Queued mock diagram task ${taskId} with exportable outputs.`,
      });

      return {
        runId,
        agent: "Apex Chart",
        provider: "mock-third-party",
        simulated: true,
        generatedAt: new Date().toISOString(),
        diagramType: normalizedType,
        style: style ?? "Clean academic journal style",
        taskCreated: true,
        task: {
          id: taskId,
          status: "queued",
          title: `${normalizedType} diagram generation`,
          description: diagramDescription,
        },
        extractedMethodSummary:
          paperMethodText.length > 240
            ? `${paperMethodText.slice(0, 240)}...`
            : paperMethodText,
        proposedNodes: [
          "Input data or study cohort",
          "Preprocessing or preparation",
          "Core method steps",
          "Evaluation or validation",
          "Output or findings",
        ],
        layoutSuggestion:
          "Use a left-to-right pipeline with numbered stages and short annotation labels below each node.",
        exportFormats: ["svg", "png", "editable source"],
        outputs: [
          {
            step: 1,
            title: "Method parsing",
            summary:
              "The method text was parsed into a staged research workflow suitable for diagramming.",
            bullets: [
              "Inputs, transformations, and outputs were separated into visual blocks.",
              "Validation steps were identified as a distinct downstream stage.",
              "Long descriptive phrases were shortened into node-friendly labels.",
            ],
          },
          {
            step: 2,
            title: "Diagram planning",
            summary:
              "A publishable layout plan was prepared from the diagram description and inferred method flow.",
            bullets: [
              "A left-to-right structure was selected for readability.",
              "Annotations were grouped beneath nodes instead of inside them.",
              "The node set was normalized into a small number of major stages.",
            ],
          },
          {
            step: 3,
            title: "Task creation",
            summary:
              "A mock generation task was queued with export targets and layout instructions.",
            bullets: [
              `Task ${taskId} was created in queued state.`,
              "SVG and PNG were included as default publication exports.",
              "Editable source was retained for later revision cycles.",
            ],
          },
        ],
      };
    },
  });
