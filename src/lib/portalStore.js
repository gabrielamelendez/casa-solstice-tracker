import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";

// Shared store for portal collections (guests, seating_tables), scoped by project.
// Same strategy as taskStore: Supabase + Realtime when configured, localStorage otherwise.

const TIMEOUT_MS = 6000;

function readLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeLocal(key, rows) {
  try { localStorage.setItem(key, JSON.stringify(rows)); } catch { /* ignore */ }
}
function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
}

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function useCollection(table, project) {
  const localKey = `cs_${table}_${project}_v1`;
  const [rows, setRowsState] = useState(() => readLocal(localKey));
  const [source, setSource] = useState(supabase ? "connecting" : "local");
  const [loaded, setLoaded] = useState(!supabase);
  const rowsRef = useRef(rows);

  const setRows = useCallback((updater) => {
    setRowsState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      rowsRef.current = next;
      writeLocal(localKey, next);
      return next;
    });
  }, [localKey]);

  useEffect(() => {
    let cancelled = false;
    let channel = null;

    async function load() {
      if (!supabase) return;
      try {
        const { data, error } = await withTimeout(
          supabase.from(table).select("*").eq("project", project),
          TIMEOUT_MS
        );
        if (error) throw error;
        if (cancelled) return;
        setRows(data);
        setSource("supabase");
      } catch (e) {
        console.warn(`[cs-portal] ${table} fetch failed, using localStorage:`, e.message);
        if (!cancelled) setSource("local");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();

    if (supabase) {
      const apply = (payload) => {
        if (payload.eventType === "DELETE") {
          const id = payload.old?.id;
          if (id) setRows(prev => prev.filter(r => r.id !== id));
          return;
        }
        const row = payload.new;
        if (!row?.id || row.project !== project) return;
        setRows(prev => {
          const i = prev.findIndex(r => r.id === row.id);
          if (i === -1) return [...prev, row];
          const next = prev.slice(); next[i] = row; return next;
        });
      };
      channel = supabase
        .channel(`${table}_${project}_${Math.random().toString(36).slice(2, 8)}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table, filter: `project=eq.${project}` }, apply)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table, filter: `project=eq.${project}` }, apply)
        .on("postgres_changes", { event: "DELETE", schema: "public", table }, apply)
        .subscribe();
    }
    return () => { cancelled = true; if (channel) supabase.removeChannel(channel); };
  }, [table, project, setRows]);

  // Insert or patch rows. Each item needs an id; fields not given keep their current value.
  const save = useCallback(async (items) => {
    const list = Array.isArray(items) ? items : [items];
    const current = rowsRef.current;
    const full = list.map(item => {
      const prev = current.find(r => r.id === item.id) || {};
      return { ...prev, ...item, project };
    });
    setRows(prev => {
      const next = prev.slice();
      full.forEach(row => {
        const i = next.findIndex(r => r.id === row.id);
        if (i === -1) next.push(row); else next[i] = row;
      });
      return next;
    });
    if (!supabase) return true;
    try {
      const { error } = await withTimeout(supabase.from(table).upsert(full), TIMEOUT_MS);
      if (error) throw error;
      setSource("supabase");
      return true;
    } catch (e) {
      console.warn(`[cs-portal] ${table} save failed, kept locally:`, e.message);
      setSource("local");
      return false;
    }
  }, [table, project, setRows]);

  const remove = useCallback(async (ids) => {
    const list = Array.isArray(ids) ? ids : [ids];
    setRows(prev => prev.filter(r => !list.includes(r.id)));
    if (!supabase) return true;
    try {
      const { error } = await withTimeout(supabase.from(table).delete().in("id", list), TIMEOUT_MS);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn(`[cs-portal] ${table} delete failed:`, e.message);
      setSource("local");
      return false;
    }
  }, [table, setRows]);

  return { rows, save, remove, source, loaded };
}

export const RSVP_KEYS = ["Pendiente", "Confirmado", "No asiste"];

// Seats a guest occupies: what they confirmed, else the full invitation.
export function seatsFor(g) {
  if (g.rsvp === "No asiste") return 0;
  if (g.rsvp === "Confirmado") return g.attending ?? g.invited ?? 1;
  return g.invited ?? 1;
}

export function normalize(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
