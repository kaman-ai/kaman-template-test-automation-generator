// The desk: a Kaman scenario — the live records this template works on,
// read from your connected system as you, with "Ask" on each row.
import { Scenario } from "../components/Scenario";
import { wiring } from "../lib/kaman";

export const dynamic = "force-dynamic";

export default function DeskPage() {
  return <Scenario id={wiring.desk} />;
}
