import { NavLink } from "react-router-dom";
import { themeVars } from "../../portals";

const TABS = [
  { to: "", label: "Papelería", end: true },
  { to: "invitados", label: "Invitados" },
  { to: "mesas", label: "Mesas" },
];

// Tab bar shown on every portal page (also inserted into the existing trackers).
export function PortalTabs({ portal }) {
  return (
    <nav className="portal-tabs" style={themeVars(portal.theme)} aria-label="Secciones del portal">
      <div className="portal-tabs-inner">
        {TABS.map(t => (
          <NavLink
            key={t.label}
            to={`/${portal.slug}${t.to ? "/" + t.to : ""}`}
            end={t.end}
            className={({ isActive }) => "portal-tab" + (isActive ? " active" : "")}
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function PortalHeader({ portal, eyebrow = "Casa Solstice · Portal de la boda", compact = false }) {
  const style = portal.headerImage ? { backgroundImage: `url('${portal.headerImage}')` } : undefined;
  return (
    <header className={"portal-header" + (portal.headerImage ? " has-image" : "") + (compact ? " compact" : "")} style={style}>
      <div className="portal-eyebrow">{eyebrow}</div>
      {portal.logo
        ? <img className="portal-logo" src={portal.logo} alt={portal.eventName || portal.names} />
        : <h1 className="portal-names">{portal.names}</h1>}
      {portal.logo && <div className="portal-sub-names">{portal.names}</div>}
      {portal.tagline && <div className="portal-tagline">{portal.tagline}</div>}
      <div className="portal-date">{portal.dateLabel}</div>
    </header>
  );
}

export function PortalFooter() {
  return (
    <footer className="portal-footer">
      <div className="portal-brand">Casa Solstice</div>
      <div className="portal-brand-sub">Event & Design Atelier · Est. 2025</div>
    </footer>
  );
}

export function SyncBadge({ source }) {
  const map = {
    connecting: ["Conectando…", "#D4A82A"],
    supabase: ["Sincronizado", "#4CAF50"],
    local: ["Solo en este dispositivo", "#C97080"],
  };
  const [label, color] = map[source] || map.local;
  return <span className="sync-badge"><i style={{ background: color }} />{label}</span>;
}

export default function PortalShell({ portal, children, wide = false }) {
  return (
    <div className="portal" style={themeVars(portal.theme)}>
      <PortalHeader portal={portal} compact />
      <PortalTabs portal={portal} />
      <main className={"portal-content" + (wide ? " wide" : "")}>{children}</main>
      <PortalFooter />
    </div>
  );
}
