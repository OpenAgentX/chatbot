import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";
import {
  createAgentRunId,
  sleep,
  writeAgentEvent,
} from "./mock-agent-progress";

export const apexScholar = ({
  dataStream,
}: {
  dataStream: UIMessageStreamWriter<ChatMessage>;
}) =>
  tool({
    description:
      "Academic writing companion for professional output. Use this when the user wants help drafting, refining, or structuring academic papers, theses, literature reviews, abstracts, or research prose. This tool returns simulated third-party agent output.",
    inputSchema: z.object({
      task: z
        .string()
        .describe("Academic writing task or requested deliverable"),
      topic: z.string().describe("Research topic or paper subject"),
      academicLevel: z
        .string()
        .optional()
        .describe("Optional level such as undergraduate, master's, PhD"),
      outputType: z
        .string()
        .optional()
        .describe("Optional output type such as abstract, outline, discussion"),
      requirements: z
        .string()
        .optional()
        .describe("Optional style, journal, or formatting requirements"),
    }),
    execute: async ({
      task,
      topic,
      academicLevel,
      outputType,
      requirements,
    }) => {
      const runId = createAgentRunId();

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Scholar",
        seq: 1,
        status: "thinking",
        title: "Framing academic task",
        detail: `Interpreting the request as ${task} and narrowing the scope for topic ${topic}.`,
      });
      await sleep(5800);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Scholar",
        seq: 2,
        status: "tool_call",
        title: "Calling writing planner",
        detail:
          "Simulating outline synthesis, section planning, and academic-style polish heuristics.",
      });
      await sleep(5200);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Scholar",
        seq: 3,
        status: "tool_result",
        title: "Received draft scaffold",
        detail:
          "Mock planner returned abstract framing, section ordering, and revision checkpoints.",
      });
      await sleep(5400);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Scholar",
        seq: 4,
        status: "completed",
        title: "Preparing academic package",
        detail:
          "Finalizing outline, writing plan, and publication-readiness checks.",
      });
await sleep(5400);
      return {
        runId,
        agent: "Apex Scholar",
        provider: "mock-third-party",
        simulated: true,
        generatedAt: new Date().toISOString(),
        task,
        topic,
        academicLevel: academicLevel ?? "Graduate",
        outputType: outputType ?? "Structured writing package",
        requirements: requirements ?? "Standard academic style",
        deliverables: {
          title: `Mock Academic Draft Package: ${topic}`,
          abstract:
            `This simulated draft package outlines a rigorous academic response to the topic of ${topic}, with emphasis on research framing, analytical clarity, and publishable structure.`,
          outline: [
            "Introduction and problem framing",
            "Literature review and gap identification",
            "Method or analytical framework",
            "Results or argument development",
            "Discussion, implications, and limitations",
          ],
          writingPlan: [
            "Define a narrow research claim before drafting",
            "Map each section to one core contribution",
            "Keep evidence chains explicit and citation-ready",
          ],
        },
        qualityChecks: [
          "Argument progression is logically ordered",
          "Section headings match conventional academic structure",
          "Claims are phrased to support citation insertion",
        ],
        recommendedNextStep:
          "Use this draft package as a scaffold, then replace placeholder evidence and claims with source-grounded content.",
        outputs: [
          {
            step: 1,
            title: "Research framing",
            summary:
              `Apex Scholar generated an initial framing pass for ${topic}, clarifying scope and expected contribution.`,
            bullets: [
              "Narrow the central claim to one defensible research contribution.",
              "Define the paper's gap statement before drafting full sections.",
              "Align terminology early to reduce revision churn later.",
            ],
          },
          {
            step: 2,
            title: "Structure draft",
            summary:
              "A section-by-section writing scaffold was prepared for faster academic drafting.",
            bullets: [
              "Introduction and literature review were sequenced for argumentative clarity.",
              "Method and discussion sections were mapped to explicit contribution claims.",
              "Paragraph flow was optimized for citation insertion.",
            ],
          },
          {
            step: 3,
            title: "Polish guidance",
            summary:
              "A final refinement pass highlighted style, logic, and publication-readiness checks.",
            bullets: [
              "Keep sentence claims measurable and source-ready.",
              "Tighten transitions between evidence and interpretation.",
              "Audit conclusion language for overclaiming.",
            ],
          },
        ],
      };
    },
  });
