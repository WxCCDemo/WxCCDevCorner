import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import path from "node:path";
import * as OTPAuth from "otpauth";

const root       = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port       = Number(process.env.PORT || 8788);
const secretFile = path.join(root, ".totp_secret");
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const types = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff2": "font/woff2",
  ".woff":  "font/woff",
};

// ── Session store ─────────────────────────────
const sessions = new Map();

function createSession() {
  const token = randomBytes(32).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function isValidSession(token) {
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp) return false;
  if (Date.now() > exp) { sessions.delete(token); return false; }
  return true;
}

// ── Cookie helpers ────────────────────────────
function parseCookies(header = "") {
  return Object.fromEntries(
    header.split(";").map((c) => c.trim().split("=").map(decodeURIComponent))
  );
}

function sessionCookie(token) {
  return `wxcc_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}; Path=/`;
}

// ── TOTP setup ────────────────────────────────
let totp;

async function loadOrCreateSecret() {
  let secret;
  if (process.env.TOTP_SECRET) {
    secret = process.env.TOTP_SECRET.trim();
  } else if (existsSync(secretFile)) {
    secret = (await readFile(secretFile, "utf8")).trim();
  } else {
    secret = new OTPAuth.Secret({ size: 20 }).base32;
    await writeFile(secretFile, secret, "utf8");
  }

  totp = new OTPAuth.TOTP({
    issuer:    "WxCC Dev Corner",
    label:     "wxcc-devcorner",
    algorithm: "SHA1",
    digits:    6,
    period:    30,
    secret:    OTPAuth.Secret.fromBase32(secret),
  });

  const uri    = totp.toString();
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🔐  TOTP Setup — WxCC Dev Corner");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Scan the QR code OR enter the secret manually");
  console.log("  into Google Authenticator or Microsoft Authenticator.\n");
  console.log(`  QR code URL (open in browser):\n  ${qrUrl}\n`);
  console.log(`  Manual secret:  ${secret}`);
  console.log(`  Account name:   wxcc-devcorner`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// ── Login page ────────────────────────────────
function loginPage(error = "") {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign in · WxCC Dev Corner</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #003d7a 0%, #0057a3 55%, #0072ce 100%);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
    }
    .card {
      background: #fff; border-radius: 14px; padding: 40px 36px 36px;
      width: 360px; box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }
    .icon { display: flex; justify-content: center; margin-bottom: 22px; }
    .icon svg { width: 48px; height: 48px; color: #0072ce; }
    h1 { margin: 0 0 4px; font-size: 22px; font-weight: 750; color: #0f1f2e; text-align: center; }
    .subtitle { margin: 0 0 28px; font-size: 13px; color: #526070; text-align: center; }
    label { display: block; font-size: 12px; font-weight: 700; color: #526070;
            text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
    input[type="text"] {
      width: 100%; padding: 12px 14px; font-size: 24px; font-weight: 700;
      letter-spacing: 6px; text-align: center;
      border: 1.5px solid #cdd8e3; border-radius: 8px; outline: none;
      color: #0f1f2e; transition: border-color .15s;
    }
    input[type="text"]::placeholder { letter-spacing: 2px; font-size: 16px; font-weight: 400; color: #b0bec5; }
    input[type="text"]:focus { border-color: #0072ce; }
    .hint { margin: 8px 0 20px; font-size: 12px; color: #526070; }
    .error { background: #fff3ec; border: 1px solid #f4c4a8; border-radius: 7px;
             padding: 10px 12px; color: #d4500a; font-size: 13px; font-weight: 600;
             margin-bottom: 18px; }
    button {
      width: 100%; padding: 13px; background: #0072ce; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 750;
      cursor: pointer; transition: background .15s;
    }
    button:hover { background: #0057a3; }
    .footer { margin-top: 20px; font-size: 11px; color: #a0aab4; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
        <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
        <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
      </svg>
    </div>
    <h1>WxCC Dev Corner</h1>
    <p class="subtitle">Enter your 6-digit authenticator code</p>
    ${error ? `<div class="error">&#9888; ${error}</div>` : ""}
    <form method="POST" action="/auth">
      <label for="code">Authenticator code</label>
      <input id="code" name="code" type="text" inputmode="numeric"
             pattern="[0-9]{6}" maxlength="6" placeholder="000000"
             autocomplete="one-time-code" autofocus required>
      <p class="hint">Open your authenticator app and enter the current code for <strong>wxcc-devcorner</strong>.</p>
      <button type="submit">Sign in &rarr;</button>
    </form>
    <p class="footer">Session lasts 8 hours &middot; Private workspace</p>
  </div>
</body>
</html>`;
}

// ── Parse body ────────────────────────────────
async function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => resolve(body));
  });
}

function parseForm(body) {
  return Object.fromEntries(new URLSearchParams(body));
}

// ── Server ────────────────────────────────────
await loadOrCreateSecret();

createServer(async (req, res) => {
  const url     = new URL(req.url, `http://localhost:${port}`);
  const cookies = parseCookies(req.headers["cookie"] || "");
  const token   = cookies["wxcc_session"];
  const method  = req.method.toUpperCase();

  // ── Auth endpoints ───────────────────────────
  if (url.pathname === "/login" && method === "GET") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(loginPage());
    return;
  }

  if (url.pathname === "/auth" && method === "POST") {
    const body  = await readBody(req);
    const { code } = parseForm(body);
    const delta = totp.validate({ token: (code || "").trim(), window: 1 });

    if (delta !== null) {
      const newToken = createSession();
      const redirect = cookies["wxcc_redirect"] || "/";
      res.writeHead(302, {
        "Set-Cookie": [
          sessionCookie(newToken),
          "wxcc_redirect=; Max-Age=0; Path=/; HttpOnly",
        ],
        "Location": redirect,
      });
      res.end();
    } else {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(loginPage("Incorrect code — please try again."));
    }
    return;
  }

  if (url.pathname === "/logout") {
    if (token) sessions.delete(token);
    res.writeHead(302, {
      "Set-Cookie": "wxcc_session=; Max-Age=0; Path=/; HttpOnly",
      "Location": "/login",
    });
    res.end();
    return;
  }

  // ── Session gate ──────────────────────────────
  if (!isValidSession(token)) {
    const redirectCookie = `wxcc_redirect=${encodeURIComponent(url.pathname)}; HttpOnly; SameSite=Strict; Max-Age=300; Path=/`;
    res.writeHead(302, {
      "Set-Cookie": redirectCookie,
      "Location": "/login",
    });
    res.end();
    return;
  }

  // ── Serve static files ────────────────────────
  const route    = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(root, route));

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (filePath === secretFile || filePath.endsWith(".totp_secret")) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
    res.end(body);
  } catch {
    // Try appending .html
    try {
      const htmlPath = filePath + ".html";
      const body = await readFile(htmlPath);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  }

}).listen(port, "0.0.0.0", () => {
  console.log(`\nWxCC Dev Corner running at http://127.0.0.1:${port}\n`);
});
