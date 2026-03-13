import React from "react";
import { GraphWsContext, useGraphWsProvider } from "@/hooks/use-graph-ws";

export function GraphWsProvider({ children }: { children: React.ReactNode }) {
  const value = useGraphWsProvider();
  return (
    <GraphWsContext.Provider value={value}>
      {children}
    </GraphWsContext.Provider>
  );
}
