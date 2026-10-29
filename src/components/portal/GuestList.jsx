import { useMemo, useState } from "react";
import PortalShell, { SyncBadge } from "./PortalShell";
import { useCollection, newId, RSVP_KEYS, normalize } from "../../lib/portalStore";
import { SAMPLE_GUESTS } from "../../portals";
import ConfirmButton from "./ConfirmButton";

const RSVP_STYLE = {
  "Pendiente": { bg: "#EDE0CE", color: "#6B4E3D" },
  "Confirmado": { bg: "#E8F5E9", color: "#1B5E20" },
  "No asiste": { bg: "#F6E3E3", color: "#8A2A2A" },
};

export function RsvpPill({ status, onClick }) {
  const s = RSVP_STYLE[status] || RSVP_STYLE.Pendiente;
  const Tag = onClick ? "button" : "span";
  return (
    <Tag className="rsvp-pill" style={{ background: s.bg, color: s.color }} onClick={onClick} type={onClick ? "button" : undefined}>
      {status}
    </Tag>
  );
}

function RsvpLinkCard({ portal }) {
  const url = `${window.location.origin}/${portal.slug}/rsvp`;
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { window.prompt("Copia el link:", url); }
  };
  const waText = `¡Hola! Nos encantaría contar contigo en nuestra boda 💛 Confirma tu asistencia aquí: ${url}`;
  return (
    <section className="p-card rsvp-link-card">
      <div className="p-label">Link de RSVP para invitados</div>
      <p className="p-help">Compártelo por WhatsApp o en la invitación. Cada invitado busca su nombre y confirma; la respuesta aparece aquí al instante.</p>
      <div className="link-row">
        <code className="link-url">{url}</code>
        <button className="p-btn" onClick={copy} type="button">{copied ? "¡Copiado!" : "Copiar"}</button>
        <a className="p-btn ghost" href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noreferrer">WhatsApp</a>
        <a className="p-btn ghost" href={`/${portal.slug}/rsvp`} target="_blank" rel="noreferrer">Ver</a>
      </div>
    </section>
  );
}

function Stats({ guests }) {
  const invited = guests.reduce((s, g) => s + (g.invited || 0), 0);
  const confirmed = guests.filter(g => g.rsvp === "Confirmado").reduce((s, g) => s + (g.attending ?? g.invited ?? 0), 0);
  const pendingInv = guests.filter(g => g.rsvp === "Pendiente");
  const pending = pendingInv.reduce((s, g) => s + (g.invited || 0), 0);
  const declined = guests.filter(g => g.rsvp === "No asiste").reduce((s, g) => s + (g.invited || 0), 0);
  const items = [
    [invited, "invitados", `${guests.length} invitaciones`],
    [confirmed, "confirmados", "personas que asisten"],
    [pending, "pendientes", `${pendingInv.length} sin responder`],
    [declined, "no asisten", ""],
  ];
  return (
    <div className="stat-grid">
      {items.map(([n, l, sub]) => (
        <div className="stat" key={l}>
          <div className="stat-num">{n}</div>
          <div className="stat-label">{l}</div>
          {sub && <div className="stat-sub">{sub}</div>}
        </div>
      ))}
    </div>
  );
}

