import { useEffect } from "react";
import "./le-rsvp.css";

// Frame for the L&E public RSVP, matching their wedding website
// (Figma "Website L&E"): vino #662030 / #93253F, rosa #FFE5EB / #EAB8BF,
// oliva #585816, Cormorant Garamond, hand-drawn vines, dahlia and the RSVP tag.

const FONT_HREF = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap";
const A = "/assets/le";

function useFont() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;
    const pre = document.createElement("link");
    pre.rel = "preconnect"; pre.href = "https://fonts.gstatic.com"; pre.crossOrigin = "";
    const link = document.createElement("link");
    link.rel = "stylesheet"; link.href = FONT_HREF;
    document.head.append(pre, link);
  }, []);
}

export default function LeRsvpShell({ portal, step, children }) {
  useFont();
  useEffect(() => {
    const prev = document.title;
    document.title = `RSVP · ${portal.names}`;
    return () => { document.title = prev; };
  }, [portal.names]);

  const ev = portal.event || {};
  const wa = ev.phone ? `https://wa.me/1${ev.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="portal rsvp-le">
      <header className="le-head">
        <img className="le-vine le-vine-l" src={`${A}/enredadera.png`} alt="" aria-hidden="true" />
        <img className="le-vine le-vine-r" src={`${A}/enredadera.png`} alt="" aria-hidden="true" />
        <p className="le-kicker">Nos vamos a casar</p>
        <h1 className="le-names">
          <img src={`${A}/firma.png`} alt={portal.names} width="673" height="121" />
        </h1>
        <p className="le-date">{ev.dateLong || portal.dateLabel}{ev.time ? ` · ${ev.time}` : ""}</p>
      </header>

      <main className="le-main">
        <div className={"le-ornament" + (step === "search" ? "" : " small")} aria-hidden="true">
          <img className="le-tag" src={`${A}/rsvp-tag.png`} alt="" width="350" height="548" />
          <img className="le-dahlia" src={`${A}/dalia.png`} alt="" width="410" height="397" />
        </div>
        <div className="le-card-wrap">{children}</div>
      </main>

      <footer className="le-foot">
        <img className="le-vine le-vine-bl" src={`${A}/enredadera.png`} alt="" aria-hidden="true" />
        <img className="le-vine le-vine-br" src={`${A}/enredadera.png`} alt="" aria-hidden="true" />
        <p className="le-kicker">Con amor,</p>
        <img className="le-foot-names" src={`${A}/firma.png`} alt={portal.names} width="673" height="121" />
        {ev.phone && (
          <p className="le-contact">
            Para más información, por favor escríbenos:<br />
            <a href={wa} target="_blank" rel="noopener noreferrer">{ev.phone}</a>
          </p>
        )}
        <p className="le-credit">Casa Solstice</p>
      </footer>
    </div>
  );
}
