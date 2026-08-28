import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { allTaskIds, PROJECTS } from "../data";

const LOCAL_KEY = "cs_tracker_status_v1";
const FETCH_TIMEOUT_MS = 6000;

function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function writeLocal(map) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

function defaultStatuses() {
  const map = {};
  allTaskIds().forEach(id => { map[id] = "Pendiente"; });
  return map;
}

function taskProject(id) {
  for (const p of Object.values(PROJECTS)) {
    if (p.phases.some(ph => ph.tasks.some(t => t.id === id))) return p.id;
  }
  return null;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

// Single source of truth for task statuses across all three views.
// Tries Supabase first (fetch + Realtime subscription); if it's unreachable
// or unconfigured, falls back to localStorage so the app still works.
export function useTaskStatuses() {
  const [statuses, setStatuses] = useState(() => ({ ...defaultStatuses(), ...readLocal() }));
  const [source, setSource] = useState(supabase ? "connecting" : "local");
  const channelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) { setSource("local"); return; }
      try {
        const { data, error } = await withTimeout(
          supabase.from("task_status").select("id,status"),
          FETCH_TIMEOUT_MS
        );
        if (error) throw error;
        if (cancelled) return;
        const next = { ...defaultStatuses() };
        data.forEach(row => { next[row.id] = row.status; });
        writeLocal(next);
        setStatuses(next);
        setSource("supabase");
      } catch (e) {
        console.warn("[cs-tracker] Supabase fetch failed, using localStorage:", e.message);
        if (!cancelled) setSource("local");
      }
    }
    load();

    if (supabase) {
      channelRef.current = supabase
        .channel("task_status_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "task_status" }, (payload) => {
          const row = payload.eventType === "DELETE" ? payload.old : payload.new;
          if (!row || !row.id) return;
          setStatuses(prev => {
            const next = { ...prev, [row.id]: payload.eventType === "DELETE" ? "Pendiente" : row.status };
            writeLocal(next);
            return next;
          });
          setSource("supabase");
        })
        .subscribe();
    }

    return () => {
      cancelled = true;
      if (channelRef.current) supabase?.removeChannel(channelRef.current);
    };
  }, []);

  const setStatus = useCallback(async (taskId, newStatus) => {
    setStatuses(prev => {
      const next = { ...prev, [taskId]: newStatus };
      writeLocal(next);
      return next;
    });

    if (!supabase) return;
    try {
      const { error } = await withTimeout(
        supabase.from("task_status").upsert({
          id: taskId,
          project: taskProject(taskId),
          status: newStatus,
          updated_at: new Date().toISOString(),
        }),
        FETCH_TIMEOUT_MS
      );
      if (error) throw error;
      setSource("supabase");
    } catch (e) {
      console.warn("[cs-tracker] Supabase upsert failed, kept locally:", e.message);
      setSource("local");
    }
  }, []);

  return { statuses, setStatus, source };
}
