import { useState, useEffect } from "react";
import { STATUS_STYLE } from "../data";

export function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE["Pendiente"];
  return <span className="task-status" style={{ background: s.bg, color: s.color }}>{status}</span>;
}

export function TaskDot({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE["Pendiente"];
  return <div className="task-dot" style={{ background: s.dot }} />;
}

export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function daysUntil(now, isoDate) {
  const target = new Date(isoDate + "T00:00:00");
  return Math.ceil((target - now) / 86400000);
}

export function phaseStats(phases, statuses) {
  const all = phases.flatMap(p => p.tasks);
  const get = t => statuses[t.id] || "Pendiente";
  const done = all.filter(t => get(t) === "Listo ✓").length;
  const inProgress = all.filter(t => get(t) === "En proceso").length;
  const inReview = all.filter(t => get(t) === "En revisión").length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  return { all, done, inProgress, inReview, pct, get };
}
