import { useEffect, useRef, useState } from "react";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "./le-web.css";

// Lynette & Eduardo · wedding website, built from Gaby's Figma ("Website L&E").
// Content (dates, venue, links) comes from the L&E entry in portals.js.

const A = "/assets/le/web";
const WEDDING_AT = new Date("2027-03-20T18:00:00-04:00");
const OPENED_KEY = "le_web_opened";

function readOpened() {
  try { return sessionStorage.getItem(OPENED_KEY) === "1"; } catch { return false; }
}
function saveOpened() {
  try { sessionStorage.setItem(OPENED_KEY, "1"); } catch { /* private mode */ }
}

function useCountdown(target) {
  const calc = () => {
    const ms = Math.max(0, target.getTime() - Date.now());
    const s = Math.floor(ms / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60, done: ms === 0 };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return t;
}

function useReveal(rootRef, active) {
  useEffect(() => {
    if (!active || !rootRef.current) return;
    const els = rootRef.current.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach(el => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [rootRef, active]);
}

const pad = n => String(n).padStart(2, "0");

function Intro({ onOpen }) {
  const [opening, setOpening] = useState(false);
  const open = () => {
    if (opening) return;
    setOpening(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    setTimeout(onOpen, reduce ? 0 : 1100);
  };
  return (
    <div className={"lw-intro" + (opening ? " opening" : "")} role="dialog" aria-label="Invitación de Lynette & Eduardo">
      <img className="lw-flores lw-flores-l" src={`${A}/flores-izq.webp`} alt="" aria-hidden="true" />
      <img className="lw-flores lw-flores-r" src={`${A}/flores-der.webp`} alt="" aria-hidden="true" />
      <div className="lw-intro-inner">
        <p className="lw-intro-kicker">Nos vamos a casar</p>
        <img className="lw-intro-firma" src={`${A}/firma.webp`} alt="Lynette & Eduardo" width="2002" height="360" />
        <button type="button" className="lw-envelope" onClick={open} aria-label="Abrir la invitación">
          <img className="lw-envelope-body" src={`${A}/sobre-cerrado.webp`} alt="" width="439" height="311" />
          <img className="lw-envelope-seal" src={`${A}/sello.webp`} alt="" width="360" height="347" />
        </button>
        <p className="lw-intro-cta">Dale click al sobre para abrir</p>
      </div>
    </div>
  );
}

export default function LeWedding({ portal }) {
  const ev = portal.event || {};
  const rsvpHref = `/${portal.slug}/rsvp`;
  const wa = ev.phone ? `https://wa.me/1${ev.phone.replace(/\D/g, "")}` : null;
  const [opened, setOpened] = useState(readOpened);
  const rootRef = useRef(null);
  const t = useCountdown(WEDDING_AT);
  useReveal(rootRef, opened);

  useEffect(() => {
    const prev = document.title;
    document.title = "Lynette & Eduardo · 20 de marzo, 2027";
    return () => { document.title = prev; };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("lw-locked", !opened);
    return () => document.documentElement.classList.remove("lw-locked");
  }, [opened]);

  const handleOpen = () => { saveOpened(); setOpened(true); window.scrollTo(0, 0); };
  const registry = ev.registry || {};

  return (
    <div className={"lw" + (opened ? " is-open" : "")} ref={rootRef}>
      {!opened && <Intro onOpen={handleOpen} />}

      {/* HERO — the invitation suite */}
      <header className="lw-hero">
        <div className="lw-hero-stage">
          <img className="lw-hero-vine" src={`${A}/enredadera.webp`} alt="" aria-hidden="true" />
          <img className="lw-h lw-h-stamps" src={`${A}/sellos-blancos.webp`} alt="" aria-hidden="true" />
          <img className="lw-h lw-h-envelope" src={`${A}/sobre-abierto.webp`} alt="" aria-hidden="true" />

          <div className="lw-h lw-card">
            <img src={`${A}/invitacion.webp`} alt="" aria-hidden="true" />
            <div className="lw-card-text">
              <p className="lw-card-small">Con la bendición de Dios y de nuestros padres, nosotros</p>
              <h1 className="lw-card-names">
                <span>Lynette</span><span className="lw-amp">&amp;</span><span>Eduardo</span>
              </h1>
              <p className="lw-card-small">Nos complace que seas parte del inicio de esta nueva etapa, que se llevará a cabo el día</p>
              <p className="lw-card-date">Sábado 20 de marzo<br />del 2027</p>
              <p className="lw-card-venue">{ev.time || "6:00 PM"}. Casa de España, Salón Terraza del Mar, Santo Domingo, República Dominicana</p>
            </div>
          </div>

          <img className="lw-h lw-h-dahlia" src={`${A}/dalia.webp`} alt="" aria-hidden="true" />

          <div className="lw-h lw-tag lw-tag-rsvp">
            <img src={`${A}/tarjeta-rsvp.webp`} alt="" aria-hidden="true" />
            <div className="lw-tag-text">
              <h2 className="sr-only">RSVP</h2>
              <p>Haz clic abajo para confirmar que serás parte de este comienzo.</p>
              <p className="lw-tag-by">Responder antes del 10 de febrero, 2027</p>
              <a className="lw-tag-link" href={rsvpHref}>Confirmar</a>
            </div>
          </div>

          <div className="lw-h lw-tag lw-tag-gifts">
            <img src={`${A}/tarjeta-regalos.webp`} alt="" aria-hidden="true" />
            <div className="lw-tag-text">
              <h2 className="sr-only">Regalos</h2>
              <p>Hemos creado una lista con detalles que nos ayudarán a dar inicio a nuestra vida juntos.</p>
              {registry.casaCuesta && <a className="lw-tag-link" href={registry.casaCuesta} target="_blank" rel="noopener noreferrer">Casa Cuesta</a>}
              {registry.amazon && <a className="lw-tag-link" href={registry.amazon} target="_blank" rel="noopener noreferrer">Amazon</a>}
            </div>
          </div>
        </div>
      </header>

      {/* HISTORIA */}
      <section className="lw-story" aria-labelledby="lw-story-title">
        <img className="lw-flores lw-flores-l" src={`${A}/flores-izq.webp`} alt="" aria-hidden="true" />
        <img className="lw-flores lw-flores-r" src={`${A}/flores-der.webp`} alt="" aria-hidden="true" />
        <img className="lw-story-vine" src={`${A}/enredadera.webp`} alt="" aria-hidden="true" />
        <div className="lw-inner" data-reveal>
          <div className="lw-photostamps" aria-hidden="true">
            <img className="lw-ps-1" src={`${A}/sello-foto-1.webp`} alt="" />
            <img className="lw-ps-2" src={`${A}/sello-foto-2.webp`} alt="" />
          </div>
          <h2 id="lw-story-title" className="lw-title lw-title-light">Wherever we are, we’re home</h2>
          <div className="lw-story-text">
            <p>Nos conocimos entre amigos, en una historia que parecía destinada a cruzarse mucho antes de encontrar el momento exacto para comenzar.</p>
            <p>Ocho años después, nuestro amor vive en los detalles que más importan: una mesa compartida, un nuevo restaurante por descubrir, un viaje planeado alrededor de sabores y experiencias, y la tranquilidad de saber que la mejor parte de cualquier lugar siempre será encontrarnos el uno al otro.</p>
            <p>Hoy, queremos celebrar todo lo que hemos construido y dar la bienvenida a esta nueva etapa de nuestras vidas rodeados de las personas que más queremos. Nos haría mucha ilusión que fueras parte de nuestro gran día y que compartieras con nosotros el comienzo de este nuevo capítulo.</p>
          </div>
          <p className="lw-signoff">Con amor,</p>
          <img className="lw-firma" src={`${A}/firma.webp`} alt="Lynette & Eduardo" width="2002" height="360" />
        </div>
      </section>

      {/* UBICACIÓN + VESTIMENTA */}
      <section className="lw-place" aria-labelledby="lw-place-title">
        <div className="lw-inner" data-reveal>
          <img className="lw-door" src={`${A}/puerta.webp`} alt="Ilustración de la puerta de Casa de España" width="480" height="702" />
          <h2 id="lw-place-title" className="lw-title">Nos encontramos aquí</h2>
          <p className="lw-lead">Una buena mesa, nuestra gente favorita y una ocasión para celebrar. Te compartimos la dirección de Casa de España para encontrarnos y crear recuerdos juntos.</p>
          {ev.mapsUrl && <a className="lw-pill" href={ev.mapsUrl} target="_blank" rel="noopener noreferrer">Cómo llegar</a>}
        </div>
        <div className="lw-dress" data-reveal>
          <img className="lw-dress-frame" src={`${A}/marco-vestimenta.webp`} alt="" aria-hidden="true" />
          <div className="lw-dress-text">
            <h2 className="lw-title lw-title-sm">Código de vestimenta</h2>
            <p className="lw-dress-kind">Formal Attire</p>
            <p>Para las damas, sugerimos vestido largo, acorde con la elegancia y el carácter formal de la celebración.</p>
            <p>Para los caballeros, requerimos vestimenta formal con saco.</p>
            <p className="lw-dress-note"><em>Importante:</em> No se permiten chacabanas de ningún tipo.</p>
          </div>
        </div>
        <img className="lw-place-dahlia" src={`${A}/dalia.webp`} alt="" aria-hidden="true" />
      </section>

      {/* CUENTA REGRESIVA */}
      <section className="lw-count" aria-labelledby="lw-count-title">
        <img className="lw-count-photo" src={`${A}/foto-cuenta.webp`} alt="Lynette y Eduardo frente a una reja de hierro" />
        <div className="lw-count-shade" aria-hidden="true" />
        <div className="lw-count-inner" data-reveal>
          <h2 id="lw-count-title" className="lw-title lw-title-light">{t.done ? "¡Llegó el día!" : "Cada vez falta menos…"}</h2>
          <div className="lw-count-grid" role="timer" aria-live="off">
            {[["Días", t.d], ["Horas", pad(t.h)], ["Minutos", pad(t.m)], ["Segundos", pad(t.s)]].map(([label, v]) => (
              <div key={label} className="lw-count-cell">
                <span className="lw-count-num">{v}</span>
                <span className="lw-count-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <img className="lw-count-stamps" src={`${A}/sellos-blancos.webp`} alt="" aria-hidden="true" />
      </section>

      {/* LOS MOMENTOS */}
      <section className="lw-moments" aria-labelledby="lw-moments-title">
        <div className="lw-moments-inner">
          <div className="lw-frame" data-reveal>
            <img className="lw-frame-border" src={`${A}/marco-rosado.webp`} alt="" aria-hidden="true" />
            <img className="lw-frame-photo" src={`${A}/foto-momentos.webp`} alt="Lynette y Eduardo" />
          </div>
          <div className="lw-moments-text" data-reveal>
            <h2 id="lw-moments-title" className="lw-moments-title">Los momentos</h2>
            <p className="lw-moments-sub">que nos esperan</p>
            <ol className="lw-timeline">
              {[
                ["6:00 PM", "El comienzo de nuestro siempre", "Ceremonia"],
                ["9:00 PM", "A la mesa", "Cena y buena compañía"],
                ["10:00 PM", "Que siga la fiesta", "Baile, música y hora loca"],
                ["2:00 AM", "Hasta la próxima", "Despedida"],
              ].map(([time, title, sub]) => (
                <li key={time}>
                  <span className="lw-tl-time">{time}</span>
                  <span className="lw-tl-body"><strong>{title}</strong><span>{sub}</span></span>
                </li>
              ))}
            </ol>
            <a className="lw-pill lw-pill-solid" href={rsvpHref}>Confirmar asistencia</a>
          </div>
        </div>
      </section>

      {/* CIERRE */}
      <footer className="lw-close">
        <div className="lw-close-inner" data-reveal>
          <p className="lw-signoff">Con amor,</p>
          <img className="lw-firma" src={`${A}/firma.webp`} alt="Lynette & Eduardo" width="2002" height="360" />
          {ev.phone && (
            <p className="lw-contact">Para más información, por favor escríbenos:<br />
              <a href={wa} target="_blank" rel="noopener noreferrer">{ev.phone}</a>
            </p>
          )}
        </div>
        <img className="lw-ribbon" src={`${A}/lazo-cierre.webp`} alt="March 20th, 2027" width="1668" height="540" />
      </footer>
    </div>
  );
}
