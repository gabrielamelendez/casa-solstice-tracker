import { useState, useCallback } from "react";
import { PROJECTS, STATUS_STYLE, nextStatus } from "../data";
import { useTaskStatuses } from "../lib/taskStore";
import { TaskDot, useNow, daysUntil, phaseStats } from "./shared";

const SYNC_LABEL = {
  connecting: { label: "Conectando…", color: "#D4A82A" },
  supabase: { label: "Sincronizado", color: "#4CAF50" },
  local: { label: "Local (sin conexión)", color: "#C97080" },
};

function ProjectCard({ meta, stats, accent, onOpen }) {
  const next = stats.all.find(t => stats.get(t) === "Pendiente" || stats.get(t) === "En proceso");
  return (
    <div className="project-card" style={{ borderLeftColor: accent }} onClick={onOpen}>
      <div className="pc-name" style={{ color: accent }}>{meta.name}</div>
      <div className="pc-concept">{meta.concept}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <span className="stat-pill" style={{ background: "#E8F5E9", color: "#1B5E20" }}>✓ {stats.done} listas</span>
        {stats.inProgress > 0 && <span className="stat-pill" style={{ background: "#FFF8E1", color: "#8A6000" }}>⏳ {stats.inProgress} en proceso</span>}
        <span className="stat-pill" style={{ background: "#FAF5EE", color: "#6B4E3D" }}>{stats.all.length} tareas</span>
        <span className="stat-pill" style={{ background: "#FAF5EE", color: "#6B4E3D" }}>📅 {meta.weddingDateLabel}</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: stats.pct + "%", background: accent }} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        {next ? <div className="pc-next">Próximo: {next.name}</div> : <div />}
        <div style={{ fontSize: 22, fontWeight: 900, color: accent }}>{stats.pct}%</div>
      </div>
    </div>
  );
}

