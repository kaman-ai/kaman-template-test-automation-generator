// The app's own login form posts here. The password is checked by Kaman
// (POST /oauth/token, grant_type=password); the person never sees Kaman.
// On success the session lives in httpOnly cookies scoped to this app.
import { auth } from "../../../lib/kaman";
import { answer, readFields } from "../../../lib/authRoute";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { fields, form } = await readFields(req);
  const email = fields.email?.trim();
  if (!email || !fields.password) {
    return answer(req, form, "login", { ok: false, status: 400, error: "Enter your email and password." });
  }
  return answer(req, form, "login", await auth.login(req, email, fields.password));
}
