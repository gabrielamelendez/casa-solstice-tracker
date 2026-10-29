// Casa Solstice · protects the Studio Tracker ("/") with a password.
// Runs on Vercel before the page is served. Client portals (/selvara, /selvara/rsvp…)
// are not matched and stay open.
//
// Set the password in Vercel → Project Settings → Environment Variables:
//   STUDIO_PASSWORD = <your password>
// then redeploy. Without it, the Studio stays locked.

import { next } from "@vercel/functions";

export const config = { matcher: ["/", "/index.html"] };

const COOKIE = "cs_studio";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

async function tokenFor(password) {
  const data = new TextEncoder().encode(`cs-studio-v1:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  const match = header.split(/;\s*/).find(c => c.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function page({ error = "", missing = false } = {}) {
  const body = missing
    ? `<p class="lead">Falta configurar la contraseña.</p>
       <p class="hint">En Vercel → Settings → Environment Variables agrega <b>STUDIO_PASSWORD</b> y vuelve a publicar.</p>`
    : `<form method="POST" action="/">
         <label for="pw">Contraseña</label>
         <input id="pw" name="password" type="password" autocomplete="current-password" autofocus required>
         ${error ? `<p class="err" role="alert">${error}</p>` : ""}
         <button type="submit">Entrar</button>
       </form>`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Casa Solstice · Studio</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FAF5EE;color:#1E130C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:16px}
.card{width:100%;max-width:360px;background:#fff;border:1px solid #EDE0CE;border-radius:14px;padding:32px 24px;text-align:center;box-shadow:0 10px 30px rgba(30,19,12,.06)}
.eyebrow{font-size:10px;letter-spacing:.32em;text-transform:uppercase;color:#6B4E3D;margin-bottom:8px}
h1{font-family:Georgia,serif;font-style:italic;font-weight:400;font-size:30px;color:#5C1A1A;margin:0 0 22px}
label{display:block;text-align:left;font-size:11px;font-weight:600;color:#6B4E3D;margin-bottom:6px}
input{width:100%;font-size:16px;padding:12px;border:1px solid #EDE0CE;border-radius:10px;background:#FAF5EE;margin-bottom:12px}
input:focus{outline:2px solid #89203B;outline-offset:-1px}
button{width:100%;font-size:15px;font-weight:600;padding:13px;border:none;border-radius:10px;background:#5C1A1A;color:#fff;cursor:pointer}
.err{color:#8A2A2A;background:#F6E3E3;border-radius:8px;padding:8px;font-size:13px;margin:0 0 12px}
.lead{margin:0 0 8px}.hint{font-size:13px;color:#6B4E3D;line-height:1.5;margin:0}
</style></head><body><main class="card">
<div class="eyebrow">Casa Solstice</div><h1>Studio Tracker</h1>${body}
</main></body></html>`;
  return new Response(html, {
    status: missing ? 503 : error ? 401 : 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

// Wedding-site domains (aliases of this project) show the couple's site at "/", no password.
const PUBLIC_HOSTS = ["lynetteandeduardo.vercel.app", "lynetteyeduardo.vercel.app"];

export default async function middleware(request) {
  if (PUBLIC_HOSTS.includes(new URL(request.url).hostname)) return next();
  const password = process.env.STUDIO_PASSWORD;
  if (!password) return page({ missing: true });

  const expected = await tokenFor(password);
  const url = new URL(request.url);

  if (url.searchParams.has("salir")) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/", "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` },
    });
  }

  if (request.method === "POST") {
    let given = "";
    try { given = String((await request.formData()).get("password") || ""); } catch { /* bad body */ }
    if (given && (await tokenFor(given)) === expected) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/",
          "Set-Cookie": `${COOKIE}=${expected}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }
    return page({ error: "Contraseña incorrecta." });
  }

  if (readCookie(request, COOKIE) === expected) {
    return next();
  }
  return page();
}