function AddGuest({ onAdd, groups }) {
  const [mode, setMode] = useState("one");
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [invited, setInvited] = useState(1);
  const [bulk, setBulk] = useState("");

  const submitOne = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd([{ name: name.trim(), group_name: group.trim() || null, invited: Math.max(1, Number(invited) || 1) }]);
    setName(""); setInvited(1);
  };
  const submitBulk = (e) => {
    e.preventDefault();
    const rows = bulk.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
      const [n, c, g] = line.split(/[,;\t]/).map(s => s?.trim());
      return { name: n, invited: Math.max(1, parseInt(c, 10) || 1), group_name: g || null };
    }).filter(r => r.name);
    if (!rows.length) return;
    onAdd(rows);
    setBulk("");
  };

  return (
    <section className="p-card">
      <div className="add-head">
        <div className="p-label">Agregar invitados</div>
        <div className="seg">
          <button type="button" className={mode === "one" ? "on" : ""} onClick={() => setMode("one")}>Uno a uno</button>
          <button type="button" className={mode === "bulk" ? "on" : ""} onClick={() => setMode("bulk")}>Pegar lista</button>
        </div>
      </div>
      {mode === "one" ? (
        <form className="add-form" onSubmit={submitOne}>
          <label className="f grow">
            <span>Nombre en la invitación</span>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Familia Pérez · Ana y Luis" />
          </label>
          <label className="f">
            <span>Grupo</span>
            <input value={group} onChange={e => setGroup(e.target.value)} list="guest-groups" placeholder="Familia novia" />
          </label>
          <label className="f narrow">
            <span>Cupos</span>
            <input type="number" min="1" max="20" value={invited} onChange={e => setInvited(e.target.value)} />
          </label>
          <button className="p-btn" type="submit">Agregar</button>
        </form>
      ) : (
        <form onSubmit={submitBulk}>
          <p className="p-help">Una invitación por línea: <b>Nombre, cupos, grupo</b>. Puedes pegar directo desde Excel o Google Sheets.</p>
          <textarea className="bulk" rows={6} value={bulk} onChange={e => setBulk(e.target.value)}
            placeholder={"Familia Pérez, 4, Familia novia\nCarolina Méndez, 2, Amigos\nTía Marisol, 1, Familia novio"} />
          <button className="p-btn" type="submit">Agregar lista</button>
        </form>
      )}
    </section>
  );
}

