"use client";
// Kaman's scenario client, in the browser, through this app's own proxy
// (app/api/kaman) — which adds the signed-in user's token on the server.
// The browser never holds a token.
import { createScenariosClient } from "@kamanai/ui-scenarios";
import { apiPath } from "./apiPath";

export const scenarios = createScenariosClient({ baseUrl: apiPath("/api/kaman"), headers: () => ({}) });
