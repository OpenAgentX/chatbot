import { tool } from "ai";
import { z } from "zod";

export const apexChart = tool({
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
    return {
      agent: "Apex Chart",
      provider: "mock-third-party",
      simulated: true,
      generatedAt: new Date().toISOString(),
      diagramType: normalizedType,
      style: style ?? "Clean academic journal style",
      taskCreated: true,
      task: {
        id: `mock-chart-${Date.now()}`,
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
    };
  },
});
