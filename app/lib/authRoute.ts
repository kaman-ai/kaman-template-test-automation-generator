// The app's own login and signup routes take either a JSON post (the form,
// once React has loaded) or a plain form post (before it has, or with
// scripts off) — so the password is always POSTed, never put in a URL.
// A form post answers with a redirect: home on success, back to the form
// with the reason otherwise.
import type { KamanAuthResult } from "@yoctotta/kaman-sdk/app-auth";

const BASE = (process.env.KAMAN_PREVIEW_BASE ?? "").replace(/\/$/, "");

export async function readFields(req: Request): Promise<{ fields: Record<string, string>; form: boolean }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    return { fields: Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v ?? "")])), form: false };
  }
  const data = await req.formData().catch(() => null);
  const fields: Record<string, string> = {};
  data?.forEach((v, k) => {
    if (typeof v === "string") fields[k] = v;
  });
  return { fields, form: true };
}

export function answer(_req: Request, form: boolean, from: "login" | "signup", r: KamanAuthResult | { ok: false; status: number; error: string }) {
  if (!form) return r.ok ? r.respond(Response.json({ ok: true })) : Response.json({ error: r.error }, { status: r.status });
  // A relative Location: behind a preview proxy, req.url is the app's
  // internal address, not the one the browser used.
  const to = (path: string) => new Response(null, { status: 303, headers: { Location: `${BASE}${path}` } });
  if (r.ok) return r.respond(to("/"));
  return to(`/${from}?error=${encodeURIComponent(r.error)}`);
}
