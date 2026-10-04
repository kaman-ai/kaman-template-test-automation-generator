// Forget the session; back to the login screen.
import { auth } from "../../../lib/kaman";

export const dynamic = "force-dynamic";

export const POST = (req: Request) => auth.signOut(req);
