import { textblockTypeInputRule } from "prosemirror-inputrules";
import { Schema } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import type { Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { MutableRefObject } from "react";

import { buildContentFromDocument } from "./functions";

const tableNodes = {
  table: {
    content: "table_row+",
    group: "block",
    isolating: true,
    parseDOM: [{ tag: "table" }],
    toDOM() {
      return ["table", ["tbody", 0]] as const;
    },
  },
  table_row: {
    content: "(table_header | table_cell)+",
    parseDOM: [{ tag: "tr" }],
    toDOM() {
      return ["tr", 0] as const;
    },
  },
  table_cell: {
    attrs: { align: { default: null } },
    content: "block+",
    isolating: true,
    parseDOM: [
      {
        tag: "td",
        getAttrs: (dom: any) => {
          if (!(dom instanceof HTMLElement)) {
            return null;
          }

          return {
            align: dom.style.textAlign || dom.getAttribute("align") || null,
          };
        },
      },
    ],
    toDOM(node: any) {
      const attrs = node.attrs.align
        ? { style: `text-align: ${node.attrs.align}` }
        : {};

      return ["td", attrs, 0] as const;
    },
  },
  table_header: {
    attrs: { align: { default: null } },
    content: "block+",
    isolating: true,
    parseDOM: [
      {
        tag: "th",
        getAttrs: (dom: any) => {
          if (!(dom instanceof HTMLElement)) {
            return null;
          }

          return {
            align: dom.style.textAlign || dom.getAttribute("align") || null,
          };
        },
      },
    ],
    toDOM(node: any) {
      const attrs = node.attrs.align
        ? { style: `text-align: ${node.attrs.align}` }
        : {};

      return ["th", attrs, 0] as const;
    },
  },
};

const baseNodes = addListNodes(
  schema.spec.nodes as any,
  "paragraph block*",
  "block"
) as any;

export const documentSchema = new Schema({
  nodes: baseNodes.append(tableNodes as any),
  marks: schema.spec.marks,
});

export function headingRule(level: number) {
  return textblockTypeInputRule(
    new RegExp(`^(#{1,${level}})\\s$`),
    documentSchema.nodes.heading,
    () => ({ level })
  );
}

export const handleTransaction = ({
  transaction,
  editorRef,
  onSaveContent,
}: {
  transaction: Transaction;
  editorRef: MutableRefObject<EditorView | null>;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
}) => {
  if (!editorRef?.current) {
    return;
  }

  const newState = editorRef.current.state.apply(transaction);
  editorRef.current.updateState(newState);

  if (transaction.docChanged && !transaction.getMeta("no-save")) {
    const updatedContent = buildContentFromDocument(newState.doc);

    if (transaction.getMeta("no-debounce")) {
      onSaveContent(updatedContent, false);
    } else {
      onSaveContent(updatedContent, true);
    }
  }
};
