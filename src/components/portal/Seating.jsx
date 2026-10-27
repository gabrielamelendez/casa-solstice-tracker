import { useMemo, useState } from "react";
import PortalShell, { SyncBadge } from "./PortalShell";
import { useCollection, newId, seatsFor } from "../../lib/portalStore";
import { SAMPLE_TABLES } from "../../portals";

// Small seat diagram: filled dots = occupied seats.
function TableDiagram({ shape, capacity, used }) {
  const n = Math.max(1, Math.min(capacity, 24));
  const W = 132, H = shape === "Imperial" ? 84 : 132;
  const dots = [];
  if (shape === "Imperial") {
    const perSide = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const side = i < perSide ? 0 : 1;
      const idx = side === 0 ? i : i - perSide;
      const count = side === 0 ? perSide : n - perSide;
      const x = 18 + (count === 1 ? 48 : (idx * 96) / (count - 1));
      dots.push({ x, y: side === 0 ? 12 : H - 12, on: i < used });
    }
  } else {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      dots.push({ x: 66 + Math.cos(a) * 54, y: 66 + Math.sin(a) * 54, on: i < used });
    }
  }
  return (
    <svg className="table-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {shape === "Imperial"
        ? <rect x="12" y="24" width="108" height={H - 48} rx="6" className="t-body" />
        : <circle cx="66" cy="66" r="38" className="t-body" />}
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="7" className={d.on ? "seat on" : "seat"} />)}
    </svg>
  );
}

function TableCard({ t, guests, selected, onSeat, onUnseat, onSave, onDelete, onDropGuest }) {
  const used = guests.reduce((s, g) => s + seatsFor(g), 0);
  const over = used > t.capacity;
  const [over_, setOver] = useState(false);
  return (
    <div
      className={"table-card" + (selected ? " targetable" : "") + (over ? " over" : "") + (over_ ? " drop" : "")}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); const id = e.dataTransfer.getData("text/guest"); if (id) onDropGuest(id, t.id); }}
    >
      <div className="table-head">
        <input className="table-name" defaultValue={t.name} aria-label="Nombre de la mesa"
          onBlur={e => e.target.value.trim() && e.target.value !== t.name && onSave({ id: t.id, name: e.target.value.trim() })} />
        <span className={"table-count" + (over ? " warn" : "")}>{used}/{t.capacity}</span>
      </div>
      <div className="table-visual"><TableDiagram shape={t.shape} capacity={t.capacity} used={used} /></div>
      <div className="table-opts">
        <select value={t.shape} onChange={e => onSave({ id: t.id, shape: e.target.value })} aria-label="Forma">
          <option>Redonda</option><option>Imperial</option>
        </select>
        <select value={t.capacity} onChange={e => onSave({ id: t.id, capacity: Number(e.target.value) })} aria-label="Capacidad">
          {Array.from({ length: 23 }, (_, i) => i + 2).map(n => <option key={n} value={n}>{n} sillas</option>)}
        </select>
      </div>
      {over && <div className="table-warn">Hay {used - t.capacity} {used - t.capacity === 1 ? "persona" : "personas"} de más</div>}
      <ul className="table-guests">
        {guests.map(g => (
          <li key={g.id} draggable onDragStart={e => { e.dataTransfer.setData("text/guest", g.id); e.dataTransfer.effectAllowed = "move"; }}>
            <span>{g.name} <em>· {seatsFor(g)}</em>{g.rsvp === "Pendiente" && <em className="pend"> (pendiente)</em>}</span>
            <button type="button" onClick={() => onUnseat(g.id)} aria-label={`Quitar a ${g.name} de la mesa`}>×</button>
          </li>
        ))}
        {guests.length === 0 && <li className="muted">Mesa vacía</li>}
      </ul>
      {selected && <button type="button" className="p-btn seat-here" onClick={() => onSeat(t.id)}>Sentar aquí</button>}
      <button type="button" className="table-del" onClick={() => { if (confirm(`¿Eliminar ${t.name}? Sus invitados vuelven a "Por sentar".`)) onDelete(t.id); }}>Eliminar mesa</button>
    </div>
  );
}

