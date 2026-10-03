// Server-side only: the Kaman client, and what this app is wired to.
//
// kaman.app.json names the agents and workflows this app uses and the
// actions it offers. When the template is installed, Kaman rewrites it to
// point at YOUR copies — nothing here hard-codes an id.
import { kamanApp } from "@yoctotta/kaman-sdk/app";
import manifest from "../../kaman.app.json";

export type Input = { name: string; label: string; kind: "text" | "number" | "json"; default: unknown };
export type Action = {
  id: string;
  label: string;
  description: string;
  kind: "workflow" | "agent";
  /** The key under `workflows` or `agents`. */
  target: string;
  /** Workflow: the run's state, nested under this key when set (e.g. a webhook's `payload`). */
  wrap?: string;
  /** Agent: the question, with `{{input}}` placeholders. */
  prompt?: string;
  inputs: Input[];
};
export type Manifest = {
  name: string;
  agents: Record<string, string>;
  workflows: Record<string, string>;
  ui: { title: string; tagline: string; actions: Action[] };
};

export const app = manifest as unknown as Manifest;

export function kaman() {
  return kamanApp();
}

export function failure(e: unknown, status = 502) {
  const message = e instanceof Error ? e.message : String(e);
  return Response.json({ error: message }, { status });
}
