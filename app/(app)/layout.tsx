// Every screen of the app, inside its shell. Who may see it is decided in
// middleware.ts (signed out → the login screen) and, for the data, by Kaman.
import { DeskShell } from "../components/DeskShell";
import { wiring } from "../lib/kaman";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DeskShell title={wiring.title} desk={wiring.desk} run={wiring.run} chatTitle={wiring.chatTitle}>
      {children}
    </DeskShell>
  );
}