function StudioHome({ statuses, now, go }) {
  const le = PROJECTS.le, ne = PROJECTS.ne;
  const leDays = daysUntil(now, le.weddingDate);
  const neDays = daysUntil(now, ne.weddingDate);
  const leStats = phaseStats(le.phases, statuses);
  const neStats = phaseStats(ne.phases, statuses);

  return (
    <div style={{ padding: "20px 16px 100px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div className="cd-card" style={{ background: "#89203B" }}>
          <div className="cd-name">Lynette & Eduardo</div>
          <div className="cd-days">{leDays}</div>
          <div className="cd-label">días · {le.weddingDateLabel}</div>
        </div>
        <div className="cd-card" style={{ background: "#DA9A40" }}>
          <div className="cd-name">SELVARA · N&E</div>
          <div className="cd-days">{neDays}</div>
          <div className="cd-label">días · {ne.weddingDateLabel}</div>
        </div>
      </div>
      <div style={{ fontSize: 9, letterSpacing: ".28em", textTransform: "uppercase", color: "#C97080", marginBottom: 10, fontWeight: 700 }}>Proyectos activos</div>
      <ProjectCard meta={le} stats={leStats} accent="#89203B" onOpen={() => go("le")} />
      <ProjectCard meta={ne} stats={neStats} accent="#DA9A40" onOpen={() => go("ne")} />
      <div className="reminder">
        <div className="reminder-label">⚡ Fechas límite de imprenta</div>
        <div className="reminder-body">
          <strong>L&E</strong> → archivos a imprenta antes del <strong>{le.printDeadlineLabel}</strong><br />
          <strong>N&E</strong> → archivos a imprenta antes del <strong>{ne.printDeadlineLabel}</strong><br />
          Aprobación final 4 semanas antes de cada fecha.
        </div>
      </div>
    </div>
  );
}

function PhaseBlock({ ph, meta, statuses, setStatus, open, onToggle }) {
  const get = t => statuses[t.id] || "Pendiente";
  const pd = ph.tasks.filter(t => get(t) === "Listo ✓").length;
  const ppct = ph.tasks.length ? Math.round((pd / ph.tasks.length) * 100) : 0;
  const uc = ph.urgency === "urgent" ? "#89203B" : ph.urgency === "high" ? "#DA9A40" : "#6B4E3D";
  return (
    <div className="phase">
      <div className="phase-header" onClick={onToggle}>
        <span style={{ fontSize: 18 }}>{ph.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="phase-title">{ph.title}</div>
          <div className="phase-deadline" style={{ color: uc }}>{ph.deadline}</div>
          <div className="phase-prog">
            <div className="phase-bar"><div className="phase-bar-fill" style={{ width: ppct + "%", background: meta.accent }} /></div>
            <span className="phase-pct">{pd}/{ph.tasks.length}</span>
          </div>
        </div>
        <span style={{ fontSize: 12, color: "#6B4E3D" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="tasks">
          {ph.tasks.map(t => {
            const status = get(t);
            const isDone = status === "Listo ✓";
            return (
              <div className="task" key={t.id} style={{ background: isDone ? "#F8FBF8" : "#fff" }}>
                <TaskDot status={status} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={"task-name" + (isDone ? " done" : "")}>{t.name}</div>
                  {t.note && <div className="task-note">{t.note}</div>}
                </div>
                <button className="task-status" style={{ background: STATUS_STYLE[status].bg, color: STATUS_STYLE[status].color }}
                  onClick={() => setStatus(t.id, nextStatus(status))}>
                  {status}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StudioProject({ projId, statuses, setStatus, go }) {
  const meta = PROJECTS[projId];
  const stats = phaseStats(meta.phases, statuses);
  const [openPhases, setOpenPhases] = useState(() => Object.fromEntries(meta.phases.map(p => [p.id, true])));
  const togglePhase = (id) => setOpenPhases(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="pv-header" style={{ background: meta.accent }}>
        <button className="back-btn" onClick={() => go(null)}>← Inicio</button>
        <div className="pv-name">{meta.name}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }} className="pv-meta">
          <span>📅 {meta.weddingDateLabel}</span>
          <span>💰 {meta.budget}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <div className="pv-stat"><div className="pv-stat-num" style={{ color: "#4CAF50" }}>{stats.done}</div><div className="pv-stat-label">Listas</div></div>
          <div className="pv-stat"><div className="pv-stat-num" style={{ color: "#D4A82A" }}>{stats.inProgress}</div><div className="pv-stat-label">En proceso</div></div>
          <div className="pv-stat"><div className="pv-stat-num" style={{ color: "#4A90D9" }}>{stats.inReview}</div><div className="pv-stat-label">En revisión</div></div>
          <div className="pv-stat"><div className="pv-stat-num">{stats.all.length}</div><div className="pv-stat-label">Total</div></div>
          <div className="pv-stat"><div className="pv-stat-num">{stats.pct}%</div><div className="pv-stat-label">Avance</div></div>
        </div>
        <div className="pv-progress"><div className="pv-progress-fill" style={{ width: stats.pct + "%" }} /></div>
      </div>

      <div style={{ padding: 16 }}>
        {meta.phases.map(ph => (
          <PhaseBlock key={ph.id} ph={ph} meta={meta} statuses={statuses} setStatus={setStatus}
            open={openPhases[ph.id] !== false} onToggle={() => togglePhase(ph.id)} />
        ))}

        <a href={projId === "le" ? "/lynette-eduardo" : "/selvara"} target="_blank" rel="noreferrer"
          style={{ display: "block", textAlign: "center", marginTop: 20, background: meta.accent, color: "#fff", textDecoration: "none", borderRadius: 8, padding: "12px 14px", fontSize: 12, fontWeight: 700, letterSpacing: ".04em" }}>
          Ver vista del cliente →
        </a>
      </div>
    </div>
  );
}

export default function StudioApp() {
  const { statuses, setStatus, source } = useTaskStatuses();
  const now = useNow();
  const [projId, setProjId] = useState(null);
  const go = useCallback((id) => setProjId(id), []);
  const sync = SYNC_LABEL[source] || SYNC_LABEL.local;

  return (
    <div className="studio-app">
      <nav className="studio-nav">
        <div className="studio-nav-brand">Casa Solstice</div>
        <div className="studio-nav-sub">
          <span className="sync-dot" style={{ background: sync.color }} />
          Studio Tracker · {sync.label}
        </div>
      </nav>
      {projId
        ? <StudioProject projId={projId} statuses={statuses} setStatus={setStatus} go={go} />
        : <StudioHome statuses={statuses} now={now} go={go} />}
    </div>
  );
}
