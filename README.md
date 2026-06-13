# VOCS — Voice Control System

> A JavaScript library that adds voice control to an existing web page. Once
> attached, VOCS lets a user operate the page's interactive HTML5 elements —
> clicking buttons and links, typing into fields, picking options, setting
> dates, scrolling — by voice instead of mouse and keyboard.

VOCS started as a Bachelor's thesis project (SS 2018) and a working prototype.
This document **freezes the original concept and the current state of the
repository** so the idea can be revisited later without re-reading the thesis or
re-discovering the code.

---

## Table of contents

- [Concept](#concept)
- [Command grammar](#command-grammar)
- [Keywords](#keywords)
- [System states](#system-states)
- [How an element is found](#how-an-element-is-found)
- [Per-element behavior](#per-element-behavior)
- [Error handling](#error-handling)
- [Manual adjustments for developers](#manual-adjustments-for-developers)
- [Architecture (as built)](#architecture-as-built)
- [User guide](#user-guide)
- [Repository layout](#repository-layout)
- [Run it locally](#run-it-locally)
- [Current state: what exists, what is stubbed](#current-state-what-exists-what-is-stubbed)

---

## Concept

The goal is to replace conventional input devices (mouse, keyboard) for
**classic web interfaces** — informational sites, web shops, blogs, and rich
internet applications that are driven by ordinary clicks and form input. It is
explicitly **not** designed for complex graphical apps (WebGL/3D, canvas-heavy
interaction).

VOCS ships as a JS library that a developer attaches to a page. After it is
attached, the page gains voice-control behavior automatically for the interactive
HTML5 elements the concept covers:

| Category | Elements |
|---|---|
| Buttons & links | `<button>`, `<input type="button\|submit\|reset">`, `<a>` |
| Toggles | `<input type="checkbox\|radio">` |
| Text fields | `<input type="text\|email\|password\|search\|tel\|url">`, `<textarea>` |
| Special fields | `<input type="date\|datetime-local\|time\|week\|month\|number">` |
| Menus | `<select>` (incl. `multiple`) |

The system **simulates the mouse/keyboard event** that the matched element would
normally receive. Because these native elements are the building blocks of
navbars, tabs, pagination, breadcrumbs and dropdowns, voice control extends to
those composite patterns too — as long as they are built on the elements above
and remain HTML5-conformant.

Out of scope by design: `input type="file"` and `input type="color"` (their
dialogs live outside the page and are not reachable from JS), `hidden` inputs,
`<audio>`/`<video>`/`<embed>`/`range`/`datalist`, mouseover-triggered actions, and
anything in the browser chrome (URL bar, back button, dialogs).

A central design constraint is **privacy and consent**. The microphone never
records on page load. The system boots `INACTIVE`; the user must explicitly
activate it through the UI (which is also where the browser's mic-permission
prompt is triggered). An optional "always start" preference can be persisted so
recording auto-starts on the next visit. Secure (HTTPS) origins are required for
the permission to be remembered.

---

## Command grammar

Commands are spoken imperatively. The system does **not** understand
conversational/interrogative phrasing — *"Vocs, can you please click Submit?"* is
ignored. Every command follows one shape:

```
keyword [element-name]
```

- The **keyword** is required and must be the **first** word.
- The **element-name** is optional and is only used with the activation keyword,
  to name the element to act on.
- All other keywords are only recognized when spoken **in isolation** (a single
  word). This is what lets the page contain an element literally labelled "off"
  or "down" without the command colliding with it.

You do not have to read the element's full label — **any distinctive part of the
visible text is enough**. For *"Type your first name"* it is enough to say
*"click first"*. If the partial name is ambiguous (matches several elements), VOCS
falls back to its disambiguation flow (see [Error handling](#error-handling)).

---

## Keywords

Defined in `src/const.js` (`KEYWORDS_OBJECTS`) and `src/lang/en.js`:

| Keyword | Effect |
|---|---|
| `click` *(name)* | Act on the named element (click / focus / open select / start date entry). Activation keyword. |
| `stop` | Interrupt the current flow and return the system to its resting state. |
| `up` / `down` | Scroll the window (or an open select list) up/down by half a viewport. |
| `top` / `bottom` | Scroll the page fully to the top / bottom. |
| `show` | Mark **all** controllable elements with numbers (used when an element has no readable text — see error handling). |
| `clear` | Clear the whole text field / reset the date entry / deselect. |
| `delete` | Remove the last word in a field, or step back one entry in a date/select flow. |
| `off` | Deactivate voice control. *(concept; not implemented — see current state)* |
| `info` | Open an external page describing the system. *(concept; not implemented)* |
| `start` | Persist the "auto-start on reload" preference. *(handled via the UI's reload toggle)* |

Numbers are also valid input during disambiguation, select, and date/time flows.
Spoken number-words are converted to digits (via `words-to-numbers`), because the
speech engine returns numbers inconsistently as words or digits.

---

## System states

| State | Meaning |
|---|---|
| `INACTIVE` | Mic access unavailable or system switched off. No recording. (Initial state.) |
| `ACTIVE` | Activated and listening; permanent recording running, waiting for a command. |
| `LISTENING` | A command is being captured and transcribed to text. |
| `ERROR` | A recognition or processing error occurred. |
| `NOMATCH` | No element could be identified from the input. |
| `DONE` | The requested action was performed successfully. |

Resting state is `ACTIVE`. A command moves the system to `LISTENING`, then to
`DONE` or `NOMATCH`, then back to `ACTIVE`. A fatal error (e.g. ASR component
failure) can take the whole system down.

---

## How an element is found

When you name an element, VOCS:

1. **Collects** candidate elements from the DOM (`collector.js` → `element.js`),
   keeping only ones that are **interactive** (not `disabled`/`readonly`),
   **visible**, and **inside the viewport** — so it never acts on something the
   user can't see.
2. Builds an object per element capturing its text, associated `<label>`, `value`,
   `placeholder`, selected option, position and dimensions, and its **type**
   (clickable / focusable / selectable / date-time).
3. **Scores** each candidate by comparing the spoken name against those fields
   (stop-words removed first). If exact substring matching finds nothing, it
   retries with **fuzzy matching** (`fuse.js`) to tolerate recognition errors.
4. Acts on the single best match, or triggers disambiguation if several tie.

`<label>` resolution follows HTML semantics: `for`/`id` association first, then a
`<label>` immediately before/after the element, then a wrapping `<label>`.

---

## Per-element behavior

**Buttons & links** — a click event fires. No follow-up needed. Requires visible
text (or a `value` attribute on `<input>` buttons).

**Checkboxes & radios** — identified via their `<label>`; a click toggles them.

**Text fields** — focus first, then **dictate**: spoken text is appended to the
field. While a field is focused, all keywords except `clear`, `delete`, `stop`
become literal text. `clear` empties the field, `delete` removes the last word,
`stop` ends input and releases focus. To literally type one of those words, say
it twice (*"stop stop"*, *"clear clear"*). `maxLength` is respected; an
`autofocus` field can be dictated into without naming it first.

**Special fields (date / time / number)** — VOCS opens a small dialog overlay and
collects each part **sequentially** as numbers (e.g. day → month → year → …),
validating each against allowed ranges and the element's `min`/`max`. `clear`
resets, `delete` steps back one value, `stop` aborts. Only numbers are accepted
during this flow.

**Select menus** — VOCS renders an overlay listing every option, each tagged with
a number. Say the number to choose. `up`/`down` scroll a long list; `clear`/
`delete` deselect. `multiple` selects are supported by saying several numbers in
turn; repeating a number deselects that option; `stop` ends the flow.

**Scrolling** — `up`/`down` move half a viewport (≈ one mouse-wheel step);
`top`/`bottom` jump to the page extremes.

---

## Error handling

Speech recognition is never 100% accurate, so the system is built to recover:

- **No element identified** — VOCS recomputes the most likely target(s) from the
  (possibly mis-heard) input and **marks them with numbers**; say a valid number
  to pick one, or `stop` to abort.
- **Several elements identified** (e.g. same label) — same numbered-overlay
  disambiguation.
- **Unreachable elements** (icon-only buttons, images, names the ASR keeps
  mis-hearing such as *"email"* vs *"male"*) — the `show` keyword marks **all**
  controllable elements with numbers so any of them can be chosen by number.

---

## Manual adjustments for developers

The concept defines flexible structural requirements, but developers can extend
coverage manually:

- Add the CSS class **`vocs_clickable`** to make any element clickable by voice.
  The class carries no styling; the `vocs_` prefix avoids name clashes. Such
  elements only receive a **click** event.

  ```html
  <div class="vocs_clickable">Element label</div>
  ```

- If the clickable element has no text of its own, link it to a text-bearing
  element with **`data-vocs-id`** / **`data-vocs-for`** (mirrors the
  input/`<label>` association):

  ```html
  <div class="vocs_clickable" data-vocs-id="click_me"></div>
  <p data-vocs-for="click_me">Element label goes here</p>
  ```

When developers adjust the HTML this way, ensuring correct behavior is their
responsibility.

---

## Architecture (as built)

VOCS is a **distributed system**: a JavaScript **client** running in the browser,
and a Node.js **server** that brokers speech recognition. The split exists to
decouple the in-browser control logic from the speech-recognition (ASR)
component, which is the part with browser/platform compatibility constraints.

```
┌─────────────────────────┐   REST /audio (HTTP+JSON)   ┌──────────────────┐   HTTP   ┌───────────────┐
│  Client (browser, JS)   │ ──────── audio (WAV) ─────► │  Server (Node.js)│ ───────► │  ASR provider │
│  captures mic, controls │ ◄──── {success, string} ─── │  distributor →   │ ◄─────── │  (Bing, …)    │
│  the page's DOM         │                             │  provider module │          │               │
└─────────────────────────┘                             └──────────────────┘          └───────────────┘
```

Two **strategies** select where recognition happens (Strategy pattern via
`Vocs.initRecognizer({ api })`):

- **`default` → Web Speech API** (`webspeech.js`). Recognition happens entirely in
  the browser; **no server is involved**. This is the default used by the
  prototype. It is **Chrome-only** but free.
- **any other api → Web Audio API recorder** (`recorder.js`). Audio is recorded in
  the browser and POSTed to the server, which forwards it to an external ASR
  provider and returns the transcribed string.

### Client modules (`src/`)

| Module | Responsibility |
|---|---|
| `vocs.js` | Public API + strategy entry point (`initRecognizer`). |
| `webspeech.js` | Web Speech API path (browser-native recognition). |
| `recorder.js`, `_recorder.js` | Web Audio API recording → send audio to server. |
| `controller.js` | **Core.** Interprets commands, manages input modes & state, orchestrates everything. |
| `analyzer.js` | Extracts the keyword and the element-name from a transcript. |
| `collector.js` | Gathers and scores DOM elements for a given name. |
| `element.js` | Builds element objects: type detection, label resolution, visibility/viewport checks. |
| `actions.js` | Executes DOM events (click, focus, set/clear/delete text, set value, scroll). |
| `fuzzy_search.js` | Fuzzy matching for keywords and element names (`fuse.js`). |
| `helper.js` | Builds the overlay UIs (numbered markers, select list, date/time dialog). |
| `const.js` | Selectors, keywords + regexes, input modes, element types, state constants. |
| `useri.js` | The floating UI toolbar (activate/deactivate, status, input echo, persistence). |
| `speaker.js` | Spoken status messages via the Speech Synthesis API. |
| `visualizer.js` | Microphone waveform canvas. |
| `lang/` | String tables (`en.js` complete; `de.js`, `ru.js` partial). |

**Input modes** (`const.js`) drive the controller's behavior: `NO_MODE`, `TYPE`,
`SELECT`, `MULTIPLE`, `DATE_TIME`. **Element types**: `CLICKABLE`, `FOCUSABLE`,
`SELECTABLE`, `DATE_TIME`.

### Server (`/`, Express)

| File | Responsibility |
|---|---|
| `vocs.js` (root) | HTTP server bootstrap; listens on port **3001**. |
| `app.js` | Express app: `helmet`, `morgan`, `body-parser`; mounts `/audio`. |
| `routes/recognizer.js` | `POST /audio` → the configured recognizer module. |
| `recognizers/bing.js` | Calls Microsoft Bing Speech API, extracts the transcript. |
| `recognizers/houndify.js` | Houndify provider (partial). |
| `routes/config.js` | Echo/config route. |

A provider **distributor** routes incoming audio to the right module by the
client-supplied `api` value; each module knows its own provider's request format
and response shape. Adding/swapping a provider does not touch the rest of the
system.

### Data exchange

Client → server:

```json
{ "api": "bing", "audio": "<binary WAV>" }
```

Server → client:

```json
{ "success": true, "string": "click button" }
```

Bing expects WAV, mono, 16 kHz. Note that the browser's default capture rate is
44.1 kHz, which produces large (2–3 MB / 2 s) payloads — audio must be converted
down before sending or latency suffers.

---

## User guide

1. Open a page that has VOCS attached (the bundled demo page, or the `test/`
   site).
2. Click the **microphone/play** control in the VOCS toolbar and **grant mic
   permission**. The system goes from `INACTIVE` to `ACTIVE`. (Optionally enable
   the reload/"always start" toggle to auto-activate next time.)
3. Speak commands. The toolbar echoes what was heard and shows the current state.

Common commands:

| You say | What happens |
|---|---|
| *"click submit"* | Clicks the button/link labelled "Submit". |
| *"click first"* | Focuses the field whose label contains "first" (e.g. "First name"); then dictate. |
| *"hello world"* (while a field is focused) | Types "hello world" into the field. |
| *"delete"* | Removes the last word from the focused field. |
| *"clear"* | Empties the focused field / resets the current entry. |
| *"stop"* | Ends text entry / aborts the current flow. |
| *"stop stop"* | Types the literal word "stop" into a focused field. |
| *"click fruit"* → *"three"* | Opens the "fruit" select, then picks option #3. |
| *"click birthday"* → *"25"* → *"12"* → *"1990"* | Fills a date field part by part. |
| *"down"* / *"up"* / *"top"* / *"bottom"* | Scrolls the page. |
| *"show"* → *"2"* | Marks every controllable element with a number; picks #2. |

Tips: say only a distinctive part of a label; speak one command per ~1 s; if
nothing matches, VOCS will offer numbered candidates — just say the number.

---

## Repository layout

```
.
├── index.html          # Demo page (Vite dev entry)
├── index.js            # Demo bootstrap: Vocs.initRecognizer({})  (= Web Speech API)
├── src/                # Client library (modules listed above)
├── recognizers/        # Server-side ASR provider modules (bing, houndify)
├── routes/             # Express routes (/audio, config)
├── app.js              # Express app
├── vocs.js             # Server bootstrap (port 3001)
├── public/             # Static assets served by the Express server
├── dist/               # Vite build output
├── test/               # Standalone Vite test site (native + Bootstrap/Materialize/Semantic UI)
├── vite.config.js      # Dev server :5173, proxies /audio → :3001
└── package.json
```

---

## Run it locally

Tooling has been migrated from the original Webpack 4 + Babel 6 setup to **Vite
6**.

```bash
npm install

# Front end (default Web Speech API path — Chrome recommended):
npm run dev        # Vite dev server at http://localhost:5173

# Optional: server-side ASR path
npm start          # Express server (node vocs) at http://localhost:3001
                   # vite proxies /audio → :3001

npm run build      # production build → dist/
npm run preview    # preview the build
```

The default demo (`index.js`) uses `Vocs.initRecognizer({})`, i.e. the in-browser
Web Speech API — **no server needed, Chrome only**. To use a server-side provider
instead, initialize with `Vocs.initRecognizer({ api: 'bing' })` and run the
server.

---

## Current state: what exists, what is stubbed

This is what the prototype actually does today — useful for deciding later what to
keep and what to rebuild.

**Working**

- Web Speech API recognition path (Chrome, desktop).
- Full command interpretation in `controller.js` for every covered element type.
- Element collection, scoring, exact + fuzzy matching; spoken-number conversion.
- Numbered-marker disambiguation, `show`, select overlay, sequential date/time
  dialog.
- Floating UI toolbar with status, input echo, mic visualizer, spoken status
  (Speech Synthesis), and `localStorage`/`sessionStorage` persistence of
  active/minimized/auto-start state.
- Bing Speech provider on the server; Vite build + standalone `test/` site.

**Stubbed, partial, or not implemented**

- `off` and `info` keywords — `TODO` placeholders in `controller.js`.
- `clear`/`delete` for `<select>` — `executeClearSelection` /
  `executeDeleteSelection` are empty stubs.
- Web Audio recorder path is **alpha**: it starts recording on a crude frequency
  threshold and the result is currently logged, not wired back into the
  controller.
- Server-side providers beyond Bing are incomplete (`houndify.js` partial; no
  Google/IBM modules despite the architecture allowing them).

**Known issues (from the thesis evaluation)**

- Select options whose `value` contains characters like `()` cannot be selected.
- Numbered markers can overlap for elements positioned close together.
- Marker positioning for `fixed` elements / on scroll is imperfect (`FIXME`s in
  `helper.js`).

**Constraints**

- English only (German/Russian string tables are partial prototypes).
- Default path is **Chrome-only**; designed for **desktop**, not mobile.
- The trigger keyword is **`click`**, matching the thesis design.

---

## Origin

Bachelor's thesis, SS 2018 — a concept and prototype implementation of a voice
control system for web interfaces. Licensed under the terms in `LICENSE`.
