"use client";

import { ChevronLeftIcon, ChevronRightIcon, LayoutPanelTopIcon } from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type PptEditorProps = {
  content: string;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  status: "streaming" | "idle";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  isInline?: boolean;
};

type Slide = {
  id: string;
  title: string;
  body: string;
  notes: string;
};

function parseSlides(content: string): Slide[] {
  const normalized = content.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n\s*---\s*\n/g)
    .map((segment, index) => segment.trim())
    .filter(Boolean)
    .map((segment, index) => {
      const lines = segment.split("\n");
      const noteLineIndex = lines.findIndex((line) => /^notes:\s*$/i.test(line));
      const inlineNoteIndex = lines.findIndex((line) => /^notes:\s+/i.test(line));

      let bodyLines = lines;
      let notes = "";

      if (noteLineIndex >= 0) {
        bodyLines = lines.slice(0, noteLineIndex);
        notes = lines.slice(noteLineIndex + 1).join("\n").trim();
      } else if (inlineNoteIndex >= 0) {
        bodyLines = lines.slice(0, inlineNoteIndex);
        notes = lines[inlineNoteIndex].replace(/^notes:\s+/i, "").trim();
      }

      const body = bodyLines.join("\n").trim();
      const titleLine =
        bodyLines.find((line) => line.trim().startsWith("#")) ||
        bodyLines.find((line) => line.trim().length > 0) ||
        `Slide ${index + 1}`;
      const title = titleLine.replace(/^#+\s*/, "").trim();

      return {
        id: `slide-${index + 1}`,
        title: title || `Slide ${index + 1}`,
        body,
        notes,
      };
    });
}

const SlideCard = ({
  slide,
  slideNumber,
  totalSlides,
  compact = false,
}: {
  slide: Slide;
  slideNumber: number;
  totalSlides: number;
  compact?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-[28px] border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),rgba(244,244,245,0.95)_42%,rgba(228,228,231,1))] text-foreground shadow-[var(--shadow-card)] dark:bg-[radial-gradient(circle_at_top_left,rgba(39,39,42,0.95),rgba(24,24,27,0.98)_42%,rgba(9,9,11,1))]",
        compact ? "p-4" : "p-6 md:p-8"
      )}
    >
      <div className="absolute top-4 right-4 rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase backdrop-blur">
        {slideNumber}/{totalSlides}
      </div>

      <div className="flex h-full flex-col">
        <div className={cn("mb-4 pr-16", compact ? "text-lg" : "text-2xl md:text-3xl")}>
          <div className="font-semibold tracking-tight">{slide.title}</div>
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-hidden [&_.katex-display]:overflow-x-auto [&_h1]:hidden [&_ul]:space-y-2 [&_ol]:space-y-2 [&_p]:leading-relaxed",
            compact
              ? "text-[11px] [&_li]:leading-relaxed [&_p]:text-[11px]"
              : "text-[13px] md:text-[15px] [&_li]:leading-relaxed"
          )}
        >
          <MessageResponse>{slide.body}</MessageResponse>
        </div>

        {slide.notes ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-background/40 p-3 backdrop-blur-sm">
            <div className="mb-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
              Notes
            </div>
            <div className={cn(compact ? "text-[10px]" : "text-xs md:text-sm")}>
              <MessageResponse>{slide.notes}</MessageResponse>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

function PurePptEditor({
  content,
  onSaveContent,
  status,
  isCurrentVersion,
  isInline = false,
}: PptEditorProps) {
  const slides = useMemo(() => parseSlides(content), [content]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [view, setView] = useState<"preview" | "source">("preview");
  const [draftContent, setDraftContent] = useState(content);

  useEffect(() => {
    setDraftContent(content);
  }, [content]);

  useEffect(() => {
    if (slides.length === 0) {
      setSelectedSlideIndex(0);
      return;
    }

    if (selectedSlideIndex > slides.length - 1) {
      setSelectedSlideIndex(slides.length - 1);
    }
  }, [slides.length, selectedSlideIndex]);

  const selectedSlide = slides[selectedSlideIndex] ?? null;

  if (isInline) {
    if (!selectedSlide) {
      return (
        <div className="flex h-full min-h-[220px] items-center justify-center rounded-[24px] border border-dashed border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
          {status === "streaming" ? "Generating slides..." : "No slides yet"}
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col gap-3">
        <SlideCard
          compact={true}
          slide={selectedSlide}
          slideNumber={selectedSlideIndex + 1}
          totalSlides={slides.length}
        />
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            <LayoutPanelTopIcon className="size-3.5" />
            {slides.length} slides
          </div>
          <div className="truncate">{selectedSlide.title}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-61px)] flex-col bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/50 bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setView("preview")}
            size="sm"
            type="button"
            variant={view === "preview" ? "default" : "outline"}
          >
            Preview
          </Button>
          <Button
            onClick={() => setView("source")}
            size="sm"
            type="button"
            variant={view === "source" ? "default" : "outline"}
          >
            Source
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
            {slides.length} slides
          </div>
          {status === "streaming" ? (
            <div className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1">
              Generating
            </div>
          ) : null}
        </div>
      </div>

      {view === "source" ? (
        <div className="px-4 py-4 md:px-6">
          <Textarea
            className="min-h-[calc(100dvh-180px)] rounded-[24px] bg-card/40 font-mono text-[13px] leading-6"
            onBlur={() => {
              if (draftContent !== content) {
                onSaveContent(draftContent, false);
              }
            }}
            onChange={(event) => {
              const nextValue = event.target.value;
              setDraftContent(nextValue);
              onSaveContent(nextValue, true);
            }}
            readOnly={!isCurrentVersion}
            value={draftContent}
          />
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)] md:p-6">
          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto rounded-[28px] border border-border/50 bg-muted/30 p-2">
            {slides.map((slide, index) => (
              <button
                className={cn(
                  "rounded-[20px] border p-2 text-left transition-all",
                  index === selectedSlideIndex
                    ? "border-foreground/15 bg-background shadow-[var(--shadow-card)]"
                    : "border-transparent hover:border-border/60 hover:bg-background/70"
                )}
                key={slide.id}
                onClick={() => setSelectedSlideIndex(index)}
                type="button"
              >
                <div className="mb-2 text-[11px] font-medium text-muted-foreground">
                  Slide {index + 1}
                </div>
                <div className="line-clamp-2 text-sm font-medium">{slide.title}</div>
              </button>
            ))}
          </div>

          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Slide Preview
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedSlide
                    ? `Slide ${selectedSlideIndex + 1} of ${slides.length}`
                    : "No slides yet"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  disabled={selectedSlideIndex === 0}
                  onClick={() => setSelectedSlideIndex((index) => Math.max(0, index - 1))}
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <Button
                  disabled={selectedSlideIndex >= slides.length - 1}
                  onClick={() =>
                    setSelectedSlideIndex((index) => Math.min(slides.length - 1, index + 1))
                  }
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
            </div>

            {selectedSlide ? (
              <SlideCard
                slide={selectedSlide}
                slideNumber={selectedSlideIndex + 1}
                totalSlides={slides.length}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-[28px] border border-dashed border-border/60 bg-muted/30 text-sm text-muted-foreground">
                {status === "streaming" ? "Generating slides..." : "No slides yet"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const PptEditor = memo(PurePptEditor, (prevProps, nextProps) => {
  if (prevProps.content !== nextProps.content) {
    return false;
  }

  if (prevProps.status !== nextProps.status) {
    return false;
  }

  if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) {
    return false;
  }

  if (prevProps.isInline !== nextProps.isInline) {
    return false;
  }

  return true;
});
