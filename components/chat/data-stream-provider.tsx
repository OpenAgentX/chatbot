"use client";

import type { DataUIPart } from "ai";
import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { AgentProcessEvent, CustomUIDataTypes } from "@/lib/types";

export type AgentRunState = {
  agent: string;
  events: AgentProcessEvent[];
};

type DataStreamContextValue = {
  dataStream: DataUIPart<CustomUIDataTypes>[];
  setDataStream: React.Dispatch<
    React.SetStateAction<DataUIPart<CustomUIDataTypes>[]>
  >;
  agentRuns: Record<string, AgentRunState>;
  activeRunIdByAgent: Record<string, string>;
  pushAgentEvent: (event: AgentProcessEvent) => void;
  resetAgentRuns: () => void;
};

const DataStreamContext = createContext<DataStreamContextValue | null>(null);

export function DataStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dataStream, setDataStream] = useState<DataUIPart<CustomUIDataTypes>[]>(
    []
  );
  const [agentRuns, setAgentRuns] = useState<Record<string, AgentRunState>>({});
  const [activeRunIdByAgent, setActiveRunIdByAgent] = useState<
    Record<string, string>
  >({});

  const value = useMemo(
    () => ({
      dataStream,
      setDataStream,
      agentRuns,
      activeRunIdByAgent,
      pushAgentEvent: (event: AgentProcessEvent) => {
        setAgentRuns((current) => {
          const existing = current[event.runId];
          const nextEvents = existing?.events ?? [];

          if (
            nextEvents.some(
              (existingEvent) =>
                existingEvent.seq === event.seq &&
                existingEvent.agent === event.agent
            )
          ) {
            return current;
          }

          return {
            ...current,
            [event.runId]: {
              agent: event.agent,
              events: [...nextEvents, event],
            },
          };
        });

        setActiveRunIdByAgent((current) => ({
          ...current,
          [event.agent]: event.runId,
        }));
      },
      resetAgentRuns: () => {
        setAgentRuns({});
        setActiveRunIdByAgent({});
      },
    }),
    [dataStream, agentRuns, activeRunIdByAgent]
  );

  return (
    <DataStreamContext.Provider value={value}>
      {children}
    </DataStreamContext.Provider>
  );
}

export function useDataStream() {
  const context = useContext(DataStreamContext);
  if (!context) {
    throw new Error("useDataStream must be used within a DataStreamProvider");
  }
  return context;
}
