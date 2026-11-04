// node web/google-redirect/test.js: the redirect page's only logic, tvTarget.
"use strict";
const assert = require("node:assert");
const { tvTarget } = require("./public/google.js");
const s = "a".repeat(24);
assert.strictEqual(tvTarget(`?state=192.168.1.20_8739_${s}&code=4/0Ab-x&scope=email`), `http://192.168.1.20:8739/google/done?state=192.168.1.20_8739_${s}&code=4%2F0Ab-x`);
assert.strictEqual(tvTarget(`?state=10.0.0.5_8740_${s}&error=access_denied`), `http://10.0.0.5:8740/google/done?state=10.0.0.5_8740_${s}&error=access_denied`);
assert.ok(tvTarget(`?state=172.20.1.1_8739_${s}&code=c`));
for (const bad of [
  `?state=8.8.8.8_8739_${s}&code=c`, // public address: never
  `?state=172.32.0.1_8739_${s}&code=c`,
  `?state=192.168.1.300_8739_${s}&code=c`,
  `?state=192.168.1.2_80_${s}&code=c`, // privileged port
  `?state=evil.example_8739_${s}&code=c`,
  `?state=192.168.1.2_8739_short&code=c`,
  `?code=c`,
  `?state=192.168.1.2_8739_${s}%2F..&code=c`,
]) assert.strictEqual(tvTarget(bad), null, bad);
console.log("google redirect page: ok");

// The QR code's first stop (tv.html): the fragment names a LAN address, a kind and the nonce, nothing else.
const { tvPage } = require("./public/tv.js");
const n = "abcdefghjkmnpqrs23456789";
assert.strictEqual(tvPage(`#192.168.1.20_8739_g_${n}`), `http://192.168.1.20:8739/google?n=${n}`);
assert.strictEqual(tvPage(`#10.0.0.5_8740_d_${n}`), `http://10.0.0.5:8740/pair?n=${n}`);
for (const bad of [
  `#8.8.8.8_8739_g_${n}`, // public address: never
  `#192.168.1.20_80_g_${n}`, // privileged port
  `#192.168.1.20_8739_x_${n}`, // unknown kind
  `#192.168.1.20_8739_g_short`,
  `#192.168.1.20_8739_g_${n}/../evil`,
  `#evil.example_8739_g_${n}`,
  "",
]) assert.strictEqual(tvPage(bad), null, bad);
const { SAME_WIFI } = require("./public/reach.js");
assert.strictEqual(SAME_WIFI.fr, "Ton téléphone doit être sur le même Wi-Fi que la TV.");
assert.strictEqual(SAME_WIFI.en, "Your phone must be on the same Wi-Fi as the TV.");
console.log("tv page: ok");
