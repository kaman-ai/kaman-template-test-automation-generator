"use client";
// The shell around every screen: where you are, the template's one big
// action (its workflow, declared on the desk scenario), and signing out.
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { scenarios } from "../lib/scenarios";
import { apiPath } from "../lib/apiPath";
import { Toasts, useNotify } from "./Toasts";

export function DeskShell(props: {
  title: string;
  desk: string;
  run: string | null;
  chatTitle: string;
  children: React.ReactNode;
}) {
  return (
    <Toasts>
      <div className="min-h-screen bg-background">
        <Header {...props} />
        <main className="mx-auto w-full max-w-7xl px-6 py-6">{props.children}</main>
      </div>
    </Toasts>
  );
}

function Header({ title, desk, run, chatTitle }: { title: string; desk: string; run: string | null; chatTitle: string }) {
  const path = usePathname();
  const notify = useNotify();
  const [starting, setStarting] = React.useState(false);
  const nav = [
    { href: "/", label: "Desk" },
    { href: "/chat", label: chatTitle },
  ];

  // The run is an action the desk scenario declares; Kaman starts the
  // workflow as the signed-in user and answers at once. The run itself —
  // approvals included — is followed in Kaman's Runs.
  const startRun = async () => {
    setStarting(true);
    try {
      await scenarios.invokeAction(desk, "run", {});
      notify("Started. Follow it in Kaman's Runs; anything that needs a person will ask.");
    } catch (e) {
      notify(`Could not start: ${e instanceof Error ? e.message : String(e)}`, "error");
    } finally {
      setStarting(false);
    }
  };

  return (
    <header className="border-b border-border bg-background/95">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-6 px-6 py-3">
        <span className="text-base font-semibold">{title}</span>
        <nav className="flex gap-1 text-sm" aria-label="App">
          {nav.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-3 py-1.5 ${active ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {run ? (
            <button
              type="button"
              onClick={() => void startRun()}
              disabled={starting}
              data-testid="start-run"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {starting ? "Starting…" : run}
            </button>
          ) : null}
          <form method="post" action={apiPath("/api/auth/signout")}>
            <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted" data-testid="sign-out">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
