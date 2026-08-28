import { BrowserRouter, Routes, Route } from "react-router-dom";
import StudioApp from "./components/StudioApp";
import ClientLE from "./components/ClientLE";
import ClientSelvara from "./components/ClientSelvara";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudioApp />} />
        <Route path="/lynette-eduardo" element={<ClientLE />} />
        <Route path="/selvara" element={<ClientSelvara />} />
      </Routes>
    </BrowserRouter>
  );
}
