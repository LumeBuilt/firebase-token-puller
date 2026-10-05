# Firebase Token Puller

Internal Chrome extension (Manifest V3) for the team, in the **ActivationAgents** dark
brand kit. Click the toolbar icon on a tab where you're logged into one of our apps →
it reads the Firebase Auth record and gives you copy buttons for the **API key** and
**refresh token**.

No more digging through DevTools → Application → IndexedDB by hand.

## Look & feel

- **Opening animation** — an ActivationAgents intro (CSS + Web Animations API) plays on
  first open each browser session (`intro/`). It's gated with `chrome.storage.session`,
  so it plays once per session, not on every popup open. Click it to skip.
- **Branding** — ActivationAgents dark UI: deep-black panels, brand-purple accents and
  glow, rounded cards, the AA wordmark in the header lockup. Clear `Copied ✓` feedback
  on the copy buttons, and styled empty/error states.
- **Fonts are bundled, not loaded from a CDN.** MV3 forbids remote fonts/scripts, so
  Sora, Inter and IBM Plex Mono ship as local `woff2` in `fonts/` and are declared with
  `@font-face`. No `fonts.googleapis.com` link anywhere.

### Colors / type

- Colors: `--bg #09090d`, `--panel #121219`, `--panel-2 #0c0c11`, `--line #20202a`,
  `--fg #ececf1`, `--muted #8c8c98`, `--faint #5a5a66`, accents `#a273f5` / `#c79fff`,
  brand purples `#7C45DB → #A273F5 → #C79FFF` (accent bar gradient), logo lockup field
  `#050505`.
- Type: **Sora** (600/700) for headers/logo lockup, **Inter** (400/500/600) for UI text,
  **IBM Plex Mono** (400/500) for the API key + refresh-token values.

## What it copies

Straight from `firebaseLocalStorageDb` → `firebaseLocalStorage`, for each row keyed
`firebase:authUser:<API_KEY>:<appName>`:

- **API key** — `value.apiKey` (falls back to the one embedded in the key name)
- **Refresh token** — `value.stsTokenManager.refreshToken`

Three buttons: Copy API key, Copy refresh token, and **Copy both** (as
`API_KEY=...` / `REFRESH_TOKEN=...`).

## How it works

1. On click, it injects a tiny reader into the **active tab** (temporary access granted
   by `activeTab` — no broad permissions, nothing runs in the background).
2. The reader opens the page's own `firebaseLocalStorageDb` IndexedDB (same origin as
   the tab) — this is where the Firebase Web SDK stores the signed-in user.
3. It reads the API key and refresh token out of the record and shows them with
   copy buttons. If there are multiple signed-in accounts, pick one from the dropdown.

## Install (unpacked, for the team)

1. Go to `chrome://extensions`
2. Toggle **Developer mode** (top-right)
3. Click **Load unpacked** → select this `firebase-token-puller` folder
4. Pin it to the toolbar

**After editing the extension** (or pulling a new version): on `chrome://extensions`
click **Reload** on the Firebase Token Puller card, then open a tab where you're logged
into one of our apps and click the toolbar icon. The intro plays once, then you get the
API key + refresh token with copy buttons.

To share with partners: zip the folder and have them load it unpacked the same way,
or package it as a `.crx` / publish as an **unlisted/private** Chrome Web Store item.

## Assumptions / limits

- Works with the **Firebase JS SDK** (v8 and v9+ modular) which uses IndexedDB. If an
  app stores auth somewhere custom, the reader needs a tweak.
- The token is read from the tab you're viewing — log in first.
- Permissions are minimal: `activeTab`, `scripting`, `storage` (the `storage` one is
  only for the intro's once-per-session gate). **No `host_permissions`** — nothing runs
  in the background and no broad site access is requested.

## Optional hardening

- Lock it to only our domains: add a `content_scripts.matches` list or convert the
  reader to a declared content script instead of `activeTab`.

## Toolbar icon

Ships with the ActivationAgents purple **A** mark as the toolbar/extension icon
(`icons/icon16|32|48|128.png`, transparent PNGs declared under both `icons` and
`action.default_icon` in the manifest).
