// Firebase Token Puller — popup logic
// Reads the Firebase Auth record from the active tab's IndexedDB
// (firebaseLocalStorageDb -> firebaseLocalStorage) and copies the
// API key and refresh token.

const $ = (id) => document.getElementById(id);
const statusDot = $("status-dot");

let users = []; // [{ email, apiKey, refreshToken, appName }]

/**
 * Runs IN the page's context (isolated world, same origin as the tab).
 * Content-script context shares the page origin's IndexedDB, so it can
 * read the Firebase Web SDK's stored auth record.
 *
 * Each row looks like:
 *   { fbase_key: "firebase:authUser:<API_KEY>:<appName>",
 *     value: { apiKey, stsTokenManager: { refreshToken, ... }, ... } }
 */
async function readFirebaseAuth() {
  const openDb = () =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open("firebaseLocalStorageDb");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  try {
    const db = await openDb();
    if (!db.objectStoreNames.contains("firebaseLocalStorage")) return { users: [] };
    const store = db
      .transaction("firebaseLocalStorage", "readonly")
      .objectStore("firebaseLocalStorage");
    const rows = await new Promise((resolve, reject) => {
      const r = store.getAll();
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });

    const users = [];
    for (const row of rows) {
      const key = row && row.fbase_key;
      if (!key || !key.startsWith("firebase:authUser:")) continue;
      const v = row.value || {};
      const stm = v.stsTokenManager || {};
      // key format: firebase:authUser:<API_KEY>:<appName>
      const parts = key.split(":");
      users.push({
        email: v.email || v.displayName || v.uid || "(unknown account)",
        apiKey: v.apiKey || parts[2] || "",
        refreshToken: stm.refreshToken || "",
        appName: v.appName || parts.slice(3).join(":") || "",
      });
    }
    return { users };
  } catch (e) {
    return { error: String(e) };
  }
}

async function readFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) throw new Error("No active tab.");
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: readFirebaseAuth,
  });
  if (result && result.error) throw new Error(result.error);
  return (result && result.users) || [];
}

function current() {
  if (users.length <= 1) return users[0];
  return users[Number($("account").value)] || users[0];
}

function showSelected() {
  const u = current();
  $("apiKey").value = u.apiKey;
  $("refreshToken").value = u.refreshToken;
  const meta = $("meta");
  meta.classList.remove("err");
  const missing = [];
  if (!u.apiKey) missing.push("API key");
  if (!u.refreshToken) missing.push("refresh token");
  if (missing.length) {
    meta.classList.add("err");
    meta.textContent = "Missing: " + missing.join(", ") + " — check the record in DevTools.";
  } else {
    meta.textContent = "";
  }
}

function render() {
  const sel = $("account");
  const stat = $("accountStatic");
  if (users.length > 1) {
    // Multiple signed-in accounts: offer the dropdown.
    sel.innerHTML = "";
    users.forEach((u, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = u.email;
      sel.appendChild(opt);
    });
    sel.classList.remove("hidden");
    stat.classList.add("hidden");
  } else {
    // Single account: show it as a plain read-only field, not a dropdown.
    stat.value = users[0] ? users[0].email : "";
    stat.classList.remove("hidden");
    sel.classList.add("hidden");
  }
  showSelected();
}

async function flash(btn, text = "Copied ✓") {
  const old = btn.textContent;
  btn.textContent = text;
  setTimeout(() => (btn.textContent = old), 1200);
}

async function init() {
  try {
    users = await readFromActiveTab();
  } catch (e) {
    $("loading").classList.add("hidden");
    statusDot.classList.add("err");
    const empty = $("empty");
    empty.classList.remove("hidden");
    empty.textContent =
      "Couldn't read this tab: " + e.message + " — open your app's tab, then click the icon.";
    return;
  }

  $("loading").classList.add("hidden");
  if (users.length === 0) {
    statusDot.classList.add("err");
    const empty = $("empty");
    empty.classList.remove("hidden");
    empty.textContent =
      "No Firebase session found on this tab. Log into your app first, then reopen this.";
    return;
  }

  statusDot.classList.add("ok");
  $("main").classList.remove("hidden");
  render();

  $("account").addEventListener("change", showSelected);

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const val = $(btn.dataset.src).value;
      await navigator.clipboard.writeText(val);
      flash(btn);
    });
  });

  $("copyBoth").addEventListener("click", async (e) => {
    const u = current();
    const payload = `API_KEY=${u.apiKey}\nREFRESH_TOKEN=${u.refreshToken}`;
    await navigator.clipboard.writeText(payload);
    flash(e.currentTarget, "Copied both ✓");
  });
}

init();
