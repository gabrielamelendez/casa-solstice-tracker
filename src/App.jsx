import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import StudioApp from "./components/StudioApp";
import ClientLE from "./components/ClientLE";
import ClientSelvara from "./components/ClientSelvara";
import ClientSarahJuan from "./components/ClientSarahJuan";
import GuestList from "./components/portal/GuestList";
import Seating from "./components/portal/Seating";
import Rsvp from "./components/portal/Rsvp";
import TemplateTracker from "./components/portal/TemplateTracker";
import LeWedding from "./components/le-web/LeWedding";
import LeCountdown from "./components/le-web/LeCountdown";
import { PORTALS } from "./portals";
import { weddingSlug } from "./weddingHost";

// Papelería tab per portal: the existing bespoke trackers, or the template one.
const TRACKERS = {
  "lynette-eduardo": ClientLE,
  selvara: ClientSelvara,
  "sarah-juan": ClientSarahJuan,
};

function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF5EE", fontFamily: "Georgia, serif", fontStyle: "italic", color: "#5C1A1A", fontSize: 22 }}>
      Página no encontrada
    </div>
  );
}

function PortalRoute({ page }) {
  const { slug } = useParams();
  const portal = PORTALS[slug];
  if (!portal) return <NotFound />;
  if (page === "invitados") return <GuestList portal={portal} />;
  if (page === "mesas") return <Seating portal={portal} />;
  if (page === "rsvp") return <Rsvp portal={portal} />;
  if (page === "cuenta") return slug === "lynette-eduardo" ? <LeCountdown /> : <NotFound />;
  if (page === "boda") return slug === "lynette-eduardo" ? <LeWedding portal={portal} /> : <NotFound />;
  const Tracker = TRACKERS[slug];
  return Tracker ? <Tracker /> : <TemplateTracker portal={portal} />;
}

function WeddingSite({ slug }) {
  const portal = PORTALS[slug];
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LeWedding portal={portal} />} />
        <Route path="/rsvp" element={<Rsvp portal={portal} />} />
        <Route path="/cuenta-regresiva" element={<LeCountdown />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  if (weddingSlug && PORTALS[weddingSlug]) return <WeddingSite slug={weddingSlug} />;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudioApp />} />
        <Route path="/:slug" element={<PortalRoute page="papeleria" />} />
        <Route path="/:slug/invitados" element={<PortalRoute page="invitados" />} />
        <Route path="/:slug/mesas" element={<PortalRoute page="mesas" />} />
        <Route path="/:slug/rsvp" element={<PortalRoute page="rsvp" />} />
        <Route path="/:slug/boda" element={<PortalRoute page="boda" />} />
        <Route path="/:slug/cuenta-regresiva" element={<PortalRoute page="cuenta" />} />
      </Routes>
    </BrowserRouter>
  );
}