function GuestRow({ g, tableName, onSave, onDelete, groups }) {
  const [open, setOpen] = useState(false);
  const cycle = () => {
    const next = RSVP_KEYS[(RSVP_KEYS.indexOf(g.rsvp) + 1) % RSVP_KEYS.length];
    onSave({ id: g.id, rsvp: next, attending: next === "Confirmado" ? (g.attending || g.invited) : next === "No asiste" ? 0 : null });
  };
  const field = (key, val) => onSave({ id: g.id, [key]: val });
  const seats = g.rsvp === "Confirmado" ? `${g.attending ?? g.invited}/${g.invited}` : `${g.invited}`;

  return (
    <div className={"guest" + (open ? " open" : "")}>
      <div className="guest-main">
        <button className="guest-name-btn" type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          <div className="guest-name">{g.name}</div>
          <div className="guest-meta">
            {g.group_name && <span>{g.group_name}</span>}
            <span>{seats} {g.invited === 1 ? "cupo" : "cupos"}</span>
            {tableName && <span>· {tableName}</span>}
            {g.dietary && <span className="tag">🍽 {g.dietary}</span>}
            {g.message && <span className="tag">💌 mensaje</span>}
          </div>
        </button>
        <RsvpPill status={g.rsvp} onClick={cycle} />
      </div>
      {open && (
        <div className="guest-edit">
          <label className="f grow"><span>Nombre</span>
            <input defaultValue={g.name} onBlur={e => e.target.value.trim() && e.target.value !== g.name && field("name", e.target.value.trim())} />
          </label>
          <label className="f"><span>Grupo</span>
            <input defaultValue={g.group_name || ""} list="guest-groups" onBlur={e => e.target.value !== (g.group_name || "") && field("group_name", e.target.value || null)} />
          </label>
          <label className="f narrow"><span>Cupos</span>
            <input type="number" min="1" max="20" defaultValue={g.invited} onBlur={e => { const v = Math.max(1, parseInt(e.target.value, 10) || 1); if (v !== g.invited) onSave({ id: g.id, invited: v, attending: g.attending != null ? Math.min(g.attending, v) : g.attending }); }} />
          </label>
          {g.rsvp === "Confirmado" && (
            <label className="f narrow"><span>Asisten</span>
              <select value={g.attending ?? g.invited} onChange={e => field("attending", Number(e.target.value))}>
                {Array.from({ length: g.invited }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          )}
          <label className="f full"><span>Restricciones alimentarias</span>
            <input defaultValue={g.dietary || ""} onBlur={e => e.target.value !== (g.dietary || "") && field("dietary", e.target.value || null)} />
          </label>
          <label className="f full"><span>Notas internas</span>
            <input defaultValue={g.notes || ""} placeholder="Solo visible para ustedes" onBlur={e => e.target.value !== (g.notes || "") && field("notes", e.target.value || null)} />
          </label>
          {g.message && <div className="guest-message">“{g.message}”</div>}
          <div className="guest-actions">
            {g.responded_at && <span className="p-help">Respondió el {new Date(g.responded_at).toLocaleDateString("es-DO", { day: "numeric", month: "short" })}</span>}
            <ConfirmButton className="p-btn danger" label="Eliminar" confirmLabel="Sí, eliminar" onConfirm={() => onDelete(g.id)} />
          </div>
        </div>
      )}
    </div>
  );
}

function exportCsv(guests, tables, portal) {
  const tName = id => tables.find(t => t.id === id)?.name || "";
  const head = ["Nombre", "Grupo", "Cupos", "RSVP", "Asisten", "Restricciones", "Mensaje", "Mesa", "Notas"];
  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [head, ...guests.map(g => [g.name, g.group_name, g.invited, g.rsvp, g.rsvp === "Confirmado" ? (g.attending ?? g.invited) : "", g.dietary, g.message, tName(g.table_id), g.notes])]
    .map(r => r.map(esc).join(","));
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `invitados-${portal.slug}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function GuestList({ portal }) {
  const { rows: guests, save, remove, source, loaded } = useCollection("guests", portal.project);
  const { rows: tables } = useCollection("seating_tables", portal.project);
  const [filter, setFilter] = useState("Todos");
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");

  const groups = useMemo(() => [...new Set(guests.map(g => g.group_name).filter(Boolean))].sort(), [guests]);
  const visible = useMemo(() => {
    const nq = normalize(q);
    return guests
      .filter(g => filter === "Todos" || g.rsvp === filter)
      .filter(g => !group || g.group_name === group)
      .filter(g => !nq || normalize(g.name).includes(nq))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }, [guests, filter, q, group]);

  const add = (rows) => save(rows.map(r => ({ id: newId(), rsvp: "Pendiente", attending: null, ...r, created_at: new Date().toISOString() })));
  const loadSample = () => add(SAMPLE_GUESTS);
  const counts = Object.fromEntries(["Todos", ...RSVP_KEYS].map(k => [k, k === "Todos" ? guests.length : guests.filter(g => g.rsvp === k).length]));

  return (
    <PortalShell portal={portal}>
      <div className="page-title-row">
        <h2 className="page-title">Lista de invitados</h2>
        <SyncBadge source={source} />
      </div>
      <Stats guests={guests} />
      <RsvpLinkCard portal={portal} />
      <datalist id="guest-groups">{groups.map(g => <option key={g} value={g} />)}</datalist>
      <AddGuest onAdd={add} groups={groups} />

      <section className="p-card list-card">
        <div className="list-tools">
          <input className="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar invitado…" aria-label="Buscar invitado" />
          {groups.length > 0 && (
            <select value={group} onChange={e => setGroup(e.target.value)} aria-label="Filtrar por grupo">
              <option value="">Todos los grupos</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
          <button className="p-btn ghost" type="button" onClick={() => exportCsv(guests, tables, portal)} disabled={!guests.length}>Exportar CSV</button>
        </div>
        <div className="chips">
          {["Todos", ...RSVP_KEYS].map(k => (
            <button key={k} type="button" className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{k} <b>{counts[k]}</b></button>
          ))}
        </div>

        {loaded && guests.length === 0 ? (
          <div className="empty">
            <p>Todavía no hay invitados. Agrega el primero arriba o pega la lista completa.</p>
            {portal.isTemplate && <button className="p-btn ghost" type="button" onClick={loadSample}>Cargar invitados de ejemplo</button>}
          </div>
        ) : (
          <div className="guest-list">
            {visible.map(g => (
              <GuestRow key={g.id} g={g} groups={groups} tableName={tables.find(t => t.id === g.table_id)?.name}
                onSave={save} onDelete={remove} />
            ))}
            {visible.length === 0 && <div className="empty"><p>Ningún invitado coincide con el filtro.</p></div>}
          </div>
        )}
        <p className="p-help list-foot">Toca el estado para cambiarlo manualmente · toca el nombre para editar.</p>
      </section>
    </PortalShell>
  );
}
