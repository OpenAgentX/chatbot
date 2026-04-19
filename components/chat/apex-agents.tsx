"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { AgentProcessEvent } from "@/lib/types";
import {
  BrainIcon,
  CheckCircle2Icon,
  SearchIcon,
  WrenchIcon,
} from "lucide-react";

type ApexResearchOutput = {
  runId?: string;
  agent: string;
  provider?: string;
  simulated?: boolean;
  generatedAt?: string;
  company: string;
  industry: string;
  objective?: string;
  geography: string;
  timeframe: string;
  summary: string;
  keyFindings: string[];
  strategicPriorities: { priority: string; rationale: string }[];
  risks: string[];
  boardQuestions: string[];
  recommendation: string;
  outputs?: AgentStepOutput[];
};

type ApexScholarOutput = {
  runId?: string;
  agent: string;
  provider?: string;
  simulated?: boolean;
  generatedAt?: string;
  topic: string;
  task: string;
  academicLevel: string;
  outputType: string;
  requirements: string;
  deliverables: {
    title: string;
    abstract: string;
    outline: string[];
    writingPlan: string[];
  };
  qualityChecks: string[];
  recommendedNextStep: string;
  outputs?: AgentStepOutput[];
};

type ApexChartOutput = {
  runId?: string;
  agent: string;
  provider?: string;
  simulated?: boolean;
  generatedAt?: string;
  diagramType: string;
  style: string;
  taskCreated: boolean;
  task: {
    id: string;
    status: string;
    title: string;
    description: string;
  };
  extractedMethodSummary: string;
  proposedNodes: string[];
  layoutSuggestion: string;
  exportFormats: string[];
  outputs?: AgentStepOutput[];
};

type ApexAgentOutput = ApexResearchOutput | ApexScholarOutput | ApexChartOutput;
type AgentStepOutput = {
  step: number;
  title: string;
  summary: string;
  bullets: string[];
};

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="font-medium text-[11px] uppercase tracking-[0.18em] text-white/65">
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div className="flex gap-2" key={item}>
          <div className="mt-1.5 size-1.5 rounded-full bg-white/55" />
          <div className="text-sm leading-6 text-white/88">{item}</div>
        </div>
      ))}
    </div>
  );
}

function MetaPill({ children }: { children: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-white/10 px-2.5 py-1 text-[11px] text-white/78">
      {children}
    </div>
  );
}

