// Sends the phone to the TV's own page on the local network, and says so plainly when the TV does not answer
// (DECISIONS.md §29). While a navigation is pending the browser keeps this page on screen and its script running, so
// after REACH_MS without an answer it stops the attempt and tells the person what is wrong instead of a browser timeout.
"use strict";

const REACH_MS = 8000;

/** Private IPv4 + unprivileged port, the only places these pages ever send a phone to. */
function lanHost(a, b, c, d, port) {
  if ([a, b, c, d].some((n) => n > 255) || port < 1024 || port > 65535) return false;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

const SAME_WIFI = {
  fr: "Ton téléphone doit être sur le même Wi-Fi que la TV.",
  en: "Your phone must be on the same Wi-Fi as the TV.",
};

function say(title, text) {
  document.getElementById("title").textContent = title;
  document.getElementById("text").textContent = text.replace("Wi-Fi", "Wi\u2011Fi"); // never cut at the hyphen
}

/** The TV did not answer: say why, and offer a new attempt (with its own timer). */
function tvUnreachable(target, en, replace, back) {
  // [back]: come back to this page, maybe from the TV's own page rather than from an error: no verdict then.
  const title = back ? (en ? "No answer from the TV?" : "Pas de réponse de la TV ?") : (en ? "The TV doesn't answer" : "La TV ne répond pas");
  say(title, en ? SAME_WIFI.en : SAME_WIFI.fr);
  const a = document.getElementById("go");
  a.href = target;
  a.textContent = en ? "Try again" : "Réessayer";
  a.onclick = (e) => { e.preventDefault(); a.hidden = true; goToTv(target, en, replace); };
  a.hidden = false;
}

function goToTv(target, en, replace) {
  say(en ? "Opening the TV's page…" : "Ouverture de la page de la TV…", en ? SAME_WIFI.en : SAME_WIFI.fr);
  let left = false;
  addEventListener("pagehide", () => { left = true; }, { once: true });
  setTimeout(() => {
    if (left) return;
    window.stop(); // the browser would otherwise wait a minute and show its own error page
    tvUnreachable(target, en, replace);
  }, REACH_MS);
  // After the load event: a navigation started while the page still loads replaces its history entry, and « back »
  // from the browser's error page must find this page (tv.js explains instead of bouncing).
  const go = () => setTimeout(() => (replace ? location.replace(target) : location.assign(target)), 0);
  if (document.readyState === "complete") go();
  else addEventListener("load", go, { once: true });
}

if (typeof module !== "undefined") module.exports = { lanHost, SAME_WIFI };
