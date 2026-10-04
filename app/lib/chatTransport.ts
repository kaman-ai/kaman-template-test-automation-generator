// The chat component's transport: each turn is a POST to this app's own
// /api/chat, whose answer streams back as chat frames. The session id comes
// back in a header and is reused, so the agent keeps the conversation.
import { FrameParseError, parseFrame, type ConversationFrame, type StreamSubscription } from "@kamanai/ui-chatbot-core";
import type { ConversationTransport } from "@kamanai/ui-chatbot";
import { apiPath } from "./apiPath";

export function appChatTransport(): ConversationTransport {
  let sessionId: string | undefined;
  return {
    send(text: string, onFrame: (frame: ConversationFrame) => void): StreamSubscription {
      const url = apiPath("/api/chat");
      const abort = new AbortController();
      void (async () => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId, text }),
            signal: abort.signal,
          });
          if (!res.ok || !res.body) {
            const out = (await res.json().catch(() => null)) as { error?: string } | null;
            onFrame({ kind: "error", message: out?.error ?? `HTTP ${res.status}` });
            return;
          }
          sessionId = res.headers.get("X-Kaman-Session") ?? sessionId;
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let split: number;
            while ((split = buffer.indexOf("\n\n")) !== -1) {
              const block = buffer.slice(0, split);
              buffer = buffer.slice(split + 2);
              let event = "message";
              const data: string[] = [];
              for (const line of block.split("\n")) {
                if (line.startsWith("event:")) event = line.slice(6).trim();
                else if (line.startsWith("data:")) data.push(line.slice(5).trim());
              }
              try {
                onFrame(parseFrame(event, data.join("\n")));
              } catch (e) {
                onFrame({ kind: "error", message: e instanceof FrameParseError ? e.message : String(e) });
              }
            }
          }
        } catch (e) {
          if (!abort.signal.aborted) onFrame({ kind: "error", message: e instanceof Error ? e.message : String(e) });
        }
      })();
      return { url, close: () => abort.abort() };
    },
  };
}
