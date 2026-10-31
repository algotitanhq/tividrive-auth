# tividrive-auth

The page Google sends the phone back to after a Tividrive pairing: <https://tividrive-auth.storagebits.workers.dev/google>.

Static assets only (`public/`), no Worker code, no cookie, no storage. The page reads the code Google returns and sends
the phone on to the TV's pairing server on the local network (private IPv4 addresses, ports from 1024, only). It holds
no secret: the code is useless without the PKCE verifier the TV keeps.

Source of truth: `web/google-redirect/` in the Tividrive app repository; this repo is its deploy copy. `node test.js`
tests it. CI deploys `main` to Cloudflare once the repository variable `PUBLIC_RELEASE` is `true`.
