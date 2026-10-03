// Run one of the app's actions: a workflow run, or a question to an agent.
import { app, failure, kaman } from "../../../lib/kaman";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const action = app.ui.actions.find((a) => a.id === id);
  if (!action) return failure(`no action '${id}'`, 404);
  let values: Record<string, unknown> = {};
  try {
    values = (await req.json()) ?? {};
  } catch {
    return failure("the action's inputs are not JSON", 400);
  }
  try {
    if (action.kind === "workflow") {
      const workflow = app.workflows[action.target];
      if (!workflow) return failure(`the app names no workflow '${action.target}'`, 500);
      const state = action.wrap ? { [action.wrap]: values } : values;
      return Response.json(await kaman().runWorkflow(workflow, state));
    }
    const agent = app.agents[action.target];
    if (!agent) return failure(`the app names no agent '${action.target}'`, 500);
    const prompt = (action.prompt ?? "").replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => {
      const v = values[k];
      return typeof v === "string" ? v : JSON.stringify(v ?? "");
    });
    const answer = await kaman().askAgentStructured<{ answer: string; points: string[] }>(
      agent,
      {
        type: "object",
        properties: {
          answer: { type: "string", description: "The answer, in a few sentences." },
          points: { type: "array", items: { type: "string" }, description: "The facts it rests on." },
        },
        required: ["answer", "points"],
      },
      prompt,
      { idleTimeoutMs: 240_000 },
    );
    return Response.json(answer);
  } catch (e) {
    return failure(e);
  }
}
