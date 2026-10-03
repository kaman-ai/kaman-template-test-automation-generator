"use client";

// The app's actions — each a workflow run or a question to one of the
// template's agents — with their results. Everything goes through this
// app's own server routes, so the Kaman key never reaches the browser.
import { useState } from "react";
import manifest from "../kaman.app.json";
import { apiPath } from "./lib/apiPath";
import type { Action, Manifest } from "./lib/kaman";

const app = manifest as unknown as Manifest;

function initial(action: Action): Record<string, string> {
  return Object.fromEntries(
    action.inputs.map((i) => [i.name, i.kind === "json" ? JSON.stringify(i.default, null, 2) : String(i.default ?? "")]),
  );
}

function ActionCard({ action }: { action: Action }) {
  const [values, setValues] = useState<Record<string, string>>(() => initial(action));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const body: Record<string, unknown> = {};
      for (const i of action.inputs) {
        const raw = values[i.name] ?? "";
        body[i.name] = i.kind === "json" ? JSON.parse(raw || "null") : i.kind === "number" ? Number(raw) : raw;
      }
      const res = await fetch(apiPath(`/api/action/${action.id}`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out?.error ?? `HTTP ${res.status}`);
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const answer = result as { answer?: string; points?: string[]; state?: string; nodeOutputs?: Record<string, unknown> } | null;
  return (
    <section className="flex flex-col gap-3 rounded-xl border bg-white p-5" data-action={action.id}>
      <div>
        <h2 className="text-lg font-medium">{action.label}</h2>
        <p className="text-sm text-slate-600">{action.description}</p>
      </div>
      {action.inputs.map((i) => (
        <label key={i.name} className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">{i.label}</span>
          {i.kind === "json" ? (
            <textarea
              value={values[i.name]}
              onChange={(e) => setValues((v) => ({ ...v, [i.name]: e.target.value }))}
              rows={Math.min(10, (values[i.name] ?? "").split("\n").length + 1)}
              className="rounded-lg border px-3 py-2 font-mono text-xs"
            />
          ) : (
            <input
              value={values[i.name]}
              onChange={(e) => setValues((v) => ({ ...v, [i.name]: e.target.value }))}
              className="rounded-lg border px-3 py-2"
            />
          )}
        </label>
      ))}
      <div>
        <button
          onClick={() => void run()}
          disabled={busy}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Working… (this can take a few minutes)" : action.label}
        </button>
      </div>
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
      {answer?.answer ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm">
          <p>{answer.answer}</p>
          {answer.points?.length ? (
            <ul className="mt-2 list-disc pl-5 text-slate-700">
              {answer.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {answer?.state ? (
        <div className="flex flex-col gap-2 text-sm">
          <div>
            Run finished: <strong>{answer.state}</strong>
          </div>
          <details className="rounded-lg border bg-slate-50 p-3" open>
            <summary className="cursor-pointer font-medium">What each step produced</summary>
            <pre className="mt-2 max-h-96 overflow-auto text-xs">{JSON.stringify(answer.nodeOutputs, null, 2)}</pre>
          </details>
        </div>
      ) : null}
    </section>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{app.ui.title}</h1>
        <p className="text-slate-600">{app.ui.tagline}</p>
      </header>
      {app.ui.actions.map((a) => (
        <ActionCard key={a.id} action={a} />
      ))}
    </main>
  );
}
