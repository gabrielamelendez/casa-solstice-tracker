import { useTaskStatuses } from "../../lib/taskStore";
import { TaskDot, StatusPill, useNow, daysUntil, phaseStats } from "../shared";
import { PortalHeader, PortalTabs, PortalFooter } from "./PortalShell";
import { themeVars } from "../../portals";

// Papelería tab for portals whose phases live in portals.js (the template).
export default function TemplateTracker({ portal }) {
  const { statuses } = useTaskStatuses();
  const now = useNow();
  const stats = phaseStats(portal.phases, statuses);
  const days = daysUntil(now, portal.weddingDate);

  return (
    <div className="portal" style={themeVars(portal.theme)}>
      <PortalHeader portal={portal} eyebrow="Casa Solstice · Estado del proyecto" />
      <div className="portal-progress">
        <div className="pp-pct">{stats.pct}%</div>
        <div className="pp-label">del proyecto completado · <b>{days} días</b> para la boda</div>
        <div className="pp-track"><div className="pp-fill" style={{ width: stats.pct + "%" }} /></div>
      </div>
      <PortalTabs portal={portal} />
      <main className="portal-content">
        {portal.phases.map(ph => {
          const done = ph.tasks.filter(t => statuses[t.id] === "Listo ✓").length;
          return (
            <section className="p-card tt-phase" key={ph.id}>
              <div className="tt-head">
                <span>{ph.emoji}</span>
                <span className="tt-title">{ph.clientTitle}</span>
                <span className="tt-badge">{done === ph.tasks.length ? "✓ Lista" : `${done}/${ph.tasks.length}`}</span>
              </div>
              {ph.tasks.map(t => {
                const s = statuses[t.id] || "Pendiente";
                return (
                  <div className="tt-task" key={t.id}>
                    <TaskDot status={s} />
                    <div style={{ flex: 1 }}>
                      <div className={"tt-name" + (s === "Listo ✓" ? " done" : "")}>{t.name}</div>
                      {t.note && <div className="tt-note">{t.note}</div>}
                    </div>
                    <StatusPill status={s} />
                  </div>
                );
              })}
            </section>
          );
        })}
      </main>
      <PortalFooter />
    </div>
  );
}
