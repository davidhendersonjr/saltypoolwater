# Wiring the emblems into saltypoolwater

Four new files go in `frontend\src\emblem\`:

- `emblemParts.jsx` — every fin, color, floatie, water, and extra (add new parts here)
- `Emblem.jsx` — draws one emblem from a `{fin, color, floatie, water, extra}` object
- `EmblemPicker.jsx` — the tabbed customizer dialog
- `UserMenu.jsx` — the little shark in the top-right corner + its menu
- `emblem.css` — styles for all of the above

## 1. Styles

First line of `styles.css` (next to the scoring import):

```css
@import "./emblem/emblem.css";
```

## 2. api.js — two new calls

Saves go to the API when it exists and fall back to the browser's storage
until you add the endpoint, so the picker works today.

```js
// --- emblems ---
const EMBLEM_KEY = "spw-emblem";

export async function getEmblem() {
  try {
    const r = await fetch("/api/me/emblem");
    if (r.ok) return (await r.json()).emblem;
  } catch {}
  try { return JSON.parse(localStorage.getItem(EMBLEM_KEY)); } catch { return null; }
}

export async function saveEmblem(emblem) {
  try {
    const r = await fetch("/api/me/emblem", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emblem }),
    });
    if (r.ok) return (await r.json()).emblem;
    if (r.status === 401) throw new Error("Sign in to save your shark.");
  } catch (e) {
    if (e.message.startsWith("Sign in")) throw e;
  }
  localStorage.setItem(EMBLEM_KEY, JSON.stringify(emblem));
  return emblem;
}
```

Then add them to the `api` object: `getEmblem, saveEmblem,`.

## 3. App.jsx

Imports at the top:

```jsx
import Emblem from "./emblem/Emblem.jsx";
import UserMenu from "./emblem/UserMenu.jsx";
import { emblemFromName } from "./emblem/emblemParts.jsx";
```

State, next to `const [me, setMe] = useState(null);`:

```jsx
const [emblem, setEmblem] = useState(null);
```

In `refresh()`, after `setMe(meRes);`:

```jsx
if (meRes?.signedIn) {
  const saved = await api.getEmblem();
  setEmblem(saved || emblemFromName(meRes.userDetails));
}
```

A save handler next to `vote` / `comment`:

```jsx
async function saveEmblem(next) {
  const saved = await api.saveEmblem(next);
  setEmblem(saved);
}
```

Replace the signed-in half of the auth row. This:

```jsx
<span className="spw-who">🧂 {me.userDetails}</span>
<a className="spw-linkbtn" href={logoutUrl}>Sign out</a>
```

becomes:

```jsx
<span className="spw-who">🧂 {me.userDetails}</span>
```

and add the menu as the first child of `<header className="spw-header">`:

```jsx
{signedIn && (
  <UserMenu me={me} emblem={emblem} onSaveEmblem={saveEmblem} logoutUrl={logoutUrl} />
)}
```

(Sign out now lives in the menu. Keep the old link too if you want both.)

## 4. Emblems next to authors

In the post meta line, replace `{c.author} · ` with:

```jsx
<span className="spw-author">
  <Emblem emblem={c.authorEmblem || emblemFromName(c.author)} size={18} />
  {c.author}
</span>
{" · "}
```

and in the comment loop, replace `<span className="who">{m.author}</span>` with:

```jsx
<span className="who spw-author">
  <Emblem emblem={m.authorEmblem || emblemFromName(m.author)} size={16} />
  {m.author}
</span>
```

Until the API stores emblems, every author gets a consistent shark generated
from their username, so the feed looks populated from day one.

## 5. API (when you're ready)

Two routes on the Functions app:

- `GET /api/me/emblem` → `{ emblem }` for the signed-in user (404 if none)
- `PUT /api/me/emblem` with body `{ emblem }` → validates that each of
  `fin, color, floatie, water, extra` is a string under 32 chars, stores it
  on the user record, returns `{ emblem }`

Then, when writing a complaint or comment, copy the author's current
emblem onto the document as `authorEmblem` so the feed can render it
without a lookup per post. That's the whole backend change.

## Adding parts later

Each list in `emblemParts.jsx` is self-contained. A new fin is one path in
a 128×128 box with its base on y=92 and a `tip` for the extras to hang off.
A new floatie has a `back` and `front` half split at the waterline. Nothing
else needs to change — the picker reads the lists.
