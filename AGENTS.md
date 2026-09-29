# Working in this project

A reviewed Next.js App Router starter. It builds and runs as-is; `app/page.tsx` is a placeholder
meant to be replaced by the product you are asked for.

Read this instead of exploring. It is the whole setup.

## What this project is for

A single-page web app that saves its data in the visitor's browser.

Good for: trackers and planners; calculators and converters; dashboards over data you bring; small tools and games.

Not built for: sharing data between people or devices (data stays in one browser); accounts or sign-in; calling outside services or APIs.

A request that needs one of these is outside what this project can deliver as it stands: plan the closest thing it can, and say plainly what was left out.

## Stack

Next.js App Router · TypeScript · Tailwind CSS · shadcn/ui · 14 shadcn/ui components pre-installed (dialog, select, table, card, form inputs, tabs, alert) · Dexie (browser database, device-local) · TanStack Query · TanStack Table.

## Layout

```
app/layout.tsx              root layout — <html>/<body> and <Providers>. Set metadata here.
app/page.tsx                the placeholder. Replace it.
app/globals.css             Tailwind entry, the design tokens, and the two base rules.
app/providers.tsx           "use client" — composed from this project's modules. Already wired into layout.
types/webgpu.d.ts           WebGPU type reference. See "Graphics" below.
template.capabilities.json  what this template ships, declared for the planner. Keep it accurate.
components/ui/              the shadcn components, already themed. See docs/components.md.
lib/utils.ts                cn() — the className merge helper every shadcn component expects.
components.json             shadcn config: new-york, neutral, rsc, aliases @/components and @/lib.
lib/storage/                the shared storage package, vendored in. Do NOT edit; see docs/storage.md.
lib/db.ts                   THIS app's database schema. Tables, indexes, versions. Edit this.
lib/data/<name>.ts          THIS app's queries. Components call these, never Dexie directly. Create it.
```

`@/*` resolves to the project root (`tsconfig.json` paths). Import as `@/components/ui/button`.

**That list is the entire project.** There is nothing else to discover, so do not spend steps
exploring for it. If you want to see the conventions before writing, the ones worth opening are
`app/layout.tsx`, `app/page.tsx`, `app/globals.css` and `package.json`.

## What this project ships

Each of these is already installed and already wired up. **Read the document before building on
one** — it carries the worked code, so you do not have to derive it, and it says what the thing
cannot do as well as what it can.

- **Component kit.** 14 shadcn/ui components, the design tokens they need, and the cn() helper. Read `docs/components.md` before building on it.
- **Browser storage.** Dexie over IndexedDB, already set up: schemas, seeding, live queries and export/import. Data lives in one browser on one device — no sync, no sharing between visitors, no server copy. Read `docs/storage.md` before building on it.

Nothing outside the stack above is set up. In particular, unless a document above says otherwise,
there is no backend datastore, no authentication and no external API.

## Conventions

**Server components by default.** Add `"use client"` only to files that need state, effects,
event handlers or browser APIs. Keep the client boundary as low in the tree as you can — a page
can stay a server component with an interactive child island.

**Tailwind v4 has no `tailwind.config.js`.** Configuration lives in CSS. Add design tokens with
`@theme` in `app/globals.css`; there is no JS config file to edit and creating one does nothing.

**Dependencies.** `npm install <pkg>` works — there is a real shell with network access. Install
what the task genuinely needs rather than reimplementing it, and prefer a package that ships its
own types. A large fixed dataset still belongs in its own module under `lib/`, separate from the
component that renders it.

**Lint runs after you finish, and two rules fail most runs.**
`react-hooks/set-state-in-effect`: never call a state setter directly in a `useEffect` body. A
value computed from props or state is computed during render (or with `useMemo`); state that should
reset when an id changes is reset with `key={id}`; a value only the browser knows comes from
`useSyncExternalStore`. Setting state inside a callback the effect subscribes to — an event
listener, a timer, a promise's `.then` — is allowed. `react/no-unescaped-entities`: a bare `'` or
`"` in JSX text fails lint, so "Don't" is written `Don&apos;t` (or `{"Don't"}`).

**Hydration.** The server renders every client component too, and its HTML must match the first
client render. Never read the current time, `Math.random()`, the visitor's locale or time zone,
`window` or storage during render. Render a placeholder until `useIsHydrated()` from
`@/lib/storage/react` is true, or do the work in an event handler.

**`params` and `searchParams` are Promises (Next 16).** In a page, layout or `generateMetadata`,
type them as `Promise<{ id: string }>` and `await` them; reading `params.id` directly fails the
build.

## Graphics

`types/webgpu.d.ts` provides WebGPU types. If *What this project ships* above lists Canvas and 3D,
use `CanvasStage` and `three` as `docs/graphics.md` says; otherwise no graphics library is
installed, Canvas 2D and WebGL work, and `npm install three` if you want a scene graph.

**The browser used to verify your work runs headless with no GPU** — but it does have WebGL.
Measured there: WebGL 1 and WebGL 2 both give a real context and real pixels, through a software
rasteriser that is roughly an order of magnitude slower than hardware, so budget a few thousand
triangles rather than a million. `navigator.gpu` is **absent**, so nothing may require WebGPU.

Anything gated behind a context that might fail must still degrade to something visible rather
than a blank canvas, or verification sees an empty page: give it a static fallback frame and a
readable message, rendered on the server so the route has text either way.

## What the finished app must do

When you finish, the supervisor runs `npm install`, `npm test --if-present`, `npm run lint
--if-present` and `npm run build`, then opens the built app in a headless browser **and uses it**.
You cannot run that browser and should not try to imitate it; you pass it by building an app that
meets these requirements:

- **Every route renders visible content and throws nothing** — not on load, and not while it is
  being used. No uncaught exceptions, console errors or failed requests. A page that renders
  nothing fails even when the build passed.
- **The main flow starts from a visible, enabled button with an honest text label** that says what
  it does: "Add expense", "New habit", "Create list". It sits on the page itself, not behind a menu,
  a hover or another step. An icon-only button carries an `aria-label` that says the same.
- **Entering data uses a real form**: labelled inputs inside a `<form>`, and a submit button named
  for what it does ("Save", "Add"). Submitting it with sensible values visibly adds to the page.
- **What was added is still there after a reload**, if the app keeps anything at all.
- **Destructive and file actions say so in their label**: Delete, Remove, Clear, Reset, Discard,
  Undo, Export, Download, Import, Sign out. These are never pressed during the check, so none of
  them can be the way into the main flow — and a control that hides one behind a harmless label is
  a lie to the person using the app.

`npm run build` passing is not evidence the product works — the untouched starter passes all four
commands. Neither is a page that renders: a tracker whose "Add" button throws renders perfectly.
What is judged is the running application, being used.

## Do not

- **Do not scaffold a new application over this one.** No `create-next-app`, no second `app/`
  directory. Build on what is here.
- **Do not run a dev server.** `next dev` / `npm run dev` are blocked. Use `npm run build` to
  check your work compiles.
- **Do not install Playwright, Puppeteer or Selenium.** Browser automation is blocked; the
  verification step above is how the page gets opened.
- **Do not reimplement something this project already ships.** Every item under "What this project
  ships" is installed, wired up and documented; a second library doing the same job is wasted
  steps and a second source of truth.
- **Do not promise anything the documents above say is impossible.** A screen offering sharing or
  cross-device sync on a device-local database is a screen that lies to the person using it.
- **Do not delete this file**, any document named above, or `template.capabilities.json`. The
  first two are the briefing for every later task on this repository; the third is how the planner
  knows what this project can do before it writes a single criterion.
