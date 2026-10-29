// Casa Solstice · Portales de cliente
// Cada portal = una pareja. Rutas que genera cada entrada:
//   /<slug>            → Papelería (tracker de tareas)
//   /<slug>/invitados  → Lista de invitados (la editan los novios)
//   /<slug>/mesas      → Organizador de mesas
//   /<slug>/rsvp       → Link público para que cada invitado confirme
//
// NUEVO CLIENTE: copia el bloque "plantilla", cambia slug/project/textos/colores,
// y agrega su proyecto en data.js (o usa phases aquí mismo, como la plantilla).

export const PORTALS = {
  "lynette-eduardo": {
    slug: "lynette-eduardo",
    project: "le",
    names: "Lynette & Eduardo",
    tagline: "A Table for Two · Wherever we are, we're home.",
    dateLabel: "20 de marzo de 2027",
    weddingDate: "2027-03-20",
    rsvpBy: "10 de febrero, 2027",
    tableHint: "Ej. Roma, París, Madrid…",
    theme: { accent: "#89203B", onAccent: "#FFFFFF", bg: "#FAF5EE", card: "#FFFFFF", ink: "#1E130C", mid: "#6B4E3D", line: "#EDE0CE", soft: "#F3E6E0" },
    // RSVP público con el diseño de la web de L&E (ver components/portal/LeRsvpShell.jsx).
    rsvpLayout: "le",
    rsvpCopy: {
      title: "Confirma tu asistencia",
      lead: "Escribe tu nombre o apellido como aparece en tu invitación para confirmar que serás parte de este comienzo.",
      yes: "Sí, ahí estaré",
      no: "Con pena, no podré",
      doneYes: "¡Gracias por confirmar!",
      doneNo: "Gracias por avisarnos",
    },
    event: {
      dateLong: "Sábado 20 de marzo, 2027",
      time: "6:00 PM",
      venue: "Casa de España · Salón Terraza del Mar",
      city: "Santo Domingo, República Dominicana",
      mapsUrl: "https://maps.app.goo.gl/zRWL5ycZiJFuBRSq6",
      registry: { amazon: "https://www.amazon.com/wedding/guest-view/2YLAUCR233M7I" },
      start: "20270320T220000Z", // 6:00 PM en RD (UTC-4)
      end: "20270321T060000Z",   // 2:00 AM
      dressCode: "Formal · vestido largo para las damas, saco para los caballeros",
      phone: "809-962-6618",
    },
  },
  selvara: {
    slug: "selvara",
    project: "ne",
    names: "Nicole & Eduardo",
    eventName: "SELVARA",
    tagline: "Come as you are, stay for the stories.",
    dateLabel: "15 de mayo de 2027 · Zona Colonial",
    weddingDate: "2027-05-15",
    rsvpBy: "",
    headerImage: "/assets/gradient-header.jpg",
    logo: "/assets/logo-selvara.png",
    theme: { accent: "#DA9A40", onAccent: "#FFFFFF", deep: "#8A2644", bg: "#F4EDE9", card: "rgba(255,255,255,.75)", ink: "#4E521C", mid: "#888B40", line: "rgba(102,107,38,.16)", soft: "#EFE2D2" },
  },
  "sarah-juan": {
    slug: "sarah-juan",
    project: "sj",
    names: "Sarah & Juan",
    tagline: "Entre Aquí y Allá",
    dateLabel: "21 de agosto de 2027 · Madrid",
    weddingDate: "2027-08-21",
    rsvpBy: "",
    theme: { accent: "#7F843E", onAccent: "#FFFFFF", bg: "#FAF5EE", card: "#FFFFFF", ink: "#1E130C", mid: "#6B4E3D", line: "#EDE0CE", soft: "#EEEEDF" },
  },

  // ── PLANTILLA ── portal de muestra con datos de ejemplo (proyecto "demo").
  plantilla: {
    slug: "plantilla",
    project: "demo",
    names: "Nombre & Nombre",
    tagline: "Concepto del evento · frase editorial",
    dateLabel: "Fecha · Lugar",
    weddingDate: "2027-12-31",
    rsvpBy: "1 de noviembre de 2027",
    isTemplate: true,
    theme: { accent: "#5C1A1A", onAccent: "#FFFFFF", bg: "#FAF5EE", card: "#FFFFFF", ink: "#1E130C", mid: "#6B4E3D", line: "#EDE0CE", soft: "#F2E7DC" },
    phases: [
      { id: "demo1", clientTitle: "Brief & Información inicial", emoji: "📋", tasks: [
        { id: "demo1a", name: "Confirmar textos — nombres, fecha, lugar" },
        { id: "demo1b", name: "Confirmar dress code" },
        { id: "demo1c", name: "Confirmar cantidad de mesas" },
      ]},
      { id: "demo2", clientTitle: "Dirección creativa", emoji: "🌸", tasks: [
        { id: "demo2a", name: "Moodboard aprobado" },
        { id: "demo2b", name: "Monograma aprobado" },
        { id: "demo2c", name: "Sistema visual completo", note: "Paleta + tipografía + ilustraciones" },
      ]},
      { id: "demo3", clientTitle: "Diseño de piezas", emoji: "✏️", tasks: [
        { id: "demo3a", name: "Save the Date" },
        { id: "demo3b", name: "Invitación principal", note: "2 rondas de revisión" },
        { id: "demo3c", name: "Menú" },
        { id: "demo3d", name: "Seating chart & números de mesa" },
      ]},
      { id: "demo4", clientTitle: "Extras", emoji: "✨", tasks: [
        { id: "demo4a", name: "Welcome sign" },
        { id: "demo4b", name: "Detalles para invitados" },
      ]},
      { id: "demo5", clientTitle: "Entrega final", emoji: "📦", tasks: [
        { id: "demo5a", name: "Archivos finales para imprenta" },
        { id: "demo5b", name: "Aprobación final" },
        { id: "demo5c", name: "Entrega al cliente" },
      ]},
    ],
  },
};

export const SAMPLE_GUESTS = [
  { name: "Familia Pérez Rodríguez", group_name: "Familia novia", invited: 4, rsvp: "Confirmado", attending: 4, dietary: "" },
  { name: "Carolina Méndez", group_name: "Amigos", invited: 2, rsvp: "Confirmado", attending: 2, dietary: "Vegetariana", message: "¡No nos lo perdemos!" },
  { name: "Andrés y Lucía Báez", group_name: "Amigos", invited: 2, rsvp: "Pendiente" },
  { name: "Tía Marisol", group_name: "Familia novio", invited: 1, rsvp: "Confirmado", attending: 1, dietary: "Sin mariscos" },
  { name: "Familia Castillo", group_name: "Familia novio", invited: 3, rsvp: "No asiste", attending: 0 },
  { name: "Pablo Herrera", group_name: "Trabajo", invited: 2, rsvp: "Pendiente" },
];

export const SAMPLE_TABLES = [
  { name: "Principal", shape: "Imperial", capacity: 12 },
  { name: "Mesa 1", shape: "Redonda", capacity: 10 },
  { name: "Mesa 2", shape: "Redonda", capacity: 10 },
];

export function themeVars(t) {
  return {
    "--p-accent": t.accent, "--p-on": t.onAccent, "--p-bg": t.bg, "--p-card": t.card,
    "--p-ink": t.ink, "--p-mid": t.mid, "--p-line": t.line, "--p-soft": t.soft,
    "--p-deep": t.deep || t.accent,
  };
}
