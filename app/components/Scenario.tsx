"use client";
// One of the desk's screens: a Kaman scenario as a whole working page —
// its figures, charts and tables resolved against the lake as the signed-in
// user, its row actions live, its drill-downs opening in place.
import { ScenarioPage } from "@kamanai/ui-scenarios";
import { scenarios } from "../lib/scenarios";
import { useNotify } from "./Toasts";

export function Scenario({ id }: { id: string }) {
  const notify = useNotify();
  return <ScenarioPage client={scenarios} scenarioId={id} notify={notify} exportable={false} />;
}
