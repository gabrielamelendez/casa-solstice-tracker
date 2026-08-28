import { PROJECTS } from "../data";
import { useTaskStatuses } from "../lib/taskStore";
import { useNow, daysUntil, phaseStats } from "./shared";

const SEL_STYLE = {
  "Pendiente": { bg: "rgba(102,107,38,.08)", color: "#888B40", dot: "rgba(102,107,38,.25)" },
  "En proceso": { bg: "rgba(240,160,48,.15)", color: "#F0A030", dot: "#F0A030" },
  "En revisión": { bg: "rgba(74,144,217,.15)", color: "#5AB0F0", dot: "#5AB0F0" },
  "Listo ✓": { bg: "rgba(74,200,80,.15)", color: "#4AC850", dot: "#4AC850" },
};

export default function ClientSelvara() {
  const { statuses } = useTaskStatuses();
  const now = useNow();
  const meta = PROJECTS.ne;
  const phases = meta.phases.filter(p => p.clientVisible);
  const stats = phaseStats(phases, statuses);
  const days = daysUntil(now, meta.weddingDate);

  return (
    <div className="client-ne-app">
      <div className="header" style={{ backgroundImage: "url('/assets/gradient-header.jpg')" }}>
        <div className="header-studio">Casa Solstice · Estado del proyecto</div>
        <img className="header-logo" src="/assets/logo-selvara.png" alt="SELVARA" />
        <div className="header-tagline">"Come as you are, stay for the stories."</div>
        <div className="header-lockup">15 MAY 2027 · ZONA COLONIAL · SANTO DOMINGO<br />NICOLE + EDUARDO · First & Only Edition</div>
        <div className="progress-big">
          <div className="progress-pct">{stats.pct}%</div>
          <div className="progress-label">del proyecto completado</div>
          <div className="progress-track"><div className="progress-fill" style={{ width: stats.pct + "%" }} /></div>
        </div>
      </div>
      <div className="countdown-strip"><strong>{days} días</strong> para SELVARA · 15 de mayo de 2027</div>
      <div className="content">
        <div className="section-label">Estado de cada fase</div>
        <div>
          {phases.map(ph => {
            const pd = ph.tasks.filter(t => statuses[t.id] === "Listo ✓").length;
            const allDone = pd === ph.tasks.length;
            return (
              <div className="phase" key={ph.id}>
                <div className="phase-header">
                  <span style={{ fontSize: 18 }}>{ph.emoji}</span>
                  <span className="phase-title">{ph.clientTitle || ph.title}</span>
                  {allDone
                    ? <span className="phase-badge" style={{ background: "rgba(74,200,80,.15)", color: "#4AC850" }}>✓ Lista</span>
                    : pd > 0
                      ? <span className="phase-badge" style={{ background: "rgba(240,160,48,.15)", color: "#F0A030" }}>{pd}/{ph.tasks.length}</span>
                      : <span className="phase-badge" style={{ background: "rgba(102,107,38,0.08)", color: "#666B26" }}>Pendiente</span>}
                </div>
                <div className="tasks-list">
                  {ph.tasks.map(t => {
                    const status = statuses[t.id] || "Pendiente";
                    const s = SEL_STYLE[status];
                    const isDone = status === "Listo ✓";
                    return (
                      <div className="task-item" key={t.id}>
                        <div className="task-dot" style={{ background: s.dot }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={"task-name" + (isDone ? " done" : "")}>{t.name}</div>
                          {t.note && <div className="task-note">{t.note}</div>}
                        </div>
                        <span className="task-status" style={{ background: s.bg, color: s.color }}>{status}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="cs-footer">
          <div className="cs-brand">Casa Solstice</div>
          <div className="cs-sub">Event & Design Atelier · Est. 2025</div>
        </div>
      </div>
    </div>
  );
}
