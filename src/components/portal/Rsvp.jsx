import { useMemo, useState } from "react";
import { PortalHeader, PortalFooter } from "./PortalShell";
import { useCollection, normalize } from "../../lib/portalStore";
import { themeVars } from "../../portals";

// Public page: each guest finds their invitation by name and answers.
// Only names matching the search are shown — never the full list.

function matchGuests(guests, q) {
  const words = normalize(q).split(/\s+/).filter(w => w.length >= 2);
  if (normalize(q).length < 3 || !words.length) return [];
  return guests
    .filter(g => { const n = normalize(g.name); return words.every(w => n.includes(w)); })
    .slice(0, 5);
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

  const matches = useMemo(() => matchGuests(guests, q), [guests, q]);
  const guest = guests.find(g => g.id === guestId);

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
    <div className="portal rsvp-page" style={themeVars(portal.theme)}>
      <PortalHeader portal={portal} eyebrow="Confirma tu asistencia" />
      <main className="rsvp-main">
        {step === "search" && (
          <section className="p-card rsvp-card">
            <h2 className="rsvp-title">Nos encantaría celebrar contigo</h2>
            <p className="rsvp-lead">Escribe tu nombre o apellido como aparece en tu invitación.</p>
            {portal.rsvpBy && <p className="rsvp-by">Por favor responde antes del {portal.rsvpBy}.</p>}
            <input className="rsvp-search" value={q} onChange={e => setQ(e.target.value)} autoFocus
              placeholder="Ej. Carolina Méndez" aria-label="Tu nombre" autoComplete="name" />
            {normalize(q).length >= 3 && (
              <div className="rsvp-results">
                {!loaded && <p className="p-help">Buscando…</p>}
                {loaded && matches.map(g => (
                  <button type="button" key={g.id} className="rsvp-result" onClick={() => pick(g)}>
                    <span>{g.name}</span>
                    <small>{g.rsvp === "Pendiente" ? "Responder →" : "Ya respondiste · cambiar →"}</small>
                  </button>
                ))}
                {loaded && matches.length === 0 && (
                  <p className="p-help">No encontramos ese nombre. Prueba solo con tu apellido, o escríbele a los novios.</p>
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
                Sí, ahí estaré
              </button>
              <button type="button" role="radio" aria-checked={answer === "no"} className={answer === "no" ? "on" : ""} onClick={() => { setAnswer("no"); setError(""); }}>
                No podré asistir
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
            <div className="rsvp-mark">✦</div>
            <h2 className="rsvp-title">{answer === "si" ? "¡Gracias por confirmar!" : "Gracias por avisarnos"}</h2>
            <p className="rsvp-lead">
              {answer === "si"
                ? `Te esperamos el ${portal.dateLabel.split(" · ")[0]}${Number(count) > 1 ? ` · ${count} personas` : ""}.`
                : "Te vamos a extrañar. Gracias por tomarte el tiempo de responder."}
            </p>
            <button type="button" className="p-btn ghost" onClick={() => setStep("form")}>Cambiar mi respuesta</button>
          </section>
        )}
      </main>
      <PortalFooter />
    </div>
  );
}
