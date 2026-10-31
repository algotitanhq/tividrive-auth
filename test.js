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
