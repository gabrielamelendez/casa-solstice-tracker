import { useEffect, useState } from "react";

// Two-step delete button that confirms inline instead of using window.confirm,
// which some browsers and in-app web views block silently.
export default function ConfirmButton({ label, confirmLabel = "Sí, eliminar", className = "", onConfirm }) {
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!asking) return;
    const t = setTimeout(() => setAsking(false), 6000);
    return () => clearTimeout(t);
  }, [asking]);

  if (!asking) {
    return <button type="button" className={className} onClick={() => setAsking(true)}>{label}</button>;
  }
  return (
    <span className="confirm-inline" role="group" aria-label="Confirmar">
      <button type="button" className={className + " confirm-yes"} onClick={() => { setAsking(false); onConfirm(); }} autoFocus>{confirmLabel}</button>
      <button type="button" className="confirm-no" onClick={() => setAsking(false)}>Cancelar</button>
    </span>
  );
}
