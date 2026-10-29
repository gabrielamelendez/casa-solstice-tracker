import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./le-web.css";
import { useCountdown, WEDDING_AT } from "./LeWedding";

// Stand-alone countdown for embedding in Canva (Apps → Embed).
//   /lynette-eduardo/cuenta-regresiva                       → photo background, light text
//   /lynette-eduardo/cuenta-regresiva?fondo=transparente     → no photo, light text
//   /lynette-eduardo/cuenta-regresiva?fondo=transparente&color=vino → no photo, wine text
//   &titulo=no hides "Cada vez falta menos…"

const pad = n => String(n).padStart(2, "0");

export default function LeCountdown() {
  const [params] = useSearchParams();
  const plain = params.get("fondo") === "transparente";
  const wine = params.get("color") === "vino";
  const showTitle = params.get("titulo") !== "no";
  const t = useCountdown(WEDDING_AT);

  useEffect(() => {
    const prev = document.title;
    document.title = "Cuenta regresiva · Lynette & Eduardo";
    const html = document.documentElement, body = document.body;
    const before = [html.style.background, body.style.background];
    if (plain) { html.style.background = "transparent"; body.style.background = "transparent"; }
    return () => { document.title = prev; html.style.background = before[0]; body.style.background = before[1]; };
  }, [plain]);

  return (
    <div className={"lw lw-embed" + (plain ? " lw-embed-plain" : "") + (wine ? " lw-embed-wine" : "")}>
      <section className="lw-count" aria-labelledby="lw-count-title">
        {!plain && <img className="lw-count-photo" src="/assets/le/web/foto-cuenta.webp" alt="" />}
        {!plain && <div className="lw-count-shade" aria-hidden="true" />}
        <div className="lw-count-inner">
          {showTitle && <h2 id="lw-count-title" className="lw-title lw-title-light">{t.done ? "¡Llegó el día!" : "Cada vez falta menos…"}</h2>}
          <div className="lw-count-grid" role="timer">
            {[["Días", t.d], ["Horas", pad(t.h)], ["Minutos", pad(t.m)], ["Segundos", pad(t.s)]].map(([label, v]) => (
              <div key={label} className="lw-count-cell">
                <span className="lw-count-num">{v}</span>
                <span className="lw-count-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
