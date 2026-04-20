"use client";

import {
  MarkdownSerializer,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import { DOMParser, type Node as ProseMirrorNode } from "prosemirror-model";
import { Decoration, DecorationSet, type EditorView } from "prosemirror-view";
import { renderToString } from "react-dom/server";

import { MessageResponse } from "@/components/ai-elements/message";

import { documentSchema } from "./config";
import type { UISuggestion } from "./suggestions";

function getTableAlignmentMarker(align: string | null | undefined) {
  switch (align) {
    case "left":
      return ":---";
    case "center":
      return ":---:";
    case "right":
      return "---:";
    default:
      return "---";
  }
}

function serializeTableCellContent(cell: ProseMirrorNode) {
  return markdownSerializer
    .serialize(cell)
    .trim()
    .replace(/\n+/g, " ")
    .replace(/\|/g, "\\|");
}

const markdownSerializer = new MarkdownSerializer(
  {
    ...defaultMarkdownSerializer.nodes,
    table(state, node) {
      const rows: string[][] = [];

      node.forEach((row) => {
        const cells: string[] = [];

        row.forEach((cell) => {
          cells.push(serializeTableCellContent(cell));
        });

        rows.push(cells);
      });

      if (rows.length === 0) {
        state.closeBlock(node);
        return;
      }

      const columnCount = Math.max(...rows.map((row) => row.length), 1);
      const normalizedRows = rows.map((row) =>
        Array.from({ length: columnCount }, (_, index) => row[index] ?? "")
      );
      const separatorRow = Array.from({ length: columnCount }, (_, index) =>
        getTableAlignmentMarker(node.firstChild?.maybeChild(index)?.attrs.align)
      );

      state.write(`| ${normalizedRows[0].join(" | ")} |`);
      state.ensureNewLine();
      state.write(`| ${separatorRow.join(" | ")} |`);

      for (const row of normalizedRows.slice(1)) {
        state.ensureNewLine();
        state.write(`| ${row.join(" | ")} |`);
      }

      state.closeBlock(node);
    },
  },
  defaultMarkdownSerializer.marks,
  defaultMarkdownSerializer.options
);

export const buildDocumentFromContent = (content: string) => {
  const parser = DOMParser.fromSchema(documentSchema);
  const stringFromMarkdown = renderToString(
    <MessageResponse>{content}</MessageResponse>
  );
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = stringFromMarkdown;
  return parser.parse(tempContainer);
};

export const buildContentFromDocument = (document: ProseMirrorNode) => {
  return markdownSerializer.serialize(document);
};

export const createDecorations = (
  suggestions: UISuggestion[],
  _view: EditorView
) => {
  const decorations: Decoration[] = [];

  for (const suggestion of suggestions) {
    decorations.push(
      Decoration.inline(
        suggestion.selectionStart,
        suggestion.selectionEnd,
        {
          class: "suggestion-highlight",
          "data-suggestion-id": suggestion.id,
        },
        {
          suggestionId: suggestion.id,
          type: "highlight",
        }
      )
    );
  }

  return DecorationSet.create(_view.state.doc, decorations);
};
