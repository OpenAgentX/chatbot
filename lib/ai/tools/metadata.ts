export type ChatToolId =
  | "getWeather"
  | "createDocument"
  | "editDocument"
  | "updateDocument"
  | "requestSuggestions";

export type ChatToolGroup = "General" | "Documents";

export type ChatToolMetadata = {
  id: ChatToolId;
  label: string;
  description: string;
  group: ChatToolGroup;
  selectable: boolean;
  enabledByDefault: boolean;
};

export const chatToolRegistry: ChatToolMetadata[] = [
  {
    id: "getWeather",
    label: "Weather",
    description: "查询城市或坐标的当前天气",
    group: "General",
    selectable: true,
    enabledByDefault: true,
  },
  {
    id: "requestSuggestions",
    label: "Suggestions",
    description: "针对已有文档生成写作建议",
    group: "Documents",
    selectable: true,
    enabledByDefault: true,
  },
  {
    id: "createDocument",
    label: "Create Document",
    description: "创建新的文档或产物",
    group: "Documents",
    selectable: false,
    enabledByDefault: true,
  },
  {
    id: "editDocument",
    label: "Edit Document",
    description: "对已有文档执行精确替换编辑",
    group: "Documents",
    selectable: false,
    enabledByDefault: true,
  },
  {
    id: "updateDocument",
    label: "Update Document",
    description: "更新已有文档内容",
    group: "Documents",
    selectable: false,
    enabledByDefault: true,
  },
];

export const selectableChatTools = chatToolRegistry.filter(
  (tool) => tool.selectable
);

export const defaultSelectableChatToolIds = selectableChatTools
  .filter((tool) => tool.enabledByDefault)
  .map((tool) => tool.id);

const allToolIdSet = new Set(chatToolRegistry.map((tool) => tool.id));

export function normalizeSelectableChatToolIds(
  selectedToolIds: string[] | undefined
): ChatToolId[] {
  if (!selectedToolIds || selectedToolIds.length === 0) {
    return defaultSelectableChatToolIds;
  }

  return selectedToolIds.filter(
    (toolId): toolId is ChatToolId =>
      allToolIdSet.has(toolId as ChatToolId) &&
      selectableChatTools.some((tool) => tool.id === toolId)
  );
}

export function getEffectiveActiveChatToolIds(
  selectedToolIds: string[] | undefined
): ChatToolId[] {
  const selectedSelectableIds = new Set(
    normalizeSelectableChatToolIds(selectedToolIds)
  );

  return chatToolRegistry
    .filter((tool) => !tool.selectable || selectedSelectableIds.has(tool.id))
    .map((tool) => tool.id);
}
