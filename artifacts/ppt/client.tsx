import { toast } from "sonner";
import { Artifact } from "@/components/chat/create-artifact";
import { DiffView } from "@/components/chat/diffview";
import { DocumentSkeleton } from "@/components/chat/document-skeleton";
import {
  ClockRewind,
  CopyIcon,
  FileIcon,
  RedoIcon,
  SparklesIcon,
  UndoIcon,
} from "@/components/chat/icons";
import { PptEditor } from "@/components/chat/ppt-editor";

type PptArtifactMetadata = Record<string, never>;

export const pptArtifact = new Artifact<"ppt", PptArtifactMetadata>({
  kind: "ppt",
  description:
    "Useful for presentation decks and slide-by-slide outlines in markdown.",
  initialize: ({ setMetadata }) => {
    setMetadata({});
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-pptDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + streamPart.data,
        isVisible:
          draftArtifact.status === "streaming" &&
          draftArtifact.content.length > 320 &&
          draftArtifact.content.length < 380
            ? true
            : draftArtifact.isVisible,
        status: "streaming",
      }));
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="ppt" />;
    }

    if (mode === "diff") {
      const selectedContent = getDocumentContentById(currentVersionIndex);
      const prevContent =
        currentVersionIndex > 0
          ? getDocumentContentById(currentVersionIndex - 1)
          : selectedContent;

      return (
        <div className="flex flex-row px-4 py-8 md:px-16 md:py-12 lg:px-20">
          <DiffView newContent={selectedContent} oldContent={prevContent} />
        </div>
      );
    }

    return (
      <PptEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        onSaveContent={onSaveContent}
        status={status}
      />
    );
  },
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: "View changes",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("toggle");
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy deck markdown",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied deck markdown to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      icon: <SparklesIcon />,
      description: "Tighten storyline",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please tighten the slide storyline, make the takeaway of each slide clearer, and keep the deck in markdown slide format.",
            },
          ],
        });
      },
    },
    {
      icon: <FileIcon />,
      description: "Add speaker notes",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Please add concise speaker notes under each slide, keeping the current markdown slide structure.",
            },
          ],
        });
      },
    },
  ],
});