function OutputTimeline({ outputs }: { outputs?: AgentStepOutput[] }) {
  if (!outputs?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
      <SectionTitle>Agent Outputs</SectionTitle>
      <div className="mt-3 space-y-3">
        {outputs.map((output) => (
          <div
            className="rounded-xl border border-white/8 bg-black/15 p-3"
            key={`${output.step}-${output.title}`}
          >
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white/88">
                {output.step}
              </div>
              <div className="font-medium text-sm text-white">{output.title}</div>
            </div>
            <div className="mt-2 text-sm leading-6 text-white/82">
              {output.summary}
            </div>
            <div className="mt-3">
              <BulletList items={output.bullets} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApexAgentProcessLog({
  events,
}: {
  events?: AgentProcessEvent[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (!events?.length) {
    return null;
  }

  const latestEvent = events[events.length - 1];

  const statusMeta: Record<
    AgentProcessEvent["status"],
    {
      label: string;
      headerClassName: string;
      badgeClassName: string;
      dotClassName: string;
      icon: typeof BrainIcon;
    }
  > = {
    thinking: {
      label: "Thinking",
      headerClassName:
        "bg-amber-500/10 text-amber-200 border-amber-400/20",
      badgeClassName:
        "bg-amber-500/12 text-amber-200 ring-1 ring-inset ring-amber-400/20",
      dotClassName: "bg-amber-300/85 text-amber-950",
      icon: BrainIcon,
    },
    tool_call: {
      label: "Tool Call",
      headerClassName: "bg-sky-500/10 text-sky-200 border-sky-400/20",
      badgeClassName:
        "bg-sky-500/12 text-sky-200 ring-1 ring-inset ring-sky-400/20",
      dotClassName: "bg-sky-300/85 text-sky-950",
      icon: WrenchIcon,
    },
    tool_result: {
      label: "Tool Result",
      headerClassName:
        "bg-violet-500/10 text-violet-200 border-violet-400/20",
      badgeClassName:
        "bg-violet-500/12 text-violet-200 ring-1 ring-inset ring-violet-400/20",
      dotClassName: "bg-violet-300/85 text-violet-950",
      icon: SearchIcon,
    },
    completed: {
      label: "Completed",
      headerClassName:
        "bg-emerald-500/10 text-emerald-200 border-emerald-400/20",
      badgeClassName:
        "bg-emerald-500/12 text-emerald-200 ring-1 ring-inset ring-emerald-400/20",
      dotClassName: "bg-emerald-300/85 text-emerald-950",
      icon: CheckCircle2Icon,
    },
  };

  const latestMeta = statusMeta[latestEvent.status];
  const LatestIcon = latestMeta.icon;

  return (
    <div className="rounded-xl border border-border/50 bg-muted/35">
      <button
        className="flex w-full items-center justify-between gap-3 p-3 text-left"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <div className="min-w-0">
          <div className="font-medium text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Live Process
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${latestMeta.badgeClassName}`}
            >
              <LatestIcon className="size-3.5" />
              <span>{latestMeta.label}</span>
            </div>
            <div className="text-sm text-foreground/80">
              {events.length} step{events.length > 1 ? "s" : ""} captured
            </div>
          </div>
        </div>
        <ChevronDownIcon
          className={`size-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="space-y-3 border-t border-border/50 px-3 py-3">
          {events.map((event) => (
            (() => {
              const meta = statusMeta[event.status];
              const EventIcon = meta.icon;

              return (
                <div
                  className={`rounded-lg border px-3 py-3 ${meta.headerClassName}`}
                  key={`${event.runId}-${event.seq}`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${meta.dotClassName}`}
                    >
                      {event.seq}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <EventIcon className="size-3.5" />
                          <span>{event.title}</span>
                        </div>
                        <div className="rounded-full bg-black/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em]">
                          {meta.label}
                        </div>
                      </div>
                      <div className="mt-2 text-sm leading-6 text-current/80">
                        {event.detail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()
          ))}
        </div>
      )}
    </div>
  );
}

function ApexResearchCard({
  data,
  processEvents,
}: {
  data: ApexResearchOutput;
  processEvents?: AgentProcessEvent[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_28%)]" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
              Apex Research
            </div>
            <div className="mt-1 text-xl font-semibold text-white">
              {data.company}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <MetaPill>{data.industry}</MetaPill>
              <MetaPill>{data.geography}</MetaPill>
              <MetaPill>{data.timeframe}</MetaPill>
            </div>
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
            Board View
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5 text-sm leading-6 text-white/92">
          {data.summary}
        </div>

        <ApexAgentProcessLog events={processEvents} />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
            <SectionTitle>Key Findings</SectionTitle>
            <div className="mt-3">
              <BulletList items={data.keyFindings} />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
            <SectionTitle>Risks</SectionTitle>
            <div className="mt-3">
              <BulletList items={data.risks} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
          <SectionTitle>Strategic Priorities</SectionTitle>
          <div className="mt-3 space-y-3">
            {data.strategicPriorities.map((item) => (
              <div className="rounded-xl bg-black/15 p-3" key={item.priority}>
                <div className="font-medium text-sm text-white">
                  {item.priority}
                </div>
                <div className="mt-1 text-sm leading-6 text-white/75">
                  {item.rationale}
                </div>
              </div>
            ))}
          </div>
        </div>

        <OutputTimeline outputs={data.outputs} />

        <div className="grid gap-3 md:grid-cols-[1.25fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
            <SectionTitle>Board Questions</SectionTitle>
            <div className="mt-3">
              <BulletList items={data.boardQuestions} />
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-300/16 bg-cyan-300/8 p-3.5">
            <SectionTitle>Recommendation</SectionTitle>
            <div className="mt-3 text-sm leading-6 text-white/92">
              {data.recommendation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApexScholarCard({
  data,
  processEvents,
}: {
  data: ApexScholarOutput;
  processEvents?: AgentProcessEvent[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-50 via-amber-50 to-orange-100 p-4 shadow-lg ring-1 ring-amber-900/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(120,53,15,0.08),transparent_30%)]" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-amber-800/70">
              Apex Scholar
            </div>
            <div className="mt-1 text-xl font-semibold text-stone-900">
              {data.topic}
            </div>
            <div className="mt-1 text-sm text-stone-600">{data.task}</div>
          </div>
          <div className="rounded-full border border-amber-900/10 bg-white/60 px-3 py-1 text-xs text-stone-700">
            {data.outputType}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetaPill>{data.academicLevel}</MetaPill>
          <MetaPill>{data.requirements}</MetaPill>
        </div>

        <div className="rounded-2xl bg-white/70 p-3.5 shadow-sm">
          <SectionTitle>Abstract</SectionTitle>
          <div className="mt-3 text-sm leading-6 text-stone-700">
            {data.deliverables.abstract}
          </div>
        </div>

        <ApexAgentProcessLog events={processEvents} />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-white/70 p-3.5 shadow-sm">
            <SectionTitle>Outline</SectionTitle>
            <div className="mt-3">
              <div className="space-y-2">
                {data.deliverables.outline.map((item, index) => (
                  <div
                    className="flex items-center gap-2 text-sm text-stone-700"
                    key={item}
                  >
                    <div className="flex size-5 items-center justify-center rounded-full bg-amber-100 text-[11px] font-medium text-amber-900">
                      {index + 1}
                    </div>
                    <div>{item}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/70 p-3.5 shadow-sm">
            <SectionTitle>Writing Plan</SectionTitle>
            <div className="mt-3">
              <BulletList items={data.deliverables.writingPlan} />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl bg-white/70 p-3.5 shadow-sm">
            <SectionTitle>Quality Checks</SectionTitle>
            <div className="mt-3">
              <BulletList items={data.qualityChecks} />
            </div>
          </div>
          <div className="rounded-2xl border border-amber-900/10 bg-amber-100/55 p-3.5">
            <SectionTitle>Next Step</SectionTitle>
            <div className="mt-3 text-sm leading-6 text-stone-700">
              {data.recommendedNextStep}
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 p-3.5 shadow-sm">
          <SectionTitle>Agent Outputs</SectionTitle>
          <div className="mt-3 space-y-3">
            {data.outputs?.map((output) => (
              <div
                className="rounded-xl border border-stone-200 bg-stone-50/80 p-3"
                key={`${output.step}-${output.title}`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-900">
                    {output.step}
                  </div>
                  <div className="font-medium text-sm text-stone-800">
                    {output.title}
                  </div>
                </div>
                <div className="mt-2 text-sm leading-6 text-stone-700">
                  {output.summary}
                </div>
                <div className="mt-3 space-y-1.5">
                  {output.bullets.map((item) => (
                    <div className="flex gap-2" key={item}>
                      <div className="mt-1.5 size-1.5 rounded-full bg-stone-400" />
                      <div className="text-sm leading-6 text-stone-700">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

function ApexChartCard({
  data,
  processEvents,
}: {
  data: ApexChartOutput;
  processEvents?: AgentProcessEvent[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-950 p-4 shadow-lg">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.14),transparent_28%)]" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/80">
              Apex Chart
            </div>
            <div className="mt-1 text-xl font-semibold text-white">
              {data.task.title}
            </div>
            <div className="mt-1 text-sm text-white/70">{data.diagramType}</div>
          </div>
          <div className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
            {data.task.status}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <MetaPill>{data.style}</MetaPill>
          <MetaPill>{data.task.id}</MetaPill>
          <MetaPill>{data.taskCreated ? "Task Created" : "Draft"}</MetaPill>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
          <SectionTitle>Diagram Brief</SectionTitle>
          <div className="mt-3 text-sm leading-6 text-white/90">
            {data.task.description}
          </div>
        </div>

        <ApexAgentProcessLog events={processEvents} />

        <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
            <SectionTitle>Method Summary</SectionTitle>
            <div className="mt-3 text-sm leading-6 text-white/82">
              {data.extractedMethodSummary}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
            <SectionTitle>Export Formats</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.exportFormats.map((item) => (
                <div
                  className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/78"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/6 p-3.5">
            <SectionTitle>Proposed Nodes</SectionTitle>
            <div className="mt-3">
              <BulletList items={data.proposedNodes} />
            </div>
          </div>
          <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/8 p-3.5">
            <SectionTitle>Layout Suggestion</SectionTitle>
            <div className="mt-3 text-sm leading-6 text-white/90">
              {data.layoutSuggestion}
            </div>
          </div>
        </div>
        <OutputTimeline outputs={data.outputs} />
      </div>
    </div>
  );
}

export function ApexAgentCard({
  output,
  processEvents,
}: {
  output: ApexAgentOutput;
  processEvents?: AgentProcessEvent[];
}) {
  if ("company" in output) {
    return <ApexResearchCard data={output} processEvents={processEvents} />;
  }

  if ("deliverables" in output) {
    return <ApexScholarCard data={output} processEvents={processEvents} />;
  }

  return <ApexChartCard data={output} processEvents={processEvents} />;
}
