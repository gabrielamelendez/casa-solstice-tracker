import { PROJECTS } from "../data";
import { useTaskStatuses } from "../lib/taskStore";
import { TaskDot, StatusPill, useNow, daysUntil, phaseStats } from "./shared";

export default function ClientLE() {
  const { statuses } = useTaskStatuses();
  const now = useNow();
  const meta = PROJECTS.le;
  const phases = meta.phases.filter(p => p.clientVisible);
  const stats = phaseStats(phases, statuses);
  const days = daysUntil(now, meta.weddingDate);

  return (
    <div className="client-le-app">
      <div className="header">
        <div className="header-studio">Casa Solstice · Estado del proyecto</div>
        <div className="header-names">Lynette & Eduardo</div>
        <div className="header-concept">A Table for Two · Wherever we are, we're home.</div>
        <div className="header-date">Boda · 20 de marzo de 2027</div>
        <div className="progress-big">
          <div className="progress-pct">{stats.pct}%</div>
          <div className="progress-label">del proyecto completado</div>
          <div className="progress-track"><div className="progress-fill" style={{ width: stats.pct + "%" }} /></div>
        </div>
      </div>
      <div className="countdown-strip"><strong>{days} días</strong> para la boda · 20 de marzo de 2027</div>
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
                    ? <span className="phase-badge" style={{ background: "#E8F5E9", color: "#1B5E20" }}>✓ Lista</span>
                    : pd > 0
                      ? <span className="phase-badge" style={{ background: "#FFF8E1", color: "#8A6000" }}>{pd}/{ph.tasks.length}</span>
                      : <span className="phase-badge" style={{ background: "#EDE0CE", color: "#6B4E3D" }}>Pendiente</span>}
                </div>
                <div className="tasks-list">
                  {ph.tasks.map(t => {
                    const status = statuses[t.id] || "Pendiente";
                    const isDone = status === "Listo ✓";
                    return (
                      <div className="task-item" key={t.id} style={{ background: isDone ? "#F8FBF8" : "#fff" }}>
                        <TaskDot status={status} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={"task-name" + (isDone ? " done" : "")}>{t.name}</div>
                          {t.note && <div className="task-note">{t.note}</div>}
                        </div>
                        <StatusPill status={status} />
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
