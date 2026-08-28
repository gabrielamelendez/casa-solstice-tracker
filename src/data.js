// Casa Solstice · Tracker — static project/phase/task definitions.
// Task *status* is NOT stored here — it lives in Supabase (table `task_status`)
// with a localStorage fallback. This file is just the shape of the work.

export const STATUS_KEYS = ["Pendiente", "En proceso", "En revisión", "Listo ✓"];

export const STATUS_STYLE = {
  "Pendiente": { bg: "#EDE0CE", color: "#6B4E3D", dot: "#C97080" },
  "En proceso": { bg: "#FFF8E1", color: "#8A6000", dot: "#D4A82A" },
  "En revisión": { bg: "#E8F4FD", color: "#004085", dot: "#4A90D9" },
  "Listo ✓": { bg: "#E8F5E9", color: "#1B5E20", dot: "#4CAF50" },
};

export function nextStatus(status) {
  const idx = STATUS_KEYS.indexOf(status);
  return STATUS_KEYS[(idx + 1) % STATUS_KEYS.length];
}

export const PROJECTS = {
  le: {
    id: "le",
    name: "Lynette & Eduardo",
    concept: "A Table for Two · Wherever we are, we're home.",
    weddingDateLabel: "20 Mar 2027",
    weddingDate: "2027-03-20",
    budget: "US$500 · Founding Client",
    accent: "#89203B",
    printDeadlineLabel: "20 Ene 2027",
    deliveryDeadlineLabel: "20 Feb 2027",
    phases: [
      { id: "le1", title: "Brief & Kickoff", clientTitle: "Brief & Información inicial", emoji: "📋", deadline: "Sep 2026", urgency: "normal", clientVisible: true, tasks: [
        { id: "le1a", name: "Confirmar textos exactos — nombres, fecha, lugar", note: "Necesario para arrancar todas las piezas" },
        { id: "le1b", name: "Confirmar dress code" },
        { id: "le1c", name: "Confirmar RSVP — cómo responden" },
        { id: "le1d", name: "Confirmar cantidad de mesas", note: "Para los números de mesa" },
        { id: "le1e", name: "Confirmar ciudades para números de mesa", note: "Roma · París · Madrid · San Sebastián · Lima · CDMX" },
      ]},
      { id: "le2", title: "Moodboard & Monograma", clientTitle: "Dirección creativa", emoji: "🌸", deadline: "Oct 2026", urgency: "normal", clientVisible: true, tasks: [
        { id: "le2a", name: "Moodboard final aprobado", note: "5 bloques: feeling, flores, mesa/Madrid, papelería, detalles" },
        { id: "le2b", name: "Monograma E+L — opción A", note: "Fondo claro" },
        { id: "le2c", name: "Monograma E+L — opción B", note: "Fondo burgundy" },
        { id: "le2d", name: "Aprobación monograma" },
        { id: "le2e", name: "Sistema de ilustraciones botánicas", note: "Dahlia, hortensia, rosa coral, detalles" },
        { id: "le2f", name: "Aprobación sistema visual completo", note: "Paleta + tipografía + ilustraciones" },
      ]},
      { id: "le3", title: "Diseño de Piezas", clientTitle: "Diseño de piezas", emoji: "✏️", deadline: "Nov–Dic 2026", urgency: "normal", clientVisible: true, tasks: [
        { id: "le3a", name: "⭐ Save the Date", note: "Primera pieza — sale primera" },
        { id: "le3b", name: "⭐ Invitación principal", note: "Pieza principal · 2 rondas de revisión" },
        { id: "le3c", name: "Tarjeta de detalles / RSVP" },
        { id: "le3d", name: "Menú · A Table for Two", note: "Late Night Table como sección especial" },
        { id: "le3e", name: "⭐ Welcome Sign", note: "Gran formato · impacto floral máximo" },
        { id: "le3f", name: "Bar Sign", note: "Con personalidad · guiño a Madrid" },
        { id: "le3g", name: "Números de mesa — ciudades gastronómicas" },
        { id: "le3h", name: "Webpage de invitación", note: "Estilo Gaby & Fran" },
      ]},
      { id: "le4", title: "Extras", clientTitle: "Extras", emoji: "✨", deadline: "Dic 2026 – Ene 2027", urgency: "normal", clientVisible: true, tasks: [
        { id: "le4a", name: "Matchbooks \"Strike while the love is hot\"" },
        { id: "le4b", name: "Postales de Madrid", note: "Set ilustrado estilo vintage" },
        { id: "le4c", name: "Etiqueta aceite de oliva · Cosecha 2018", note: "Every great meal starts here" },
        { id: "le4d", name: "Un Destino para Dos", note: "Tarjeta para invitados" },
      ]},
      { id: "le5", title: "Entrega Final & Impresión", clientTitle: "Entrega final", emoji: "📦", deadline: "Ene–Feb 2027", urgency: "urgent", clientVisible: true, tasks: [
        { id: "le5a", name: "Archivos finales 300dpi CMYK", note: "Sangrado 3mm" },
        { id: "le5b", name: "Aprobación final cliente" },
        { id: "le5c", name: "Cobro 50% restante" },
        { id: "le5d", name: "Envío a imprenta", note: "Límite: 20 Ene 2027" },
        { id: "le5e", name: "Recepción y revisión de impresión" },
        { id: "le5f", name: "Entrega final al cliente", note: "Límite: 20 Feb 2027" },
      ]},
    ],
  },
  ne: {
    id: "ne",
    name: "Nicole & Eduardo — SELVARA",
    concept: "First & Only Edition · 15 May 2027",
    weddingDateLabel: "15 May 2027",
    weddingDate: "2027-05-15",
    budget: "US$900 · Founding Client",
    accent: "#DA9A40",
    accentDark: "#8A2644",
    printDeadlineLabel: "20 Feb 2027",
    deliveryDeadlineLabel: "15 Mar 2027",
    phases: [
      { id: "ne1", title: "Confirmación & Kickoff", clientTitle: "Confirmación & Kickoff", emoji: "🌿", deadline: "Sep 2026", urgency: "urgent", clientVisible: true, tasks: [
        { id: "ne1a", name: "Confirmación oficial + contrato firmado", note: "+ 50% de pago" },
        { id: "ne1b", name: "Kickoff con Nicole + Eduardo", note: "Presentar SELVARA oficialmente" },
        { id: "ne1c", name: "Confirmar lista exacta de piezas del paquete" },
        { id: "ne1d", name: "Confirmar textos — nombres, fecha, venue, hora" },
        { id: "ne1e", name: "Definir extras opcionales", note: "Merch station, wristbands, tattoos" },
      ]},
      { id: "ne2", title: "Sistema de Identidad SELVARA", clientTitle: "Sistema de identidad SELVARA", emoji: "✦", deadline: "Oct 2026", urgency: "normal", clientVisible: true, tasks: [
        { id: "ne2a", name: "Moodboard SELVARA aprobado", note: "Tropical × Disco × Festival × Editorial" },
        { id: "ne2b", name: "Monograma N+E festival style aprobado", note: "No tradicional" },
        { id: "ne2c", name: "Sistema de ilustraciones tropicales", note: "Heliconias, anturios, aves del paraíso" },
        { id: "ne2d", name: "Textura animal print definida", note: "Python o leopardo dorado" },
        { id: "ne2e", name: "Paleta día y noche aprobada", note: "Coral/mango/selva → negro/dorado/neón" },
        { id: "ne2f", name: "Aprobación sistema visual completo" },
      ]},
      { id: "ne3", title: "Piezas de Papelería", clientTitle: "Piezas de papelería", emoji: "✏️", deadline: "Nov–Dic 2026", urgency: "normal", clientVisible: true, tasks: [
        { id: "ne3a", name: "⭐ Save the Date digital", note: "Primera expresión de SELVARA" },
        { id: "ne3b", name: "⭐ Set de invitación completo", note: "Invitación + detalles + RSVP + belly band + sobre + liner" },
        { id: "ne3c", name: "Abanicos — diseño ambas caras", note: "220 unidades · 9×9 pulg." },
        { id: "ne3d", name: "Bar sign / menú del bar", note: "Con los Negronis de N+E" },
        { id: "ne3e", name: "Servilletas monograma N+E", note: "300 unidades · 40×40 cm" },
      ]},
      { id: "ne4", title: "Piezas de Experiencia", clientTitle: "Piezas de experiencia", emoji: "🎪", deadline: "Ene–Feb 2027", urgency: "normal", clientVisible: true, tasks: [
        { id: "ne4a", name: "⭐ Visuales para pantallas", note: "Animaciones · patrones · tipografía · transiciones" },
        { id: "ne4b", name: "⭐ Pista de baile", note: "SELVARA · First & Only Edition" },
        { id: "ne4c", name: "Confirmar medidas exactas de la pista con el venue" },
      ]},
      { id: "ne5", title: "Cotizaciones de Impresión", emoji: "🖨️", deadline: "Oct–Nov 2026", urgency: "high", clientVisible: false, tasks: [
        { id: "ne5a", name: "Cotización set de invitación", note: "110 sets · cotton/lino 350g" },
        { id: "ne5b", name: "Cotización abanicos", note: "Imprenta especializada · 220 unidades" },
        { id: "ne5c", name: "Cotización servilletas", note: "300 unidades · airlaid y tela" },
        { id: "ne5d", name: "Cotización pista de baile", note: "Empresa gran formato · vinilo antideslizante" },
        { id: "ne5e", name: "Cotización temporal tattoos", note: "100 unidades" },
      ]},
      { id: "ne6", title: "Entrega Final & Producción", clientTitle: "Entrega final", emoji: "📦", deadline: "Feb–Mar 2027", urgency: "urgent", clientVisible: true, tasks: [
        { id: "ne6a", name: "Archivos finales 300dpi CMYK", note: "Sangrado 3mm" },
        { id: "ne6b", name: "Aprobación final Nicole + Eduardo" },
        { id: "ne6c", name: "Cobro 50% restante" },
        { id: "ne6d", name: "Envío a imprentas", note: "Límite: 20 Feb 2027" },
        { id: "ne6e", name: "Recepción y revisión de impresión" },
        { id: "ne6f", name: "Entrega final", note: "Límite: 15 Mar 2027" },
      ]},
      { id: "ne7", title: "Intercambio Instagram", emoji: "📱", deadline: "Sep 2026 – May 2027", urgency: "normal", clientVisible: false, tasks: [
        { id: "ne7a", name: "Acordar contenido en contrato" },
        { id: "ne7b", name: "3 stories del proceso creativo", note: "Con @casasolsticecollective" },
        { id: "ne7c", name: "1 post/reel cuando llegue la invitación física" },
        { id: "ne7d", name: "Stories desde la boda", note: "El día del evento" },
        { id: "ne7e", name: "1 post/reel post-boda", note: "Mencionando @casasolsticecollective" },
        { id: "ne7f", name: "Permiso uso de contenido en portafolio CS", note: "Por escrito en contrato" },
      ]},
    ],
  },
};

export function allTaskIds() {
  return Object.values(PROJECTS).flatMap(p => p.phases.flatMap(ph => ph.tasks.map(t => t.id)));
}
