import { useEffect } from "react";
// Cormorant Garamond servida desde el propio sitio (no depende de Google Fonts).
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "./le-rsvp.css";

// Frame for the L&E public RSVP, matching their wedding website
// (Figma "Website L&E"): vino #662030 / #93253F, rosa #FFE5EB / #EAB8BF,
// oliva #585816, Cormorant Garamond, and the tone-on-tone floral line drawing.

const A = "/assets/le";

export default function LeRsvpShell({ portal, children }) {
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
        <img className="le-flores le-flores-l" src={`${A}/flores.png`} alt="" aria-hidden="true" />
        <img className="le-flores le-flores-r" src={`${A}/flores.png`} alt="" aria-hidden="true" />
        <p className="le-kicker">Nos vamos a casar</p>
        <h1 className="le-names">
          <img src={`${A}/firma.png`} alt={portal.names} width="673" height="121" />
        </h1>
        <p className="le-date">{ev.dateLong || portal.dateLabel}{ev.time ? ` · ${ev.time}` : ""}</p>
      </header>

      <main className="le-main">
        <div className="le-card-wrap">{children}</div>
      </main>

      <footer className="le-foot">
        <img className="le-flores le-flores-l" src={`${A}/flores.png`} alt="" aria-hidden="true" />
        <img className="le-flores le-flores-r" src={`${A}/flores.png`} alt="" aria-hidden="true" />
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