export default function Seating({ portal }) {
  const G = useCollection("guests", portal.project);
  const T = useCollection("seating_tables", portal.project);
  const [includePending, setIncludePending] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [shape, setShape] = useState("Redonda");
  const [capacity, setCapacity] = useState(10);
  const [name, setName] = useState("");

  const tables = useMemo(() => [...T.rows].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || (a.created_at || "").localeCompare(b.created_at || "")), [T.rows]);
  const tableIds = new Set(tables.map(t => t.id));
  const eligible = G.rows.filter(g => g.rsvp === "Confirmado" || (includePending && g.rsvp === "Pendiente"));
  const unseated = eligible.filter(g => !g.table_id || !tableIds.has(g.table_id)).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const seatedPeople = G.rows.filter(g => g.table_id && tableIds.has(g.table_id)).reduce((s, g) => s + seatsFor(g), 0);
  const confirmedPeople = G.rows.filter(g => g.rsvp === "Confirmado").reduce((s, g) => s + seatsFor(g), 0);
  const totalSeats = tables.reduce((s, t) => s + (t.capacity || 0), 0);
  const selected = G.rows.find(g => g.id === selectedId);

  const assign = (guestId, tableId) => { G.save({ id: guestId, table_id: tableId }); setSelectedId(null); };
  const addTable = (e) => {
    e.preventDefault();
    const n = tables.length + 1;
    T.save({ id: newId(), name: name.trim() || `Mesa ${n}`, shape, capacity: Number(capacity), sort: n, created_at: new Date().toISOString() });
    setName("");
  };
  const deleteTable = async (id) => {
    const seated = G.rows.filter(g => g.table_id === id).map(g => ({ id: g.id, table_id: null }));
    if (seated.length) await G.save(seated);
    T.remove(id);
  };
  const loadSample = () => T.save(SAMPLE_TABLES.map((t, i) => ({ id: newId(), ...t, sort: i + 1, created_at: new Date(Date.now() + i).toISOString() })));

  return (
    <PortalShell portal={portal} wide>
      <div className="page-title-row">
        <h2 className="page-title">Organizador de mesas</h2>
        <SyncBadge source={T.source === "local" || G.source === "local" ? "local" : T.source} />
      </div>

      <div className="stat-grid">
        <div className="stat"><div className="stat-num">{tables.length}</div><div className="stat-label">mesas</div><div className="stat-sub">{totalSeats} sillas</div></div>
        <div className="stat"><div className="stat-num">{seatedPeople}</div><div className="stat-label">sentados</div><div className="stat-sub">de {confirmedPeople} confirmados</div></div>
        <div className="stat"><div className="stat-num">{unseated.reduce((s, g) => s + seatsFor(g), 0)}</div><div className="stat-label">por sentar</div><div className="stat-sub">{unseated.length} invitaciones</div></div>
        <div className="stat"><div className="stat-num">{Math.max(0, totalSeats - seatedPeople)}</div><div className="stat-label">sillas libres</div></div>
      </div>

      <form className="p-card add-form table-add" onSubmit={addTable}>
        <div className="p-label full-row">Nueva mesa</div>
        <label className="f grow"><span>Nombre</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={portal.tableHint || `Mesa ${tables.length + 1}`} />
        </label>
        <label className="f"><span>Forma</span>
          <select value={shape} onChange={e => setShape(e.target.value)}><option>Redonda</option><option>Imperial</option></select>
        </label>
        <label className="f narrow"><span>Sillas</span>
          <input type="number" min="2" max="24" value={capacity} onChange={e => setCapacity(e.target.value)} />
        </label>
        <button className="p-btn" type="submit">Crear mesa</button>
      </form>

      <div className="seating-layout">
        <aside className="p-card unseated">
          <div className="p-label">Por sentar</div>
          <label className="check"><input type="checkbox" checked={includePending} onChange={e => setIncludePending(e.target.checked)} /> Incluir pendientes de RSVP</label>
          <p className="p-help">Toca un invitado y luego “Sentar aquí” en la mesa. En computadora también puedes arrastrarlo.</p>
          <ul className="unseated-list">
            {unseated.map(g => (
              <li key={g.id}>
                <button type="button" draggable
                  onDragStart={e => { e.dataTransfer.setData("text/guest", g.id); e.dataTransfer.effectAllowed = "move"; }}
                  className={"u-guest" + (selectedId === g.id ? " sel" : "") + (g.rsvp === "Pendiente" ? " pend" : "")}
                  onClick={() => setSelectedId(selectedId === g.id ? null : g.id)}>
                  <span>{g.name}</span><b>{seatsFor(g)}</b>
                </button>
              </li>
            ))}
            {unseated.length === 0 && <li className="muted">{eligible.length ? "¡Todos están sentados!" : "Aún no hay confirmados. Activa “Incluir pendientes” para ir armando."}</li>}
          </ul>
        </aside>

        <section className="tables-grid">
          {tables.map(t => (
            <TableCard key={t.id} t={t}
              guests={G.rows.filter(g => g.table_id === t.id)}
              selected={!!selected}
              onSeat={tid => selected && assign(selected.id, tid)}
              onDropGuest={assign}
              onUnseat={gid => G.save({ id: gid, table_id: null })}
              onSave={T.save}
              onDelete={deleteTable} />
          ))}
          {T.loaded && tables.length === 0 && (
            <div className="p-card empty">
              <p>Crea la primera mesa arriba para empezar a sentar invitados.</p>
              {portal.isTemplate && <button className="p-btn ghost" type="button" onClick={loadSample}>Cargar mesas de ejemplo</button>}
            </div>
          )}
        </section>
      </div>

      {selected && (
        <div className="select-bar" role="status">
          <span>Elegiste <b>{selected.name}</b> ({seatsFor(selected)}) · toca “Sentar aquí” en una mesa</span>
          <button type="button" onClick={() => setSelectedId(null)}>Cancelar</button>
        </div>
      )}
    </PortalShell>
  );
}
