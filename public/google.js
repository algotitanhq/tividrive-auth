// Tividrive's Google sign-in comes back here (DECISIONS.md §21 in storagebits/dropbokstv). This page keeps nothing:
// it reads the TV's LAN address from the OAuth state, and sends the phone on to the TV with the code. The code is
// useless without the PKCE verifier, which never leaves the TV. Only private IPv4 addresses are accepted, so the page
// can never send a code anywhere on the Internet.
"use strict";

/** The TV URL for this redirect's query string, or null when it does not come from Tividrive. */
function tvTarget(search) {
  const q = new URLSearchParams(search);
  const state = q.get("state") || "";
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})_(\d{1,5})_[A-Za-z0-9]{16,64}$/.exec(state);
  if (!m) return null;
  const [a, b, c, d] = m.slice(1, 5).map(Number);
  const port = Number(m[5]);
  const lanHost = typeof module !== "undefined" ? require("./reach.js").lanHost : globalThis.lanHost;
  if (!lanHost(a, b, c, d, port)) return null;
  const out = new URLSearchParams({ state });
  const code = q.get("code");
  if (code) out.set("code", code);
  else out.set("error", (q.get("error") || "unknown").slice(0, 40));
  return `http://${a}.${b}.${c}.${d}:${port}/google/done?${out}`;
}

if (typeof module !== "undefined") module.exports = { tvTarget };

if (typeof document !== "undefined") {
  const en = (navigator.language || "").toLowerCase().startsWith("en");
  const target = tvTarget(location.search);
  // The code leaves the address bar and the history at once.
  history.replaceState(null, "", location.pathname);
  const set = (title, text) => {
    document.getElementById("title").textContent = title;
    document.getElementById("text").textContent = text;
  };
  if (!target) {
    set(en ? "This link isn't from Tividrive" : "Ce lien ne vient pas de Tividrive",
      en ? "Scan the QR code shown on the TV." : "Scannez le code QR affiché sur la télé.");
  } else {
    goToTv(target, en, true); // replace: the page with the code must not come back with « back »
  }
}
