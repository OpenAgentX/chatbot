import { tool, type UIMessageStreamWriter } from "ai";
import { z } from "zod";
import type { ChatMessage } from "@/lib/types";
import {
  createAgentRunId,
  sleep,
  writeAgentEvent,
} from "./mock-agent-progress";

export const apexResearch = ({
  dataStream,
}: {
  dataStream: UIMessageStreamWriter<ChatMessage>;
}) =>
  tool({
    description:
      "Generate a board-level strategic analysis for a business company. Use this when the user wants executive strategy, market positioning, growth options, risks, or board-facing analysis. This tool returns simulated third-party agent output.",
    inputSchema: z.object({
      company: z
        .string()
        .describe("Target company name, brand, or business entity"),
      industry: z
        .string()
        .optional()
        .describe("Optional industry or sector context"),
      objective: z
        .string()
        .optional()
        .describe("What strategic question should the analysis answer"),
      geography: z
        .string()
        .optional()
        .describe("Optional market or geographic focus"),
      timeframe: z
        .string()
        .optional()
        .describe("Planning horizon, such as 12 months or 3 years"),
    }),
    execute: async ({
      company,
      industry,
      objective,
      geography,
      timeframe,
    }) => {
      const market = geography ?? "Global";
      const horizon = timeframe ?? "24 months";
      const runId = createAgentRunId();

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Research",
        seq: 1,
        status: "thinking",
        title: "Scoping board question",
        detail: `Clarifying the strategic objective for ${company} and mapping the planning horizon to ${horizon}.`,
      });
      await sleep(180);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Research",
        seq: 2,
        status: "tool_call",
        title: "Calling market intelligence service",
        detail:
          "Simulating competitor scan, portfolio benchmarking, and growth-risk aggregation.",
      });
      await sleep(220);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Research",
        seq: 3,
        status: "tool_result",
        title: "Received strategy evidence pack",
        detail:
          "Mock service returned market pressure signals, sequencing constraints, and board-level trigger metrics.",
      });
      await sleep(140);

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Research",
        seq: 4,
        status: "completed",
        title: "Assembling board memo",
        detail:
          "Finalizing strategic priorities, risk framing, and board intervention questions.",
      });

      return {
        runId,
        agent: "Apex Research",
        provider: "mock-third-party",
        simulated: true,
        generatedAt: new Date().toISOString(),
        company,
        industry: industry ?? "Not specified",
        objective:
          objective ?? `Board-level strategic analysis for ${company}`,
        geography: market,
        timeframe: horizon,
        summary:
          `${company} shows credible expansion potential if leadership prioritizes focus, disciplined capital allocation, and differentiated execution in ${market}.`,
        keyFindings: [
          `${company} appears to have defendable positioning but faces margin pressure from fast-moving competitors and shifting customer expectations.`,
          "The next growth wave is likely to come from sharper product segmentation, better partner leverage, and operational simplification.",
          "Leadership should align investment sequencing with the highest-confidence revenue pools rather than broad portfolio expansion.",
        ],
        strategicPriorities: [
          {
            priority: "Sharpen core market focus",
            rationale:
              "Concentrating on the strongest customer segments should improve sales efficiency and protect execution capacity.",
          },
          {
            priority: "Build selective adjacency bets",
            rationale:
              "A small number of adjacent offers can expand wallet share without overextending the operating model.",
          },
          {
            priority: "Upgrade decision cadence",
            rationale:
              "Board reporting should move from descriptive KPIs to forward-looking trigger metrics tied to growth and risk.",
          },
        ],
        risks: [
          "Execution complexity from parallel transformation programs",
          "Competitive pricing pressure in core accounts",
          "Uneven adoption across regions or business units",
        ],
        boardQuestions: [
          `Which two investment areas create the highest strategic leverage for ${company} over the next ${horizon}?`,
          "What evidence would justify accelerating versus pausing expansion bets?",
          "Which operating metrics should trigger board intervention?",
        ],
        recommendation:
          "Pursue a focused growth agenda with quarterly strategic checkpoints, tighter capital gating, and a smaller number of high-conviction initiatives.",
        outputs: [
          {
            step: 1,
            title: "Market scan",
            summary:
              `${company} retains a credible core position, but growth is constrained by competitive compression and expanding customer expectations.`,
            bullets: [
              "Core segment economics remain viable but need sharper prioritization.",
              "Competitor moves are increasing pricing pressure in adjacent offers.",
              "Regional execution quality is likely uneven across growth bets.",
            ],
          },
          {
            step: 2,
            title: "Portfolio diagnosis",
            summary:
              "The current strategy appears broader than the operating model can support without loss of focus.",
            bullets: [
              "A narrower initiative portfolio would improve execution reliability.",
              "Capital allocation should favor near-term strategic leverage over optionality.",
              "Management cadence should shift from reporting to intervention triggers.",
            ],
          },
          {
            step: 3,
            title: "Board recommendation pack",
            summary:
              "A focused growth agenda with strict sequencing offers the best risk-adjusted path over the planning horizon.",
            bullets: [
              "Concentrate on highest-conviction customer segments first.",
              "Stage adjacency investments behind clear proof points.",
              "Adopt quarterly decision gates with board-level escalation metrics.",
            ],
          },
        ],
      };
    },
  });
