"use client";

type ApexResearchOutput = {
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
};

type ApexScholarOutput = {
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
};

type ApexChartOutput = {
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
};

type ApexAgentOutput = ApexResearchOutput | ApexScholarOutput | ApexChartOutput;

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

function ApexResearchCard({ data }: { data: ApexResearchOutput }) {
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

function ApexScholarCard({ data }: { data: ApexScholarOutput }) {
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
      </div>
    </div>
  );
}

function ApexChartCard({ data }: { data: ApexChartOutput }) {
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
      </div>
    </div>
  );
}

export function ApexAgentCard({ output }: { output: ApexAgentOutput }) {
  if ("company" in output) {
    return <ApexResearchCard data={output} />;
  }

  if ("deliverables" in output) {
    return <ApexScholarCard data={output} />;
  }

  return <ApexChartCard data={output} />;
}
