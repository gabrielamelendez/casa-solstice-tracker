import { useMemo, useState } from "react";
import { PortalHeader, PortalFooter } from "./PortalShell";
import LeRsvpShell from "./LeRsvpShell";
import { useCollection, normalize } from "../../lib/portalStore";
import { themeVars } from "../../portals";

// Public page: each guest finds their invitation by name and answers.
// Only names matching the search are shown — never the full list.
// A portal can swap the frame around the form with `rsvpLayout` (e.g. "le").

function matchGuests(guests, q) {
  const words = normalize(q).split(/\s+/).filter(w => w.length >= 2);
  if (normalize(q).length < 3 || !words.length) return [];
  return guests
    .filter(g => { const n = normalize(g.name); return words.every(w => n.includes(w)); })
    .slice(0, 5);
}

function DefaultShell({ portal, children }) {
  return (
    <div className="portal rsvp-page" style={themeVars(portal.theme)}>
      <PortalHeader portal={portal} eyebrow="Confirma tu asistencia" />
      <main className="rsvp-main">{children}</main>
      <PortalFooter />
    </div>
  );
}

const SHELLS = { le: LeRsvpShell };

function calendarUrl(portal) {
  const ev = portal.event;
  if (!ev?.start) return null;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `Boda de ${portal.names}`,
    dates: `${ev.start}/${ev.end || ev.start}`,
    location: [ev.venue, ev.city].filter(Boolean).join(", "),
    details: ev.dressCode ? `Código de vestimenta: ${ev.dressCode}` : "",
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export default function Rsvp({ portal }) {
  const { rows: guests, save, loaded } = useCollection("guests", portal.project);
  const [q, setQ] = useState("");
  const [guestId, setGuestId] = useState(null);
  const [step, setStep] = useState("search"); // search | form | done
  const [answer, setAnswer] = useState(null);  // "si" | "no"
  const [count, setCount] = useState(1);
  const [dietary, setDietary] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const copy = portal.rsvpCopy || {};
  const ev = portal.event;
  const Shell = SHELLS[portal.rsvpLayout] || DefaultShell;
  const matches = useMemo(() => matchGuests(guests, q), [guests, q]);
  const guest = guests.find(g => g.id === guestId);
  const calUrl = calendarUrl(portal);

  const pick = (g) => {
    setGuestId(g.id);
    setAnswer(g.rsvp === "Confirmado" ? "si" : g.rsvp === "No asiste" ? "no" : null);
    setCount(g.attending || g.invited || 1);
    setDietary(g.dietary || "");
    setMessage(g.message || "");
    setError("");
    setStep("form");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!answer) { setError("Cuéntanos si podrás acompañarnos."); return; }
    setSending(true);
    const ok = await save({
      id: guest.id,
      rsvp: answer === "si" ? "Confirmado" : "No asiste",
      attending: answer === "si" ? Number(count) : 0,
      dietary: answer === "si" ? (dietary.trim() || null) : guest.dietary ?? null,
      message: message.trim() || null,
      responded_at: new Date().toISOString(),
    });
    setSending(false);
    if (!ok) { setError("No pudimos enviar tu respuesta. Revisa tu conexión e inténtalo de nuevo."); return; }
    setStep("done");
  };

  return (
    <Shell portal={portal} step={step}>
      {step === "search" && (
        <section className="p-card rsvp-card">
          <h2 className="rsvp-title">{copy.title || "Nos encantaría celebrar contigo"}</h2>
          <p className="rsvp-lead">{copy.lead || "Escribe tu nombre o apellido como aparece en tu invitación."}</p>
          {portal.rsvpBy && <p className="rsvp-by">Responder antes del {portal.rsvpBy}</p>}
          <input className="rsvp-search" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Tu nombre o apellido" aria-label="Tu nombre" autoComplete="name" />
          {normalize(q).length >= 3 && (
            <div className="rsvp-results" aria-live="polite">
              {!loaded && <p className="p-help">Buscando…</p>}
              {loaded && matches.map(g => (
                <button type="button" key={g.id} className="rsvp-result" onClick={() => pick(g)}>
                  <span>{g.name}</span>
                  <small>{g.rsvp === "Pendiente" ? "Responder →" : "Ya respondiste · cambiar →"}</small>
                </button>
              ))}
              {loaded && matches.length === 0 && (
                <p className="p-help">
                  No encontramos ese nombre. Prueba solo con tu apellido
                  {ev?.phone ? <>, o escríbenos al <a href={`https://wa.me/1${ev.phone.replace(/\D/g, "")}`}>{ev.phone}</a>.</> : ", o escríbele a los novios."}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {step === "form" && guest && (
        <form className="p-card rsvp-card" onSubmit={submit}>
          <button type="button" className="rsvp-back" onClick={() => setStep("search")}>← No soy yo</button>
          <h2 className="rsvp-title">{guest.name}</h2>
          <p className="rsvp-lead">
            {guest.invited > 1 ? `Tu invitación es para ${guest.invited} personas.` : "Tu invitación es personal."}
          </p>

          <div className="rsvp-choice" role="radiogroup" aria-label="¿Nos acompañas?">
            <button type="button" role="radio" aria-checked={answer === "si"} className={answer === "si" ? "on" : ""} onClick={() => { setAnswer("si"); setError(""); }}>
              {copy.yes || "Sí, ahí estaré"}
            </button>
            <button type="button" role="radio" aria-checked={answer === "no"} className={answer === "no" ? "on" : ""} onClick={() => { setAnswer("no"); setError(""); }}>
              {copy.no || "No podré asistir"}
            </button>
          </div>

          {answer === "si" && (
            <>
              {guest.invited > 1 && (
                <label className="f full"><span>¿Cuántas personas asistirán?</span>
                  <select value={count} onChange={e => setCount(e.target.value)}>
                    {Array.from({ length: guest.invited }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>)}
                  </select>
                </label>
              )}
              <label className="f full"><span>Alergias o restricciones alimentarias</span>
                <input value={dietary} onChange={e => setDietary(e.target.value)} placeholder="Opcional · ej. vegetariano, sin mariscos" />
              </label>
            </>
          )}
          <label className="f full"><span>Un mensaje para los novios</span>
            <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Opcional" maxLength={500} />
          </label>
          {error && <p className="rsvp-error" role="alert">{error}</p>}
          <button className="p-btn rsvp-submit" type="submit" disabled={sending}>{sending ? "Enviando…" : "Enviar respuesta"}</button>
        </form>
      )}

      {step === "done" && guest && (
        <section className="p-card rsvp-card rsvp-done">
          <div className="rsvp-mark" aria-hidden="true">✦</div>
          <h2 className="rsvp-title">{answer === "si" ? (copy.doneYes || "¡Gracias por confirmar!") : (copy.doneNo || "Gracias por avisarnos")}</h2>
          {answer === "si" && ev ? (
            <>
              <p className="rsvp-lead">
                Te esperamos{Number(count) > 1 ? ` · ${count} personas` : ""}.
              </p>
              <dl className="rsvp-event">
                <div><dt>Cuándo</dt><dd>{ev.dateLong} · {ev.time}</dd></div>
                <div><dt>Dónde</dt><dd>{ev.venue}<br />{ev.city}</dd></div>
                {ev.dressCode && <div><dt>Vestimenta</dt><dd>{ev.dressCode}</dd></div>}
              </dl>
              <div className="rsvp-actions">
                {calUrl && <a className="p-btn" href={calUrl} target="_blank" rel="noopener noreferrer">Agregar al calendario</a>}
                {ev.mapsUrl && <a className="p-btn ghost" href={ev.mapsUrl} target="_blank" rel="noopener noreferrer">Cómo llegar</a>}
              </div>
            </>
          ) : (
            <p className="rsvp-lead">
              {answer === "si"
                ? `Te esperamos el ${portal.dateLabel.split(" · ")[0]}${Number(count) > 1 ? ` · ${count} personas` : ""}.`
                : "Te vamos a extrañar. Gracias por tomarte el tiempo de responder."}
            </p>
          )}
          <button type="button" className="rsvp-change" onClick={() => setStep("form")}>Cambiar mi respuesta</button>
        </section>
      )}
    </Shell>
  );
}
