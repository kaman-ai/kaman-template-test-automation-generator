# Test Automation Generator

The app of the **Test Automation Generator** template in the Kaman marketplace, built the way
every app on Kaman is (the reference is the Smart Site Planning desk;
Kai's *Building an app on Kaman* skill teaches it).

Writes the tests a pull request is missing: reads the change and your testing conventions, plans the tests, writes them on a branch, runs them in CI, and comments with the coverage gain - failing tests go to a developer, who decides whether they found a bug or are wrong. Connect your git forge and CI at install.

It is installed as a code project of yours when you install the template.

## What it does

| screen | what it is |
|---|---|
| `/login`, `/signup` | the app's **own** sign-in — its users never see Kaman |
| `/` — the desk | a Kaman **scenario**: the live records from your connected system, read as you, with **Ask** on each |
| `/chat` | Kaman's chat component with the template's agent, as you |
| the header's **Run** | an **action** the desk declares: starts the template's workflow, approvals included |

## How it is wired

- The app **acts as its signed-in user**: every call carries their token
  (`auth.session`), so Kaman applies their permissions and organisation.
  The API key is used only to sign a new person up.
- Kaman's browser components reach Kaman through `app/api/kaman/[...path]`
  (`auth.proxy`), narrowed to the scenario routes. The browser never holds
  a token.
- `kaman.app.json` names the agents, workflow and desk scenario by the ids
  the template seeds them under. **Install rewrites them** to your copies
  and shares exactly those with your organisation.

## Publishing a new version

Push here, then republish the template pinned to the new commit. Installs
always take the pinned commit, never the tip of `main`.
