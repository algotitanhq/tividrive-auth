// The QR code on the TV opens this page first (DECISIONS.md §29): unlike the TV's own page, the phone can always load
// it, so it can say « same Wi-Fi » when the TV is out of reach. The TV's address and the pairing nonce ride in the
// fragment (#192.168.1.20_8739_g_<nonce>), which the browser never sends to this server.
"use strict";

/** The TV page for this fragment ("g": Google, "d": Dropbox), or null when it does not come from Tividrive. */
function tvPage(hash) {
  const m = /^#?(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})_(\d{1,5})_([gd])_([a-z0-9]{16,64})$/.exec(hash || "");
  if (!m) return null;
  const [a, b, c, d] = m.slice(1, 5).map(Number);
  const port = Number(m[5]);
  const lanHost = typeof module !== "undefined" ? require("./reach.js").lanHost : globalThis.lanHost;
  if (!lanHost(a, b, c, d, port)) return null;
  return `http://${a}.${b}.${c}.${d}:${port}/${m[6] === "g" ? "google" : "pair"}?n=${m[7]}`;
}

if (typeof module !== "undefined") module.exports = { tvPage };

if (typeof document !== "undefined") {
  const en = (navigator.language || "").toLowerCase().startsWith("en");
  if (en) document.documentElement.lang = "en";
  const target = tvPage(location.hash);
  if (!target) {
    document.getElementById("title").textContent = en ? "This link isn't from Tividrive" : "Ce lien ne vient pas de Tividrive";
    document.getElementById("text").textContent = en ? "Scan the QR code shown on the TV." : "Scanne le code QR affiché sur la TV.";
  } else if (cameBack()) {
    tvUnreachable(target, en, false, true);
  } else {
    goToTv(target, en, false); // not replace: « back » after a browser error comes here, with the explanation
  }
  // Back from the browser's own error page (bfcache): explain, never bounce straight back to it.
  addEventListener("pageshow", (e) => { if (e.persisted && target) tvUnreachable(target, en, false, true); });
}

function cameBack() {
  const nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  return !!nav && nav.type === "back_forward";
}
