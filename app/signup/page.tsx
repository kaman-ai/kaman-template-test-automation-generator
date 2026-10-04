import { Suspense } from "react";
import { AuthForm } from "../components/AuthForm";
import { wiring } from "../lib/kaman";

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="signup" title={wiring.title} />
    </Suspense>
  );
}
