// Dominios propios de webs de boda (alias de este mismo proyecto en Vercel).
// En esos dominios "/" muestra la web de la pareja y "/rsvp" su RSVP, sin el tracker.
export const WEDDING_HOSTS = {
  "lynetteandeduardo.vercel.app": "lynette-eduardo",
  "lynetteyeduardo.vercel.app": "lynette-eduardo",
};

export const weddingSlug =
  typeof window !== "undefined" ? WEDDING_HOSTS[window.location.hostname] || null : null;
