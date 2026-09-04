import React from "react";

export default function WorkspaceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted/80 rounded-lg" />
          <div className="h-4 w-96 bg-muted/50 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-muted/70 rounded-lg" />
          <div className="h-9 w-28 bg-muted/70 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl border border-border/60 bg-card p-4 space-y-3">
            <div className="h-4 w-20 bg-muted/60 rounded" />
            <div className="h-8 w-16 bg-muted/80 rounded" />
            <div className="h-3 w-28 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="rounded-xl border border-border/60 bg-card p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-border/40">
          <div className="h-6 w-40 bg-muted/80 rounded" />
          <div className="h-8 w-32 bg-muted/60 rounded-md" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/30 border border-border/40 p-3 flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-1/3 bg-muted/70 rounded" />
                <div className="h-3 w-1/4 bg-muted/40 rounded" />
              </div>
              <div className="h-6 w-20 bg-muted/60 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
