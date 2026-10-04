"use client";
// Kaman's chat component, talking to the template's agent through this
// app's /api/chat — which asks as the signed-in user and streams the answer
// back as it is written.
import * as React from "react";
import { ChatThread, useConversation } from "@kamanai/ui-chatbot";
import { appChatTransport } from "../lib/chatTransport";

export function AgentChat({ title, tagline, suggestions }: { title: string; tagline: string; suggestions: string[] }) {
  const transport = React.useMemo(() => appChatTransport(), []);
  const { messages, busy, send, stop } = useConversation({ transport });
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <ChatThread
        messages={messages}
        onSend={send}
        busy={busy}
        onStop={stop}
        pattern="wide"
        placeholder="Ask anything…"
        emptyState={
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="max-w-md text-sm text-muted-foreground">{tagline}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-left text-sm hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}
