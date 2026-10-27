# Casa Solstice · Tracker

React + Vite + Tailwind + Supabase.

- `/` — Studio Tracker (interno, editable)
- `/<cliente>` — portal del cliente, pestaña **Papelería** (tracker, solo lectura, tiempo real)
- `/<cliente>/invitados` — **Lista de invitados** (la editan los novios)
- `/<cliente>/mesas` — **Organizador de mesas**
- `/<cliente>/rsvp` — **Link público de RSVP** para los invitados

Clientes: `lynette-eduardo`, `selvara`, `sarah-juan`, y `plantilla` (portal de muestra
con botones para cargar invitados y mesas de ejemplo).

## Portal de cliente: invitados, RSVP y mesas

**Activar en Supabase (una sola vez):** SQL Editor → New query → pega todo
[`supabase/portal.sql`](supabase/portal.sql) → Run. Crea las tablas `guests` y
`seating_tables` con Realtime. No toca `task_status`.

**Cómo se usa**
- Los novios agregan invitados en `/<cliente>/invitados`, uno a uno o pegando una
  lista (`Nombre, cupos, grupo` por línea, sirve copiar desde Excel). Una fila =
  una invitación; "cupos" = cuántas personas incluye.
- Comparten el link `/<cliente>/rsvp` (botón Copiar o WhatsApp). El invitado escribe
  su nombre (mínimo 3 letras, sin importar tildes), elige su invitación, confirma
  cuántos van, alergias y un mensaje. Solo ve los nombres que coinciden con lo que escribe.
- En `/<cliente>/mesas` crean mesas (redonda/imperial, 2–24 sillas) y sientan a los
  confirmados: tocar invitado → "Sentar aquí" en el celular, o arrastrar en computadora.
  Cada invitación ocupa los asientos que confirmó.
- Exportar CSV en la lista de invitados (abre en Excel/Sheets).

**Nuevo cliente:** en [`src/portals.js`](src/portals.js) copia el bloque `plantilla`,
cambia `slug`, `project`, textos y colores. Para que su tracker de papelería se edite
desde el Studio, agrega su proyecto en `src/data.js` y en `StudioApp.jsx` como los otros.

## 1. Correr localmente sin Supabase (ya funciona así)

```bash
npm install
npm run dev
```

Sin variables de entorno configuradas, la app cae automáticamente a
`localStorage` — funciona igual, pero solo se sincroniza dentro del mismo
navegador (no en tiempo real entre dispositivos). El indicador junto al
título del Studio Tracker dice "Local (sin conexión)" cuando está en este modo.

## 2. Conectar Supabase (para sincronización en tiempo real)

### Crear el proyecto

1. Entra a [supabase.com](https://supabase.com) y crea una cuenta (gratis).
2. **New project** → dale un nombre (ej. `casa-solstice-tracker`), una
   contraseña de base de datos, y elige la región más cercana a RD
   (normalmente `us-east-1`).
3. Espera 1-2 minutos mientras se aprovisiona.

### Crear la tabla

1. En el panel izquierdo, abre **SQL Editor** → **New query**.
2. Copia y pega todo el contenido de [`supabase/schema.sql`](supabase/schema.sql)
   de este proyecto y dale **Run**.
   - Esto crea la tabla `task_status`, habilita Row Level Security con
     políticas públicas de lectura/escritura, y activa Realtime en la tabla.

### Conectar la app

1. En el panel de Supabase: **Project Settings** → **API**.
2. Copia **Project URL** y la clave **anon public**.
3. En la raíz de este proyecto, copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

4. Pega tus valores:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
```

5. Reinicia el servidor (`npm run dev`). El indicador del Studio Tracker
   debe cambiar a "Sincronizado" — a partir de ahí, marcar una tarea en
   Studio se refleja al instante en `/lynette-eduardo` y `/selvara` en
   cualquier dispositivo, sin recargar.

## 3. Desplegar (Vercel / Netlify)

Cualquiera de los dos funciona: `npm run build` genera `dist/`.

- **Vercel**: importa el repo, agrega `VITE_SUPABASE_URL` y
  `VITE_SUPABASE_ANON_KEY` en Project Settings → Environment Variables.
  El archivo `vercel.json` ya incluido resuelve las rutas `/lynette-eduardo`
  y `/selvara` al recargar directamente.
- **Netlify**: igual, agrega las mismas variables en Site settings →
  Environment variables. El archivo `public/_redirects` ya incluido hace
  lo mismo para las rutas.

Sin esas variables configuradas en el hosting, el sitio desplegado sigue
funcionando pero en modo local — cada visitante ve solo su propio progreso
guardado en su navegador, sin sincronizar entre sí.

## Nota de seguridad

**Invitados:** la lista de invitados usa el mismo modelo sin login. El link de RSVP
solo muestra los nombres que coinciden con la búsqueda, pero alguien con conocimientos
técnicos y la clave pública podría leer o editar la tabla `guests` completa (nombres,
alergias, mensajes). Si los clientes lo piden, el siguiente paso es Supabase Auth para
los novios y una función de Supabase para el RSVP.

No hay login: el Studio Tracker y los dos trackers de cliente usan la misma
clave pública (`anon key`), diferenciados solo por la ruta. Las políticas de
`schema.sql` permiten leer y escribir a cualquiera que tenga esa clave — es
un tradeoff aceptable para una herramienta interna sin datos sensibles ni
pagos, pero significa que alguien con conocimientos técnicos podría, en
teoría, editar el estado desde las herramientas de desarrollador del
navegador aunque esté en una vista "de cliente". Si eso llega a importar,
el siguiente paso sería agregar Supabase Auth y restringir `insert`/`update`
a un usuario autenticado (la diseñadora), dejando `select` público.
