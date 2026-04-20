import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { generateStrategicReportStream } from "@/services/geminiService";
import { saveDocument } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { createAgentRunId, writeAgentEvent } from "./mock-agent-progress";

type ResearchSection = {
  step: number;
  title: string;
  content: string;
};

function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function extractParagraphs(markdown: string) {
  return markdown
    .split(/\n\s*\n/)
    .map((block) => stripMarkdown(block).replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function extractBulletLines(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => stripMarkdown(line.replace(/^[-*]\s+/, "")));
}

function buildSectionSummary(content: string) {
  const paragraphs = extractParagraphs(content);

  return (
    paragraphs.find(
      (paragraph) =>
        paragraph.split(" ").length > 8 &&
        !paragraph.startsWith("Visual:") &&
        !paragraph.startsWith("Analyst's Note:")
    ) ?? "Section completed."
  );
}

function buildSectionBullets(content: string) {
  const bullets = extractBulletLines(content).slice(0, 3);

  if (bullets.length > 0) {
    return bullets;
  }

  const paragraphs = extractParagraphs(content);
  const fallback = paragraphs.slice(0, 3);

  return fallback.length > 0 ? fallback : ["Detailed findings captured in the section output."];
}

export const apexResearch = ({
  session,
  dataStream,
}: {
  session: Session;
  dataStream: UIMessageStreamWriter<any>;
}) =>
  tool({
    description:
      "Generate a board-level strategic analysis for a business company. Use this when the user wants executive strategy, market positioning, growth options, risks, or board-facing analysis. This tool streams section-level research progress and returns the completed report.",
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
      const documentId = generateUUID();
      const documentTitle = `${company} Strategic Research Report`;
      const market = geography ?? "Global";
      const horizon = timeframe ?? "24 months";
      const runId = createAgentRunId();
      const sections: ResearchSection[] = [];
      let seq = 1;

      dataStream.write({
        type: "data-kind",
        data: "report",
        transient: true,
      });

      dataStream.write({
        type: "data-id",
        data: documentId,
        transient: true,
      });

      dataStream.write({
        type: "data-title",
        data: documentTitle,
        transient: true,
      });

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Research",
        seq: seq++,
        status: "thinking",
        title: "Scoping strategic research brief",
        detail: `Preparing a deep-research brief for ${company} across ${market} with a ${horizon} planning horizon.`,
      });

      await generateStrategicReportStream(company, (update) => {
        if (update.status === "generating") {
          writeAgentEvent(dataStream, {
            runId,
            agent: "Apex Research",
            seq: seq++,
            status: "tool_call",
            title: update.title,
            detail: `Gemini Deep Research is generating the "${update.title}" section.`,
          });
          return;
        }

        const content = update.content?.trim() ?? "";
        if (content) {
          sections.push({
            step: sections.length + 1,
            title: update.title,
            content,
          });

          dataStream.write({
            type: "data-reportDelta",
            data: `${content.trim()}\n\n`,
            transient: true,
          });
        }

        writeAgentEvent(dataStream, {
          runId,
          agent: "Apex Research",
          seq: seq++,
          status: "tool_result",
          title: update.title,
          detail: content
            ? `Completed "${update.title}" and attached the section output to the live process log.`
            : `Completed "${update.title}".`,
          content,
        });
      });

      const reportMarkdown = sections
        .map((section) => section.content.trim())
        .filter(Boolean)
        .join("\n\n");

      const summary = buildSectionSummary(reportMarkdown);
      const outputs = sections.map((section) => ({
        step: section.step,
        title: section.title,
        summary: buildSectionSummary(section.content),
        bullets: buildSectionBullets(section.content),
      }));

      writeAgentEvent(dataStream, {
        runId,
        agent: "Apex Research",
        seq: seq++,
        status: "completed",
        title: "Strategic report finalized",
        detail: `Completed ${sections.length} research sections for ${company}.`,
      });

      if (session.user?.id) {
        await saveDocument({
          id: documentId,
          title: documentTitle,
          kind: "report",
          content: reportMarkdown,
          userId: session.user.id,
        });
      }

      dataStream.write({ type: "data-finish", data: null, transient: true });

      return {
        id: documentId,
        title: documentTitle,
        kind: "report" as const,
        runId,
        agent: "Apex Research",
        provider: "google-gemini",
        simulated: false,
        generatedAt: new Date().toISOString(),
        company,
        industry: industry ?? "Not specified",
        objective:
          objective ?? `Board-level strategic analysis for ${company}`,
        geography: market,
        timeframe: horizon,
        summary,
        reportMarkdown,
        sections,
        outputs,
      };
    },
  });
