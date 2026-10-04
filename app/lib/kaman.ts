// Server-side only: how this app reaches Kaman, and what it is wired to.
//
// THE RULE: the app acts as its SIGNED-IN USER. Every call a person's
// click causes goes out with their token (`auth.session(req)`), so Kaman
// applies their permissions and their organisation. The app's API key
// (KAMAN_API_KEY) is used for one thing here: signing a new person up.
//
// kaman.app.json names the agents, workflow and desk scenario this app
// uses. When the template is installed, Kaman rewrites it to YOUR copies
// and shares exactly those with your organisation, so its people can use
// them. Nothing here hard-codes an id.
import { createKamanAuth } from "@yoctotta/kaman-sdk/app-auth";
import manifest from "../../kaman.app.json";

type Manifest = {
  name: string;
  agents: Record<string, string>;
  workflows: Record<string, string>;
  scenarios: Record<string, string>;
  ui: { title: string; tagline: string; run?: string; chat: { agent: string; title: string; suggestions: string[] } };
};

const m = manifest as Manifest;

export const wiring = {
  title: m.ui.title,
  tagline: m.ui.tagline,
  /** The desk: the live records, "Ask" on each, and the workflow's run. */
  desk: m.scenarios.desk,
  /** The label of the desk's run action, when it declares one. */
  run: m.ui.run ?? null,
  /** The agent the chat page talks to (an id). */
  chatAgent: m.agents[m.ui.chat.agent],
  chatTitle: m.ui.chat.title,
  suggestions: m.ui.chat.suggestions,
};

/**
 * Sign-in for this app. Reads KAMAN_APP_CLIENT_ID, KAMAN_BASE_URL and
 * KAMAN_PREVIEW_BASE (a Kaman preview injects all three), and KAMAN_API_KEY
 * for signup.
 */
export const auth = createKamanAuth();

/** A failure as JSON, with the reason — never a bare 500. */
export function failure(e: unknown, status = 502) {
  const message = e instanceof Error ? e.message : String(e);
  return Response.json({ error: message }, { status });
}
