// The app's own signup form posts here. The ONE place this app uses its
// API key: Kaman makes the person a Member of the app's organisation with
// the password they chose (the key's owner must be allowed to add people
// there), then signs them in.
import { auth } from "../../../lib/kaman";
import { answer, readFields } from "../../../lib/authRoute";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { fields, form } = await readFields(req);
  const email = fields.email?.trim();
  if (!email || !fields.password) {
    return answer(req, form, "signup", { ok: false, status: 400, error: "Enter an email and a password." });
  }
  const name = fields.name?.trim();
  return answer(req, form, "signup", await auth.signup(req, { email, password: fields.password, ...(name ? { displayName: name } : {}) }));
}
