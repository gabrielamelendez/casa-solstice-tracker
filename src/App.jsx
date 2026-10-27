import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import StudioApp from "./components/StudioApp";
import ClientLE from "./components/ClientLE";
import ClientSelvara from "./components/ClientSelvara";
import ClientSarahJuan from "./components/ClientSarahJuan";
import GuestList from "./components/portal/GuestList";
import Seating from "./components/portal/Seating";
import Rsvp from "./components/portal/Rsvp";
import TemplateTracker from "./components/portal/TemplateTracker";
import { PORTALS } from "./portals";

// Papelería tab per portal: the existing bespoke trackers, or the template one.
const TRACKERS = {
  "lynette-eduardo": ClientLE,
  selvara: ClientSelvara,
  "sarah-juan": ClientSarahJuan,
};

function PortalRoute({ page }) {
  const { slug } = useParams();
  const portal = PORTALS[slug];
  if (!portal) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF5EE", fontFamily: "Georgia, serif", fontStyle: "italic", color: "#5C1A1A", fontSize: 22 }}>
      Página no encontrada
    </div>
  );
  if (page === "invitados") return <GuestList portal={portal} />;
  if (page === "mesas") return <Seating portal={portal} />;
  if (page === "rsvp") return <Rsvp portal={portal} />;
  const Tracker = TRACKERS[slug];
  return Tracker ? <Tracker /> : <TemplateTracker portal={portal} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudioApp />} />
        <Route path="/:slug" element={<PortalRoute page="papeleria" />} />
        <Route path="/:slug/invitados" element={<PortalRoute page="invitados" />} />
        <Route path="/:slug/mesas" element={<PortalRoute page="mesas" />} />
        <Route path="/:slug/rsvp" element={<PortalRoute page="rsvp" />} />
      </Routes>
    </BrowserRouter>
  );
}
