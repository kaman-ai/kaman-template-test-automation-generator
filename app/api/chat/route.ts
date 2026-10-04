// A turn of the app's conversation with the template's agent.
//
// The browser sends the question here; this route, on the server, puts it
// to Kaman AS THE SIGNED-IN USER — the conversation is theirs, in their
// session list, under their permissions — and streams the agent's answer
// back as it is written.
//
// Kaman's session stream speaks its own frames (`data`, `tool_progress`,
// `stopped`, …). The chat component speaks the chat frames (`text`,
// `toolUse`, `toolResult`, `done`, …). This is where one becomes the other.
import { auth, failure, wiring } from "../../lib/kaman";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

type KamanFrame = {
  type?: string;
  content?: string;
  message?: string;
  toolName?: string;
  toolCallId?: string;
  status?: string;
  args?: unknown;
  result?: string;
  error?: string;
};

const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export async function POST(req: Request) {
  let sessionId: string | undefined;
  let text = "";
  try {
    const body = (await req.json()) as { sessionId?: string; text?: string };
    sessionId = body.sessionId || undefined;
    text = (body.text ?? "").trim();
  } catch {
    return failure("the message is not JSON", 400);
  }
  if (!text) return failure("nothing to send", 400);
  const agent = wiring.chatAgent;

  const session = await auth.session(req);
  if (!session) return auth.signedOut();

  let frames: AsyncIterable<KamanFrame>;
  try {
    const http = session.kaman.raw.http;
    const me = (await http.request({ method: "GET", path: "/auth/me" })) as { user: { id: string } };
    if (!sessionId) {
      const session = (await http.request({
        method: "POST",
        path: "/sessions",
        body: { name: wiring.title, userId: me.user.id, agentId: agent },
      })) as { id: string };
      sessionId = session.id;
    }
    await http.request({
      method: "POST",
      path: `/sessions/${sessionId}/messages`,
      body: { role: "user", userId: me.user.id, content: text },
    });
    frames = (await http.request({
      method: "GET",
      path: `/sessions/${sessionId}/stream`,
      stream: true,
    })) as AsyncIterable<KamanFrame>;
  } catch (e) {
    return failure(e);
  }

  const encoder = new TextEncoder();
  const started = new Set<string>();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: string, data: unknown) => controller.enqueue(encoder.encode(sse(event, data)));
      try {
        for await (const f of frames) {
          if (f.type === "data" && f.content) {
            emit("text", { delta: f.content });
          } else if (f.type === "tool_progress") {
            const name = f.toolName || "tool";
            const id = f.toolCallId || name;
            if (f.status === "completed" || f.status === "failed") {
              if (!started.has(id)) emit("toolUse", { name, arguments: asRecord(f.args) });
              emit("toolResult", {
                name,
                content: f.result ?? f.error ?? "",
                isError: f.status === "failed" || Boolean(f.error),
              });
            } else if (!started.has(id)) {
              started.add(id);
              emit("toolUse", { name, arguments: asRecord(f.args) });
            }
          } else if (f.type === "error") {
            emit("error", { message: f.message ?? "the agent reported an error" });
            break;
          } else if (f.type === "stopped") {
            emit("done", { finishReason: "stop" });
            break;
          }
        }
      } catch (e) {
        emit("error", { message: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });
  return session.respond(new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      // The conversation continues in this session on the next turn.
      "X-Kaman-Session": sessionId!,
    },
  }));
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}
