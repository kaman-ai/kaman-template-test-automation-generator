// Kaman's browser components (the scenario pages) call Kaman from the
// browser, which holds no token. This route forwards their calls AS THE
// SIGNED-IN USER — and only to the scenario routes this app's pages use.
import { auth } from "../../../lib/kaman";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const forward = (req: Request) => auth.proxy(req, { allow: ["/scenarios/"] });

export { forward as GET, forward as POST };
