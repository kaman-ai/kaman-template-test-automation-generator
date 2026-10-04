"use client";
// The desk's messages: what a scenario's actions report, and failures.
import * as React from "react";

type Toast = { id: number; text: string; tone: "info" | "error" };
const Ctx = React.createContext<(text: string, tone?: "info" | "error") => void>(() => {});

export function useNotify() {
  return React.useContext(Ctx);
}

export function Toasts({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const notify = React.useCallback((text: string, tone: "info" | "error" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 6000);
  }, []);
  return (
    <Ctx.Provider value={notify}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            data-testid="desk-toast"
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${
              t.tone === "error" ? "border-destructive/40 bg-background text-destructive" : "border-border bg-background"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
