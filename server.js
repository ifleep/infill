// Custom server entry point for hosts (like Hostinger's Node.js App Manager,
// built on Phusion Passenger) that need a single JS file to require() and
// that hand the app its port via process.env.PORT, rather than running
// `next start` directly. Not used in local dev (`npm run dev` uses Next's
// own dev server) or in `npm run build` — only as the production entry point.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`INFiLLPK listening on port ${port}`);
  });
});
